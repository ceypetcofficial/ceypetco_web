const GalleryItem = require("../models/GalleryItem");
const createCrudController = require("./crudController");

const clean = (value) => String(value || "").trim();
const isEmbeddableVideo = (value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com") || host === "vimeo.com" || host.endsWith(".vimeo.com");
  } catch { return false; }
};
const validate = (payload, { action, existing }) => {
  const item = action === "update" ? { ...existing.toObject(), ...payload } : payload;
  if (!clean(item.title)) return "Title is required";
  if (!clean(item.category)) return "Category is required";
  if (!["image", "video"].includes(item.type)) return "Type must be image or video";
  if (!["draft", "published"].includes(item.status)) return "Status must be draft or published";
  if (!clean(item.mediaUrl)) return item.type === "video" ? "Video embed URL is required" : "Image is required";
  if (item.type === "video" && !isEmbeddableVideo(item.mediaUrl)) return "Video URL must be a valid YouTube or Vimeo URL";
  if (item.type === "video" && !clean(item.posterUrl)) return "A poster image is required for videos";
  return null;
};

const crud = createCrudController(GalleryItem, {
  searchFields: ["title", "category", "description", "altText"],
  sortBy: "order",
  assetFields: [{ field: "mediaUrl" }, { field: "posterUrl" }],
  validate,
});

const getPublished = async (req, res, next) => {
  try {
    const items = await GalleryItem.find({ status: "published" }).sort({ order: 1, createdAt: -1 }).limit(200);
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
};

module.exports = { ...crud, getPublished };
