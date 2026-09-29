const express = require("express");
const router = express.Router();
const RegionalOffice = require("../models/RegionalOffice");
const c = require("../controllers/regionalOfficeController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/active").get(async (req, res, next) => {
  try {
    const offices = await RegionalOffice.find({ status: "active" }).sort(
      "name"
    );
    res.status(200).json({ success: true, data: offices });
  } catch (error) {
    next(error);
  }
});

router.use(protect);

router
  .route("/")
  .get(c.getAll)
  .post(authorize("super_admin", "admin", "editor"), c.create);

router
  .route("/:id")
  .get(c.getById)
  .put(authorize("super_admin", "admin", "editor"), c.update)
  .delete(authorize("super_admin", "admin"), c.remove);

module.exports = router;
