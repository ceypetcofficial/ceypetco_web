const express = require("express");
const c = require("../controllers/galleryController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
const editors = authorize("super_admin", "admin", "editor", "media_user");
router.get("/", optionalAuth, (req, res, next) => req.user && ["super_admin", "admin", "editor", "media_user"].includes(req.user.role) ? c.getAll(req, res, next) : c.getPublished(req, res, next));
router.post("/", protect, editors, c.create);
router.get("/:id", protect, editors, c.getById);
router.put("/:id", protect, editors, c.update);
router.delete("/:id", protect, authorize("super_admin", "admin", "media_user"), c.remove);

module.exports = router;
