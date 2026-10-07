const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { getPublicAssetOrigin, isProduction } = require("../config/env");
const { getPool } = require("../config/db");

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const PRIVATE_DOCS_DIR = path.resolve(__dirname, "../../private-docs");
const TRASH_IMAGES_DIR = path.resolve(__dirname, "../../uploads-trash/images");

const imageTypes = new Map([
  [".jpg", new Set(["image/jpeg"])], [".jpeg", new Set(["image/jpeg"])],
  [".png", new Set(["image/png"])], [".webp", new Set(["image/webp"])],
  [".gif", new Set(["image/gif"])], [".avif", new Set(["image/avif"])],
]);
const imageFilter = (_req, file, cb) => {
  const allowedMimes = imageTypes.get(path.extname(file.originalname).toLowerCase());
  if (allowedMimes?.has(String(file.mimetype).toLowerCase())) return cb(null, true);
  cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"));
};

const documentTypes = new Map([
  [".pdf", new Set(["application/pdf"])],
  [".doc", new Set(["application/msword", "application/octet-stream"])],
  [".docx", new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"])],
  [".xls", new Set(["application/vnd.ms-excel", "application/octet-stream"])],
  [".xlsx", new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip"])],
  [".ppt", new Set(["application/vnd.ms-powerpoint", "application/octet-stream"])],
  [".pptx", new Set(["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip"])],
  [".csv", new Set(["text/csv", "text/plain", "application/vnd.ms-excel"])],
  [".zip", new Set(["application/zip", "application/x-zip-compressed"])],
  [".rar", new Set(["application/vnd.rar", "application/x-rar-compressed", "application/octet-stream"])],
]);
const docFilter = (_req, file, cb) => {
  const allowedMimes = documentTypes.get(path.extname(file.originalname).toLowerCase());
  if (allowedMimes?.has(String(file.mimetype).toLowerCase())) return cb(null, true);
  cb(new Error("Unsupported document type"));
};

const hasPrefix = (buffer, bytes) => bytes.every((value, index) => buffer[index] === value);
const validImageContent = (file) => {
  const ext = path.extname(file.originalname).toLowerCase(), b = file.buffer;
  if (ext === ".jpg" || ext === ".jpeg") return hasPrefix(b, [0xff, 0xd8, 0xff]);
  if (ext === ".png") return hasPrefix(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (ext === ".gif") return ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("ascii"));
  if (ext === ".webp") return b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
  if (ext === ".avif") return b.subarray(4, 8).toString("ascii") === "ftyp" && ["avif", "avis"].includes(b.subarray(8, 12).toString("ascii"));
  return false;
};
const validDocumentContent = (file) => {
  const ext = path.extname(file.originalname).toLowerCase(), b = file.buffer;
  if (ext === ".pdf") return b.subarray(0, 5).toString("ascii") === "%PDF-";
  if ([".docx", ".xlsx", ".pptx", ".zip"].includes(ext)) {
    const signature = b.subarray(0, 4).toString("hex");
    return ["504b0304", "504b0506", "504b0708"].includes(signature);
  }
  if ([".doc", ".xls", ".ppt"].includes(ext)) return hasPrefix(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (ext === ".rar") return hasPrefix(b, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]);
  if (ext === ".csv") return !b.subarray(0, Math.min(b.length, 8192)).includes(0);
  return false;
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: 4 * 1024 * 1024 },
});

const docUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: docFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const saveToDisk = async (req, isDoc) => {
  // Documents are private by default. Public-site editors must opt in explicitly.
  const isPrivate = isDoc && req.body?.visibility !== "public";
  const folder = isDoc ? "docs" : "images";
  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const targetDir = isPrivate ? PRIVATE_DOCS_DIR : path.resolve(UPLOADS_DIR, folder);
  await fs.promises.mkdir(targetDir, { recursive: true });
  await fs.promises.writeFile(path.join(targetDir, fileName), req.file.buffer, { flag: "wx" });
  if (!isDoc) {
    const pool = await getPool();
    await pool.query("INSERT IGNORE INTO MediaAssets (StorageName, DisplayName, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?)", [fileName, fileName, new Date(), new Date()]);
  }
  const base = getPublicAssetOrigin(req);
  return {
    filename: fileName,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    visibility: isPrivate ? "private" : "public",
    url: isPrivate ? `${base}/api/upload/private/${fileName}` : `${base}/uploads/${folder}/${fileName}`,
  };
};

const runUpload = async (req, res, isDoc) => {
  try {
    return res.status(201).json({
      success: true,
      message: isDoc
        ? "Document uploaded successfully"
        : "Image uploaded successfully",
      data: await saveToDisk(req, isDoc),
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return res.status(500).json({
      success: false,
      message: isProduction ? "Upload failed" : `Upload failed: ${err.message}`,
    });
  }
};

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded" });
    }
    if (!validImageContent(req.file)) return res.status(400).json({ success: false, message: "The file content does not match its image extension" });
    runUpload(req, res, false);
  });
};

const uploadDocument = (req, res, next) => {
  docUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No document file uploaded" });
    }
    if (!validDocumentContent(req.file)) return res.status(400).json({ success: false, message: "The file content does not match its document extension" });
    runUpload(req, res, true);
  });
};

const IMAGES_DIR = path.resolve(UPLOADS_DIR, "images");

const safeImageName = (name) => {
  if (typeof name !== "string" || !name) return null;
  const base = path.basename(name);
  if (base !== name) return null;
  if (!imageTypes.has(path.extname(base).toLowerCase())) return null;
  return base;
};

const listImages = async (req, res) => {
  try {
    await fs.promises.mkdir(IMAGES_DIR, { recursive: true });
    const base = getPublicAssetOrigin(req);
    const filenames = (await fs.promises.readdir(IMAGES_DIR)).filter((f) => imageTypes.has(path.extname(f).toLowerCase()));
    const pool = await getPool();
    if (filenames.length) await pool.query("INSERT IGNORE INTO MediaAssets (StorageName, DisplayName, CreatedAt, UpdatedAt) VALUES " + filenames.map(() => "(?, ?, ?, ?)").join(","), filenames.flatMap((filename) => [filename, filename, new Date(), new Date()]));
    const [aliases] = await pool.query("SELECT StorageName, DisplayName FROM MediaAssets WHERE DeletedAt IS NULL");
    const names = new Map(aliases.map((row) => [row.StorageName, row.DisplayName]));
    const images = (await Promise.all(filenames.map(async (filename) => {
      const stat = await fs.promises.stat(path.join(IMAGES_DIR, filename));
      return { filename, name: names.get(filename) || filename, url: `${base}/uploads/images/${filename}`, size: stat.size, mtime: stat.mtime };
    }))).sort((a, b) => b.mtime - a.mtime);
    return res.status(200).json({ success: true, data: images });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: isProduction
          ? "Failed to list images"
          : `Failed to list images: ${err.message}`,
      });
  }
};

const deleteImage = async (req, res) => {
  try {
    const name = safeImageName(req.params.filename);
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image name" });
    }
    const target = path.join(IMAGES_DIR, name);
    try { await fs.promises.access(target); } catch {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    await fs.promises.mkdir(TRASH_IMAGES_DIR, { recursive: true });
    await fs.promises.rename(target, path.join(TRASH_IMAGES_DIR, name));
    const pool = await getPool();
    await pool.query("UPDATE MediaAssets SET DeletedAt=?, UpdatedAt=? WHERE StorageName=?", [new Date(), new Date(), name]);
    return res.json({ success: true, message: "Image moved to the recycle bin" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: isProduction
          ? "Failed to delete image"
          : `Failed to delete image: ${err.message}`,
      });
  }
};

const renameImage = async (req, res) => {
  try {
    const oldName = safeImageName(req.params.filename);
    const newName = String(req.body?.name || "").trim();
    if (!oldName) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image name" });
    }
    if (!newName || newName.length > 255 || /[\\/\0]/.test(newName)) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Display name must be 255 characters or fewer and cannot contain path characters",
        });
    }
    const oldTarget = path.join(IMAGES_DIR, oldName);
    try { await fs.promises.access(oldTarget); } catch {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    const pool = await getPool();
    await pool.query("INSERT INTO MediaAssets (StorageName, DisplayName, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE DisplayName=VALUES(DisplayName), UpdatedAt=VALUES(UpdatedAt)", [oldName, newName, new Date(), new Date()]);
    const base = getPublicAssetOrigin(req);
    return res.json({
      success: true,
      message: "Image renamed",
      data: { filename: oldName, name: newName, url: `${base}/uploads/images/${oldName}` },
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: isProduction
          ? "Failed to rename image"
          : `Failed to rename image: ${err.message}`,
      });
  }
};

const servePrivateDocument = async (req, res, next) => {
  try {
    const name = path.basename(String(req.params.filename || ""));
    if (!name || name !== req.params.filename || !documentTypes.has(path.extname(name).toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid document name" });
    }
    const target = path.join(PRIVATE_DOCS_DIR, name);
    try { await fs.promises.access(target); } catch { return res.status(404).json({ success: false, message: "Document not found" }); }
    res.setHeader("Cache-Control", "no-store, private");
    res.setHeader("Content-Disposition", `attachment; filename="${name.replace(/["\\\r\n]/g, "_")}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.sendFile(target);
  } catch (error) { return next(error); }
};

module.exports = {
  uploadImage,
  uploadDocument,
  listImages,
  deleteImage,
  renameImage,
  servePrivateDocument,
};
