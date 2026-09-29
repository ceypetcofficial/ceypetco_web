const path = require("path");
const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const FuelPrice = require("./models/FuelPrice");
const FuelStation = require("./models/FuelStation");
const RegionalOffice = require("./models/RegionalOffice");

const stationSource = require(path.resolve(
  __dirname,
  "../../frontend/src/data/fuelStations.json"
));

const regionalOffices = [
  ["West", "Dematagoda", "Mr. M C Mendis", "Acting Regional Manager", "+94 11 729 6457", "ro.west@ceypetco.gov.lk"],
  ["Sabaragamuwa", "Kegalle", "K A N D Chandrasena", "Acting Regional Manager", "+94 35 313 5732", "ro.sabaragamuwa@ceypetco.gov.lk"],
  ["South", "Galle", "Mr. D C Edirisinghe", "Regional Manager", "+94 91 223 4523", "ro.south@ceypetco.gov.lk"],
  ["Uva", "Badulla", "", "Acting Regional Manager", "+94 55 223 1979", "ro.uwa@ceypetco.gov.lk"],
  ["North Central", "Anuradhapura", "", "Regional Manager", "+94 25 222 2374", "ro.nc@ceypetco.gov.lk"],
  ["North", "Jaffna", "Mr. S Sivatharan", "Regional Manager", "+94 21 222 2033", "ro.north@ceypetco.gov.lk"],
  ["Central", "Kandy", "Mr. B R M S B Ratnayake", "Acting Regional Manager", "+94 81 238 8674", "ro.central@ceypetco.gov.lk"],
  ["North West", "Kurunegala", "Mr. A G J W Bandara", "Regional Manager", "+94 37 222 2517", "ro.nw@ceypetco.gov.lk"],
  ["East", "Batticaloa", "", "Regional Manager", "+94 65 222 4429", "ro.east@ceypetco.gov.lk"],
];

const seedOperations = async () => {
  await connectDB();

  const stations = Object.entries(stationSource).flatMap(([district, items]) =>
    items.map((item) => ({ ...item, district, status: "active" }))
  );

  if (stations.length) {
    await FuelStation.bulkWrite(
      stations.map((station) => ({
        updateOne: {
          filter: { dealerNo: station.dealerNo },
          update: { $setOnInsert: station },
          upsert: true,
        },
      }))
    );
  }

  await RegionalOffice.bulkWrite(
    regionalOffices.map(([region, district, manager, openingHours, phone, email]) => ({
      updateOne: {
        filter: { region },
        update: {
          $setOnInsert: {
            name: `${region} Regional Office`,
            region,
            district,
            manager,
            openingHours,
            phone,
            email,
            status: "active",
          },
        },
        upsert: true,
      },
    }))
  );

  const effectiveDate = new Date("2026-06-29T00:00:00.000Z");
  const prices = [
    { product: "Lanka Petrol 92 Octane", price: 414, type: "fuel" },
    { product: "Lanka Auto Diesel", price: 382, type: "fuel" },
  ];
  await FuelPrice.bulkWrite(
    prices.map((price) => ({
      updateOne: {
        filter: { product: price.product, effectiveDate },
        update: { $setOnInsert: { ...price, unit: "LKR / L", effectiveDate, status: "active" } },
        upsert: true,
      },
    }))
  );

  console.log(`Operations ready: ${stations.length} stations, ${regionalOffices.length} offices, ${prices.length} prices.`);
  await closeDB();
};

seedOperations().catch(async (error) => {
  console.error("Operations seed failed:", error);
  await closeDB().catch(() => {});
  process.exit(1);
});
