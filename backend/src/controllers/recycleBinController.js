const registry = require("../models/modelRegistry");

const excluded = new Set(["ContactMessage", "PageContentRevision"]);
const getModel = (name) => {
  if (!registry.modelNames.includes(name) || excluded.has(name)) return null;
  try { return require(`../models/${name}`); }
  catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    return require("../models/sqlModel")(name);
  }
};

const getAll = async (_req, res, next) => {
  try {
    const groups = await Promise.all(registry.modelNames.filter((name) => !excluded.has(name)).map(async (name) => {
      const Model = getModel(name);
      if (!Model?.findDeleted) return [];
      const rows = await Model.findDeleted().sort("-deletedAt").limit(200);
      return rows.map((row) => {
        const value = row.toJSON?.() || row.toObject?.() || row;
        return { ...value, model: name };
      });
    }));
    const { getPool } = require("../config/db");
    const pool = await getPool();
    const [media] = await pool.query("SELECT StorageName AS _id, DisplayName AS name, DeletedAt AS deletedAt FROM MediaAssets WHERE DeletedAt IS NOT NULL");
    const data = [...groups.flat(), ...media.map((item) => ({ ...item, model: "MediaAsset" }))].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const restore = async (req, res, next) => {
  try {
    if (req.params.model === "MediaAsset") {
      const path = require("path");
      const fs = require("fs");
      const { getPool } = require("../config/db");
      const name = path.basename(req.params.id);
      if (name !== req.params.id) return res.status(400).json({ success: false, message: "Invalid image name" });
      const source = path.resolve(__dirname, "../../uploads-trash/images", name);
      const target = path.resolve(__dirname, "../../uploads/images", name);
      try { await fs.promises.access(source); } catch { return res.status(404).json({ success: false, message: "Deleted image not found" }); }
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      await fs.promises.rename(source, target);
      const pool = await getPool();
      await pool.query("UPDATE MediaAssets SET DeletedAt=NULL, UpdatedAt=? WHERE StorageName=?", [new Date(), name]);
      return res.json({ success: true, message: "Image restored" });
    }
    const Model = getModel(req.params.model);
    if (!Model?.restoreById) return res.status(400).json({ success: false, message: "This resource cannot be restored" });
    const item = await Model.restoreById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Deleted resource not found" });
    res.json({ success: true, data: item, message: "Resource restored" });
  } catch (error) { next(error); }
};

module.exports = { getAll, restore };
