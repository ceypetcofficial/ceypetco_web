const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { getPublicAssetOrigin, isProduction } = require("../config/env");

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

const allowedImageTypes = /jpeg|jpg|png|webp|gif|avif/;
const imageFilter = (_req, file, cb) => {
  const extOk = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = allowedImageTypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"));
};

const allowedDocTypes = /pdf|doc|docx|xls|xlsx|csv|zip|rar|pptx|ppt/;
const docFilter = (_req, file, cb) => {
  const extOk = allowedDocTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = /pdf|msword|officedocument|sheet|zip|rar|presentation|text/.test(
    file.mimetype
  );
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Unsupported document type"));
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

const saveToDisk = (req, isDoc) => {
  const folder = isDoc ? "docs" : "images";
  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const targetDir = path.resolve(UPLOADS_DIR, folder);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, fileName), req.file.buffer);
  const base = getPublicAssetOrigin(req);
  return {
    filename: fileName,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `${base}/uploads/${folder}/${fileName}`,
  };
};

const runUpload = (req, res, isDoc) => {
  try {
    return res.status(201).json({
      success: true,
      message: isDoc
        ? "Document uploaded successfully"
        : "Image uploaded successfully",
      data: saveToDisk(req, isDoc),
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
    runUpload(req, res, true);
  });
};

const IMAGES_DIR = path.resolve(UPLOADS_DIR, "images");

const safeImageName = (name) => {
  if (typeof name !== "string" || !name) return null;
  const base = path.basename(name);
  if (base !== name) return null;
  if (!allowedImageTypes.test(path.extname(base).toLowerCase())) return null;
  return base;
};

const listImages = (req, res) => {
  try {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    const base = getPublicAssetOrigin(req);
    const images = fs
      .readdirSync(IMAGES_DIR)
      .filter((f) => allowedImageTypes.test(path.extname(f).toLowerCase()))
      .map((filename) => {
        const stat = fs.statSync(path.join(IMAGES_DIR, filename));
        return {
          filename,
          name: filename,
          url: `${base}/uploads/images/${filename}`,
          size: stat.size,
          mtime: stat.mtime,
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
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

const deleteImage = (req, res) => {
  try {
    const name = safeImageName(req.params.filename);
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image name" });
    }
    const target = path.join(IMAGES_DIR, name);
    if (!fs.existsSync(target)) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    fs.unlinkSync(target);
    return res.json({ success: true, message: "Image deleted" });
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

const renameImage = (req, res) => {
  try {
    const oldName = safeImageName(req.params.filename);
    const newName = safeImageName(req.body && req.body.name);
    if (!oldName) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid image name" });
    }
    if (!newName) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "New name must be provided and must end in an image extension (jpeg, jpg, png, webp, gif, avif)",
        });
    }
    const oldTarget = path.join(IMAGES_DIR, oldName);
    const newTarget = path.join(IMAGES_DIR, newName);
    if (!fs.existsSync(oldTarget)) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    if (fs.existsSync(newTarget)) {
      return res
        .status(409)
        .json({ success: false, message: "An image with that name already exists" });
    }
    fs.renameSync(oldTarget, newTarget);
    const base = getPublicAssetOrigin(req);
    return res.json({
      success: true,
      message: "Image renamed",
      data: { filename: newName, name: newName, url: `${base}/uploads/images/${newName}` },
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

module.exports = {
  uploadImage,
  uploadDocument,
  listImages,
  deleteImage,
  renameImage,
};
