const ActivityLog = require("../models/ActivityLog");

const list = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, Number(req.query.limit) || 25));
    const filter = {};
    if (req.query.result && ["success", "failed"].includes(req.query.result)) filter.result = req.query.result;
    if (req.query.action) filter.action = String(req.query.action).slice(0, 50);
    if (req.query.userId) filter.userId = String(req.query.userId).slice(0, 50);
    const total = await ActivityLog.countDocuments(filter);
    const data = await ActivityLog.find(filter).sort({ occurredAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
};

module.exports = { list };
