const crypto = require("crypto");
const { getPool } = require("../config/db");

const statuses = new Set(["new", "read", "replied", "archived"]);
const literalRegex = (value) => String(value || "").slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const matches = (item, filter = {}) => Object.entries(filter).every(([key, expected]) => {
  if (key === "$or") return expected.some((part) => matches(item, part));
  if (expected && typeof expected === "object" && "$regex" in expected) {
    return new RegExp(literalRegex(expected.$regex), expected.$options === "i" ? "i" : "").test(String(item[key] || ""));
  }
  if (expected && typeof expected === "object" && "$ne" in expected) return item[key] !== expected.$ne;
  return item[key] === expected;
});

const mapRow = (row) => ({
  _id: row.Id,
  name: row.Name,
  email: row.Email,
  phone: row.Phone || "",
  subject: row.Subject,
  message: row.Message,
  status: row.Status,
  createdAt: row.CreatedAt,
  updatedAt: row.UpdatedAt,
});

class Query {
  constructor(loader, single = false) { this.loader = loader; this.single = single; this.sortField = "createdAt"; this.direction = -1; this.offset = 0; this.maximum = null; }
  sort(value) { const field = typeof value === "string" ? value : Object.keys(value || {})[0]; this.sortField = String(field || "createdAt").replace(/^-/, ""); this.direction = typeof value === "string" ? (value.startsWith("-") ? -1 : 1) : (value?.[field] || 1); return this; }
  skip(value) { this.offset = Number(value) || 0; return this; }
  limit(value) { this.maximum = Number(value); return this; }
  async exec() { let rows = await this.loader(); rows.sort((a, b) => (a[this.sortField] > b[this.sortField] ? this.direction : a[this.sortField] < b[this.sortField] ? -this.direction : 0)); rows = rows.slice(this.offset, this.maximum == null ? undefined : this.offset + this.maximum); return this.single ? rows[0] || null : rows; }
  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
}

const load = async () => {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT Id, Name, Email, Phone, Subject, Message, Status, CreatedAt, UpdatedAt FROM ContactUsMessages");
  return rows.map(mapRow);
};

class ContactMessage {
  static find(filter = {}) { return new Query(async () => (await load()).filter((item) => matches(item, filter))); }
  static findOne(filter = {}) { return new Query(async () => (await load()).filter((item) => matches(item, filter)), true); }
  static findById(id) { return this.findOne({ _id: String(id) }); }
  static async countDocuments(filter = {}) { return (await load()).filter((item) => matches(item, filter)).length; }
  static async create(values) {
    const pool = await getPool();
    const item = { _id: crypto.randomUUID(), ...values, status: "new", createdAt: new Date(), updatedAt: new Date() };
    await pool.query("INSERT INTO ContactUsMessages (Id, Name, Email, Phone, Subject, Message, Status, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [item._id, item.name, item.email, item.phone || null, item.subject, item.message, item.status, item.createdAt, item.updatedAt]);
    return item;
  }
  static async findByIdAndUpdate(id, update) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const status = update.status;
    if (!statuses.has(status)) throw Object.assign(new Error("Invalid message status"), { statusCode: 400 });
    const pool = await getPool();
    await pool.query("UPDATE ContactUsMessages SET Status=?, UpdatedAt=? WHERE Id=?", [status, new Date(), String(id)]);
    return { ...existing, status, updatedAt: new Date() };
  }
  static async findByIdAndDelete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const pool = await getPool();
    await pool.query("DELETE FROM ContactUsMessages WHERE Id=?", [String(id)]);
    return existing;
  }
}

module.exports = ContactMessage;
