const ProductSpecification = require("../models/ProductSpecification");
const path = require("path");
const { Readable } = require("stream");

const fallback = {
  title: "Petroleum product specifications",
  description: "Official quality requirements and technical data for CEYPETCO petroleum products.",
  url: "https://ceypetco.gov.lk/wp-content/uploads/Import-Specification.pdf",
  status: "published",
};

const clean = (body = {}) => ({
  title: String(body.title || fallback.title).trim().slice(0, 200),
  description: String(body.description || "").trim().slice(0, 1000),
  url: String(body.url || "").trim().slice(0, 2000),
  status: body.status === "draft" ? "draft" : "published",
});

const getCurrent = async (_req, res, next) => {
  try {
    const item = await ProductSpecification.findOne({ status: "published" }).sort("-updatedAt").lean();
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({ success: true, data: item || fallback });
  } catch (error) { next(error); }
};

const getAdmin = async (_req, res, next) => {
  try {
    const item = await ProductSpecification.findOne().sort("-updatedAt");
    res.json({ success: true, data: item || fallback });
  } catch (error) { next(error); }
};

const getPublishedSpecification = async () =>
  (await ProductSpecification.findOne({ status: "published" }).sort("-updatedAt").lean()) || fallback;

const serveDocument = async (req, res, next) => {
  try {
    const item = await getPublishedSpecification();
    const disposition = req.query.disposition === "attachment" ? "attachment" : "inline";
    const filename = `${String(item.title || fallback.title)
      .replace(/[^a-z0-9._ -]/gi, "")
      .trim() || "product-specifications"}.pdf`;

    // This public PDF is intentionally embedded by the website's preview dialog.
    if (disposition === "inline") {
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
    }

    const documentUrl = new URL(item.url, "http://local.invalid");
    if (documentUrl.pathname.startsWith("/uploads/docs/")) {
      const storageName = path.basename(decodeURIComponent(documentUrl.pathname));
      const documentPath = path.resolve(__dirname, "../../uploads/docs", storageName);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
      return res.sendFile(documentPath);
    }

    const allowedHost = documentUrl.hostname === "ceypetco.gov.lk" || documentUrl.hostname.endsWith(".ceypetco.gov.lk");
    if (documentUrl.protocol !== "https:" || !allowedHost) {
      return res.status(400).json({ success: false, message: "The specification document URL is not supported" });
    }

    const upstream = await fetch(documentUrl, { signal: AbortSignal.timeout(30000) });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ success: false, message: "The specification document is unavailable" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
    res.setHeader("Cache-Control", "public, max-age=300");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);
    return Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    return next(error);
  }
};

const save = async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.title || !data.url) return res.status(400).json({ success: false, message: "Title and PDF document are required" });
    if (!/^https?:\/\//i.test(data.url) && !data.url.startsWith("/uploads/")) {
      return res.status(400).json({ success: false, message: "Please upload a PDF or provide a valid document URL" });
    }
    const existing = await ProductSpecification.findOne();
    const item = existing
      ? await ProductSpecification.findByIdAndUpdate(existing._id, data)
      : await ProductSpecification.create(data);
    res.json({ success: true, data: item, message: "Product specification updated" });
  } catch (error) { next(error); }
};

module.exports = { getCurrent, getAdmin, serveDocument, save };
