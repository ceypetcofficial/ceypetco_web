const Career = require("../models/Career");
const createCrudController = require("./crudController");

const crud = createCrudController(Career, {
  searchFields: ["title", "reference", "department", "location"],
  sortBy: { order: 1, publishedDate: -1 },
  assetFields: [{ field: "document" }, { field: "documents", urlKey: "url" }],
});

const getActive = async (req, res, next) => {
  try {
    // Status is the explicit publishing control. Keep an open vacancy visible
    // until an administrator closes it, even if its displayed deadline passes.
    const items = await Career.find({ status: "open" }).sort({ order: 1, publishedDate: -1 });
    res.status(200).json({
      success: true,
      data: items,
      pagination: { total: items.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getActive };
