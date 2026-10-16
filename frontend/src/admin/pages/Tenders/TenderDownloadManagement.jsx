import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { DownloadCloud, Trash2 } from "lucide-react";
import api from "../../../services/api";
import Loading from "../../components/Loading";

const TenderDownloadManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/tender-downloads");
      setItems(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tender downloads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this download record?")) return;
    try {
      await api.delete(`/tender-downloads/${id}`);
      toast.success("Record deleted successfully");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tender Downloads</h1>
          <p className="text-gray-500 text-sm mt-1">
            View logs of who downloaded which tender documents
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left">
            <colgroup>
              <col className="w-[150px]" />
              <col className="w-[280px]" />
              <col className="w-[150px]" />
              <col className="w-[230px]" />
              <col className="w-[160px]" />
              <col className="w-[80px]" />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Downloaded</th>
                <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Tender</th>
                <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Reference</th>
                <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Email</th>
                <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Mobile</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <Loading center />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <DownloadCloud className="w-8 h-8 text-gray-400" />
                      <p className="text-lg font-medium text-gray-900">
                        No downloads found
                      </p>
                      <p>There are no download records to display.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id || item._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-4 align-middle">
                      <p className="text-sm font-semibold text-[#092f3b] whitespace-nowrap">
                        {new Date(item.downloadedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-[#66767d]">
                        {new Date(item.downloadedAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div
                        className="max-w-[240px] truncate text-sm font-semibold text-[#092f3b]"
                        title={item.tenderTitle || "N/A"}
                      >
                        {item.tenderTitle || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="truncate text-xs font-semibold text-[#66767d]" title={item.tenderReference || "N/A"}>
                        {item.tenderReference || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="truncate text-sm font-medium text-blue-600" title={item.email || ""}>
                        {item.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="truncate text-sm text-[#092f3b]" title={item.mobileNumber || ""}>
                        {item.mobileNumber}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <button
                        onClick={() => handleDelete(item.id || item._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenderDownloadManagement;
