import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, ArrowLeft, ArrowRight, Layers, ExternalLink } from "lucide-react";
import { divisionService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import displayImageUrl from "../../../utils/displayImageUrl.js";

const DivisionManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50, sort: "order" };
      if (search) params.search = search;
      const res = await divisionService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load division pages");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Division Pages
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage the five division pages shown under the Services navigation.
          </p>
        </div>
        <Link
          to="/admin/services-page"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Service Cards
        </Link>
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
          placeholder="Search division pages..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading division pages..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Page
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">
                    Route
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
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Layers className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        No division pages found
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={displayImageUrl(item.image)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#092f3b]">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-xs text-[#66767d] mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                            {item.heading && (
                              <p className="text-xs text-[#66767d] mt-0.5 line-clamp-1 max-w-md">
                                {item.heading}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <code className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-1 text-[#092f3b]">
                          /{item.slug}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {item.slug && (
                            <a
                              href={`/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title="View on site"
                              className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            to={`/admin/services-page/divisions/${item.slug}`}
                            title="Edit content"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                          >
                            <p className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              Edit <ArrowRight className="w-4 h-4" />
                            </p>
                          </Link>
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
    </div>
  );
};

export default DivisionManagement;
