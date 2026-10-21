const express = require("express");
const router = express.Router();
const c = require("../controllers/projectController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router
  .route("/")
  .get(optionalAuth, (req, res, next) =>
    req.user && ["super_admin", "admin", "editor", "media_user"].includes(req.user.role)
      ? c.getAll(req, res, next) : c.getPublished(req, res, next)
  );

router.use(protect);

router
  .route("/")
  .post(authorize("super_admin", "admin", "editor", "media_user"), c.create);

router
  .route("/:id")
  .get(authorize("super_admin", "admin", "editor", "media_user"), c.getById)
  .put(authorize("super_admin", "admin", "editor", "media_user"), c.update)
  .delete(authorize("super_admin", "admin", "media_user"), c.remove);

module.exports = router;
