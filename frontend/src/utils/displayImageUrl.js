const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace(/\/+$/, "");

export default function displayImageUrl(value) {
  if (!value) return value;
  try {
    const url = new URL(value);
    if (url.hostname !== "drive.google.com") return value;
    const fileId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/)?.[1]
      || url.searchParams.get("id");
    if (!fileId || !/^[A-Za-z0-9_-]{10,128}$/.test(fileId)) return value;
    const resourceKey = url.searchParams.get("resourcekey");
    const suffix = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : "";
    return `${apiBase}/images/google-drive/${fileId}${suffix}`;
  } catch {
    return value;
  }
}
