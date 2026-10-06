const Division = require("../models/Division");
const createCrudController = require("./crudController");

const crud = createCrudController(Division, {
  searchFields: ["title", "subtitle", "heading", "slug"],
  sortBy: "order",
  assetFields: [{ field: "image" }, { field: "gallery" }],
});

const getPublished = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Division.find({ status: "published" }).sort("order").skip(skip).limit(limit),
      Division.countDocuments({ status: "published" }),
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

const getBySlug = async (req, res, next) => {
  try {
    const item = await Division.findOne({ slug: req.params.slug, status: 'published' });
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Division page not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getPublished, getBySlug };