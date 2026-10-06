const ContactMessage = require("../models/ContactMessage");
const createCrudController = require("./crudController");

const crud = createCrudController(ContactMessage, {
  searchFields: ["name", "email", "subject"],
  sortBy: "-createdAt",
});

const clean = (value, max) => String(value || "").trim().slice(0, max);
const create = async (req, res, next) => {
  try {
    const payload = {
      name: clean(req.body.name, 150),
      email: clean(req.body.email, 254).toLowerCase(),
      phone: clean(req.body.phone, 40),
      subject: clean(req.body.subject, 200),
      message: clean(req.body.message, 5000),
    };
    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      return res.status(400).json({ success: false, message: "Name, email, subject and message are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    const item = await ContactMessage.create(payload);
    return res.status(201).json({ success: true, data: item, message: "Your message has been sent successfully" });
  } catch (error) { return next(error); }
};

module.exports = { ...crud, create };
