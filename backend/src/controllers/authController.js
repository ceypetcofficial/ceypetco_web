const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

const DUMMY_PASSWORD_HASH = "$2b$12$EPdbbosRG97tn63t5WDp5.cXEOc5qYdmQS0MAggvVQYAV7H2GlKGS";
const sessionCookieName = process.env.NODE_ENV === "production" ? "__Secure-ceypetco_session" : "ceypetco_session";
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api",
  maxAge: 24 * 60 * 60 * 1000,
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
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

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

const logout = (_req, res) => {
  res.clearCookie("ceypetco_session", { path: "/api" });
  res.clearCookie("__Secure-ceypetco_session", { path: "/api", secure: true, sameSite: "none" });
  res.setHeader("Cache-Control", "no-store, private");
  res.status(200).json({ success: true, message: "Logged out" });
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
