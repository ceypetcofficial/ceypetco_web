import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Edit3, Plus, Trash2, Upload } from "lucide-react";
import api from "../../../services/api";
import displayImageUrl from "../../../utils/displayImageUrl.js";
import { historyPageService } from "../../../services/contentService";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, textareaClass } from "../../components/form.jsx";

const pageFields = [
  ["heroLabel", "Hero label"],
  ["heroTitle", "Hero title"],
  ["heroIntro", "Hero introduction"],
  ["heroImage", "Hero image URL"],
  ["journeyLabel", "Journey label"],
  ["journeyTitle", "Journey title"],
  ["journeyIntro", "Journey introduction"],
  ["galleryLabel", "Gallery label"],
  ["galleryTitle", "Gallery title"],
];

const emptyItem = (kind) => kind === "milestones"
  ? { year: "", text: "" }
  : { image: "", alt: "", caption: "", wide: false };

export default function HistoryManagement() {
  const [data, setData] = useState(null);
  const [pageForm, setPageForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await historyPageService.get();
      setData(result.data);
      setPageForm(Object.fromEntries(pageFields.map(([key]) => [key, result.data[key] || ""])));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load history page");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = async (next, successMessage) => {
    setSaving(true);
    try {
      const result = await historyPageService.update(next);
      setData(result.data);
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save history page");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const savePage = async (event) => {
    event.preventDefault();
    await persist({ ...data, ...pageForm }, "History page updated");
  };

  const saveItem = async (event) => {
    event.preventDefault();
    const items = [...data[dialog.kind]];
    if (dialog.index === null) items.push(dialog.form);
    else items[dialog.index] = { ...items[dialog.index], ...dialog.form };
    if (await persist({ ...data, [dialog.kind]: items }, "History item saved")) setDialog(null);
  };

  const removeItem = async () => {
    const items = data[deleteTarget.kind].filter((_, index) => index !== deleteTarget.index);
    if (await persist({ ...data, [deleteTarget.kind]: items }, "History item deleted")) setDeleteTarget(null);
  };

  const moveItem = async (kind, index, direction) => {
    const items = [...data[kind]];
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    [items[index], items[destination]] = [items[destination], items[index]];
    await persist({ ...data, [kind]: items }, "Order updated");
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api.post("/upload/image", body);
      const origin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")
        .replace(/\/+$/, "").replace(/\/api$/, "");
      const url = result.data.data.url;
      setDialog((current) => ({
        ...current,
        form: { ...current.form, image: url.startsWith("http") ? url : `${origin}${url}` },
      }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const uploadHero = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api.post("/upload/image", body);
      const origin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")
        .replace(/\/+$/, "").replace(/\/api$/, "");
      const url = result.data.data.url;
      setPageForm((current) => ({ ...current, heroImage: url.startsWith("http") ? url : `${origin}${url}` }));
      toast.success("Hero image uploaded. Save page text to publish it.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingHero(false);
      event.target.value = "";
    }
  };

  if (loading) return <Loading label="Loading history page..." />;
  if (!data || !pageForm) return <p className="text-red-600">History page could not be loaded.</p>;

  const openDialog = (kind, index = null) => setDialog({
    kind,
    index,
    form: index === null ? emptyItem(kind) : { ...data[kind][index] },
  });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-[#092f3b]">History Page</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the public history page, timeline, and photo gallery.</p>
      </div>

      <form onSubmit={savePage} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-bold text-lg text-[#092f3b]">Page text and hero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pageFields.map(([key, label]) => (
            <Field key={key} label={label} required>
              {key.endsWith("Intro") ? (
                <textarea className={textareaClass} value={pageForm[key]} required onChange={(event) => setPageForm((current) => ({ ...current, [key]: event.target.value }))} />
              ) : (
                <input className={inputClass} value={pageForm[key]} required onChange={(event) => setPageForm((current) => ({ ...current, [key]: event.target.value }))} />
              )}
            </Field>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold cursor-pointer"><Upload size={16} />{uploadingHero ? "Uploading..." : "Upload hero image"}<input type="file" accept="image/*" className="hidden" disabled={uploadingHero} onChange={uploadHero} /></label>
        {pageForm.heroImage && <img src={pageForm.heroImage} alt="Hero preview" className="w-full max-h-48 object-cover rounded-lg" />}
        <button disabled={saving} className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save page text"}</button>
      </form>

      {[["milestones", "Timeline milestones"], ["gallery", "Gallery images"]].map(([kind, title]) => (
        <section key={kind} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="font-bold text-lg text-[#092f3b]">{title}</h2>
            <button type="button" onClick={() => openDialog(kind)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"><Plus size={16} /> Add {kind === "milestones" ? "milestone" : "image"}</button>
          </div>
          {data[kind].length === 0 && <p className="text-sm text-slate-500">No items yet.</p>}
          <div className="space-y-3">
            {data[kind].map((item, index) => (
              <div key={item._id || index} className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
                {kind === "gallery" && <img src={displayImageUrl(item.image)} alt={item.alt || ""} className="w-20 h-14 rounded object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#092f3b]">{kind === "milestones" ? item.year : item.caption || `Image ${index + 1}`}</p>
                  <p className="text-sm text-slate-500 truncate">{kind === "milestones" ? item.text : item.image}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" title="Move up" aria-label="Move up" disabled={saving || index === 0} onClick={() => moveItem(kind, index, -1)} className="p-2 text-slate-600 disabled:opacity-30"><ArrowUp size={17} /></button>
                  <button type="button" title="Move down" aria-label="Move down" disabled={saving || index === data[kind].length - 1} onClick={() => moveItem(kind, index, 1)} className="p-2 text-slate-600 disabled:opacity-30"><ArrowDown size={17} /></button>
                  <button type="button" title="Edit" aria-label="Edit" onClick={() => openDialog(kind, index)} className="p-2 text-blue-700"><Edit3 size={17} /></button>
                  <button type="button" title="Delete" aria-label="Delete" onClick={() => setDeleteTarget({ kind, index })} className="p-2 text-red-600"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Modal open={!!dialog} onClose={() => setDialog(null)} title={`${dialog?.index === null ? "Add" : "Edit"} ${dialog?.kind === "milestones" ? "milestone" : "gallery image"}`}>
        {dialog && <form onSubmit={saveItem} className="space-y-4">
          {dialog.kind === "milestones" ? <>
            <Field label="Year" required><input className={inputClass} required value={dialog.form.year} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, year: event.target.value } }))} /></Field>
            <Field label="Description" required><textarea className={textareaClass} required value={dialog.form.text} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, text: event.target.value } }))} /></Field>
          </> : <>
            <Field label="Image URL" required><input className={inputClass} required value={dialog.form.image} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, image: event.target.value } }))} /></Field>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold cursor-pointer"><Upload size={16} />{uploading ? "Uploading..." : "Upload image"}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={uploadImage} /></label>
            {dialog.form.image && <img src={dialog.form.image} alt="Preview" className="w-full max-h-40 object-cover rounded-lg" />}
            <Field label="Alternative text"><input className={inputClass} value={dialog.form.alt} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, alt: event.target.value } }))} /></Field>
            <Field label="Caption"><input className={inputClass} value={dialog.form.caption} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, caption: event.target.value } }))} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#092f3b]"><input type="checkbox" checked={dialog.form.wide} onChange={(event) => setDialog((current) => ({ ...current, form: { ...current.form, wide: event.target.checked } }))} /> Wide image</label>
          </>}
          <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={() => setDialog(null)} className="px-4 py-2 rounded-lg border border-slate-300">Cancel</button><button disabled={saving || uploading} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button></div>
        </form>}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete history item" size="sm">
        <p className="text-sm text-slate-600 mb-6">Delete this item from the public history page?</p>
        <div className="flex justify-end gap-3"><button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-300">Cancel</button><button onClick={removeItem} disabled={saving} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50">{saving ? "Deleting..." : "Delete"}</button></div>
      </Modal>
    </div>
  );
}
