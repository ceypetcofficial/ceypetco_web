const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const ManagementTeamMember = require("./models/ManagementTeamMember");
const ManagementContact = require("./models/ManagementContact");

const team = [
  [
    "D J A S De S Rajakaruna",
    "Chairman",
    "/images/chairman.jpeg",
    "Leads the governing board of Ceylon Petroleum Corporation, guiding corporate strategy, governance and long-term direction of the national petroleum entity.",
  ],
  [
    "Dr. Mayura Neththikumarage",
    "Managing Director",
    "/images/managing-director.png",
    "Oversees day-to-day operations and business management of the Corporation, driving operational efficiency, service delivery and strategic execution across all divisions.",
  ],
  [
    "Mahendra Garusinghe",
    "Director",
    "/images/director-1.jpeg",
    "Serves on the board of directors, providing governance oversight and contributing to key decisions on refined products, commercial operations and corporate policy.",
  ],
  [
    "R M S P S Bandara",
    "Director",
    "/images/director-2.jpeg",
    "Serves on the board of directors, supporting governance, financial stewardship and the strategic stewardship of the Corporation's operations and people.",
  ],
];

const contacts = [
  {
    group: "Corporate Management",
    people: [
      ["K G H Kodagoda", "Refinery Manager", "+94 11 2400666 / +94 11 5668490", "refinery.manager@ceypetco.gov.lk"],
      ["K W Samantha Pushpalal", "Deputy General Manager · HR & Admin", "+94 11 2106758", "dgm.hr@ceypetco.gov.lk"],
      ["W K S Gunawardhana", "Acting Deputy General Manager · Marketing", "+94 11 2106753", "dgm.mkt@ceypetco.gov.lk"],
      ["K K A Jayawikrama", "Deputy General Manager · Commercial & Supply Chain", "+94 11 2106761", "dgm.commercial@ceypetco.gov.lk"],
      ["N B M P Jeewasiri", "Deputy General Manager · Technical Services & Corporate Affairs", "+94 11 7296290", "dgm.ts@ceypetco.gov.lk"],
      ["B T T Perera", "Deputy General Manager · Finance", "+94 11 7296146", "dgm.fin@ceypetco.gov.lk"],
    ],
  },
  {
    group: "Senior Management · Refinery",
    people: [
      ["Deputy Refinery Manager", "Manufacturing & Operations", "+94 11 2400666 / +94 11 5668490", "refinery.manager@ceypetco.gov.lk"],
      ["Deputy Refinery Manager", "Maintenance & Projects", "+94 11 2400684 / +94 11 5668911", "drm.mp@ceypetco.gov.lk"],
      ["A K Seneviratne", "Acting Deputy Refinery Manager · Technical Services", "", "drm.ts@ceypetco.gov.lk"],
      ["K V J Chandrawanka", "Acting Deputy Refinery Manager · Electrical & Instrument", "+94 11 2401527", "mgr.electrical@ceypetco.gov.lk"],
    ],
  },
  {
    group: "Head Office",
    people: [
      ["R A K C Ariyaratne", "Chief Legal Officer", "+94 11 2106773", "clo@ceypetco.gov.lk"],
      ["M C D Perera", "Senior Manager · Finance", "+94 11 2400435", "smgr.fin@ceypetco.gov.lk"],
      ["Y A D S Priyankara", "Chief Internal Auditor", "+94 11 7296223", "cia@ceypetco.gov.lk"],
      ["G P Upananda", "Manager · Human Resource", "+94 11 7296278", "mgr.hr@ceypetco.gov.lk"],
      ["G P K Wijekoon", "Manager · Engineering & Premises", "+94 11 7296132", "mgr.eng@ceypetco.gov.lk"],
      ["W K S Gunawardhana", "Manager · Research & Development", "+94 11 7296287", "dgm.mkt@ceypetco.gov.lk"],
      ["W M T Wijesinghe", "Acting Manager · Commercial", "+94 11 7296125", "dgm.commercial@ceypetco.gov.lk"],
      ["A G D Bandara", "Manager · Shipping", "+94 11 7296300", "mgr.shipping@ceypetco.gov.lk"],
      ["Operations Management", "Stocks & Terminal Operations", "+94 11 7296290", "dgm.ts@ceypetco.gov.lk"],
      ["K Hewagamage", "Manager · Procurements & Stores", "+94 11 7296331", "mgr.procurement@ceypetco.gov.lk"],
      ["W A A C Weerasinghe", "Manager · Human Resource Development", "", "mgr.hrd@ceypetco.gov.lk"],
      ["V Shanmuganathan", "Acting Manager · Marketing", "+94 11 7296248", "mgr.mkt@ceypetco.gov.lk"],
      ["R M Ariyamanjula", "Acting Manager · Corporate Planning & Business Development", "+94 11 7296292", "mgr.cpbd@ceypetco.gov.lk"],
      ["I C Galagodage", "Acting Manager · Lubricant & Special Products", "+94 11 7296346", "dmgr.lub@ceypetco.gov.lk"],
      ["D L Perera", "Acting Manager · Information Technology", "+94 11 7296218", "lakshitha@ceypetco.gov.lk"],
      ["U H A S Jayaweera", "Acting Deputy Manager · Investigation", "+94 11 7296230", ""],
      ["B M W A R Bandara", "Acting Assistant Manager · Security", "+94 11 7296320", ""],
      ["Anurudda B. Koralagedara", "Acting Assistant Manager · Secretariat", "+94 11 7296310", "anuruddakg@ceypetco.gov.lk"],
    ],
  },
  {
    group: "Operating Divisions",
    people: [
      ["A I Wanasekara", "Manager · Aviation Operations, Katunayake", "+94 11 2253039", "mgr.avi@ceypetco.gov.lk"],
      ["A M K B Adhikari", "Acting Deputy Manager · Sapugaskanda Terminal", "+94 11 2401112 / +94 11 5750880", ""],
      ["B S S Perera", "Manager · Agro Chemicals", "+94 11 2694483 / +94 11 5666815", "mgr.agro@ceypetco.gov.lk"],
    ],
  },
];

const seed = async () => {
  await connectDB();

  for (const [i, [name, role, photo, description]] of team.entries()) {
    const exists = await ManagementTeamMember.findOne({ name });
    if (exists) {
      const update = {};
      if (description && !exists.description) update.description = description;
      if (Object.keys(update).length > 0) {
        await ManagementTeamMember.updateOne({ _id: exists._id }, update);
        console.log(`Team member updated: ${name}`);
      } else {
        console.log(`Team member already exists: ${name}`);
      }
      continue;
    }
    await ManagementTeamMember.create({
      name,
      role,
      photo,
      description,
      order: i,
      status: "published",
    });
    console.log(`Team member created: ${name}`);
  }

  let order = 0;
  for (const group of contacts) {
    for (const [name, role, phone, email] of group.people) {
      const exists = await ManagementContact.findOne({
        name,
        group: group.group,
      });
      if (exists) {
        console.log(`Contact already exists: ${group.group} · ${name}`);
        order += 1;
        continue;
      }
      await ManagementContact.create({
        group: group.group,
        name,
        role,
        phone,
        email,
        order,
        status: "published",
      });
      order += 1;
      console.log(`Contact created: ${group.group} · ${name}`);
    }
  }

  await closeDB();
  console.log("Management team + directory seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
