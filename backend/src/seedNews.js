const { closeDB } = require("./config/db");
require("dotenv").config();
const connectDB = require("./config/db");
const News = require("./models/News");

const seedNews = async () => {
  await connectDB();

  const data = [
    {
      title: "Strengthening Sri Lanka’s energy security",
      slug: "strengthening-energy-security",
      summary:
        "Updates from Ceypetco operations and national energy initiatives.",
      content:
        "Ceypetco continues to advance national energy security through refinery operations, distribution and infrastructure investment, ensuring a dependable petroleum supply across Sri Lanka.",
      category: "corporate",
      author: "Ceypetco Communications",
      publishedDate: new Date(),
      status: "published",
    },
    {
      title: "Information for customers and partners",
      slug: "information-for-customers-and-partners",
      summary:
        "Important notices, service updates and public announcements.",
      content:
        "Ceypetco shares important notices, service updates and public announcements to keep customers and partners informed of service improvements and operational changes.",
      category: "announcement",
      author: "Ceypetco Communications",
      publishedDate: new Date(),
      status: "published",
    },
    {
      title: "Building tomorrow’s energy network",
      slug: "building-tomorrows-energy-network",
      summary:
        "Progress across refinery, distribution and infrastructure projects.",
      content:
        "Ongoing projects across the refinery, marketing and infrastructure portfolio are laying the foundations for a modern, resilient national energy network.",
      category: "operations",
      author: "Ceypetco Communications",
      publishedDate: new Date(),
      status: "published",
    },
  ];

  for (const item of data) {
    const existing = await News.findOne({ slug: item.slug });
    if (existing) {
      console.log(`News already exists: ${item.title}`);
      continue;
    }
    await News.create(item);
    console.log(`News created: ${item.title}`);
  }

  await closeDB();
  console.log("News seeding complete.");
  process.exit(0);
};

seedNews().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
