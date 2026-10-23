const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => rateLimit.ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: "Too many sign-in attempts from this network, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const accountRateLimitKey = (email) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "missing-account";
  return `account:${crypto.createHash("sha256").update(normalizedEmail.slice(0, 254)).digest("hex")}`;
};

const loginAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => accountRateLimitKey(req.body?.email),
  handler: (req, res, _next, options) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfterSeconds = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : 15 * 60;
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(options.statusCode).json({
      success: false,
      message: "Too many sign-in attempts for this account.",
      retryAfterSeconds,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const resetAccountLoginAttempts = (email) => loginAccountLimiter.resetKey(accountRateLimitKey(email));

module.exports = { loginIpLimiter, loginAccountLimiter, resetAccountLoginAttempts };
