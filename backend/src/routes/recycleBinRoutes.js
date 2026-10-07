const router = require("express").Router();
const controller = require("../controllers/recycleBinController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("super_admin", "admin"));
router.get("/", controller.getAll);
router.post("/:model/:id/restore", controller.restore);

module.exports = router;
