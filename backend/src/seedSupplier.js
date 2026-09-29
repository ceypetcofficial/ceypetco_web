const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const SupplierResource = require("./models/SupplierResource");
const SupplierSection = require("./models/SupplierSection");

const resources = [
  [
    "General Guidelines",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/07/General-Guidelines-for-applying-for-oil-supplier-registration-at-CPC.pdf",
  ],
  [
    "Application Forms",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/07/Annex-1-Application-Form1.pdf",
  ],
  [
    "Terms & Conditions",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/07/Annex-2.-CPC-Standard-Terms-and-Conditions1.pdf",
  ],
  [
    "Approval Process",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/07/Approval-Process-Registration-Fee-Structure1.pdf",
  ],
  [
    "Bank Details",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/07/Bank-Details1.pdf",
  ],
  [
    "Cancellation of EOI",
    "https://ceypetco.gov.lk/wp-content/uploads/2026/08/cancellation-EOI.jpeg",
  ],
  [
    "Independent Inspector Guidelines",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/12/CPC-Requirements-for-Registering-Independent-Inspectors.pdf",
  ],
  [
    "Foreign Supplier Registration",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/11/registrationofforeignsuppliers.pdf",
  ],
  [
    "Local Supplier Register · 2026",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/11/local-supplier-reg-2026.docx",
  ],
  [
    "Extension Notice · English",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/11/Registration-2026Ad-English-EXTENSION.pdf",
  ],
  [
    "Extension Notice · Sinhala",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/11/Registration-2026AdSinhala-EXTENSION.pdf",
  ],
  [
    "Local Registration · English",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Registration-2026Ad-English.pdf",
  ],
  [
    "Local Registration · Sinhala",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Registration-2026AdSinhala.pdf",
  ],
  [
    "Materials Application",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Application-for-the-Material-A-2026.pdf",
  ],
  [
    "Services Application",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Application-for-the-Services-B-2026.pdf",
  ],
  [
    "Applicant Instruction Guide",
    "https://ceypetco.gov.lk/wp-content/uploads/2025/10/Instruction-Guide-for-Applicant1.pdf",
  ],
];

const seed = async () => {
  await connectDB();

  const existing = await SupplierSection.findOne();
  if (!existing) {
    await SupplierSection.create({
      eyebrow: "SUPPLIER ACCESS",
      title: "Registration resources",
      description:
        "Guidance and application support for oil suppliers, foreign suppliers, independent inspectors and local contractors.",
    });
    console.log("SupplierSection created (default heading)");
  } else {
    console.log("SupplierSection already exists, skipping");
  }

  for (let i = 0; i < resources.length; i++) {
    const [title, url] = resources[i];
    const exists = await SupplierResource.findOne({ title, url });
    if (exists) {
      console.log(`SupplierResource already exists: ${title}`);
      continue;
    }
    await SupplierResource.create({
      title,
      url,
      order: i,
      status: "published",
    });
    console.log(`SupplierResource created: ${title}`);
  }

  await closeDB();
  console.log("Supplier seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
