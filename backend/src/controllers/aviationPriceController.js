const createCrudController = require("./crudController");
const AviationPrice = require("../models/AviationPrice");

module.exports = createCrudController(AviationPrice, {
  searchFields: ["customer", "location"],
  sortBy: "-effectiveDate",
});
