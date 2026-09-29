const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const Division = require("./models/Division");

const CLOUD =
  "/images/";

const refImage = (file) => CLOUD + file;

const seedDivisions = async () => {
  await connectDB();

  const data = [
    {
      slug: "refinery",
      title: "Refinery",
      subtitle: "Operations and capabilities",
      order: 1,
      kicker: "REFINERY OPERATIONS & CAPABILITIES",
      heading:
        "We refine with precision and expertise, delivering quality petroleum products that fuel the nation's growth",
      copy: [
        "Our refinery transforms crude oil into high-quality fuels and products that keep Sri Lanka moving",
        "We combine proven technology with strict safety and quality standards to deliver reliable energy every day",
      ],
      image: refImage("refinery-detail-2.jpg"),
      stats: [
        { value: "1969", label: "Commissioned" },
        { value: "1,100+", label: "Direct jobs" },
        { value: "30–35%", label: "CPC sales volume" },
      ],
      features: [
        "Operated by a 100% Sri Lankan workforce",
        "Provides direct employment for more than 1,100 citizens",
        "Contributes 30–35% of CPC's total sales volume",
        "Reduces foreign-currency outflows through domestic refining",
        "More than five decades of continuous operating experience",
        "Refinery training is recognised by overseas organisations",
      ],
      detailTitle: "Installed production capacity",
      detailRows: [
        { name: "Crude distiller", value: "5,200", unit: "MT/day" },
        { name: "Naphtha Unifiner", value: "940", unit: "MT/day" },
        { name: "Platformer", value: "285", unit: "MT/day" },
        { name: "Gas oil Unifiner", value: "450", unit: "MT/day" },
        { name: "Visbreaker", value: "2,000", unit: "MT/day" },
        { name: "Merox unit", value: "70", unit: "MT/day" },
        { name: "Vacuum Unit", value: "950", unit: "MT/day" },
        { name: "Bitumen Blowing Unit", value: "350", unit: "MT/day" },
      ],
      paragraphs: [
        "The Ceylon Petroleum Corporation was established under Act No. 28 of 1961 and entered the import, distribution and marketing of petroleum products throughout the island. The Sapugaskanda Oil Refinery was commissioned in August 1969 to process 38,000 barrels per stream day—approximately 5,200 metric tonnes per day—of Iranian Light crude oil",
        "Although the crude distiller's rated capacity was 5,200 MT/day, the unit was capable of processing 5,800 MT/day. Crudes with characteristics similar to Iranian Light, including Upper Zakum and Arabian Light, could be processed while meeting the required specifications",
        "LPG production commenced in 1971, with the Naphtha Merox unit modified to process LPG. Special Boiling Point Solvent production also began using existing facilities. The Crude Distiller was subsequently debottlenecked, increasing refining capacity to 50,000 barrels per stream day—approximately 6,900 MT/day",
        "A new Kerosene Merox unit was commissioned in 1981 to process Jet A-1. The crude distiller was later revamped to process Far Eastern crudes such as Miri Light, while Naphtha Unifiner capacity increased to 1,100 MT/day in 1992. The Platformer was revamped in 1999 to reach 650 MT/day, meet growing gasoline demand and support the phase-out of lead in gasoline",
        "The existing Kerosene Unifiner was converted to process diesel, and the Gas Oil Unifiner was rehabilitated in 2003 to meet a diesel sulphur specification of 0.3% by weight",
        "Small and medium-scale energy-conservation projects have improved operational efficiency. The Utilities section supplies the electricity, water, steam and instrument air required for plant operations. The refinery contains 65 tanks for crude oil, finished products and intermediate products, supported by four additional crude-oil tanks at the Orugodawatta tank farm",
      ],
      keyFacts: [
        "Operated by a 100% Sri Lankan workforce",
        "Provides direct employment for more than 1,100 citizens",
        "Contributes 30–35% of CPC's total sales volume",
        "Reduces foreign-currency outflows through domestic refining",
        "More than five decades of continuous operating experience",
        "Refinery training is recognised by overseas organisations",
      ],
      gallery: [
        refImage("refinery-card-1.jpg"),
        refImage("refinery-card-2.jpg"),
        refImage("refinery-card-3.jpg"),
      ],
      status: "published",
    },
    {
      slug: "marketing-sales",
      title: "Marketing & Sales",
      subtitle: "Distribution and fuel products",
      order: 2,
      kicker: "MARKETING & SALES",
      heading: "Serving every fuel need through an islandwide dealer network",
      copy: [
        "Following the incorporation of CPC under the Act of Parliament in 1961, marketing operations commenced on 28 April 1962. Today, Ceypetco serves Sri Lanka's fuel requirements through approximately 850 dealers",
        "Outstation spot prices incorporate the applicable transport differential",
      ],
      image: refImage("media-3.jpg"),
      stats: [
        { value: "1962", label: "Marketing operations commenced" },
        { value: "850", label: "Dealers serving Sri Lanka" },
        { value: "Islandwide", label: "Retail and commercial fuel access" },
      ],
      features: [
        "Retail and commercial fuel supply",
        "Dealer and regional-office support",
        "Product quality and pricing information",
      ],
      keyFacts: [
        "Outstation spot prices incorporate the applicable transport differential",
      ],
      standards: ["Ceypetco Lubricants", "Historical Prices", "Marketing Circulars"],
      status: "published",
    },
    {
      slug: "aviation",
      title: "Ceypetco Aviation",
      subtitle: "Airport fueling services",
      order: 3,
      kicker: "OUR AIM",
      heading: "Quality fuel. The right aircraft. The right time",
      copy: [
        "Ceypetco Aviation provides round-the-clock refuelling at Bandaranaike International Airport and Mattala Rajapaksa International Airport, together with daytime service for domestic flights, corporate and executive jets, and nominated aircraft at Colombo Airport, Ratmalana",
        "Clean, dry aviation fuel and rigorous contamination control are essential to aircraft safety, engine life and maintenance performance. Ceypetco applies international-quality handling standards throughout its into-plane operation",
      ],
      image: refImage("aviation-service.jpg"),
      stats: [
        { value: "24/7", label: "International airport refuelling" },
        { value: "1.3M L", label: "Current daily demand" },
        { value: "04", label: "Operating locations" },
        { value: "Sole", label: "Into-plane operator in Sri Lanka" },
      ],
      features: [
        "JET A-1 and AV GAS availability",
        "International quality-control standards",
        "Hydrant and refueller operations",
      ],
      detailTitle: "Operating locations",
      detailRows: [
        { name: "Katunayake", value: "2.6M litres each", unit: "Three JET A-1 tanks" },
        { name: "Mattala", value: "1.0M litres each", unit: "Three JET A-1 tanks" },
        { name: "Ratmalana", value: "280,000 litres total", unit: "Five tanks" },
        { name: "Palali", value: "JET A-1 supply", unit: "Jaffna International Airport" },
      ],
      keyFacts: [
        "To be the region's leading service-oriented, customer-focused and environmentally responsible aviation fuel supplier",
      ],
      gallery: [1, 2, 3, 4, 5, 6].map((n) => refImage(`aviation-gallery-${n}.jpg`)),
      locations: [
        {
          name: "Katunayake",
          code: "BIA · CMB / VCBI",
          service: "Hydrant and refueller · over-wing / under-wing",
          capacity: "Three JET A-1 tanks · 2.6 million litres each",
          avgas: "200-litre sealed drums",
          contacts: [
            { role: "Deputy Manager · Aviation Operations", phone: "+94 11 2253039", email: "manjular@ceypetco.gov.lk" },
            { role: "Operations Department", phone: "+94 11 5756955", email: "avi.opsbia@ceypetco.gov.lk" },
          ],
        },
        {
          name: "Mattala",
          code: "MRIA · HRI / VCRI",
          service: "Hydrant and refueller · over-wing / under-wing",
          capacity: "Three JET A-1 tanks · 1.0 million litres each",
          avgas: "200-litre sealed drums",
          contacts: [
            { role: "Assistant Manager · Aviation Operations", phone: "+94 47 2031946", email: "" },
            { role: "Operations Department", phone: "+94 47 5678343 · +94 47 2031945 · +94 47 2031947", email: "mria.ops@ceypetco.gov.lk" },
          ],
        },
        {
          name: "Ratmalana",
          code: "RML / VCCC",
          service: "Daytime refueller service · over-wing / under-wing",
          capacity: "Five JET A-1 tanks · 280,000 litres total",
          avgas: "200-litre sealed drums",
          contacts: [
            { role: "Shift Superintendent", phone: "+94 11 2637755 · +94 11 5664707", email: "cpcavirat@ceypetco.gov.lk" },
            { role: "Commercial Manager", phone: "+94 11 5455115 · +94 76 3842287", email: "mria.cm@ceypetco.gov.lk" },
            { role: "Accountant · Aviation", phone: "+94 11 5455191", email: "acc.aviation@ceypetco.gov.lk" },
          ],
        },
        {
          name: "Palali",
          code: "Jaffna International Airport · JAF / VCCJ",
          service: "JET A-1 aviation fuel supply",
          capacity: "",
          avgas: "",
          contacts: [
            { role: "Ceypetco Aviation · general enquiries", phone: "+94 11 2253039", email: "" },
          ],
        },
      ],
      status: "published",
    },
    {
      slug: "agro-chemicals",
      title: "Agro Chemicals",
      subtitle: "Crop-protection solutions",
      order: 4,
      kicker: "CEYPETCO AGROCHEMICALS",
      heading: "More than 50 years supporting Sri Lanka's farming communities",
      copy: [
        "Ceylon Petroleum Corporation established its Agrochemicals Function in 1969. As a strategic business unit within the Marketing Function, it has served the national agrochemicals market for more than five decades",
        "Ceypetco Agrochemicals is the only government-sector organisation engaged in the agrochemicals business among Sri Lanka's marketing companies, helping maintain product quality, access and reasonable market pricing",
      ],
      image: refImage("agro-products.jpg"),
      stats: [
        { value: "50+ years", label: "Market service" },
        { value: "ISO 9001", label: "Quality certified" },
        { value: "Islandwide", label: "Field support" },
      ],
      features: [
        "Quality, environment and safety systems",
        "Guidance for farmers and agrarian centres",
        "Reasonably priced crop-protection products",
      ],
      detailTitle: "Product range",
      detailRows: [
        { name: "Insecticides", value: "Profenophos · BPMC · Fipronil", unit: "" },
        { name: "Weedicides", value: "Diuron · Pretilachlor · Glyphosate", unit: "" },
        { name: "Fungicides", value: "Tebuconazole · Mancozeb · Captan", unit: "" },
        { name: "Bio-Insecticides", value: "Flipper", unit: "" },
      ],
      paragraphs: [
        "Ceypetco Agrochemicals provides solutions from land and bed preparation through harvest by controlling or eradicating pests, fungi and weeds. The range includes insecticides, fungicides and weedicides for diverse cultivation requirements",
        "Our primary goal is to strengthen a marketing strategy based on consistently high quality, reasonable prices and dependable on-time delivery. Professionally qualified field officers located around the island work directly with farming communities",
        "Since December 2018, restricted Ceypetco Glyphosate has been distributed to approved planters at reasonable prices, supporting efforts to reduce production costs in the tea and rubber plantation sectors",
        "Ceypetco imports quality agrochemicals, formulates, repacks, stores and markets them while working closely with the Registrar of Pesticides, Department of Agriculture, agrarian service centres, farmer organisations and other agricultural institutions to promote safe use",
      ],
      keyFacts: [
        "Automated production equipment supports defect-free output and strengthens the competitiveness of the Ceypetco range",
        "The organisation continues to preserve farmer confidence by providing current guidance to sellers, farmer organisations, agrarian service centres and intermediaries",
      ],
      certs: [
        { standard: "ISO 9001:2015", label: "Quality Management System" },
        { standard: "ISO 14001:2015", label: "Environmental Management System" },
        { standard: "OHSAS 18001:2007", label: "Employee Health & Safety · qualified since 2019" },
      ],
      productGroups: [
        { group: "Insecticides", products: ["Profenophos 50% EC", "B.P.M.C. 50% EC", "Fipronil 0.3% G", "Fipronil 50g/l SC", "Imidacloprid 200g/l SC"] },
        { group: "Weedicides", products: ["Diuron 80% WP", "Pretilachlor 30% EC", "Glyphosate 36% SL · Restricted"] },
        { group: "Fungicides", products: ["Tebuconazole 25% EW", "Mancozeb 80% WP", "Captan 50% WP", "Sulphur 80% WG"] },
        { group: "Bio-Insecticides", products: ["Flipper"] },
      ],
      status: "published",
    },
    {
      slug: "lubricants",
      title: "Ceypetco Lubricants",
      subtitle: "Automotive and industrial oils",
      order: 5,
      kicker: "THE BEST FROM THE BEST",
      heading:
        "Internationally aligned protection for automotive and industrial performance",
      copy: [
        "All Ceypetco lubricating oils are blended in a plant certified to ISO 9001/2000. The Ceypetco lubricant range covers products developed to meet relevant international specifications from the American Petroleum Institute (API), MTU Friedrichshafen GmbH and the European Automobile Manufacturers' Association (ACEA)",
        "Our products serve demanding automotive and industrial applications with a focus on quality, consistency and dependable protection",
      ],
      image: refImage("lubricants-hero.jpg"),
      stats: [
        { value: "ISO", label: "Certified blending" },
        { value: "20+", label: "Product families" },
        { value: "Automotive +", label: "Industrial use" },
      ],
      features: [
        "Internationally aligned specifications",
        "Automotive and industrial product ranges",
        "Nationwide Ceypetco brand support",
      ],
      detailTitle: "Product range",
      detailRows: [
        { name: "Engine Oils", value: "Enduro · Supreme XHD · Platinum", unit: "" },
        { name: "Transmission", value: "ATF Dexron III · Gear Oil GL-4/GL-5", unit: "" },
        { name: "Speciality", value: "Brake Fluid · Coolant · Grease", unit: "" },
        { name: "Industrial", value: "Hydra · Hypertrans · Circulation Oil", unit: "" },
      ],
      standards: ["API", "ACEA", "MTU", "ISO"],
      mission: {
        heading: "Deliver quality products and total solutions through professional expertise, technology and innovation",
        text: "To achieve excellence in petroleum refining, sales and marketing while meeting stakeholder expectations through a dedicated team, an efficient dealer network, high ethical standards and the highest concern for health, safety and the environment",
      },
      vision: {
        heading: "A premier, customer-driven and environmentally responsible petroleum enterprise",
        text: "To lead petroleum and related industries in the region while contributing meaningfully to the prosperity of Sri Lanka",
      },
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await Division.findOne({ slug: item.slug });
    if (existing) {
      console.log(`Division already exists: ${item.slug}`);
      continue;
    }
    await Division.create(item);
    console.log(`Division created: ${item.slug}`);
  }

  await closeDB();
  console.log("Division seeding complete.");
  process.exit(0);
};

seedDivisions().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
