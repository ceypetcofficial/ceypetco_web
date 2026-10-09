const express = require("express");
const router = express.Router();
const { login, logout, getMe } = require("../controllers/authController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/logout", optionalAuth, logout);
router.get("/me", protect, getMe);

module.exports = router;
