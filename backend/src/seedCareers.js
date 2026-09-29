const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Career = require("./models/Career");

const seedCareers = async () => {
  await connectDB();

  const data = [
    {
      title: "Assistant Refinery Technician",
      reference: "REF-2026-014",
      department: "Refinery Division",
      location: "Sapugaskanda",
      type: "Full-time",
      status: "open",
      salary: "LKR 95,000",
      description:
        "Support refinery operations and maintenance within the mechanical workshop at Sapugaskanda.",
      responsibilities:
        "Assist in routine maintenance and repair of refinery equipment; support welding and fabrication tasks; adhere to strict safety protocols.",
      requirements:
        "NVQ Level 4/5 in Mechanical Engineering or equivalent; prior experience in an industrial environment preferred.",
      publishedDate: new Date("2026-08-01"),
      applicationDeadline: new Date("2026-09-30"),
    },
    {
      title: "Assistant Firefighter",
      reference: "SAF-2026-007",
      department: "Safety & Emergency Response",
      location: "Sapugaskanda",
      type: "Full-time",
      status: "open",
      salary: "LKR 88,000",
      description:
        "Join the refinery fire and emergency response team to protect personnel and assets.",
      responsibilities:
        "Respond to fire and emergency incidents; conduct safety checks and drills; maintain firefighting equipment.",
      requirements:
        "Good physical fitness; firefighting or emergency response training is an advantage.",
      publishedDate: new Date("2026-08-01"),
      applicationDeadline: new Date("2026-09-15"),
    },
    {
      title: "Distribution & Logistics Officer",
      reference: "MKT-2026-021",
      department: "Marketing & Sales",
      location: "Colombo",
      type: "Full-time",
      status: "draft",
      salary: "LKR 110,000",
      description:
        "Coordinate fuel distribution and depot logistics across the islandwide network.",
      responsibilities:
        "Plan and monitor fuel dispatches; coordinate with depots and transporters; ensure timely delivery to retailers.",
      requirements:
        "Degree in Logistics, Supply Chain Management or related field; strong coordination skills.",
      publishedDate: new Date("2026-08-10"),
      applicationDeadline: new Date("2026-10-01"),
    },
  ];

  for (const item of data) {
    const existing = await Career.findOne({ reference: item.reference });
    if (existing) {
      console.log(`Career already exists: ${item.title}`);
      continue;
    }
    await Career.create(item);
    console.log(`Career created: ${item.title}`);
  }

  await closeDB();
  console.log("Career seeding complete.");
  process.exit(0);
};

seedCareers().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
