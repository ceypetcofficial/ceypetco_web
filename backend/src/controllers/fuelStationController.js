const FuelStation = require("../models/FuelStation");
const createCrudController = require("./crudController");

module.exports = createCrudController(FuelStation, {
  searchFields: ["dealerNo", "dealerName", "address", "district"],
  sortBy: { district: 1, dealerName: 1 },
});
