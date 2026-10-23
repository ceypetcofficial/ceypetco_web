import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import Loading from '../../components/Loading';
import { Field, inputClass, selectClass } from '../../components/form.jsx';

const FUEL_FIELDS = ['LP 95', 'LP 92', 'LAD', 'LSD', 'LK', 'LIK', 'FUR. 800', 'FUR 1500 (High)', 'FUR. 1500 (Low)'];
const BITUMEN_FIELDS = ['Circular No.', '80/100', '60/70'];
const fieldsFor = (kind) => kind === 'fuel' ? FUEL_FIELDS : BITUMEN_FIELDS;
const emptyForm = (kind) => ({ kind, dateLabel: '', values: fieldsFor(kind).map(() => ''), note: '', status: 'active' });

function HistoricalPriceManagement() {
  const { user } = useAuth();
  const canDelete = ['super_admin', 'admin', 'marketing_user'].includes(user?.role);
  const [kind, setKind] = useState('fuel');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get('/admin/historical-prices', { params: { kind, page, limit: 20, search } });
      setItems(result.data.data || []);
      setPagination(result.data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load historical prices');
    } finally {
      setLoading(false);
    }
  }, [kind, page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm(kind)); };
  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({ kind: item.kind, dateLabel: item.dateLabel, values: [...item.values], note: item.note || '', status: item.status });
  };
  const setValue = (index, value) => setForm((current) => ({
    ...current,
    values: current.values.map((entry, entryIndex) => entryIndex === index ? value : entry),
  }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.put(`/admin/historical-prices/${editingId}`, form);
      else await api.post('/admin/historical-prices', form);
      toast.success(editingId ? 'Historical price updated' : 'Historical price added');
      setForm(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save historical price');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/historical-prices/${deleteTarget._id}`);
      toast.success('Historical price deleted');
      setDeleteTarget(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete historical price');
    } finally {
      setDeleting(false);
    }
  };

  const changeKind = (next) => {
    setKind(next);
    setPage(1);
    setSearch('');
    setSearchInput('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">Historical Prices</h1>
          <p className="text-sm text-[#66767d] mt-1">Manage the fuel and bitumen price archive shown on the Marketing &amp; Sales page.</p>
          <a href="/marketing-sales/historical-prices" target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-semibold text-red-600 hover:underline">View public archive ↗</a>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add record
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
          {[['fuel', 'Fuel prices'], ['bitumen', 'Bitumen revisions']].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={kind === value} onClick={() => changeKind(value)} className={`px-4 py-2 rounded-md text-sm font-semibold ${kind === value ? 'bg-[#092f3b] text-white' : 'text-[#66767d] hover:bg-slate-50'}`}>{label}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { setSearch(searchInput.trim()); setPage(1); } }} placeholder="Search date, press Enter" aria-label="Search historical price dates" className={`${inputClass} pl-10`} />
        </div>
      </div>

      {loading ? <Loading label="Loading archive..." /> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wide text-[#66767d]">
                <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Published values</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-4 text-sm font-semibold text-[#092f3b]">{item.dateLabel}{item.note && <small className="block text-xs font-normal text-[#66767d]">{item.note}</small>}</td>
                    <td className="px-4 py-4 text-xs text-[#66767d]">{fieldsFor(item.kind).slice(0, 3).map((label, index) => `${label}: ${item.values[index] || '—'}`).join('  ·  ')}</td>
                    <td className="px-4 py-4"><span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span></td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <button type="button" onClick={() => openEdit(item)} title="Edit record" aria-label={`Edit ${item.dateLabel}`} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#092f3b]"><Edit3 className="w-4 h-4" /></button>
                      {canDelete && <button type="button" onClick={() => setDeleteTarget(item)} title="Delete record" aria-label={`Delete ${item.dateLabel}`} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="4" className="px-4 py-12 text-center text-sm text-[#66767d]">No archive records match this search.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={pagination.pages} total={pagination.total} onPageChange={setPage} />
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={editingId ? 'Edit historical price' : 'Add historical price'} size="xl">
        {form && <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required><select className={selectClass} value={form.kind} onChange={(event) => setForm(emptyForm(event.target.value))}><option value="fuel">Fuel prices</option><option value="bitumen">Bitumen revisions</option></select></Field>
            <Field label="Date as published" required hint={form.kind === 'fuel' ? 'DD.MM.YYYY, optionally followed by a time in parentheses' : 'YYYY.MM.DD or YYYY'}><input className={inputClass} value={form.dateLabel} onChange={(event) => setForm((current) => ({ ...current, dateLabel: event.target.value }))} placeholder={form.kind === 'fuel' ? '01.03.1990' : '2021.01.05'} required /></Field>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#092f3b] mb-1">Published values</h4>
            <p className="text-xs text-[#66767d] mb-4">Enter the figures as published. Leave a field blank if no value was supplied.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fieldsFor(form.kind).map((label, index) => <Field key={label} label={label}><input className={inputClass} value={form.values[index] || ''} onChange={(event) => setValue(index, event.target.value)} placeholder="—" /></Field>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Note"><input className={inputClass} value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="Optional context" /></Field>
            <Field label="Visibility"><select className={selectClass} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="active">Published</option><option value="inactive">Hidden</option></select></Field>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#dc2626] text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save record'}</button>
          </div>
        </form>}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete historical price" size="sm">
        <p className="text-sm text-[#66767d] mb-5">Delete the record dated <b>{deleteTarget?.dateLabel}</b>? This removes it from the public archive.</p>
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold">Cancel</button><button type="button" disabled={deleting} onClick={remove} className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button></div>
      </Modal>
    </div>
  );
}

export default HistoricalPriceManagement;
