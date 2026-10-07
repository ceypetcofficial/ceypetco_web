import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  Loader2,
  Link2,
  ArrowUp,
  ArrowDown,
  Save,
  FileText,
  ExternalLink,
} from "lucide-react";
import api from "../../../services/api";
import {
  supplierResourceService,
  supplierSectionService,
} from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const emptyForm = {
  title: "",
  url: "",
  order: 0,
  status: "published",
};

const SupplierResources = () => {
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
  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    eyebrow: "",
    title: "",
    description: "",
  });
  const [savingSection, setSavingSection] = useState(false);
  const fileInputRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      const [res, sec] = await Promise.all([
        supplierResourceService.getAll(params),
        supplierSectionService.getAll(),
      ]);
      const sorted = [...res.data].sort((a, b) => a.order - b.order);
      setItems(sorted);
      setSection(sec.data);
      setSectionForm({
        eyebrow: sec.data?.eyebrow || "",
        title: sec.data?.title || "",
        description: sec.data?.description || "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, [loadAll]);

  const openCreate = () => {
    setEditing(null);
    const nextOrder = items.length
      ? Math.max(...items.map((i) => i.order)) + 1
      : 0;
    setForm({ ...emptyForm, order: nextOrder });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      url: item.url || "",
      order: item.order ?? 0,
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
      fd.append("file", file);
      fd.append("visibility", "public");
      const res = await api.post("/upload/document", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fullUrl =
        res.data.data.url && res.data.data.url.startsWith("http")
          ? res.data.data.url
          : `${getApiOrigin()}${res.data.data.url}`;
      setForm((f) => ({ ...f, url: fullUrl }));
      toast.success("Document uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await supplierResourceService.update(editing._id, form);
        toast.success("Resource updated");
      } else {
        await supplierResourceService.create(form);
        toast.success("Resource created");
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await supplierResourceService.remove(showDelete._id);
      toast.success("Resource deleted");
      setShowDelete(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete resource");
    } finally {
      setDeleting(false);
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [a, b] = [next[index], next[target]];
    const temp = a.order;
    a.order = b.order;
    b.order = temp;
    next[index] = b;
    next[target] = a;
    setItems(next);
    try {
      await Promise.all([
        supplierResourceService.update(a._id, { order: a.order }),
        supplierResourceService.update(b._id, { order: b.order }),
      ]);
    } catch (err) {
      toast.error("Failed to reorder resources");
      loadAll();
    }
  };

  const saveSection = async () => {
    if (!sectionForm.title.trim()) {
      toast.error("Section title is required");
      return;
    }
    setSavingSection(true);
    try {
      if (section && section._id) {
        await supplierSectionService.update(sectionForm);
      } else {
        await supplierSectionService.create(sectionForm);
      }
      toast.success("Section content saved");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save section");
    } finally {
      setSavingSection(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Supplier Access
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage the "Supplier Access - Registration resources" section shown
            on the Tenders page.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Resource
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#092f3b] font-['Manrope']">
            Section heading &amp; description
          </h2>
          <button
            onClick={saveSection}
            disabled={savingSection}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#092f3b] hover:bg-[#072730] text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingSection ? "Saving..." : "Save section"}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Eyebrow (small label)">
            <input
              className={inputClass}
              value={sectionForm.eyebrow}
              onChange={(e) =>
                setSectionForm((s) => ({ ...s, eyebrow: e.target.value }))
              }
              placeholder="SUPPLIER ACCESS"
            />
          </Field>
          <Field label="Title">
            <input
              className={inputClass}
              value={sectionForm.title}
              onChange={(e) =>
                setSectionForm((s) => ({ ...s, title: e.target.value }))
              }
              placeholder="Registration resources"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description">
            <textarea
              className={textareaClass}
              value={sectionForm.description}
              onChange={(e) =>
                setSectionForm((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="Short intro shown under the title"
            />
          </Field>
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
            }
          }}
          placeholder="Search resources..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading resources..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] w-14">
                  Order
                </th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                  Resource
                </th>
                <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
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
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#092f3b]">
                      No resources found
                    </p>
                    <p className="text-xs text-[#66767d] mt-1">
                      Create your first supplier resource to get started
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-[#66767d] w-4 text-center">
                          {item.order}
                        </span>
                        <button
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                          title="Move down"
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#092f3b]">
                        {item.title}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 max-w-xs truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[#66767d]">—</span>
                      )}
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
        title={editing ? "Edit Resource" : "New Resource"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. General Guidelines"
              required
            />
          </Field>

          <Field
            label="URL / Document"
            hint="Upload a file or paste a document link."
          >
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-9`}
                  value={form.url}
                  onChange={set("url")}
                  placeholder="https://example.com/file.pdf"
                />
              </div>
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.ppt,.pptx,.jpeg,.jpg,.png"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Order">
              <input
                type="number"
                className={inputClass}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))
                }
              />
            </Field>
            <Field label="Status">
              <select className={selectClass} value={form.status} onChange={set("status")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
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
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Resource" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this resource?
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

export default SupplierResources;
