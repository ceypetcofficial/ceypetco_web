const MobileApp = require("../models/MobileApp");
const createCrudController = require("./crudController");

const crud = createCrudController(MobileApp, {
  searchFields: ["title", "description", "platform"],
  sortBy: "order",
  assetFields: [{ field: "appIcon" }],
});

const getPublished = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    const platform = req.query.platform;

    const query = { status: "published" };
    if (platform) query.platform = platform;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      MobileApp.find(query).sort("-featured").sort("order").skip(skip).limit(limit),
      MobileApp.countDocuments(query),
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

module.exports = { ...crud, getPublished };
