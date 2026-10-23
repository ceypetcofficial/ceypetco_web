const express = require("express");
const router = express.Router();
const c = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("super_admin", "admin"));

router.route("/").get(c.getAll).post(c.create);
router.post("/:id/unlock-login", c.unlockLogin);
router.route("/:id").get(c.getById).put(c.update).delete(c.remove);

module.exports = router;
