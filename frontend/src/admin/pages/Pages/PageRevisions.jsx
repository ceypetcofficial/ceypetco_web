import { useCallback, useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";
import Loading from "../../components/Loading";

export default function PageRevisions(){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[restoring,setRestoring]=useState("");
  const load=useCallback(async()=>{setLoading(true);try{setItems((await api.get("/admin/pages/revisions/all")).data.data||[])}catch(e){toast.error(e.response?.data?.message||"Could not load page history")}finally{setLoading(false)}},[]);
  useEffect(()=>{load()},[load]);
  const restore=async item=>{if(!window.confirm(`Restore ${item.pageName||"this page"} to this version? The current version will be preserved in history.`))return;setRestoring(item._id);try{await api.post(`/admin/pages/${item.pageId}/revisions/${item._id}/restore`);toast.success("Page revision restored");await load()}catch(e){toast.error(e.response?.data?.message||"Restore failed")}finally{setRestoring("")}};
  if(loading)return <Loading label="Loading page history..."/>;
  return <div><div className="mb-6"><h1 className="text-xl font-extrabold text-[#092f3b]">Page Version History</h1><p className="mt-1 text-sm text-slate-500">Restore an earlier page version without losing the current version.</p></div><div className="rounded-xl border border-slate-200 bg-white overflow-hidden">{!items.length?<div className="py-14 text-center text-slate-500"><History className="mx-auto mb-3 text-slate-300"/><p className="text-sm font-semibold">No page revisions yet</p></div>:<div className="divide-y divide-slate-100">{items.map(item=><div key={item._id} className="flex items-center gap-4 p-4"><div className="min-w-0 flex-1"><strong className="text-sm text-[#092f3b]">{item.pageName||"Managed page"}</strong><p className="mt-1 text-xs text-slate-500 capitalize">{String(item.action||"update").replaceAll("_"," ")} · {item.actorName||item.actorEmail||"System"} · {new Date(item.createdAt).toLocaleString()}</p></div><button disabled={restoring===item._id} onClick={()=>restore(item)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-[#092f3b] hover:bg-slate-50 disabled:opacity-50"><RotateCcw size={15}/>{restoring===item._id?"Restoring...":"Restore"}</button></div>)}</div>}</div></div>;
}
