const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieValue = (header, name) => {
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
  }
  return null;
};
const requestToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) return req.headers.authorization.slice(7).trim();
  return cookieValue(req.headers.cookie, "__Secure-ceypetco_session") || cookieValue(req.headers.cookie, "ceypetco_session");
};

const protect = async (req, res, next) => {
  try {
    const token = requestToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "ceypetco-api", audience: "ceypetco-admin" });

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is inactive. Contact administrator.",
      });
    }

    if ((Number(decoded.tokenVersion) || 0) !== (Number(user.tokenVersion) || 0)) {
      return res.status(401).json({ success: false, message: "Session is no longer valid, please login again" });
    }

    req.user = user;
    res.setHeader('Cache-Control', 'no-store, private');
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = requestToken(req);

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "ceypetco-api", audience: "ceypetco-admin" });
    const user = await User.findById(decoded.id);

    if (user && user.status === "active" && (Number(decoded.tokenVersion) || 0) === (Number(user.tokenVersion) || 0)) {
      req.user = user;
    }

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { protect, optionalAuth };
