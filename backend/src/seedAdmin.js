const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  await connectDB();

  const data = [
    {
      name: "Super Administrator",
      email: "admin@ceypetco.gov.lk",
      password: "Admin@123456",
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
