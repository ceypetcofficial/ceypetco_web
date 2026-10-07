const express = require("express");
const router = express.Router();
const AviationPrice = require("../models/AviationPrice");
const c = require("../controllers/aviationPriceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/active").get(async (req, res, next) => {
  try {
    const prices = await AviationPrice.find({ status: "active" }).sort(
      "-effectiveDate"
    );
    res.status(200).json({ success: true, data: prices });
  } catch (error) {
    next(error);
  }
});

router.use(protect);

router.route("/").get(c.getAll);

router.route("/").post(authorize("super_admin", "admin"), c.create);

router
  .route("/:id")
  .get(c.getById)
  .put(authorize("super_admin", "admin"), c.update)
  .delete(authorize("super_admin", "admin"), c.remove);

module.exports = router;
