import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  User,
  ImagePlus,
} from "lucide-react";
import api from "../../../services/api";
import { teamMemberService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, selectClass, textareaClass } from "../../components/form.jsx";
import displayImageUrl from "../../../utils/displayImageUrl.js";

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const emptyForm = {
  name: "",
  role: "",
  photo: "",
  description: "",
  order: 0,
  status: "published",
};

const TeamMembersManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      const res = await teamMemberService.getAll(params);
      const sorted = [...res.data].sort((a, b) => a.order - b.order);
      setItems(sorted);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      role: item.role || "",
      photo: item.photo || "",
      description: item.description || "",
      order: item.order ?? 0,
      status: item.status || "published",
    });
    setShowModal(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be smaller than 4 MB");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/upload/image", fd);
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setForm((f) => ({ ...f, photo: fullUrl }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await teamMemberService.update(editing._id, form);
        toast.success("Team member updated");
      } else {
        await teamMemberService.create(form);
        toast.success("Team member created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await teamMemberService.remove(showDelete._id);
      toast.success("Team member deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team member");
    } finally {
      setDeleting(false);
    }
  };

  const move = async (item, dir) => {
    const idx = items.findIndex((c) => c._id === item._id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const a = items[idx];
    const b = items[targetIdx];
    try {
      await Promise.all([
        teamMemberService.update(a._id, { order: b.order }),
        teamMemberService.update(b._id, { order: a.order }),
      ]);
      toast.success("Order updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reorder failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Management Team
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage the leadership grid shown on the About page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Member
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSearch(searchInput);
          }}
          placeholder="Search by name or role..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading team members..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                  Photo
                </th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                  Name
                </th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                  Order
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
                    <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#092f3b]">
                      No team members found
                    </p>
                    <p className="text-xs text-[#66767d] mt-1">
                      Create your first team member to get started
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      {item.photo ? (
                        <img
                          src={displayImageUrl(item.photo)}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-[#092f3b]">
                        {item.name}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-[#66767d]">{item.role}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => move(item, -1)}
                          disabled={idx === 0}
                          title="Move up"
                          className="w-6 h-6 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 text-sm leading-none"
                        >
                          ↑
                        </button>
                        <span className="text-sm font-semibold text-[#092f3b] w-6 text-center">
                          {item.order}
                        </span>
                        <button
                          onClick={() => move(item, 1)}
                          disabled={idx === items.length - 1}
                          title="Move down"
                          className="w-6 h-6 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 text-sm leading-none"
                        >
                          ↓
                        </button>
                      </div>
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
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Team Member" : "New Team Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            {form.photo ? (
              <img
                src={displayImageUrl(form.photo)}
                alt="preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-7 h-7 text-slate-400" />
              </div>
            )}
            <div className="flex-1">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
              {form.photo && (
                <p className="text-xs text-[#66767d] mt-1.5 truncate">
                  {form.photo}
                </p>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>

          <Field label="Name" required>
            <input
              className={inputClass}
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. John Doe"
              required
            />
          </Field>

          <Field label="Role">
            <input
              className={inputClass}
              value={form.role}
              onChange={set("role")}
              placeholder="e.g. Chairman"
            />
          </Field>

          <Field label="Description" hint="Short bio shown beside the photo on the About page.">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Leads the board and oversees corporate strategy..."
              rows={4}
            />
          </Field>

          <Field label="Photo URL" hint="Or use the upload button above.">
            <input
              className={inputClass}
              value={form.photo}
              onChange={set("photo")}
              placeholder="https://..."
            />
          </Field>

          <Field label="Order">
            <input
              type="number"
              className={inputClass}
              value={form.order}
              onChange={set("order")}
            />
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
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!showDelete}
        onClose={() => setShowDelete(null)}
        title="Delete Team Member"
        size="sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this team member?
          </p>
          <p className="text-sm font-bold text-[#092f3b] mb-6">
            {showDelete?.name}
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

export default TeamMembersManagement;
