const express = require("express");
const router = express.Router();
const c = require("../controllers/annualReportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/active").get(c.getPublished);

router.use(protect);

router
  .route("/")
  .get(authorize("super_admin", "admin", "editor", "media_user"), c.getAll)
  .post(authorize("super_admin", "admin", "editor", "media_user"), c.create);

router
  .route("/:id")
  .get(authorize("super_admin", "admin", "editor", "media_user"), c.getById)
  .put(authorize("super_admin", "admin", "editor", "media_user"), c.update)
  .delete(authorize("super_admin", "admin", "media_user"), c.remove);

module.exports = router;
