const express = require("express");
const router = express.Router();
const c = require("../controllers/tenderDownloadController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public route to log a download
router.post("/", c.create);

// Protected admin route
router.get("/", protect, authorize("super_admin", "admin"), c.getAll);
router.delete("/:id", protect, authorize("super_admin", "admin"), c.remove);

module.exports = router;
