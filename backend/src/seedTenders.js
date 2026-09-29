const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Tender = require("./models/Tender");

const COMMERCIAL = "COMMERCIAL DIVISION";
const REFINERY = "REFINERY DIVISION";
const PROCUREMENT = "PROCUREMENTS & STORES DIVISION";

const documents = {
  "BK/48/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/Procurement-Document-BK482026-Gasoline-92-95-UNL.pdf",
  "4626T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4626T.pdf",
  "4629T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4629T.pdf",
  "4630T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4630T.pdf",
  "4634T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4634T.pdf",
  "4631T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4631T.pdf",
  "4628T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4628T.pdf",
  "4625T": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/4625T.pdf",
  "PD/SER/12/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/PDSER122026.pdf",
  "PD/SER/13/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/07/PDSER132026.pdf",
  "4622T": "https://ceypetco.gov.lk/wp-content/uploads/2026/07/4622T.pdf",
  "4623T": "https://ceypetco.gov.lk/wp-content/uploads/2026/07/4623T.pdf",
  "4624T": "https://ceypetco.gov.lk/wp-content/uploads/2026/07/4624T.pdf",
  "B/54/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B542026.pdf",
  "B/55/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-55-2026.pdf",
  "B/56/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-56-2026.pdf",
  "B/57/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-57-2026.pdf",
  "B/53/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B532026-1.pdf",
  "B/52/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B522026.pdf",
  "B/50/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-50-2026.pdf",
  "B/51/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-51-2026.pdf",
  "B/48/2026": "https://ceypetco.gov.lk/wp-content/uploads/2026/08/B-48-2026.pdf",
  "B/37/2025": "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Instruction-Guide-for-Applicant1.pdf",
};

const parseDate = (str) => {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(str);
  if (!m) return null;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const month = months.indexOf(m[2]);
  if (month === -1) return null;
  return new Date(Date.UTC(parseInt(m[3]), month, parseInt(m[1])));
};

const tenderItems = [
  ["BK/48/2026", "Combined cargo of Gasoline 92 UNL & 95 UNL", "01 September 2026", COMMERCIAL],
  ["4626T", "Carbon Steel Plates", "30 September 2026", REFINERY],
  ["4629T", "Walkie-Talkie", "23 September 2026", REFINERY],
  ["4630T", "Spares for Tank Sealing System", "30 September 2026", REFINERY],
  ["4634T", "Seamless Line Pipes", "23 September 2026", REFINERY],
  ["4631T", "Centrifugal Pump", "16 September 2026", REFINERY],
  ["4628T", "Vertical Boring Machine", "16 September 2026", REFINERY],
  ["4625T", "Low Range Oxygen Analyzer", "16 September 2026", REFINERY],
  ["PD/SER/12/2026", "Security services for refinery housing schemes", "02 September 2026", REFINERY],
  ["PD/SER/13/2026", "රාත්‍රී රාජකාරිවල නියැලෙන සේවකයින් සඳහා කෙටි ආහාර සැපයීම", "21 August 2026", REFINERY],
  ["4622T", "Cold Filter Plugging Point Analyzer", "02 September 2026", REFINERY],
  ["4623T", "Automatic Particle Counter", "02 September 2026", REFINERY],
  ["4624T", "Oil In Water Analyzer", "02 September 2026", REFINERY],
  ["B/54/2026", "Cleaning services for Aviation Refuelling Terminal, Mattala", "09 September 2026", PROCUREMENT],
  ["B/55/2026", "Painting office and security buildings at MRIA Mattala", "14 September 2026", PROCUREMENT],
  ["B/56/2026", "Split air conditioners for CPC locations", "14 September 2026", PROCUREMENT],
  ["B/57/2026", "Supply of 25,000 eco-friendly PP woven bags", "14 September 2026", PROCUREMENT],
  ["B/53/2026", "Inspection of subsea pipeline at Colombo Port", "30 September 2026", PROCUREMENT],
  ["B/52/2026", "Modification of Lanka filling stations", "11 September 2026", PROCUREMENT],
  ["B/50/2026", "Facelifting Lanka filling stations · Sabaragamuwa", "21 August 2026", PROCUREMENT],
  ["B/51/2026", "Facelifting Lanka filling stations · Eastern Province", "21 August 2026", PROCUREMENT],
  ["B/48/2026", "Annual maintenance of CPC land at Muthurajawela", "21 August 2026", PROCUREMENT],
  ["B/37/2025", "Registration of local suppliers and contractors for 2026", null, PROCUREMENT],
];

const seedTenders = async () => {
  await connectDB();

  for (const [reference, title, closing, division] of tenderItems) {
    const existing = await Tender.findOne({ reference });
    if (existing) {
      console.log(`Tender already exists: ${reference}`);
      continue;
    }
    const closingDate = parseDate(closing);
    await Tender.create({
      title,
      reference,
      summary: title,
      category: "procurement",
      division,
      documents: documents[reference]
        ? [{ name: `${reference} document`, url: documents[reference] }]
        : [],
      publishedDate: new Date(),
      closingDate,
      status: "open",
    });
    console.log(`Tender created: ${reference} - ${title}`);
  }

  await closeDB();
  console.log("Tender seeding complete.");
  process.exit(0);
};

seedTenders().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
