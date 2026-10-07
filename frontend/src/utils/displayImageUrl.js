const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace(/\/+$/, "");

export default function displayImageUrl(value) {
  if (!value) return value;
  if (typeof value !== "string") return "";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (/^[A-Za-z0-9._~-][A-Za-z0-9._~/%=&+-]*$/.test(value) && !value.includes("..")) return value;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.hostname !== "drive.google.com") return value;
    const fileId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]
      || url.searchParams.get("id");
    if (!fileId || !/^[A-Za-z0-9_-]{10,128}$/.test(fileId)) return value;
    const resourceKey = url.searchParams.get("resourcekey");
    const suffix = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : "";
    return `${apiBase}/images/google-drive/${fileId}${suffix}`;
  } catch {
    return "";
  }
}
