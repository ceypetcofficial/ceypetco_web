const Tender = require("../models/Tender");
const createCrudController = require("./crudController");

const crud = createCrudController(Tender, {
  searchFields: ["title", "reference", "division", "category"],
  sortBy: { priority: -1, createdAt: -1 },
  assetFields: [{ field: "documents", urlKey: "url" }],
});

const getActive = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const query = { status: { $in: ["open", "awarded"] } };
    const [items, total] = await Promise.all([
      Tender.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Tender.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getActive };
