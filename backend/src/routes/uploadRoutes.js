const express = require("express");
const router = express.Router();
const { uploadImage, uploadDocument, listImages, deleteImage, renameImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const admins = authorize("super_admin", "admin", "editor");

router
  .route("/image")
  .post(protect, admins, uploadImage);

router
  .route("/document")
  .post(protect, admins, uploadDocument);

router.route("/images").get(protect, admins, listImages);

router
  .route("/images/:filename")
  .patch(protect, admins, renameImage)
  .delete(protect, admins, deleteImage);

module.exports = router;
