const express = require("express");
const c = require("../controllers/galleryController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();
const editors = authorize("super_admin", "admin", "editor");
router.get("/", optionalAuth, (req, res, next) => req.user ? c.getAll(req, res, next) : c.getPublished(req, res, next));
router.post("/", protect, editors, c.create);
router.get("/:id", protect, editors, c.getById);
router.put("/:id", protect, editors, c.update);
router.delete("/:id", protect, authorize("super_admin", "admin"), c.remove);

module.exports = router;
