const { deleteAssets } = require("../utils/assetStorage");
const { findUnsafeUrl } = require("../utils/securityValidation");

const PROTECTED_FIELDS = ["_id", "createdAt", "updatedAt", "deletedAt", "__proto__", "prototype", "constructor"];

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return body || {};
  const clean = { ...body };
  for (const field of PROTECTED_FIELDS) delete clean[field];
  return clean;
};

const collectUrls = (doc, assetFields) => {
  if (!doc) return [];
  const urls = [];
  for (const field of assetFields || []) {
    const val = doc[field.field];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const entry of val) {
        const u = field.urlKey ? entry && entry[field.urlKey] : entry;
        if (u) urls.push(u);
      }
    } else if (typeof val === "string") {
      urls.push(val);
    }
  }
  return urls;
};

const createCrudController = (
  Model,
  { searchFields = [], sortBy = "-createdAt", assetFields = [], validate, onChange } = {}
) => {
  const getAll = async (req, res, next) => {
    try {
      const rawPage = parseInt(req.query.page, 10);
      const rawLimit = parseInt(req.query.limit, 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 200) : 50;
      const skip = (page - 1) * limit;
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const status = typeof req.query.status === "string" ? req.query.status : undefined;

      const query = {};
      if (status) query.status = status;
      if (search && searchFields.length) {
        query.$or = searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
      }

      const [items, total] = await Promise.all([
        Model.find(query).sort(sortBy).skip(skip).limit(limit),
        Model.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  const getById = async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const payload = sanitizeBody(req.body);
      const unsafeUrl = findUnsafeUrl(payload);
      if (unsafeUrl) return res.status(400).json({ success: false, message: unsafeUrl });
      if (validate) {
        const message = validate(payload, { action: "create", req });
        if (message) return res.status(400).json({ success: false, message });
      }
      const item = await Model.create(payload);
      if (onChange) await onChange({ action: "create", item, previous: null, req });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const existing = await Model.findById(req.params.id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      const payload = sanitizeBody(req.body);
      const unsafeUrl = findUnsafeUrl(payload);
      if (unsafeUrl) return res.status(400).json({ success: false, message: unsafeUrl });
      if (validate) {
        const message = validate(payload, { action: "update", req, existing });
        if (message) return res.status(400).json({ success: false, message });
      }
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      if (onChange) await onChange({ action: "update", item, previous: existing, req });
      try {
        const oldUrls = collectUrls(existing, assetFields);
        const newUrls = collectUrls(item, assetFields);
        const removed = oldUrls.filter((url) => !newUrls.includes(url));
        if (removed.length) {
          await deleteAssets(removed);
        }
      } catch (cleanupErr) {
        console.warn("Local asset cleanup warning:", cleanupErr.message);
      }
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const existing = await Model.findById(req.params.id);
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      if (onChange) await onChange({ action: "delete", item, previous: existing, req });
      res.status(200).json({ success: true, message: "Resource moved to the recycle bin" });
    } catch (error) {
      next(error);
    }
  };

  return { getAll, getById, create, update, remove };
};

module.exports = createCrudController;
