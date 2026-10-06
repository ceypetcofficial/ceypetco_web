import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Inbox, MailOpen, Mail, Check, Trash2 } from "lucide-react";
import { contactService } from "../../../services/contentService";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { selectClass } from "../../components/form.jsx";

const ContactMessages = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewing, setViewing] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await contactService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (item) => {
    if (item.status === "read" || item.status === "replied") return;
    setUpdating(true);
    try {
      await contactService.update(item._id, { status: "read" });
      setViewing((current) => current?._id === item._id ? { ...current, status: "read" } : current);
      await load();
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update message");
    } finally {
      setUpdating(false);
    }
  };

  const openMessage = (item) => {
    setViewing(item);
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await contactService.update(viewing._id, { status });
      toast.success(`Marked as ${status}`);
      setViewing((v) => ({ ...v, status }));
      load();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await contactService.remove(deleteTarget._id);
      toast.success("Message deleted");
      setDeleteTarget(null);
      setViewing(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch {
      toast.error("Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            Contact Us Details
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Messages submitted through the website contact form.
          </p>
        </div>
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
          placeholder="Search by name, email or subject..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading messages..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {items.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#092f3b]">
                  No messages found
                </p>
                <p className="text-xs text-[#66767d] mt-1">
                  {search ? "Try a different search term" : "No messages have been submitted yet"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((m) => (
                  <li key={m._id}>
                    <button
                      onClick={() => openMessage(m)}
                      className={`w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-slate-50 transition-colors ${
                        m.status === "new" ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {m.status === "new" ? (
                            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                          ) : (
                            <MailOpen className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <p className="text-sm font-semibold text-[#092f3b] truncate">
                            {m.name}
                          </p>
                          {m.status === "new" && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-[#092f3b] mt-1 truncate">
                          {m.subject || "(no subject)"}
                        </p>
                        <p className="text-xs text-[#66767d] mt-1 truncate">
                          {m.email} · {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusBadge status={m.status} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Message Details"
        size="md"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-base font-bold text-[#092f3b]">
                    {viewing.name}
                  </p>
                  <p className="text-sm text-[#66767d]">
                    {viewing.email}
                    {viewing.phone ? ` · ${viewing.phone}` : ""}
                  </p>
                </div>
                <StatusBadge status={viewing.status} />
              </div>
              <p className="text-xs text-[#66767d]">
                Received {new Date(viewing.createdAt).toLocaleString()}
              </p>
            </div>

            {viewing.subject && (
              <div>
                <p className="text-sm font-bold text-[#092f3b] mb-1 font-['Manrope']">
                  Subject
                </p>
                <p className="text-sm text-[#092f3b] bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                  {viewing.subject}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-[#092f3b] mb-1 font-['Manrope']">
                Message
              </p>
              <p className="text-sm text-[#092f3b] bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed">
                {viewing.message}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-[#092f3b]">
                  Status:
                </label>
                <select
                  className={`${selectClass} w-auto`}
                  value={viewing.status}
                  disabled={updating}
                  onChange={(e) => updateStatus(e.target.value)}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {viewing.status !== "read" && viewing.status !== "replied" && (
                  <button type="button" disabled={updating} onClick={() => markRead(viewing)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 transition-colors">
                    <Check size={16} /> Mark as read
                  </button>
                )}
                <button type="button" onClick={() => setDeleteTarget(viewing)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors">
                  <Trash2 size={16} /> Delete
                </button>
                <button type="button" onClick={() => setViewing(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} title="Delete Contact Message" size="sm">
        <p className="text-sm text-slate-600">
          Delete the message from <strong className="text-[#092f3b]">{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 disabled:opacity-60">Cancel</button>
          <button type="button" disabled={deleting} onClick={deleteMessage} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
            <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete message"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ContactMessages;
