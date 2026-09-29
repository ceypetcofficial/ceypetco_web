const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required");
  }
  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters");
  }

  await connectDB();

  const data = [
    {
      name: "Super Administrator",
      email,
      password,
      role: "super_admin",
      status: "active",
    },
  ];

  for (const u of data) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Admin already exists: ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`Admin created: ${u.email}`);
  }

  await closeDB();
  console.log("Seeding complete.");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
