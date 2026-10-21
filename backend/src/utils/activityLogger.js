const ActivityLog = require("../models/ActivityLog");

const clientIp = (req) => String(req.ip || req.socket?.remoteAddress || "unknown")
  .replace(/^::ffff:/, "")
  .slice(0, 100);

const writeActivity = async (req, values = {}) => {
  try {
    await ActivityLog.create({
      userId: values.userId || req.user?._id || null,
      userName: values.userName || req.user?.name || "Unknown user",
      userEmail: values.userEmail || req.user?.email || null,
      userRole: values.userRole || req.user?.role || null,
      action: values.action || "admin_action",
      method: values.method || req.method,
      path: values.path || req.originalUrl?.split("?")[0] || req.path,
      target: values.target || null,
      summary: values.summary || null,
      result: values.result || "success",
      statusCode: Number(values.statusCode) || 200,
      ipAddress: clientIp(req),
      userAgent: String(req.get("user-agent") || "").slice(0, 500),
      occurredAt: new Date(),
    });
  } catch (error) {
    console.error(`Activity log write failed: ${error.message}`);
  }
};

const actionFor = (method) => ({ POST: "created", PUT: "updated", PATCH: "updated", DELETE: "deleted" }[method] || "changed");

const auditAdminActivity = (req, res, next) => {
  if (!req.originalUrl.startsWith("/api/admin/") || !["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  res.on("finish", () => {
    if (!req.user) return;
    const path = req.originalUrl.split("?")[0];
    const target = path.replace(/^\/api\/admin\//, "").split("/")[0] || "admin";
    const subject = path.replace(/^\/api\/admin\//, "").replaceAll("/", " · ");
    void writeActivity(req, {
      action: actionFor(req.method),
      target,
      summary: `${actionFor(req.method)} ${subject.replaceAll("-", " ")}`,
      result: res.statusCode < 400 ? "success" : "failed",
      statusCode: res.statusCode,
    });
  });
  next();
};

module.exports = { auditAdminActivity, clientIp, writeActivity };
