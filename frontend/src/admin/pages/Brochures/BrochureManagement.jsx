import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, ExternalLink, FileText, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import api from "../../../services/api";
import { brochureService } from "../../../services/contentService";
import displayImageUrl from "../../../utils/displayImageUrl.js";
import { Field, inputClass, selectClass, textareaClass } from "../../components/form.jsx";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";

const emptyForm = { title: "", description: "", year: "", url: "", order: 0, status: "published" };
const apiOrigin = () => (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");

export default function BrochureManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await brochureService.getAll({ limit: 200, ...(query.trim() ? { search: query.trim() } : {}) });
      setItems(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load brochures");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      year: item.year || "",
      url: item.url || "",
      order: item.order ?? 0,
      status: item.status || "published",
    });
    setModalOpen(true);
  };

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("visibility", "public");
      const response = await api.post("/upload/document", data, { headers: { "Content-Type": "multipart/form-data" } });
      const uploadedUrl = response.data.data.url;
      setForm((current) => ({
        ...current,
        url: uploadedUrl?.startsWith("http") ? uploadedUrl : `${apiOrigin()}${uploadedUrl}`,
        title: current.title || file.name.replace(/\.pdf$/i, ""),
      }));
      toast.success("Brochure PDF uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "PDF upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await brochureService.update(editing._id, payload);
      else await brochureService.create(payload);
      toast.success(editing ? "Brochure updated" : "Brochure created");
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save brochure");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await brochureService.remove(deleting._id);
      toast.success("Brochure deleted");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete brochure");
    }
  };

  return <div>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div><h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">Brochures</h1><p className="text-sm text-[#66767d] mt-1">Upload and manage PDF brochures shown on the public website.</p></div>
      <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold shadow-sm"><Plus className="w-4 h-4"/>New Brochure</button>
    </div>

    <div className="relative mb-5 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brochures..." className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"/></div>

    {loading ? <Loading label="Loading brochures..."/> : items.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white py-16 text-center"><FileText className="mx-auto mb-3 h-10 w-10 text-slate-300"/><h2 className="font-bold text-[#092f3b]">No brochures found</h2><p className="mt-1 text-sm text-[#66767d]">Upload your first brochure PDF to get started.</p></div> :
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><FileText className="h-5 w-5"/></div><StatusBadge status={item.status}/></div>
        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-red-600">{item.year || "Brochure"}</p>
        <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold text-[#092f3b]" title={item.title}>{item.title}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#66767d]">{item.description || "PDF brochure"}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <a href={displayImageUrl(item.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600"><ExternalLink className="h-3.5 w-3.5"/>View PDF</a>
          <div className="flex gap-1"><button onClick={() => openEdit(item)} title="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#092f3b]"><Edit3 className="h-4 w-4"/></button><button onClick={() => setDeleting(item)} title="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4"/></button></div>
        </div>
      </article>)}</div>}

    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Brochure" : "New Brochure"}>
      <form onSubmit={save} className="space-y-4">
        <Field label="Title" required><input className={inputClass} value={form.title} onChange={set("title")} placeholder="Brochure title" required/></Field>
        <Field label="Description"><textarea className={textareaClass} value={form.description} onChange={set("description")} placeholder="Short description shown on the brochure card"/></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Year"><input className={inputClass} value={form.year} onChange={set("year")} placeholder="2026" maxLength={4}/></Field><Field label="Display Order"><input type="number" min="0" className={inputClass} value={form.order} onChange={set("order")}/></Field></div>
        <Field label="Brochure PDF" required hint="Upload a PDF file or paste a public PDF URL."><div className="flex gap-2"><input type="url" className={inputClass} value={form.url} onChange={set("url")} placeholder="https://.../brochure.pdf" required/><button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-[#092f3b] disabled:opacity-50">{uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}{uploading ? "Uploading" : "Upload"}</button><input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={uploadPdf} className="hidden"/></div></Field>
        <Field label="Status"><select className={selectClass} value={form.status} onChange={set("status")}><option value="published">Published</option><option value="draft">Draft</option></select></Field>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving || uploading} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button></div>
      </form>
    </Modal>

    <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Brochure" size="sm"><div className="text-center"><Trash2 className="mx-auto mb-4 h-10 w-10 text-red-600"/><p className="text-sm text-[#66767d]">Delete this brochure record and its managed PDF?</p><p className="my-4 font-bold text-[#092f3b]">{deleting?.title}</p><div className="flex justify-center gap-3"><button onClick={() => setDeleting(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button onClick={remove} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white">Delete</button></div></div></Modal>
  </div>;
}
