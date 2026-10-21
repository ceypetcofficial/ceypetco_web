const router = require("express").Router();
const controller = require("../controllers/productSpecificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/current", controller.getCurrent);
router.get("/current/document", controller.serveDocument);
router.get("/", protect, authorize("super_admin", "admin", "editor", "marketing_user"), controller.getAdmin);
router.put("/", protect, authorize("super_admin", "admin", "editor", "marketing_user"), controller.save);

module.exports = router;
