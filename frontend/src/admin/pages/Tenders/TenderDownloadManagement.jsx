import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Download, Search, DownloadCloud, Trash2 } from "lucide-react";
import api from "../../../services/api";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Tender Title</th>
                <th className="px-6 py-4 font-semibold">Tender Ref</th>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Mobile Number</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(item.downloadedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.tenderTitle || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.tenderReference || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {item.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.mobileNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
