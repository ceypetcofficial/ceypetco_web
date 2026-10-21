import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Loader2, Save, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";
import { Field, inputClass, selectClass } from "../../components/form.jsx";

const fallback = {
  title: "Petroleum product specifications",
  description: "Official quality requirements and technical data for CEYPETCO petroleum products.",
  url: "https://ceypetco.gov.lk/wp-content/uploads/Import-Specification.pdf",
  status: "published",
};

export default function ProductSpecificationManagement() {
  const [form, setForm] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/admin/product-specification")
      .then(({ data }) => setForm({ ...fallback, ...(data.data || {}) }))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load product specifications"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF document");
      event.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("visibility", "public");
      const { data } = await api.post("/upload/document", body);
      setForm((current) => ({ ...current, url: data.data.url }));
      toast.success("PDF uploaded. Save changes to publish it.");
    } catch (error) {
      toast.error(error.response?.data?.message || "PDF upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.url) return toast.error("Upload a PDF document first");
    setSaving(true);
    try {
      const { data } = await api.put("/admin/product-specification", {
        title: form.title,
        description: form.description,
        url: form.url,
        status: form.status,
      });
      setForm({ ...fallback, ...data.data });
      toast.success(data.message || "Product specification updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product specification");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="grid min-h-80 place-items-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return <div className="mx-auto max-w-4xl">
    <div className="mb-6">
      <h1 className="text-xl font-extrabold text-[#092f3b]">Product Specifications</h1>
      <p className="mt-1 text-sm text-slate-500">Upload and publish the PDF shown on the public Product Specifications page.</p>
    </div>
    <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Document title" required><input className={inputClass} value={form.title} onChange={set("title")} /></Field>
        <Field label="Publishing status"><select className={selectClass} value={form.status} onChange={set("status")}><option value="published">Published</option><option value="draft">Draft</option></select></Field>
      </div>
      <Field label="Description"><textarea rows="4" className={inputClass} value={form.description} onChange={set("description")} /></Field>
      <Field label="Specification PDF" required>
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#062e3b] px-4 py-2.5 text-sm font-bold text-white">
              {uploading ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}{uploading ? "Uploading..." : "Upload PDF"}
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" disabled={uploading} onChange={uploadPdf} />
            </label>
            {form.url && <a href={form.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-red-600"><FileText size={17} />View current PDF <ExternalLink size={14} /></a>}
          </div>
          <input className={`${inputClass} mt-4`} value={form.url} onChange={set("url")} placeholder="PDF URL or upload a file" />
        </div>
      </Field>
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{saving ? "Saving..." : "Save product specification"}</button>
      </div>
    </form>
  </div>;
}
