const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const { writeActivity } = require("../utils/activityLogger");

// Timing-equalization hash only. It is never assigned to an account and keeps
// unknown-user authentication timing comparable to real password checks.
const DUMMY_PASSWORD_HASH = "$2b$12$EPdbbosRG97tn63t5WDp5.cXEOc5qYdmQS0MAggvVQYAV7H2GlKGS";
const sessionCookieName = process.env.NODE_ENV === "production" ? "__Secure-ceypetco_session" : "ceypetco_session";
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api",
  // Persist until explicit logout. Account status and tokenVersion checks still
  // allow administrators to revoke access when necessary.
  maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 254 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      await writeActivity(req, { userEmail: email.toLowerCase(), action: "login", summary: "Failed login: unknown account", result: "failed", statusCode: 401 });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch || user.status !== "active") {
      await writeActivity(req, { userId: user._id, userName: user.name, userEmail: user.email, userRole: user.role, action: "login", summary: user.status !== "active" ? "Failed login: inactive account" : "Failed login: invalid password", result: "failed", statusCode: 401 });
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    await writeActivity(req, { userId: user._id, userName: user.name, userEmail: user.email, userRole: user.role, action: "login", summary: "Login successful", result: "success", statusCode: 200 });

    const token = generateToken(user);
    res.cookie(sessionCookieName, token, sessionCookieOptions);
    res.setHeader("Cache-Control", "no-store, private");

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await writeActivity(req, { action: "logout", summary: "Logged out", result: "success", statusCode: 200 });
      req.user.tokenVersion = (Number(req.user.tokenVersion) || 0) + 1;
      await req.user.save({ validateBeforeSave: false });
    }
  res.clearCookie("ceypetco_session", { path: "/api" });
  res.clearCookie("__Secure-ceypetco_session", { path: "/api", secure: true, sameSite: "none" });
  res.setHeader("Cache-Control", "no-store, private");
  res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
    },
  });
};

module.exports = { login, logout, getMe };
