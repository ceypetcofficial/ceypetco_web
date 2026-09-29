import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Loader2,
  Copy,
  Check,
  Trash2,
  Pencil,
  X,
  RefreshCw,
  Link2,
} from "lucide-react";
import api from "../../../services/api";

const imageTypePattern = /^image\//;
const imageExtensionPattern = /\.(jpeg|jpe?g|png|webp|gif|svg|avif)$/i;

const formatBytes = (n) => {
  if (!n && n !== 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const ImageLibrary = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState("");
  const [editing, setEditing] = useState("");
  const [draftName, setDraftName] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/upload/images");
      setImages(res.data && res.data.data ? res.data.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load the image library");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copy = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(text);
    setTimeout(() => setCopied(""), 1500);
    toast.success("Image link copied");
  };

  const upload = async (file) => {
    if (!file) return;
    if (!imageTypePattern.test(file.type)) {
      toast.error("Only image files are allowed");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await api.post("/upload/image", body);
      const img = res.data && res.data.data;
      if (img) {
        setImages((list) => [
          img,
          ...list.filter((i) => i.filename !== img.filename),
        ]);
        copy(img.url);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const startRename = ({ filename }) => {
    setEditing(filename);
    setDraftName(filename);
  };

  const saveRename = async () => {
    const oldName = editing;
    const name = (draftName || "").trim();
    if (!name || name === oldName) {
      setEditing("");
      return;
    }
    if (!imageExtensionPattern.test(name) || name.includes("/")) {
      toast.error("Name must end in an image extension (.jpg .png .webp .gif .svg .avif)");
      return;
    }
    try {
      const res = await api.patch(
        `/upload/images/${encodeURIComponent(oldName)}`,
        { name }
      );
      const img = res.data && res.data.data;
      if (img) {
        setImages((list) =>
          list.map((i) =>
            i.filename === oldName
              ? { ...i, filename: img.filename, name: img.filename, url: img.url }
              : i
          )
        );
      }
      setEditing("");
      toast.success("Image renamed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rename failed");
    }
  };

  const remove = async (img) => {
    if (!window.confirm(`Delete image "${img.filename}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/upload/images/${encodeURIComponent(img.filename)}`);
      setImages((list) => list.filter((i) => i.filename !== img.filename));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Upload pictures and copy their links to change any image on the website. Paste an image
        link into any image field on the site to change the picture. Images that are already in use
        on the website are listed here too, so you can reuse or update them.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          upload(e.target.files && e.target.files[0]);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current && fileRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragging
            ? "border-red-500 bg-red-50"
            : "border-slate-300 bg-white hover:border-[#092f3b]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-3 text-[#092f3b] text-sm font-semibold">
            <Loader2 size={20} className="animate-spin" /> Uploading image…
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <UploadCloud size={28} className="text-[#092f3b]" />
            <p className="text-sm font-semibold text-[#092f3b]">
              Click to choose an image, or drag &amp; drop it here
            </p>
            <p className="text-xs text-slate-400">
              JPEG · PNG · WebP · GIF · SVG · AVIF · up to 4 MB
            </p>
          </div>
        )}
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-extrabold text-[#092f3b] uppercase tracking-wider">
            Image library
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {images.length} {images.length === 1 ? "image" : "images"}
          </span>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={22} className="animate-spin mr-3" /> Loading image library…
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-500">No uploaded images yet</p>
          <p className="text-xs mt-1">Upload an image above to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.filename}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-slate-100">
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {editing === img.filename ? (
                    <>
                      <button
                        onClick={() => setEditing("")}
                        title="Cancel"
                        className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                      >
                        <X size={13} />
                      </button>
                      <button
                        onClick={saveRename}
                        title="Save name"
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        <Check size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startRename(img)}
                      title="Rename"
                      className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(img)}
                    title="Delete"
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="p-3 flex flex-col gap-2 flex-1">
                {editing === img.filename ? (
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") setEditing("");
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-xs font-semibold text-[#092f3b] border border-slate-300 rounded-md outline-none"
                  />
                ) : (
                  <p className="text-xs font-semibold text-[#092f3b] truncate" title={img.filename}>
                    {img.filename}
                  </p>
                )}
                <p className="text-[11px] text-slate-400">{formatBytes(img.size)}</p>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 min-w-0">
                  <Link2 size={13} className="shrink-0 text-slate-400" />
                  <span className="text-[10px] text-slate-500 truncate flex-1" title={img.url}>
                    {img.url}
                  </span>
                  <button
                    onClick={() => copy(img.url)}
                    title="Copy image link"
                    className="shrink-0 p-1.5 rounded-lg bg-[#092f3b] text-white hover:bg-[#062e3b]"
                  >
                    {copied === img.url ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
