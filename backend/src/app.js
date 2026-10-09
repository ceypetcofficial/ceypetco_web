const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const newsRoutes = require("./routes/newsRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const tenderRoutes = require("./routes/tenderRoutes");
const projectRoutes = require("./routes/projectRoutes");
const careerRoutes = require("./routes/careerRoutes");
const contactRoutes = require("./routes/contactRoutes");
const aviationPriceRoutes = require("./routes/aviationPriceRoutes");
const fuelPriceRoutes = require("./routes/fuelPriceRoutes");
const historicalPriceRoutes = require("./routes/historicalPriceRoutes");
const fuelStationRoutes = require("./routes/fuelStationRoutes");
const regionalOfficeRoutes = require("./routes/regionalOfficeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const supplierResourceRoutes = require("./routes/supplierResourceRoutes");
const supplierSectionRoutes = require("./routes/supplierSectionRoutes");
const annualReportRoutes = require("./routes/annualReportRoutes");
const managementTeamMemberRoutes = require("./routes/managementTeamMemberRoutes");
const managementContactRoutes = require("./routes/managementContactRoutes");
const userRoutes = require("./routes/userRoutes");
const homeServiceRoutes = require("./routes/homeServiceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const divisionRoutes = require("./routes/divisionRoutes");
const popupNoticeRoutes = require("./routes/popupNoticeRoutes");
const mobileAppRoutes = require("./routes/mobileAppRoutes");
const historyPageRoutes = require("./routes/historyPageRoutes");
const pageContentRoutes = require("./routes/pageContentRoutes");
const googleDriveImageRoutes = require("./routes/googleDriveImageRoutes");
const tenderDownloadRoutes = require("./routes/tenderDownloadRoutes");
const recycleBinRoutes = require("./routes/recycleBinRoutes");
const priceAuditRoutes = require("./routes/priceAuditRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const { allowedOrigins, isProduction } = require("./config/env");
const requireTrustedOrigin = require("./middleware/csrfMiddleware");

const app = express();
const isDevelopment = process.env.NODE_ENV === "development";

app.set("trust proxy", 1);
app.set("query parser", "simple");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: "deny" },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'none'"],
      },
    },
  })
);
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, message: "Origin is not allowed" });
  }
  return next();
});
app.use(express.json({ limit: "100kb", strict: true }));
app.use(requireTrustedOrigin);
app.use(
  "/uploads/images",
  (req, res, next) => [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(path.extname(req.path).toLowerCase()) ? next() : res.status(404).end(),
  express.static(path.resolve(__dirname, "../uploads/images"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);
app.use(
  "/uploads/docs",
  (req, res, next) => [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".csv", ".zip", ".rar"].includes(path.extname(req.path).toLowerCase()) ? next() : res.status(404).end(),
  express.static(path.resolve(__dirname, "../uploads/docs"), {
    setHeaders: (res, filePath) => {
      const filename = path.basename(filePath).replace(/["\\\r\n]/g, "_");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);
app.use(morgan(isProduction ? "combined" : "dev"));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "Too many read requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    !["GET", "HEAD", "OPTIONS"].includes(req.method),
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: "Too many changes submitted, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    ["GET", "HEAD", "OPTIONS"].includes(req.method),
});

const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many submissions, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
});

const imageProxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: { success: false, message: "Too many image requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many uploads, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "CEYPETCO backend is running successfully",
  });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/admin/contact-messages", publicFormLimiter);
app.use("/api/tender-downloads", publicFormLimiter);
app.use("/api/images/google-drive", imageProxyLimiter);
app.use("/api/upload", uploadLimiter);
app.use("/api", readLimiter);
app.use("/api", writeLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/news", newsRoutes);
app.use("/api/admin/notices", noticeRoutes);
app.use("/api/admin/tenders", tenderRoutes);
app.use("/api/tender-downloads", tenderDownloadRoutes);
app.use("/api/admin/projects", projectRoutes);
app.use("/api/admin/supplier-resources", supplierResourceRoutes);
app.use("/api/admin/supplier-section", supplierSectionRoutes);
app.use("/api/admin/annual-reports", annualReportRoutes);
app.use("/api/admin/team-members", managementTeamMemberRoutes);
app.use("/api/admin/management-contacts", managementContactRoutes);
app.use("/api/admin/careers", careerRoutes);
app.use("/api/admin/contact-messages", contactRoutes);
app.use("/api/admin/historical-prices", historicalPriceRoutes);
app.use("/api/admin/fuel-prices", fuelPriceRoutes);
app.use("/api/admin/aviation-prices", aviationPriceRoutes);
app.use("/api/admin/fuel-stations", fuelStationRoutes);
app.use("/api/admin/regional-offices", regionalOfficeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/home-services", homeServiceRoutes);
app.use("/api/admin/services", serviceRoutes);
app.use("/api/admin/divisions", divisionRoutes);
app.use("/api/admin/popup-notices", popupNoticeRoutes);
app.use("/api/admin/mobile-apps", mobileAppRoutes);
app.use("/api/admin/history-page", historyPageRoutes);
app.use("/api/admin/pages", pageContentRoutes);
app.use("/api/admin/recycle-bin", recycleBinRoutes);
app.use("/api/admin/price-audit", priceAuditRoutes);
app.use("/api/admin/gallery", galleryRoutes);
app.use("/api/images/google-drive", googleDriveImageRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;
