const User = require("../models/User");

const ALLOWED_ROLES = ["super_admin", "admin", "editor"];
const ALLOWED_STATUSES = ["active", "inactive"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const validateUserInput = ({ name, email, password, role, status }) => {
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
  }
  if (email !== undefined) {
    const value = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      return "Please provide a valid email address";
    }
  }
  if (password !== undefined && password !== "") {
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
  }
  if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
    return "Invalid role. Must be one of: super_admin, admin, editor";
  }
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return "Invalid status. Must be one of: active, inactive";
  }
  return null;
};

const getAll = async (req, res, next) => {
  try {
    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 50;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort("-createdAt").skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const invalid = validateUserInput({
      name,
      email: normalizedEmail,
      password,
      role,
      status,
    });
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super_admin can create super_admin accounts' });
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || "admin",
      status: status || "active",
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (
      req.params.id === req.user._id.toString() &&
      (req.body.role !== undefined || req.body.status !== undefined)
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role or status",
      });
    }

    if (req.user.role !== 'super_admin') {
      const target = await User.findById(req.params.id);
      if (target && target.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super_admin can modify super_admin accounts' });
      }
      if (req.body.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super_admin can grant super_admin role' });
      }
    }

    const invalid = validateUserInput(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, message: invalid });
    }

    const updates = {};
    for (const field of ["name", "role", "status"]) {
      if (field in req.body) updates[field] = req.body[field];
    }
    if (req.body.email !== undefined) {
      updates.email = String(req.body.email).trim().toLowerCase();
      const existing = await User.findOne({ email: updates.email });
      if (
        existing &&
        existing._id.toString().toLowerCase() !==
          String(req.params.id).toLowerCase()
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }
    }
    if (password) {
      const user = await User.findById(req.params.id).select("+password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.password = password;
      Object.assign(user, updates);
      await user.save();
      return res.status(200).json({ success: true, data: user });
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot delete your own account" });
    }
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super_admin can delete user accounts' });
    }
    const target = await User.findById(req.params.id);
    if (target && target.role === 'super_admin') {
      const superAdminCount = await User.countDocuments({ role: 'super_admin', status: 'active' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last super_admin account' });
      }
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
