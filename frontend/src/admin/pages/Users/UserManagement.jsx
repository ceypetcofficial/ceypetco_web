import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  User as UserIcon,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Dices,
} from "lucide-react";
import { userService } from "../../../services/contentService";
import { useAuth } from "../../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import { Field, inputClass, selectClass } from "../../components/form.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_INFO = {
  super_admin: {
    label: "Super Admin",
    desc: "Full platform access, including user and role management.",
    badge: "Has every permission",
  },
  admin: {
    label: "Admin",
    desc: "Manages all website content and user accounts.",
    badge: "Content + user management",
  },
  editor: {
    label: "Editor",
    desc: "Authors and manages website content only.",
    badge: "Content only \u00b7 no user management",
  },
};

const STATUS_INFO = {
  active: {
    desc: "Can sign in to the dashboard.",
    badge: "Login allowed",
  },
  inactive: {
    desc: "Blocked from signing in. Existing sessions are invalidated.",
    badge: "Login blocked",
  },
};

const STRENGTH = [
  { label: "Too short", color: "bg-slate-200", text: "text-slate-400" },
  { label: "Very weak", color: "bg-red-500", text: "text-red-600" },
  { label: "Weak", color: "bg-red-400", text: "text-red-600" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-600" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Very strong", color: "bg-emerald-600", text: "text-emerald-700" },
];

const scorePassword = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const initialsOf = (name) =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "U";

const generateStrongPassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const buf = new Uint32Array(16);
  crypto.getRandomValues(buf);
  return [...buf].map((n) => chars[n % chars.length]).join("");
};

const FieldError = ({ children }) => (
  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
    <span>{children}</span>
  </p>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="w-6 h-6 rounded-md bg-[#062e3b] text-white flex items-center justify-center shrink-0">
      {icon}
    </span>
    <h4 className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-[#092f3b] font-['Manrope']">
      {title}
    </h4>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "admin",
  status: "active",
};

const PasswordField = ({ value, onChange, visible, onToggle, placeholder }) => (
  <div className="relative">
    <input
      type={visible ? "text" : "password"}
      className={`${inputClass} pr-11`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="new-password"
    />
    <button
      type="button"
      onClick={onToggle}
      title={visible ? "Hide password" : "Show password"}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#092f3b] hover:bg-slate-100 transition-colors"
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
);

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await userService.getAll(params);
      setItems(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const isSelf = editing ? editing._id === currentUser?._id : false;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowPw(false);
    setShowConfirmPw(false);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      confirmPassword: "",
      role: item.role || "admin",
      status: item.status || "active",
    });
    setErrors({});
    setShowPw(false);
    setShowConfirmPw(false);
    setShowModal(true);
  };

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) {
      e.name = "Full name is required";
    } else if (f.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters";
    }
    if (!f.email.trim()) {
      e.email = "Email address is required";
    } else if (!EMAIL_RE.test(f.email)) {
      e.email = "Enter a valid email address, e.g. name@ceypetco.gov.lk";
    }
    if (!editing && !f.password) {
      e.password = "Password is required";
    } else if (f.password && f.password.length < 8) {
      e.password = "Use at least 8 characters";
    }
    if (f.password && f.password !== f.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;
      if (editing) {
        await userService.update(editing._id, payload);
        toast.success("User updated successfully");
      } else {
        await userService.create(payload);
        toast.success("User created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.remove(showDelete._id);
      toast.success("User deleted");
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (key === "password" && form.confirmPassword) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
  };

  const handleGeneratePassword = () => {
    const pw = generateStrongPassword();
    setForm((f) => ({ ...f, password: pw, confirmPassword: pw }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.password;
      delete next.confirmPassword;
      return next;
    });
  };

  const score = scorePassword(form.password);
  const strength = STRENGTH[score];
  const pwdMatched =
    form.password.length > 0 && form.password === form.confirmPassword;
  const pwdMismatch =
    form.confirmPassword.length > 0 && !pwdMatched;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#092f3b] font-['Manrope']">
            User Management
          </h1>
          <p className="text-sm text-[#66767d] mt-1">
            Manage admin users, roles and account access.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
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
          placeholder="Search by name or email..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-[#092f3b] placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
        />
      </div>

      {loading ? (
        <Loading label="Loading users..." />
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">User</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d] hidden lg:table-cell">Last Login</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.08em] uppercase text-[#66767d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <UserIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#092f3b]">No users found</p>
                      <p className="text-xs text-[#66767d] mt-1">Add your first team member</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#062e3b] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white uppercase">
                              {initialsOf(item.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#092f3b] truncate">
                              {item.name}
                              {currentUser?._id === item._id && (
                                <span className="ml-2 text-[10px] font-bold text-white bg-[#062e3b] px-1.5 py-0.5 rounded">YOU</span>
                              )}
                            </p>
                            <p className="text-xs text-[#66767d] truncate">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <StatusBadge status={item.role} />
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#66767d]">
                          {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : "Never"}
                        </span>
                      </td>
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
                            disabled={currentUser?._id === item._id}
                            title={currentUser?._id === item._id ? "Cannot delete your own account" : "Delete"}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit User" : "Add User"}
        size="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="flex items-center gap-4 -mt-1 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#062e3b] to-[#0b4c5e] flex items-center justify-center shrink-0">
              <span className="text-lg font-extrabold text-white uppercase">
                {initialsOf(form.name || editing?.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-extrabold text-[#092f3b] font-['Manrope'] truncate">
                {form.name.trim() || (editing ? editing.name : "New User")}
              </p>
              <p className="text-xs text-[#66767d] break-all">
                {form.email.trim() || (editing ? editing.email : "Account details preview")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                className={`${inputClass} ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Nimal Perera"
                autoFocus
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field label="Email Address" required>
              <div className="relative">
                <input
                  type="email"
                  className={`${inputClass} pl-10 ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                  value={form.email}
                  onChange={set("email")}
                  placeholder="user@ceypetco.gov.lk"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <SectionHeader icon={<ShieldCheck className="w-3.5 h-3.5" />} title="Access & Permissions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Role" hint={isSelf ? "You cannot change your own role." : undefined}>
                <select
                  className={`${selectClass} ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                  value={form.role}
                  onChange={set("role")}
                  disabled={isSelf}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </Field>
              <Field label="Status" hint={isSelf ? "You cannot change your own status." : undefined}>
                <select
                  className={`${selectClass} ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                  value={form.status}
                  onChange={set("status")}
                  disabled={isSelf}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm font-bold text-[#092f3b]">
                    {ROLE_INFO[form.role].label}
                    <span className="ml-2 text-xs font-semibold text-[#66767d]">
                      {ROLE_INFO[form.role].desc}
                    </span>
                  </p>
                  <span className="text-[10px] font-bold text-white bg-[#062e3b] px-2 py-1 rounded-full">
                    {ROLE_INFO[form.role].badge}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap mt-2.5 pt-2.5 border-t border-slate-200/70">
                  <p className="text-sm font-bold text-[#092f3b]">
                    {form.status === "active" ? "Active" : "Inactive"}
                    <span className="ml-2 text-xs font-semibold text-[#66767d]">
                      {STATUS_INFO[form.status].desc}
                    </span>
                  </p>
                  <span className="text-[10px] font-bold text-white bg-[#062e3b] px-2 py-1 rounded-full">
                    {STATUS_INFO[form.status].badge}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader icon={<Lock className="w-3.5 h-3.5" />} title="Password" />
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc2626] hover:text-[#b91c1c] transition-colors"
              >
                <Dices className="w-3.5 h-3.5" />
                Generate strong password
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={editing ? "New Password" : "Password"}
                required={!editing}
                hint={editing ? "Leave blank to keep current password" : undefined}
              >
                <PasswordField
                  value={form.password}
                  onChange={set("password")}
                  visible={showPw}
                  onToggle={() => setShowPw((v) => !v)}
                  placeholder={editing ? "Leave blank to keep" : "At least 8 characters"}
                />
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            score >= i ? strength.color : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs font-semibold ${strength.text}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
              <Field label="Confirm Password" required={!editing}>
                <PasswordField
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  visible={showConfirmPw}
                  onToggle={() => setShowConfirmPw((v) => !v)}
                  placeholder="Re-enter password"
                />
                {pwdMatched && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passwords match
                  </p>
                )}
                {pwdMismatch && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Passwords do not match
                  </p>
                )}
                {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  {editing ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete User" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-sm text-[#66767d] mb-2">Are you sure you want to delete this user?</p>
          <p className="text-sm font-bold text-[#092f3b] mb-6">{showDelete?.name}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setShowDelete(null)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-[#092f3b] hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;