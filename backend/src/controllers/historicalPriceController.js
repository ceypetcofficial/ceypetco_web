const HistoricalPrice = require("../models/HistoricalPrice");
const parseHistoricalDate = require("../utils/historicalPriceDate");

const sort = { sortKey: -1, sourceIndex: 1, createdAt: -1 };

function payloadFrom(body) {
  const kind = body.kind;
  const dateLabel = String(body.dateLabel || "").trim();
  const parsed = parseHistoricalDate(kind, dateLabel);
  const expectedValues = kind === "fuel" ? 9 : kind === "bitumen" ? 3 : 0;
  if (!parsed || !Array.isArray(body.values) || body.values.length !== expectedValues) return null;

  const values = body.values.map((value) => String(value ?? "").trim().slice(0, 80));
  if (values.every((value) => !value)) return null;
  return {
    kind,
    dateLabel,
    ...parsed,
    values,
    note: String(body.note || "").trim().slice(0, 200),
    status: body.status === "inactive" ? "inactive" : "active",
  };
}

const invalid = (res) => res.status(400).json({
  success: false,
  message: "Enter a valid date and the required price fields for this category",
});

exports.getActive = async (_req, res, next) => {
  try {
    const data = await HistoricalPrice.find({ status: "active" }).sort({ kind: 1, ...sort }).lean();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const query = {};
    if (["fuel", "bitumen"].includes(req.query.kind)) query.kind = req.query.kind;
    if (["active", "inactive"].includes(req.query.status)) query.status = req.query.status;
    if (req.query.search) {
      const escaped = String(req.query.search).slice(0, 80);
      query.dateLabel = { $regex: escaped, $options: "i" };
    }
    const [data, total] = await Promise.all([
      HistoricalPrice.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      HistoricalPrice.countDocuments(query),
    ]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = payloadFrom(req.body);
    if (!payload) return invalid(res);
    const data = await HistoricalPrice.create(payload);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) return invalid(res);
    const payload = payloadFrom(req.body);
    if (!payload) return invalid(res);
    const data = await HistoricalPrice.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) return invalid(res);
    const data = await HistoricalPrice.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, message: "Record deleted" });
  } catch (error) { next(error); }
};
