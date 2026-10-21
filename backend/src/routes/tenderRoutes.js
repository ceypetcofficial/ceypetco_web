const express = require("express");
const router = express.Router();
const c = require("../controllers/tenderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router
  .route("/")
  .get(optionalAuth, (req, res, next) =>
    req.user && ["super_admin", "admin", "editor", "tender_user"].includes(req.user.role)
      ? c.getAll(req, res, next) : c.getActive(req, res, next)
  );

router.use(protect);

router
  .route("/")
  .post(authorize("super_admin", "admin", "editor", "tender_user"), c.create);

router
  .route("/:id")
  .get(authorize("super_admin", "admin", "editor", "tender_user"), c.getById)
  .put(authorize("super_admin", "admin", "editor", "tender_user"), c.update)
  .delete(authorize("super_admin", "admin", "tender_user"), c.remove);

module.exports = router;
