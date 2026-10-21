const express = require("express");
const router = express.Router();
const c = require("../controllers/careerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/active").get(c.getActive);

router.use(protect);

router
  .route("/")
  .get(authorize("super_admin", "admin", "editor", "hr_user"), c.getAll)
  .post(authorize("super_admin", "admin", "editor", "hr_user"), c.create);

router
  .route("/:id")
  .get(authorize("super_admin", "admin", "editor", "hr_user"), c.getById)
  .put(authorize("super_admin", "admin", "editor", "hr_user"), c.update)
  .delete(authorize("super_admin", "admin", "hr_user"), c.remove);

module.exports = router;
