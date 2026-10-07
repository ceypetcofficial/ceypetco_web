const router = require("express").Router();
const controller = require("../controllers/priceAuditController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
router.get("/", protect, authorize("super_admin", "admin"), controller.getAll);
module.exports = router;
