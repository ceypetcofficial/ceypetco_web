import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Newspaper,
  Pencil,
  Upload,
  Loader2,
} from "lucide-react";
import api from "../../../services/api";
import { newsService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";
import displayImageUrl from "../../../utils/displayImageUrl.js";
import compressImageForUpload from "../../../utils/compressImageForUpload.js";

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  category: "general",
  featuredImage: "",
  images: [],
  author: "",
  publishedDate: "",
  status: "draft",
};

const categoryOptions = [
  "general",
  "press-release",
  "announcement",
  "corporate",
  "fuel",
  "operations",
];

const NewsManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await newsService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setGalleryUrl("");
    setShowModal(true);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      category: item.category || "general",
      featuredImage: item.featuredImage || "",
      images: item.images || [],
      author: item.author || "",
      publishedDate: item.publishedDate?.split("T")[0] || "",
      status: item.status || "draft",
    });
    setGalleryUrl("");
    setShowModal(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const readyFile = await compressImageForUpload(file);
      const fd = new FormData();
      fd.append("image", readyFile);
      const res = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const origin = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${origin}${res.data.data.url}`;
      setForm((f) => ({ ...f, featuredImage: fullUrl }));
      toast.success(readyFile === file ? "Image uploaded successfully" : "Image compressed and uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      let compressedCount = 0;
      for (const file of files) {
        const readyFile = await compressImageForUpload(file);
        if (readyFile !== file) compressedCount += 1;
        const body = new FormData();
        body.append("image", readyFile);
        const response = await api.post("/upload/image", body);
        const origin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")
          .replace(/\/+$/, "").replace(/\/api$/, "");
        const url = response.data.data.url;
        urls.push(url.startsWith("http") ? url : `${origin}${url}`);
        setForm((current) => ({ ...current, images: [...current.images, urls[urls.length - 1]] }));
      }
      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded${compressedCount ? ` (${compressedCount} compressed)` : ""}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to upload gallery images");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const addGalleryUrl = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid image URL");
    } catch {
      toast.error("Enter a valid image URL");
      return;
    }
    setForm((current) => ({ ...current, images: [...current.images, url] }));
    setGalleryUrl("");
  };

  const removeGalleryImage = (index) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const moveGalleryImage = (index, direction) => {
    setForm((current) => {
      const images = [...current.images];
      const target = index + direction;
      if (target < 0 || target >= images.length) return current;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.publishedDate) {
        payload.publishedDate = new Date(payload.publishedDate).toISOString();
      } else {
        delete payload.publishedDate;
      }
      if (editing) {
        await newsService.update(editing._id, payload);
        toast.success("News updated successfully");
      } else {
        await newsService.create(payload);
        toast.success("News created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save news");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await newsService.remove(showDelete._id);
      toast.success("News deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete news");
    } finally {
      setDeleting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            News Management
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Create and manage news articles published on the website.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(searchInput);
              setPage(1);
            }
          }}
          placeholder="Search by title, category or author..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading news..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">
                    Author
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Newspaper className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        No news articles found
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search
                          ? "Try a different search term"
                          : "Create your first article to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-[#092f3b] line-clamp-1 max-w-xs">
                          {item.title}
                        </p>
                        {item.summary && (
                          <p className="text-xs text-[#66767d] mt-0.5 line-clamp-1 max-w-xs">
                            {item.summary}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {item.author || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDelete(item)}
                            title="Delete"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {items.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Article" : "New Article"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder="Article headline"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select
                className={selectClass}
                value={form.category}
                onChange={set("category")}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={selectClass}
                value={form.status}
                onChange={set("status")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Author">
              <input
                className={inputClass}
                value={form.author}
                onChange={set("author")}
                placeholder="Author name"
              />
            </Field>
            <Field label="Published Date">
              <input
                type="date"
                className={inputClass}
                value={form.publishedDate}
                onChange={set("publishedDate")}
              />
            </Field>
          </div>

          <Field label="Featured Image" hint="Upload an image, provide an image URL, or paste a Google Drive link shared as Anyone with the link.">
            <div className="space-y-3">
              <div className="flex items-stretch gap-2">
                <input
                  className={inputClass}
                  value={form.featuredImage}
                  onChange={set("featuredImage")}
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
              {form.featuredImage && (
                <img
                  src={displayImageUrl(form.featuredImage)}
                  alt="Featured image preview"
                  className="w-full max-h-48 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>
          </Field>

          <Field label="Article images" hint="These appear below the article text. Upload images or add Google Drive links shared as Anyone with the link, then arrange their order.">
            <div className="space-y-3">
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Upload images"}
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploading} className="hidden" />
              </label>
              <div className="flex gap-2">
                <input className={inputClass} type="url" value={galleryUrl} onChange={(event) => setGalleryUrl(event.target.value)} placeholder="https://example.com/photo.jpg" />
                <button type="button" onClick={addGalleryUrl} disabled={!galleryUrl.trim()} className="px-4 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] disabled:opacity-50">Add URL</button>
              </div>
              {form.images.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.images.map((url, index) => <div key={`${url}-${index}`} className="rounded-lg border border-slate-200 overflow-hidden">
                  <img src={displayImageUrl(url)} alt={`Article image ${index + 1} preview`} className="w-full h-36 object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="text-xs text-slate-600">Image {index + 1}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveGalleryImage(index, -1)} disabled={index === 0} aria-label="Move image left" className="p-1.5 text-slate-600 disabled:opacity-30">←</button>
                      <button type="button" onClick={() => moveGalleryImage(index, 1)} disabled={index === form.images.length - 1} aria-label="Move image right" className="p-1.5 text-slate-600 disabled:opacity-30">→</button>
                      <button type="button" onClick={() => removeGalleryImage(index)} aria-label="Remove image" className="p-1.5 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>)}
              </div>}
            </div>
          </Field>

          <Field label="Summary">
            <textarea
              className={textareaClass}
              value={form.summary}
              onChange={set("summary")}
              placeholder="Short summary shown on the website"
            />
          </Field>

          <Field label="Content" required>
            <textarea
              className={`${textareaClass} min-h-[200px]`}
              value={form.content}
              onChange={set("content")}
              placeholder="Full article content"
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Article" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this article?
          </p>
          <p className="text-sm font-bold text-[#092f3b] mb-6 line-clamp-2">
            "{showDelete?.title}"
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowDelete(null)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewsManagement;
