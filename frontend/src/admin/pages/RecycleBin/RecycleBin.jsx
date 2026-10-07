import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";
import Loading from "../../components/Loading";

export default function RecycleBin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await api.get("/admin/recycle-bin")).data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || "Could not load deleted items"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const restore = async (item) => {
    setRestoring(item._id);
    try {
      await api.post(`/admin/recycle-bin/${encodeURIComponent(item.model)}/${encodeURIComponent(item._id)}/restore`);
      toast.success("Item restored");
      await load();
    } catch (error) { toast.error(error.response?.data?.message || "Restore failed"); }
    finally { setRestoring(""); }
  };
  if (loading) return <Loading label="Loading recycle bin..." />;
  return <div>
    <div className="mb-6"><h1 className="text-xl font-extrabold text-[#092f3b]">Recycle Bin</h1><p className="text-sm text-slate-500 mt-1">Restore content removed from management screens.</p></div>
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {!items.length ? <div className="py-14 text-center text-slate-500"><Trash2 className="mx-auto mb-3 text-slate-300"/><p className="text-sm font-semibold">Recycle bin is empty</p></div> : <div className="divide-y divide-slate-100">{items.map(item=><div key={`${item.model}-${item._id}`} className="p-4 flex items-center gap-4"><div className="min-w-0 flex-1"><strong className="text-sm text-[#092f3b]">{item.title||item.name||item.product||item.reference||item._id}</strong><p className="text-xs text-slate-500 mt-1">{item.model} · deleted {new Date(item.deletedAt).toLocaleString()}</p></div><button disabled={restoring===item._id} onClick={()=>restore(item)} className="inline-flex items-center gap-2 rounded-lg bg-[#062e3b] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><ArchiveRestore size={15}/>{restoring===item._id?"Restoring...":"Restore"}</button></div>)}</div>}
    </div>
  </div>;
}
