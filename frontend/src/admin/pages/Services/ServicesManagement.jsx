import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Pencil,
  Link2,
  Sparkles,
  Upload,
  Loader2,
  ArrowRight,
} from "lucide-react";
import api from "../../../services/api";
import { serviceService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";
import displayImageUrl from "../../../utils/displayImageUrl.js";

const emptyForm = {
  title: "",
  category: "",
  text: "",
  image: "",
  link: "",
  order: 0,
  status: "published",
};

const ServicesManagement = () => {
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
  const [imagePreview, setImagePreview] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await serviceService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load services");
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
    setImagePreview("");
    setShowModal(true);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      category: item.category || "",
      text: item.text || "",
      image: item.image || "",
      link: item.link || "",
      order: item.order ?? 0,
      status: item.status || "published",
    });
    setImagePreview(item.image || "");
    setShowModal(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const origin = (import.meta.env.VITE_API_BASE_URL || "")
        .replace(/\/+$/, "")
        .replace(/\/api$/, "");
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${origin}${res.data.data.url}`;
      setForm((f) => ({ ...f, image: fullUrl }));
      setImagePreview(fullUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) {
        await serviceService.update(editing._id, payload);
        toast.success("Service updated successfully");
      } else {
        await serviceService.create(payload);
        toast.success("Service created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await serviceService.remove(showDelete._id);
      toast.success("Service deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete service");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Services Page
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage the "How can we help?" directory shown on the public Services
            page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/services-page/divisions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
          >
            Division Pages
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Service
          </button>
        </div>
      </div>

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
          placeholder="Search services..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading services..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Order
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Service
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">
                    Link
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
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        No services found
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search
                          ? "Try a different search term"
                          : "Create your first service to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-[#66767d]">
                          {String(item.order ?? 0).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={displayImageUrl(item.image)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Sparkles className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#092f3b] line-clamp-1 max-w-xs">
                              {item.title}
                            </p>
                            {item.category && (
                              <p className="text-xs text-[#66767d] mt-0.5 line-clamp-1 max-w-xs">
                                {item.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d] line-clamp-1 max-w-xs block">
                          {item.link || "—"}
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Service" : "New Service"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" required>
              <input
                className={inputClass}
                value={form.title}
                onChange={set("title")}
                placeholder="Service title shown on the Services page"
                required
              />
            </Field>
            <Field label="Category">
              <input
                className={inputClass}
                value={form.category}
                onChange={set("category")}
                placeholder="e.g. Business Services"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={`${textareaClass} min-h-[80px]`}
              value={form.text}
              onChange={set("text")}
              placeholder="Short description shown under the title"
            />
          </Field>

          <Field label="Image" hint="Upload an image or provide a URL">
            <div className="space-y-3">
              <div className="flex items-stretch gap-2">
                <input
                  className={inputClass}
                  value={form.image}
                  onChange={set("image")}
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
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Service image preview"
                  className="w-full max-h-40 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Link" required hint="Internal paths or external URLs are supported.">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  value={form.link}
                  onChange={set("link")}
                  placeholder="/regional-offices or https://..."
                  required
                />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Order">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.order}
                  onChange={set("order")}
                  placeholder="Display order"
                />
              </Field>
              <Field label="Status">
                <select className={selectClass} value={form.status} onChange={set("status")}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </Field>
            </div>
          </div>

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
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Service" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this service?
          </p>
          <p className="text-sm font-bold text-[#092f3b] mb-6 line-clamp-2">
            {showDelete?.title}
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

export default ServicesManagement;
