const express = require("express");
const router = express.Router();
const FuelPrice = require("../models/FuelPrice");
const c = require("../controllers/fuelPriceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.route("/active").get(async (req, res, next) => {
  try {
    const prices = await FuelPrice.find({ status: "active" }).sort(
      "-effectiveDate"
    );
    res.status(200).json({ success: true, data: prices });
  } catch (error) {
    next(error);
  }
});

router.use(protect);

router.route("/").get(authorize("super_admin", "admin", "marketing_user"), c.getAll);

router.route("/").post(authorize("super_admin", "admin", "marketing_user"), c.create);

router
  .route("/:id")
  .get(authorize("super_admin", "admin", "marketing_user"), c.getById)
  .put(authorize("super_admin", "admin", "marketing_user"), c.update)
  .delete(authorize("super_admin", "admin", "marketing_user"), c.remove);

module.exports = router;
