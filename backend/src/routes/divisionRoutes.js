const express = require("express");
const router = express.Router();
const c = require("../controllers/divisionController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router
  .route("/")
  .get(optionalAuth, (req, res, next) =>
    req.user ? c.getAll(req, res, next) : c.getPublished(req, res, next)
  );
router.route("/slug/:slug").get(c.getBySlug);

router.use(protect);

router
  .route("/")
  .post(authorize("super_admin", "admin", "editor"), c.create);

router
  .route("/:id")
  .get(c.getById)
  .put(authorize("super_admin", "admin", "editor"), c.update)
  .delete(authorize("super_admin", "admin"), c.remove);

module.exports = router;