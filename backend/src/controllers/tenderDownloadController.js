const TenderDownload = require("../models/sqlModel")("TenderDownload");
const Tender = require("../models/sqlModel")("Tender");

exports.create = async (req, res, next) => {
  try {
    const { tenderId, email, mobileNumber } = req.body;

    if (!tenderId || !email || !mobileNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify tender exists
    const tender = await Tender.findById(tenderId);
    if (!tender) {
      return res.status(404).json({ success: false, message: "Tender not found" });
    }

    const downloadRecord = await TenderDownload.create({
      tenderId,
      tenderTitle: tender.title,
      tenderReference: tender.reference || "N/A",
      email,
      mobileNumber,
      downloadedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: downloadRecord
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const records = await TenderDownload.find().sort("-createdAt");
    res.status(200).json({
      success: true,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const record = await TenderDownload.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
