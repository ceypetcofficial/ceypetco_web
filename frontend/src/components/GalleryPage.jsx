import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../api";
import displayImageUrl from "../utils/displayImageUrl";

const videoSource = (value) => {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    }
    if (url.hostname === "vimeo.com" || url.hostname.endsWith(".vimeo.com")) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch { return ""; }
  return "";
};

function Viewer({ item, onClose, onPrevious, onNext, count, index }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const prior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && count > 1) onPrevious();
      if (event.key === "ArrowRight" && count > 1) onNext();
      if (event.key === "Tab") {
        const buttons = [...document.querySelectorAll(".gallery-viewer button")];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", key); prior?.focus?.(); };
  }, [onClose, onNext, onPrevious, count]);
  const src = videoSource(item.mediaUrl);
  return createPortal(
    <div className="gallery-viewer" role="dialog" aria-modal="true" aria-label={item.title} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="gallery-viewer-glow" aria-hidden="true" />
      <div className="gallery-viewer-panel">
        <div className="gallery-viewer-top">
          <div className="gallery-viewer-brand"><span>CEYPETCO</span><b>Media Gallery</b></div>
          <div className="gallery-viewer-tools"><span className="gallery-viewer-count"><b>{String(index + 1).padStart(2, "0")}</b><i>/</i>{String(count).padStart(2, "0")}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Close media viewer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button></div>
        </div>
        <div className="gallery-viewer-stage">
          <span className="gallery-viewer-type">{item.type === "video" ? "Video" : "Photography"}</span>
          {count > 1 && <button type="button" className="gallery-viewer-prev" onClick={onPrevious} aria-label="Previous media"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></button>}
          {item.type === "video" ? (src ? <iframe src={`${src}?autoplay=1`} title={item.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <p className="gallery-viewer-error">This video link cannot be embedded.</p>) : <img src={displayImageUrl(item.mediaUrl)} alt={item.altText || item.title} />}
          {count > 1 && <button type="button" className="gallery-viewer-next" onClick={onNext} aria-label="Next media"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></button>}
        </div>
        <div className="gallery-viewer-caption"><div className="gallery-viewer-copy"><span>{item.category}</span><h2>{item.title}</h2>{item.description && <p>{item.description}</p>}</div><div className="gallery-viewer-hint" aria-hidden="true"><span><kbd>←</kbd><kbd>→</kbd> Browse</span><span><kbd>ESC</kbd> Close</span></div></div>
      </div>
    </div>, document.body,
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  useEffect(() => {
    let live = true;
    api.get("/admin/gallery").then(({ data }) => live && setItems(data.data || [])).catch(() => live && setError("The gallery could not be loaded. Please try again later.")).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, []);
  const categories = useMemo(() => [...items.reduce((unique, item) => {
    const category = item.category?.trim();
    if (category && !unique.has(category.toLocaleLowerCase())) unique.set(category.toLocaleLowerCase(), category);
    return unique;
  }, new Map()).values()].sort((a, b) => a.localeCompare(b)), [items]);
  const visible = useMemo(() => items.filter((item) => filter === "all" || item.type === filter || item.category === filter), [items, filter]);
  const chooseFilter = (value) => { setFilter(value); setActive(null); };
  const activeIndex = active ? visible.findIndex((item) => item._id === active._id) : -1;
  const move = (step) => setActive(visible[(activeIndex + step + visible.length) % visible.length]);
  return <main className="inner-page gallery-page">
    <section className="page-hero gallery-hero"><img src="/images/aviation-hero.jpg" alt="" /><div className="container page-hero-copy"><p className="eyebrow light">MEDIA CENTRE · GALLERY</p><h1>Ceypetco in focus</h1><p>Explore photographs and videos from across our people, operations, services and community.</p><div className="breadcrumbs"><a href="/">Home</a><span>/</span><b>Gallery</b></div></div></section>
    <nav className="media-section-nav" aria-label="Media sections"><div className="container"><a href="/news">News</a><a href="/notices">Notices</a><a href="/publications">Publications</a><a className="active" href="/gallery" aria-current="page">Gallery</a></div></nav>
    <section className="gallery-content content-section" aria-labelledby="gallery-heading"><div className="container">
      <div className="gallery-intro"><p className="eyebrow">VISUAL STORIES</p><h2 id="gallery-heading">Inside Ceypetco</h2><p>A curated view of the people, places and operations behind our work.</p></div>
      <div className="gallery-filters" aria-label="Filter gallery">{[["all", "All media"], ["image", "Photos"], ["video", "Videos"], ...categories.map((c) => [c, c])].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => chooseFilter(value)}>{label}</button>)}</div>
      {loading ? <p className="gallery-status" role="status">Loading gallery…</p> : error ? <p className="gallery-status gallery-error" role="alert">{error}</p> : visible.length === 0 ? <p className="gallery-status">No published media matches this filter.</p> : <div className="gallery-grid">{visible.map((item) => <button className="gallery-card" type="button" key={item._id} onClick={() => setActive(item)} aria-label={`${item.type === "video" ? "Watch video" : "View photo"}: ${item.title}`}><img src={displayImageUrl(item.type === "video" ? item.posterUrl : item.mediaUrl)} alt={item.altText || item.title} loading="lazy" decoding="async" /><span className="gallery-card-shade" /><span className="gallery-card-copy"><small>{item.category}</small><strong>{item.title}</strong><em>{item.type === "video" && <i aria-hidden="true">▶</i>}{item.type === "video" ? "Watch video" : "View photo"}</em></span></button>)}</div>}
    </div></section>
    {active && <Viewer item={active} index={activeIndex} count={visible.length} onClose={() => setActive(null)} onPrevious={() => move(-1)} onNext={() => move(1)} />}
  </main>;
}
