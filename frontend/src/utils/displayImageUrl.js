import { apiBaseUrl, apiOrigin } from "./apiBaseUrl.js";

const uploadPathPattern = /^\/?uploads\/(images|docs)\//i;
const legacyUploadHosts = new Set([
  "localhost",
  "127.0.0.1",
  "ceypetco.gov.lk",
  "www.ceypetco.gov.lk",
  "api.ceypetco.gov.lk",
]);

export default function displayImageUrl(value) {
  if (!value) return value;
  if (typeof value !== "string") return "";
  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized || normalized.includes("..")) return "";

  // Uploaded assets are served by Express at the API origin, outside /api.
  if (uploadPathPattern.test(normalized)) {
    return `${apiOrigin}/${normalized.replace(/^\/+/, "")}`;
  }
  if (normalized.startsWith("/") && !normalized.startsWith("//")) return normalized;
  if (/^[A-Za-z0-9._~-][A-Za-z0-9._~/%=&+-]*$/.test(normalized)) return normalized;
  try {
    const url = new URL(normalized);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (uploadPathPattern.test(url.pathname) && legacyUploadHosts.has(url.hostname.toLowerCase())) {
      return `${apiOrigin}${url.pathname}${url.search}${url.hash}`;
    }
    if (url.hostname !== "drive.google.com") return normalized;
    const fileId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]
      || url.searchParams.get("id");
    if (!fileId || !/^[A-Za-z0-9_-]{10,128}$/.test(fileId)) return value;
    const resourceKey = url.searchParams.get("resourcekey");
    const suffix = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : "";
    return `${apiBaseUrl}/images/google-drive/${fileId}${suffix}`;
  } catch {
    return "";
  }
}
