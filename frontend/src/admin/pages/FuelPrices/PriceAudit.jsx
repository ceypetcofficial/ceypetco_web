import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

export default function PriceAudit(){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[page,setPage]=useState(1),[pagination,setPagination]=useState({pages:1,total:0,limit:25});
  const load=useCallback(async()=>{setLoading(true);try{const result=(await api.get("/admin/price-audit",{params:{page,limit:25}})).data;setItems(result.data||[]);setPagination(result.pagination||{pages:1,total:0,limit:25})}catch(e){toast.error(e.response?.data?.message||"Could not load price history")}finally{setLoading(false)}},[page]);
  useEffect(()=>{load()},[load]);
  if(loading)return <Loading label="Loading price history..."/>;
  return <div><div className="mb-6"><h1 className="text-xl font-extrabold text-[#092f3b]">Price Change History</h1><p className="mt-1 text-sm text-slate-500">An audit trail of fuel and aviation price changes.</p></div><div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">{!items.length?<div className="py-14 text-center text-slate-500"><History className="mx-auto mb-3 text-slate-300"/><p className="text-sm font-semibold">No price changes recorded yet</p></div>:<table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Type</th><th className="p-3">Action</th><th className="p-3">Previous</th><th className="p-3">New</th><th className="p-3">Changed by</th><th className="p-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map(item=><tr key={item._id} className="text-sm"><td className="p-3 font-semibold">{item.entity}</td><td className="p-3 capitalize">{item.action}</td><td className="p-3">{item.previousValue??"—"}</td><td className="p-3">{item.newValue??"—"}</td><td className="p-3">{item.userName||item.userEmail}</td><td className="p-3 whitespace-nowrap">{new Date(item.changedAt||item.createdAt).toLocaleString()}</td></tr>)}</tbody></table>}</div>{pagination.total>0&&<Pagination page={page} totalPages={pagination.pages} total={pagination.total} pageSize={pagination.limit} currentCount={items.length} onPageChange={setPage}/>}</div>;
}
