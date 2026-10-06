import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Pencil,
  Link2,
  Smartphone,
  Star,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";
import api from "../../../services/api";
import { mobileAppService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const platformOptions = [
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "web", label: "Web" },
];

const emptyForm = {
  title: "",
  description: "",
  platform: "android",
  appIcon: "",
  downloadUrl: "",
  storeUrl: "",
  order: 0,
  featured: false,
  status: "published",
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

const MobileAppManagement = () => {
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
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await mobileAppService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load mobile apps");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

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
      platform: item.platform || "android",
      appIcon: item.appIcon || "",
      downloadUrl: item.downloadUrl || "",
      storeUrl: item.storeUrl || "",
      order: item.order ?? 0,
      featured: !!item.featured,
      status: item.status || "published",
    });
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
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setForm((f) => ({ ...f, appIcon: fullUrl }));
      toast.success("App icon uploaded successfully");
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
      const payload = {
        ...form,
        order: Number(form.order) || 0,
        featured: !!form.featured,
      };
      if (editing) {
        await mobileAppService.update(editing._id, payload);
        toast.success("Mobile app updated successfully");
      } else {
        await mobileAppService.create(payload);
        toast.success("Mobile app created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save mobile app");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mobileAppService.remove(showDelete._id);
      toast.success("Mobile app deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete mobile app");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div id="mobile-apps-page" className="admin-page" data-page="mobile-apps">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Mobile Apps
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage the official mobile applications shown on the public
            &quot;/mobile-app&quot; page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New App
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
          placeholder="Search apps..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading mobile apps..." />
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
                    App
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">
                    Platform
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
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Smartphone className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        No mobile apps found
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search
                          ? "Try a different search term"
                          : "Create your first app to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star
                            className={`w-3.5 h-3.5 ${item.featured ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                          />
                          <span className="text-xs font-bold text-[#66767d]">
                            {String(item.order ?? 0).padStart(2, "0")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.appIcon ? (
                              <img
                                src={item.appIcon}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Smartphone className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#092f3b] line-clamp-1 max-w-xs">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-xs text-[#66767d] mt-0.5 line-clamp-1 max-w-xs">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold text-[#092f3b] bg-slate-100 capitalize">
                          {item.platform}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d] line-clamp-1 max-w-xs block">
                          {item.downloadUrl || item.storeUrl || "—"}
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
        title={editing ? "Edit Mobile App" : "New Mobile App"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="Title" required>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={set("title")}
                  placeholder="App name shown on the public page"
                  required
                />
              </Field>
            </div>
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
          </div>

          <Field label="Description">
            <textarea
              className={`${textareaClass} min-h-[90px]`}
              value={form.description}
              onChange={set("description")}
              placeholder="Short description shown under the app title"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Platform">
              <select
                className={selectClass}
                value={form.platform}
                onChange={set("platform")}
              >
                {platformOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>

          <Field label="App Icon">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {form.appIcon ? (
                  <img
                    src={form.appIcon}
                    alt="App icon preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  id="mobile-app-icon-upload"
                />
                <label
                  htmlFor="mobile-app-icon-upload"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload icon"}
                </label>
                {form.appIcon && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, appIcon: "" }))}
                    className="ml-2 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Download URL" hint="Direct APK link or download page for Android/web apps.">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  value={form.downloadUrl}
                  onChange={set("downloadUrl")}
                  placeholder="https://..."
                />
              </div>
            </Field>
            <Field label="Store URL" hint="App Store / Play Store listing for iOS apps.">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  value={form.storeUrl}
                  onChange={set("storeUrl")}
                  placeholder="https://apps.apple.com/..."
                />
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-[#092f3b]">
                Featured app
              </p>
              <p className="text-xs text-[#66767d] mt-0.5">
                The featured app is highlighted in a larger card
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#66767d]">
                {form.featured ? "On" : "Off"}
              </span>
              <Toggle
                checked={form.featured}
                onChange={(value) => setForm((f) => ({ ...f, featured: value }))}
              />
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

      <Modal
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        title="Delete Mobile App"
        size="sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this app?
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

export default MobileAppManagement;