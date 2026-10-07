const router = require("express").Router();
const controller = require("../controllers/historicalPriceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/active", controller.getActive);
router.use(protect);
router.get("/", controller.getAll);
router.post("/", authorize("super_admin", "admin"), controller.create);
router.put("/:id", authorize("super_admin", "admin"), controller.update);
router.delete("/:id", authorize("super_admin", "admin"), controller.remove);

module.exports = router;
