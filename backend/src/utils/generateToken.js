const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, tokenVersion: Number(user.tokenVersion) || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    algorithm: "HS256",
    issuer: "ceypetco-api",
    audience: "ceypetco-admin",
    jwtid: require("crypto").randomUUID(),
  });
};

module.exports = generateToken;
