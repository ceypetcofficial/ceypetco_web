const safeUrl = (value) => {
  try { return new URL(String(value || "").trim()); } catch { return null; }
};

export const getVideoDetails = (value) => {
  const url = safeUrl(value);
  if (!url) return { provider: "", embedUrl: "", thumbnailUrl: "" };
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) {
    const id = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    return id ? { provider: "YouTube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` } : { provider: "YouTube", embedUrl: "", thumbnailUrl: "" };
  }

  if (host === "drive.google.com") {
    const id = url.pathname.match(/\/file\/d\/([^/?]+)/)?.[1] || url.searchParams.get("id");
    return id ? { provider: "Google Drive", embedUrl: `https://drive.google.com/file/d/${id}/preview`, thumbnailUrl: "" } : { provider: "Google Drive", embedUrl: "", thumbnailUrl: "" };
  }

  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
    return id ? { provider: "Vimeo", embedUrl: `https://player.vimeo.com/video/${id}`, thumbnailUrl: "" } : { provider: "Vimeo", embedUrl: "", thumbnailUrl: "" };
  }
  return { provider: "", embedUrl: "", thumbnailUrl: "" };
};
