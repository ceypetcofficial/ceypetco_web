const express = require("express");
const router = express.Router();
const { uploadImage, uploadDocument, uploadAnnualReport, listImages, deleteImage, renameImage, servePrivateDocument, servePublicDocument } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const admins = authorize("super_admin", "admin", "editor");

router
  .route("/image")
  .post(protect, admins, uploadImage);

router
  .route("/document")
  .post(protect, admins, uploadDocument);

router
  .route("/annual-report")
  .post(protect, admins, uploadAnnualReport);

router.route("/images").get(protect, admins, listImages);
router.get("/private/:filename", protect, admins, servePrivateDocument);
router.get("/public/:filename", servePublicDocument);

router
  .route("/images/:filename")
  .patch(protect, admins, renameImage)
  .delete(protect, admins, deleteImage);

module.exports = router;
