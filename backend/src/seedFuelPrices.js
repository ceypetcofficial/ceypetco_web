const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const FuelPrice = require("./models/FuelPrice");

const products = [
  { product: "Lanka Petrol 92 Octane", price: 414, category: "White Oil", type: "fuel", date: "2026-06-29" },
  { product: "Lanka Auto Diesel", price: 382, category: "White Oil", type: "fuel", date: "2026-06-29" },
  { product: "Lanka Kerosene", price: 285, category: "White Oil", type: "fuel", date: "2026-05-30" },
  { product: "Lanka Petrol 95 Octane Euro 4", price: 495, category: "White Oil", type: "fuel", date: "2026-05-30" },
  { product: "Lanka Super Diesel 4 Star Euro 4", price: 478, category: "White Oil", type: "fuel", date: "2026-05-30" },
  { product: "Lanka Industrial Kerosene", price: 434, category: "White Oil", type: "fuel", date: "2026-04-01" },
  { product: "Lanka Fuel Oil Super", price: 332, category: "Black Oil", type: "other", date: "2026-04-01" },
  { product: "Lanka Fuel Oil 1500 Sec. · High Sulphur", price: 332, category: "Black Oil", type: "other", date: "2026-04-01" },
  { product: "Lanka Fuel Oil 1500 Sec. · Low Sulphur", price: 332, category: "Black Oil", type: "other", date: "2026-04-01" },
];

const seed = async () => {
  await connectDB();

  for (const p of products) {
    const effectiveDate = new Date(`${p.date}T12:00:00`);
    await FuelPrice.updateOne(
      { product: p.product },
      {
        $set: {
          price: p.price,
          category: p.category,
          type: p.type,
          unit: "LKR",
          effectiveDate,
          status: "active",
        },
        $setOnInsert: { product: p.product },
      },
      { upsert: true }
    );
    console.log(`Upserted fuel price: ${p.product}`);
  }

  await closeDB();
  console.log("Fuel price seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
