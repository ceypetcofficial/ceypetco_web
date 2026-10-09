const jwt = require("jsonwebtoken");

const DEFAULT_TTL_SECONDS = 60 * 60;
const MAX_TTL_SECONDS = 2 * 60 * 60;

const getTokenTtlSeconds = () => {
  const value = String(process.env.JWT_EXPIRES_IN || "1h").trim().toLowerCase();
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) throw new Error("JWT_EXPIRES_IN must use s, m, h, or d (for example, 1h)");
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
  const requested = Number(match[1]) * multiplier;
  return Math.max(300, Math.min(requested, MAX_TTL_SECONDS));
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, tokenVersion: Number(user.tokenVersion) || 0 }, process.env.JWT_SECRET, {
    expiresIn: getTokenTtlSeconds() || DEFAULT_TTL_SECONDS,
    algorithm: "HS256",
    issuer: "ceypetco-api",
    audience: "ceypetco-admin",
    jwtid: require("crypto").randomUUID(),
  });
};

module.exports = generateToken;
module.exports.getTokenTtlSeconds = getTokenTtlSeconds;
