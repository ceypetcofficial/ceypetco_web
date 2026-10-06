import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  FolderKanban,
  Pencil,
  Upload,
  Loader2,
  Image as ImageIcon,
  Link2,
  PlusCircle,
  X,
  ExternalLink,
} from "lucide-react";
import api from "../../../services/api";
import { projectService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  category: "general",
  featuredImage: "",
  location: "",
  statusLabel: "",
  startDate: "",
  completionDate: "",
  status: "draft",
};

const categoryOptions = [
  "general",
  "refinery",
  "infrastructure",
  "retail-network",
  "renewable",
  "OandG",
];

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const ProjectManagement = () => {
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
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [docs, setDocs] = useState([]);
  const [docForm, setDocForm] = useState({ name: "", url: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await projectService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load projects");
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
    setDocs([]);
    setDocForm({ name: "", url: "" });
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
      location: item.location || "",
      statusLabel: item.statusLabel || "",
      startDate: item.startDate?.split("T")[0] || "",
      completionDate: item.completionDate?.split("T")[0] || "",
      status: item.status || "draft",
    });
    setImagePreview(item.featuredImage || "");
    setDocs(Array.isArray(item.documents) ? item.documents : []);
    setDocForm({ name: "", url: "" });
    setShowModal(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setForm((f) => ({ ...f, featuredImage: fullUrl }));
      setImagePreview(fullUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload/document", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setDocs((d) => [
        ...d,
        { name: res.data.data.originalname || file.name, url: fullUrl },
      ]);
      toast.success("Document uploaded and added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addDocByLink = () => {
    if (!docForm.url) return;
    setDocs((d) => [...d, { name: docForm.name || docForm.url, url: docForm.url }]);
    setDocForm({ name: "", url: "" });
  };

  const removeDoc = (index) => {
    setDocs((d) => d.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, documents: docs };
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      else delete payload.startDate;
      if (payload.completionDate) payload.completionDate = new Date(payload.completionDate).toISOString();
      else delete payload.completionDate;
      if (editing) {
        await projectService.update(editing._id, payload);
        toast.success("Project updated successfully");
      } else {
        await projectService.create(payload);
        toast.success("Project created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectService.remove(showDelete._id);
      toast.success("Project deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Projects Management
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage strategic projects and infrastructure initiatives shown on the website.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
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
          placeholder="Search projects..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading projects..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Project
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden sm:table-cell">
                    Location
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
                      <FolderKanban className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        No projects found
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search
                          ? "Try a different search term"
                          : "Create your first project to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.featuredImage ? (
                            <img
                              src={item.featuredImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <FolderKanban className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#092f3b] line-clamp-1 max-w-xs">
                              {item.title}
                            </p>
                            <p className="text-xs text-[#66767d] mt-0.5 line-clamp-1 max-w-xs">
                              {item.summary || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs text-[#66767d]">{item.category}</span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs text-[#66767d]">{item.location || "—"}</span>
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
        title={editing ? "Edit Project" : "New Project"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder="Project name"
              required
            />
          </Field>

          <Field label="Featured Image">
            <div className="flex items-stretch gap-3">
              <div className="w-24 h-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className={`${inputClass} pl-9`}
                      value={form.featuredImage}
                      onChange={set("featuredImage")}
                      placeholder="Paste an image URL"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {imageUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {imageUploading ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-[#66767d]">
                  Upload an image or paste a URL. Shown as the project thumbnail.
                </p>
              </div>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select className={selectClass} value={form.category} onChange={set("category")}>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className={selectClass} value={form.status} onChange={set("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location">
              <input
                className={inputClass}
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Sapugaskanda, Sri Lanka"
              />
            </Field>
            <Field label="Status Label">
              <input
                className={inputClass}
                value={form.statusLabel}
                onChange={set("statusLabel")}
                placeholder="e.g. Ongoing, Under construction"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={set("startDate")}
              />
            </Field>
            <Field label="Completion Date">
              <input
                type="date"
                className={inputClass}
                value={form.completionDate}
                onChange={set("completionDate")}
              />
            </Field>
          </div>

          <Field label="Summary">
            <textarea
              className={textareaClass}
              value={form.summary}
              onChange={set("summary")}
              placeholder="Short project description shown in lists"
            />
          </Field>

          <Field label="Content" required>
            <textarea
              className={`${textareaClass} min-h-[160px]`}
              value={form.content}
              onChange={set("content")}
              placeholder="Full project description"
              required
            />
          </Field>

          <Field
            label="Documents"
            hint="Add downloadable documents linked to this project."
          >
            <div className="space-y-3">
              <div className="flex items-stretch gap-2">
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
                  {uploading ? "Uploading..." : "Upload file"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.ppt,.pptx"
                  onChange={handleDocUpload}
                  className="hidden"
                />
              </div>
              <div className="flex items-stretch gap-2">
                <input
                  className={inputClass}
                  value={docForm.name}
                  onChange={(e) => setDocForm((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Document name (optional)"
                />
                <input
                  className={inputClass}
                  value={docForm.url}
                  onChange={(e) => setDocForm((d) => ({ ...d, url: e.target.value }))}
                  placeholder="https://example.com/file.pdf"
                />
                <button
                  type="button"
                  onClick={addDocByLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add
                </button>
              </div>

              {docs.length > 0 && (
                <ul className="space-y-2">
                  {docs.map((doc, index) => (
                    <li
                      key={doc._id || doc.id || index}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm text-[#092f3b] truncate">{doc.name}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Project" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this project?
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

export default ProjectManagement;
