const express = require("express");
const router = express.Router();
const { uploadImage, uploadDocument, uploadAnnualReport, listImages, deleteImage, renameImage, servePrivateDocument, servePublicDocument } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const contentUploaders = authorize("super_admin", "admin", "editor", "tender_user", "hr_user", "media_user");
const mediaManagers = authorize("super_admin", "admin", "editor", "media_user");

router
  .route("/image")
  .post(protect, contentUploaders, uploadImage);

router
  .route("/document")
  .post(protect, contentUploaders, uploadDocument);

router
  .route("/annual-report")
  .post(protect, mediaManagers, uploadAnnualReport);

router.route("/images").get(protect, mediaManagers, listImages);
router.get("/private/:filename", protect, contentUploaders, servePrivateDocument);
router.get("/public/:filename", servePublicDocument);

router
  .route("/images/:filename")
  .patch(protect, mediaManagers, renameImage)
  .delete(protect, mediaManagers, deleteImage);

module.exports = router;
