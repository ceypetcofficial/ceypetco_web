const PopupNotice = require("../models/PopupNotice");
const { deleteAssets } = require("../utils/assetStorage");

const sanitizeText = (value) =>
  String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<\s*\/?\s*script[\s\S]*?>/gi, "")
    .replace(/<\s*(iframe|object|embed|form|meta|style|link)[\s\S]*?>/gi, "")
    .replace(/\b(javascript|vbscript|data)\s*:/gi, "")
    .replace(/\son[a-z]+\s*=\s*["']?[^>]*/gi, "")
    .trim();

const toBoolean = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const isValidExternalUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidInternalUrl = (url) =>
  typeof url === "string" &&
  url.startsWith("/") &&
  !url.startsWith("//") &&
  !/\s/.test(url);

const validateUrl = (linkType, buttonLink) => {
  if (!buttonLink) return true;
  if (linkType === "external") {
    if (!isValidExternalUrl(buttonLink)) {
      return { ok: false, message: "External button link must be a valid http(s) URL" };
    }
    return { ok: true };
  }
  if (linkType === "internal") {
    if (!isValidInternalUrl(buttonLink)) {
      return {
        ok: false,
        message: "Internal button link must start with / and be a valid site route",
      };
    }
    return { ok: true };
  }
  return { ok: false, message: "Invalid link type" };
};

const validateImageUrl = (imageUrl) => {
  if (!imageUrl) return { ok: true };
  return isValidExternalUrl(imageUrl)
    ? { ok: true }
    : { ok: false, message: "Popup image must be a valid URL" };
};

const sanitizePayload = (body) => {
  const payload = {};

  if (body.title !== undefined) {
    payload.title = sanitizeText(body.title);
  }
  if (body.description !== undefined) {
    payload.description = sanitizeText(body.description);
  }
  if (body.imageUrl !== undefined) {
    payload.imageUrl = sanitizeText(body.imageUrl);
  }
  if (body.priority !== undefined) {
    const parsed = parseInt(body.priority, 10);
    payload.priority = Number.isNaN(parsed)
      ? 0
      : Math.max(0, Math.min(1000, parsed));
  }
  if (body.showOnce !== undefined) {
    payload.showOnce = toBoolean(body.showOnce);
  }
  if (body.buttonEnabled !== undefined) {
    payload.buttonEnabled = toBoolean(body.buttonEnabled);
  }
  if (body.buttonText !== undefined) {
    payload.buttonText = sanitizeText(body.buttonText);
  }
  if (body.buttonLink !== undefined) {
    payload.buttonLink = sanitizeText(body.buttonLink);
  }
  if (body.linkType !== undefined) {
    payload.linkType =
      body.linkType === "external" ? "external" : "internal";
  }

  return payload;
};

const collectErrors = (payload, existing = {}) => {
  const errors = [];
  const title = payload.title !== undefined ? payload.title : existing.title;
  const linkType =
    payload.linkType !== undefined ? payload.linkType : existing.linkType;
  const buttonEnabled =
    payload.buttonEnabled !== undefined
      ? payload.buttonEnabled
      : existing.buttonEnabled;
  const buttonLink =
    payload.buttonLink !== undefined ? payload.buttonLink : existing.buttonLink;
  const buttonText =
    payload.buttonText !== undefined ? payload.buttonText : existing.buttonText;
  const imageUrl =
    payload.imageUrl !== undefined ? payload.imageUrl : existing.imageUrl;

  if (title !== undefined && !String(title).trim()) {
    errors.push("Title is required");
  }
  if (imageUrl !== undefined) {
    const res = validateImageUrl(imageUrl);
    if (!res.ok) errors.push(res.message);
  }
  if (buttonEnabled || (existing.buttonEnabled && payload.buttonEnabled !== false)) {
    if (!String(buttonText || "").trim()) {
      errors.push("Button text is required when the button is enabled");
    }
    if (!String(buttonLink || "").trim()) {
      errors.push("Button link is required when the button is enabled");
    }
    if (!errors.length || buttonLink) {
      const res = validateUrl(linkType, buttonLink);
      if (!res.ok) errors.push(res.message);
    }
  }
  return errors;
};

const getActive = async (req, res, next) => {
  try {
    const notice = await PopupNotice.findOne({ status: "active" }).sort({
      priority: -1,
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: notice || null });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      PopupNotice.find(query).sort("-createdAt").skip(skip).limit(limit),
      PopupNotice.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const notice = await PopupNotice.findById(req.params.id);
    if (!notice) {
      return res
        .status(404)
        .json({ success: false, message: "Popup notice not found" });
    }
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = sanitizePayload(req.body);
    const errors = collectErrors(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }
    const notice = await PopupNotice.create(payload);
    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await PopupNotice.findById(req.params.id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Popup notice not found" });
    }
    const payload = sanitizePayload(req.body);
    const errors = collectErrors(payload, existing);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }
    const prevImage = existing.imageUrl;
    for (const field of ["title", "description", "imageUrl", "priority", "showOnce", "buttonEnabled", "buttonText", "buttonLink", "linkType"]) {
      if (payload[field] !== undefined) existing[field] = payload[field];
    }
    await existing.save();
    if (prevImage && prevImage !== existing.imageUrl) {
      try {
        await deleteAssets([prevImage]);
      } catch (cleanupErr) {
        console.warn("Popup image cleanup warning:", cleanupErr.message);
      }
    }
    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const notice = await PopupNotice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res
        .status(404)
        .json({ success: false, message: "Popup notice not found" });
    }
    if (notice.imageUrl) {
      try {
        await deleteAssets([notice.imageUrl]);
      } catch (cleanupErr) {
        console.warn("Popup image cleanup warning:", cleanupErr.message);
      }
    }
    res.status(200).json({ success: true, message: "Popup notice deleted" });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Status must be active or inactive" });
    }
    const notice = await PopupNotice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!notice) {
      return res
        .status(404)
        .json({ success: false, message: "Popup notice not found" });
    }
    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    next(error);
  }
};

const resetVisibility = async (req, res, next) => {
  try {
    const notice = await PopupNotice.findByIdAndUpdate(
      req.params.id,
      { updatedAt: new Date() },
      { new: true, runValidators: false }
    );
    if (!notice) {
      return res
        .status(404)
        .json({ success: false, message: "Popup notice not found" });
    }
    res.status(200).json({
      success: true,
      message: "Popup visibility reset. Visitors will see it again.",
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActive,
  getAll,
  getById,
  create,
  update,
  remove,
  updateStatus,
  resetVisibility,
};
