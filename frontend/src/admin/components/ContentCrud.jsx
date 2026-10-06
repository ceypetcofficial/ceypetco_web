import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Edit3, Trash2, Pencil, Inbox } from "lucide-react";
import Pagination from "./Pagination";
import Modal from "./Modal";
import Loading from "./Loading";
import { Field, inputClass, textareaClass, selectClass } from "./form";

const ContentCrud = ({
  title,
  description,
  service,
  columns,
  fields,
  emptyTitle,
  emptyHint,
  searchPlaceholder = "Search...",
  objectKey = null,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const makeEmpty = () => {
    const empty = {};
    fields.forEach((f) => {
      empty[f.key] =
        f.type === "select"
          ? f.default || ""
          : f.type === "number"
            ? ""
            : f.type === "date"
              ? ""
              : "";
    });
    return empty;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await service.getAll(params);
      const data = objectKey ? res.data[objectKey] : res.data;
      setItems(Array.isArray(data) ? data : []);
      setTotal(res.pagination?.total || (Array.isArray(data) ? data.length : 0));
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, search, service, objectKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("create") === "1") openCreate();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(makeEmpty());
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const f = {};
    fields.forEach((field) => {
      let val = item[field.key];
      if (field.type === "date" && val) val = String(val).split("T")[0];
      f[field.key] = val ?? "";
    });
    setForm(f);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((field) => {
        let val = form[field.key];
        if (field.type === "date" && val) val = new Date(val).toISOString();
        if (field.type === "number" && (val === "" || val === null || val === undefined)) val = undefined;
        if ((field.type !== "date" || val) && val !== undefined) payload[field.key] = val;
      });
      if (editing) {
        await service.update(editing._id, payload);
        toast.success("Updated successfully");
      } else {
        await service.create(payload);
        toast.success("Created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await service.remove(showDelete._id);
      toast.success("Deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const renderField = (field) => {
    if (field.type === "select") {
      return (
        <select
          className={selectClass}
          value={form[field.key] ?? ""}
          onChange={set(field.key)}
        >
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, " ")}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
      );
    }
    if (field.type === "textarea") {
      return (
        <textarea
          className={textareaClass}
          value={form[field.key] ?? ""}
          onChange={set(field.key)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    }
    const inputProps = {
      className: inputClass,
      value: form[field.key] ?? "",
      onChange: set(field.key),
      placeholder: field.placeholder,
      required: field.required,
    };
    if (field.type === "number") inputProps.type = "number";
    if (field.type === "date") inputProps.type = "date";
    return <input {...inputProps} />;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            {title}
          </h1>
          <p className="text-sm text-[#66767d] mt-1">{description}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
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
          placeholder={searchPlaceholder}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] ${col.className || ""}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                      <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">
                        {emptyTitle}
                      </p>
                      <p className="text-xs text-[#66767d] mt-1">{emptyHint}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-4 ${col.className || ""}`}>
                          {col.render
                            ? col.render(item)
                            : (item[col.key] ?? "—")}
                        </td>
                      ))}
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDelete(item)}
                            title="Delete"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit ${title}` : `New ${title}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.type === "textarea" || field.fullWidth ? "sm:col-span-2" : ""}
              >
                <Field
                  label={field.label}
                  required={field.required}
                  hint={field.hint}
                >
                  {renderField(field)}
                </Field>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title={`Delete ${title}`} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">
            Are you sure you want to delete this item?
          </p>
          <p className="text-sm font-bold text-[#092f3b] mb-6 line-clamp-2">
            {showDelete?.title || showDelete?.name || showDelete?._id}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowDelete(null)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContentCrud;
