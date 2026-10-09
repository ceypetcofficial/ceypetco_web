import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Pencil,
  Upload,
  Loader2,
  Eye,
  Power,
  RotateCcw,
  Megaphone,
} from "lucide-react";
import api from "../../../services/api";
import { popupNoticeService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";
import PopupNotice from "../../../components/PopupNotice";
import displayImageUrl from "../../../utils/displayImageUrl.js";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  status: "inactive",
  priority: 0,
  showOnce: true,
  buttonEnabled: false,
  buttonText: "Learn More",
  buttonLink: "",
  linkType: "internal",
};

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
    />
  </button>
);

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const PopupNoticeManagement = () => {
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
  const [togglingId, setTogglingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewNotice, setPreviewNotice] = useState(null);
  const [previewCount, setPreviewCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await popupNoticeService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load popup notices");
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
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      status: item.status || "inactive",
      priority: item.priority ?? 0,
      showOnce: !!item.showOnce,
      buttonEnabled: !!item.buttonEnabled,
      buttonText: item.buttonText || "Learn More",
      buttonLink: item.buttonLink || "",
      linkType: item.linkType === "external" ? "external" : "internal",
    });
    setShowModal(true);
  };

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
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setForm((f) => ({ ...f, imageUrl: fullUrl }));
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
      const payload = { ...form };
      if (payload.priority === "" || payload.priority === null) {
        payload.priority = 0;
      }
      if (editing) {
        await popupNoticeService.update(editing._id, payload);
        toast.success("Popup notice updated successfully");
      } else {
        await popupNoticeService.create(payload);
        toast.success("Popup notice created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save popup notice");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await popupNoticeService.remove(showDelete._id);
      toast.success("Popup notice deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete popup notice");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item) => {
    setTogglingId(item._id);
    const next = item.status === "active" ? "inactive" : "active";
    try {
      await popupNoticeService.updateStatus(item._id, next);
      toast.success(next === "active" ? "Popup notice activated" : "Popup notice deactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const resetVisibility = async (item) => {
    setResettingId(item._id);
    try {
      await popupNoticeService.resetVisibility(item._id);
      toast.success("Visibility reset — visitors will see it again");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset visibility");
    } finally {
      setResettingId(null);
    }
  };

  const openPreview = () => {
    setPreviewNotice({
      _id: editing?._id || "preview",
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      status: "active",
      priority: form.priority,
      showOnce: form.showOnce,
      buttonEnabled: form.buttonEnabled,
      buttonText: form.buttonText,
      buttonLink: form.buttonLink,
      linkType: form.linkType,
      updatedAt: new Date().toISOString(),
    });
    setPreviewCount((count) => count + 1);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Popup Notice Management
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Create and manage announcements shown to first-time visitors.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Popup Notice
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
          placeholder="Search by title..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading popup notices..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Title</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">Priority</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">Button</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Megaphone className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">No popup notices found</p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search ? "Try a different search term" : "Create your first popup notice to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={displayImageUrl(item.imageUrl)}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Megaphone className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <p className="text-sm font-semibold text-[#092f3b] line-clamp-1 max-w-xs">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs font-semibold text-[#092f3b]">{item.priority ?? 0}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {item.buttonEnabled ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {item.buttonText || "Enabled"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setPreviewNotice({
                                _id: item._id,
                                title: item.title,
                                description: item.description,
                                imageUrl: item.imageUrl,
                                status: "active",
                                showOnce: item.showOnce,
                                buttonEnabled: item.buttonEnabled,
                                buttonText: item.buttonText,
                                buttonLink: item.buttonLink,
                                linkType: item.linkType,
                                updatedAt: item.updatedAt || new Date().toISOString(),
                              });
                              setPreviewCount((count) => count + 1);
                            }}
                            title="Preview"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(item)}
                            disabled={togglingId === item._id}
                            title={item.status === "active" ? "Deactivate" : "Activate"}
                            className={`p-2 rounded-lg transition-colors ${item.status === "active" ? "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => resetVisibility(item)}
                            disabled={resettingId === item._id}
                            title="Reset visibility"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
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
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Popup Notice" : "New Popup Notice"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#66767d]">
              Preview the popup as visitors will see it.
            </p>
            <button
              type="button"
              onClick={openPreview}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Popup
            </button>
          </div>

          <Field label="Title" required>
            <input className={inputClass} value={form.title} onChange={set("title")} placeholder="e.g. Monthly Fuel Price Update" required />
          </Field>

          <Field label="Description">
            <textarea
              className={`${textareaClass} min-h-[110px]`}
              value={form.description}
              onChange={set("description")}
              placeholder="Short announcement message shown to visitors"
            />
          </Field>

          <Field label="Image / Banner" hint="Upload an image or provide a URL">
            <div className="space-y-3">
              <div className="flex items-stretch gap-2">
                <input
                  className={inputClass}
                  value={form.imageUrl}
                  onChange={set("imageUrl")}
                  placeholder="https://example.com/banner.jpg"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>
              {form.imageUrl && (
                <img
                  src={displayImageUrl(form.imageUrl)}
                  alt="Popup banner preview"
                  className="w-full max-h-44 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Status">
              <select className={selectClass} value={form.status} onChange={set("status")}>
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
              </select>
            </Field>
            <Field label="Priority" hint="Higher number shown first">
              <input
                type="number"
                min="0"
                max="1000"
                className={inputClass}
                value={form.priority}
                onChange={set("priority")}
              />
            </Field>
            <Field label="Show Once" hint="Remember visitor permanently. Off = once per session.">
              <div className="h-11 flex items-center">
                <Toggle checked={form.showOnce} onChange={(value) => setForm((f) => ({ ...f, showOnce: value }))} />
              </div>
            </Field>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#092f3b]">Action button</p>
                <p className="text-xs text-[#66767d]">Show a button with a link on the popup</p>
              </div>
              <Toggle checked={form.buttonEnabled} onChange={(value) => setForm((f) => ({ ...f, buttonEnabled: value }))} />
            </div>

            {form.buttonEnabled && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Button text" required>
                    <input className={inputClass} value={form.buttonText} onChange={set("buttonText")} placeholder="Learn More" required />
                  </Field>
                  <Field label="Link type">
                    <select className={selectClass} value={form.linkType} onChange={set("linkType")}>
                      <option value="internal">Internal page route</option>
                      <option value="external">External URL</option>
                    </select>
                  </Field>
                </div>
                <Field label={form.linkType === "external" ? "External URL" : "Internal route"} required hint={form.linkType === "external" ? "e.g. https://ceypetco.gov.lk/report.pdf" : "e.g. /services or /contact"}>
                  <input
                    className={inputClass}
                    value={form.buttonLink}
                    onChange={set("buttonLink")}
                    placeholder={form.linkType === "external" ? "https://..." : "/services"}
                    required
                  />
                </Field>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              <Pencil className="w-4 h-4" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Popup Notice" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">Are you sure you want to delete this popup notice?</p>
          <p className="text-sm font-bold text-[#092f3b] mb-6 line-clamp-2">"{showDelete?.title}"</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setShowDelete(null)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {previewNotice && (
        <PopupNotice key={previewCount} notice={previewNotice} preview />
      )}
    </div>
  );
};

export default PopupNoticeManagement;
