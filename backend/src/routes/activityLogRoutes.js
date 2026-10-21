const router = require("express").Router();
const { list } = require("../controllers/activityLogController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("super_admin", "admin"), list);

module.exports = router;
