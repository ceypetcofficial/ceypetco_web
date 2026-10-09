const { allowedOrigins } = require("../config/env");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const SESSION_COOKIE_RE = /(?:^|;\s*)(?:__Secure-)?ceypetco_session=/;

const originOf = (value) => {
  try { return new URL(value).origin; }
  catch { return null; }
};

// Cookie-authenticated mutations must originate from the configured frontend
// (or the API's own origin). Bearer-token clients are not vulnerable to CSRF.
const requireTrustedOrigin = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.headers.authorization?.startsWith("Bearer ")) return next();
  if (!SESSION_COOKIE_RE.test(String(req.headers.cookie || ""))) return next();

  const suppliedOrigin = originOf(req.get("origin")) || originOf(req.get("referer"));
  const ownOrigin = `${req.protocol}://${req.get("host")}`;
  const trusted = new Set([...allowedOrigins, ownOrigin].map(originOf).filter(Boolean));

  if (!suppliedOrigin || !trusted.has(suppliedOrigin)) {
    return res.status(403).json({ success: false, message: "Request origin could not be verified" });
  }
  return next();
};

module.exports = requireTrustedOrigin;
