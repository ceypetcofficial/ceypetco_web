const fs = require("fs");
const path = require("path");

const uploadsDir = path.resolve(__dirname, "../../uploads");
const ensureUploadDirectories = () => {
  fs.mkdirSync(path.join(uploadsDir, "images"), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, "docs"), { recursive: true });
  fs.mkdirSync(path.resolve(__dirname, "../../private-docs"), { recursive: true });
};
const isLocalUploadUrl = (url) => {
  try { return new URL(url, "http://localhost").pathname.startsWith("/uploads/"); }
  catch { return false; }
};
const deleteLocalAsset = (url) => {
  try {
    const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
    const relativePath = pathname.replace(/^\/uploads\//, "");
    const absolutePath = path.resolve(uploadsDir, relativePath);
    if (!absolutePath.startsWith(uploadsDir + path.sep)) return { deleted: false, reason: "outside-uploads" };
    if (!fs.existsSync(absolutePath)) return { deleted: false, reason: "not-found" };
    fs.unlinkSync(absolutePath);
    return { deleted: true, file: pathname };
  } catch (error) { return { deleted: false, reason: error.message }; }
};
const deleteAssets = async (urls) => (urls || [])
  .filter((url) => typeof url === "string")
  .map((url) => isLocalUploadUrl(url) ? deleteLocalAsset(url) : { deleted: false, reason: "external-asset" });

module.exports = { ensureUploadDirectories, isLocalUploadUrl, deleteLocalAsset, deleteAssets };
