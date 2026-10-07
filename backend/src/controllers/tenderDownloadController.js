const TenderDownload = require("../models/sqlModel")("TenderDownload");
const Tender = require("../models/sqlModel")("Tender");

exports.create = async (req, res, next) => {
  try {
    const tenderId = typeof req.body?.tenderId === "string" ? req.body.tenderId.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const mobileNumber = typeof req.body?.mobileNumber === "string" ? req.body.mobileNumber.trim() : "";

    if (!tenderId || !email || !mobileNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenderId)) {
      return res.status(400).json({ success: false, message: "Invalid tender ID" });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }
    if (mobileNumber.length > 30 || !/^\+?[0-9][0-9 ()-]{6,28}[0-9]$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Please provide a valid mobile number" });
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
