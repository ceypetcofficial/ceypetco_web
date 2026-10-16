const Brochure = require("../models/Brochure");
const createCrudController = require("./crudController");

const crud = createCrudController(Brochure, {
  searchFields: ["title", "description", "year"],
  sortBy: { order: 1, createdAt: -1 },
  assetFields: [{ field: "url" }],
});

const getPublished = async (_req, res, next) => {
  try {
    const items = await Brochure.find({ status: "published" }).sort({
      order: 1,
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      data: items,
      pagination: { total: items.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getPublished };
