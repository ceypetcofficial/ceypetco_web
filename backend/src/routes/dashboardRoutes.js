const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/stats", protect, authorize("super_admin", "admin", "editor"), getDashboardStats);

module.exports = router;
