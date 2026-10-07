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
  FileText,
  Link2,
  X,
} from "lucide-react";
import api from "../../../services/api";
import { tenderService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass, selectClass } from "../../components/form.jsx";

const emptyForm = {
  title: "",
  reference: "",
  summary: "",
  description: "",
  category: "general",
  division: "",
  publishedDate: "",
  closingDate: "",
  status: "draft",
};

const categoryOptions = [
  "general",
  "procurement",
  "construction",
  "supply",
  "services",
];

const getApiOrigin = () =>
  (import.meta.env.VITE_API_BASE_URL || "")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const TenderManagement = () => {
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
  const [docs, setDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRefs = useRef({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await tenderService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tenders");
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
    setDocs([]);
    setShowModal(true);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      reference: item.reference || "",
      summary: item.summary || "",
      description: item.description || "",
      category: item.category || "general",
      division: item.division || "",
      publishedDate: item.publishedDate?.split("T")[0] || "",
      closingDate: item.closingDate?.split("T")[0] || "",
      status: item.status || "draft",
    });
    setDocs(Array.isArray(item.documents) ? item.documents.map((d) => ({ ...d })) : []);
    setShowModal(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setDoc = (index, field, value) => {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const addDoc = () => {
    setDocs((prev) => [...prev, { name: "", url: "" }]);
  };

  const removeDoc = (index) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadDocFile = async (index, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploadingDoc(index);
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
      setDoc(index, "url", fullUrl);
      if (!docs[index] || !docs[index].name) {
        setDoc(index, "name", file.name.replace(/\.[^.]+$/, ""));
      }
      toast.success("Document uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingDoc(null);
      if (fileInputRefs.current[index]) fileInputRefs.current[index].value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.publishedDate) payload.publishedDate = new Date(payload.publishedDate).toISOString();
      else delete payload.publishedDate;
      if (payload.closingDate) payload.closingDate = new Date(payload.closingDate).toISOString();
      else delete payload.closingDate;
      const cleanDocs = docs
        .map((d) => ({ name: d.name?.trim(), url: d.url?.trim() }))
        .filter((d) => d.name || d.url);
      if (cleanDocs.length) payload.documents = cleanDocs;
      if (editing) {
        await tenderService.update(editing._id, payload);
        toast.success("Tender updated successfully");
      } else {
        await tenderService.create(payload);
        toast.success("Tender created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tender");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tenderService.remove(showDelete._id);
      toast.success("Tender deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete tender");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Tenders Management
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Create and manage tenders advertised by CEYPETCO.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Tender
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
          placeholder="Search tenders..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading tenders..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
                    Division
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden sm:table-cell">
                    Closing
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
                        No tenders found
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">
                        {search
                          ? "Try a different search term"
                          : "Create your first tender to get started"}
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
                        {item.documents?.length > 0 && (
                          <p className="text-xs text-[#66767d] mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {item.documents.length} document(s)
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d]">{item.reference || "—"}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs text-[#66767d]">{item.division || "—"}</span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {item.closingDate
                            ? new Date(item.closingDate).toLocaleDateString()
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Tender" : "New Tender"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder="Tender headline"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Reference No.">
              <input
                className={inputClass}
                value={form.reference}
                onChange={set("reference")}
                placeholder="e.g. BK/48/2026"
              />
            </Field>
            <Field label="Division">
              <input
                className={inputClass}
                value={form.division}
                onChange={set("division")}
                placeholder="e.g. Refinery Division"
              />
            </Field>
          </div>

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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Published Date">
              <input
                type="date"
                className={inputClass}
                value={form.publishedDate}
                onChange={set("publishedDate")}
              />
            </Field>
            <Field label="Closing Date">
              <input
                type="date"
                className={inputClass}
                value={form.closingDate}
                onChange={set("closingDate")}
              />
            </Field>
          </div>

          <Field label="Summary">
            <textarea
              className={textareaClass}
              value={form.summary}
              onChange={set("summary")}
              placeholder="Short summary"
            />
          </Field>

          <Field label="Description">
            <textarea
              className={`${textareaClass} min-h-[120px]`}
              value={form.description}
              onChange={set("description")}
              placeholder="Full description"
            />
          </Field>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-[#092f3b] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents
                </p>
                <p className="text-xs text-[#66767d]">
                  Upload a file or paste an external document link.
                </p>
              </div>
              <button
                type="button"
                onClick={addDoc}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Document
              </button>
            </div>

            {docs.length === 0 ? (
              <p className="text-sm text-[#66767d] bg-slate-50 rounded-lg px-4 py-6 text-center">
                No documents added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {docs.map((doc, index) => (
                  <div key={doc._id || doc.id || index} className="rounded-lg border border-slate-200 p-3 space-y-3 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <input
                        className={inputClass}
                        value={doc.name}
                        onChange={(e) => setDoc(index, "name", e.target.value)}
                        placeholder="Document name"
                      />
                      <button
                        type="button"
                        onClick={() => removeDoc(index)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          className={`${inputClass} pl-9`}
                          value={doc.url}
                          onChange={(e) => setDoc(index, "url", e.target.value)}
                          placeholder="https://... or leave blank to upload"
                        />
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <input
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.ppt,.pptx"
                          onChange={(e) => uploadDocFile(index, e)}
                          className="hidden"
                          id={`doc-file-${index}`}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[index]?.click()}
                          disabled={uploadingDoc === index}
                          className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          {uploadingDoc === index ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingDoc === index ? "Uploading..." : "Upload file"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Tender" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this tender?
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

export default TenderManagement;
