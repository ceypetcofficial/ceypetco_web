const SupplierSection = require("../models/SupplierSection");
const createCrudController = require("./crudController");
const { findUnsafeUrl } = require("../utils/securityValidation");

const sanitizePayload = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const payload = { ...body };
  for (const key of ["_id", "createdAt", "updatedAt", "deletedAt", "__proto__", "prototype", "constructor"]) delete payload[key];
  return payload;
};

const crud = createCrudController(SupplierSection, {
  sortBy: "-createdAt",
});

const getFirst = async (req, res, next) => {
  try {
    const section = await SupplierSection.findOne().sort('-createdAt');
    res.status(200).json({ success: true, data: section || null });
  } catch (error) {
    next(error);
  }
};

const upsertFirst = async (req, res, next) => {
  try {
    const payload = sanitizePayload(req.body);
    if (!payload) return res.status(400).json({ success: false, message: "Invalid request body" });
    const unsafeUrl = findUnsafeUrl(payload);
    if (unsafeUrl) return res.status(400).json({ success: false, message: unsafeUrl });
    const existing = await SupplierSection.findOne().sort("-createdAt");
    let section;
    if (existing) {
      existing.set(payload);
      section = await existing.save();
    } else {
      section = await SupplierSection.create(payload);
    }
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getFirst, upsertFirst };
