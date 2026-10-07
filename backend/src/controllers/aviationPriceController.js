const createCrudController = require("./crudController");
const AviationPrice = require("../models/AviationPrice");
const PriceAudit = require("../models/PriceAudit");

const validate = (payload, { existing }) => {
  const value = payload.price ?? existing?.price;
  if (value === undefined || value === null || value === "") return "Price is required";
  if (typeof value === "boolean" || !Number.isFinite(Number(value))) return "Price must be a valid number";
  if (Number(value) < 0 || Number(value) > 100000) return "Price must be between 0 and 100,000 US$/USG";
  payload.price = Number(value);
  return null;
};
const onChange = ({ action, item, previous, req }) => PriceAudit.create({ entity: "AviationPrice", entityId: item._id, action, previousValue: previous?.price ?? null, newValue: item.price ?? null, userId: req.user._id, userName: req.user.name, userEmail: req.user.email, changedAt: new Date() });

module.exports = createCrudController(AviationPrice, {
  searchFields: ["customer", "location"],
  sortBy: "-effectiveDate",
  validate,
  onChange,
});
