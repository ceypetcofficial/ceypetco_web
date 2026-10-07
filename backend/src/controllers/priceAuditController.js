const PriceAudit = require("../models/PriceAudit");

const getAll = async (req, res, next) => {
  try {
    const rawPage = Number.parseInt(req.query.page, 10);
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 25;
    const filter = req.query.entity ? { entity: req.query.entity } : {};
    const [data, total] = await Promise.all([PriceAudit.find(filter).sort("-createdAt").skip((page - 1) * limit).limit(limit), PriceAudit.countDocuments(filter)]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

module.exports = { getAll };
