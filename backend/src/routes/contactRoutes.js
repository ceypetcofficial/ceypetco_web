const express = require("express");
const router = express.Router();
const c = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/").post(c.create);

router.use(protect);

router.route("/").get(authorize("super_admin", "admin"), c.getAll);
router.route("/:id").get(authorize("super_admin", "admin"), c.getById).put(authorize("super_admin", "admin"), c.update).delete(authorize("super_admin", "admin"), c.remove);

module.exports = router;
