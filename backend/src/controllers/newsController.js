const News = require("../models/News");
const createCrudController = require("./crudController");

const crud = createCrudController(News, {
  searchFields: ["title", "summary", "category", "author"],
  sortBy: "-publishedDate",
  assetFields: [{ field: "featuredImage" }, { field: "images" }],
});

const getPublished = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim();
    const query = { status: "published" };
    if (search) {
      query.$or = ["title", "summary", "category", "author"].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
    const [items, total] = await Promise.all([
      News.find(query).sort("-publishedDate").skip(skip).limit(limit),
      News.countDocuments(query),
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

const getPublishedById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const query = { status: "published" };
    const isId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (isId.test(identifier)) {
      query._id = identifier;
    } else {
      query.slug = identifier;
    }
    const item = await News.findOne(query);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "News article not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = { ...crud, getPublished, getPublishedById };
