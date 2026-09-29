const HistoryPage = require("../models/HistoryPage");
const { deleteAssets } = require("../utils/assetStorage");

const imageBase = "/images";

const defaults = {
  heroLabel: "OUR HISTORY",
  heroTitle: "Milestones that shaped our journey",
  heroIntro: "Explore the defining moments behind more than six decades of service to Sri Lanka",
  heroImage: `${imageBase}/history-1.jpg`,
  journeyLabel: "OUR JOURNEY",
  journeyTitle: "Six decades of national service",
  journeyIntro: "From market entry and national distribution to refinery modernisation, each milestone strengthened Sri Lanka’s energy infrastructure",
  galleryLabel: "HISTORICAL MOMENTS",
  galleryTitle: "A visual journey through our legacy",
  milestones: [
    { year: "1962", text: "The Corporation commenced business in competition with the other oil companies operating in Sri Lanka at the time" },
    { year: "1964", text: "CPC took over the import, sale and distribution of petroleum products nationally. Kolonnawa, regional bulk depots and retail outlets were integrated and improved as one network, with added storage, fire-safety systems, internal roads and modernised gantry filling" },
    { year: "1968", text: "The Corporation continued expanding its national operating footprint and petroleum-services capabilities" },
    { year: "1969", text: "The refinery commenced production. Refining capacity was later increased to 50,000 BPD. A lubricating-oil blending plant was installed at Kolonnawa and CPC entered the agrochemical market" },
    { year: "1971", text: "Bunkering operations at Sri Lankan ports and aviation refuelling activities were integrated into the Corporation" },
    { year: "1978", text: "CPC built a Nylon 6 yarn factory for the textile, tyre and finishing industries at a cost of Rs. 603 million" },
    { year: "1987", text: "A Single Point Buoy Mooring facility was commissioned 9.2 kilometres offshore from Colombo Port, together with an intermediate crude-oil tank farm at Orugodawatte" },
    { year: "1992", text: "The refinery crude-distiller unit was revamped to modernise operations and improve efficiency at a cost of Rs. 250 million" },
  ],
  gallery: [1, 2, 3, 4, 6, 7, 8, 9].map((number, index) => ({
    image: `${imageBase}/history-${number}.jpg`,
    alt: `Ceypetco historical archive ${index + 1}`,
    caption: `Archive ${String(index + 1).padStart(2, "0")}`,
    wide: index === 0 || index === 5,
  })),
};

const get = async (req, res, next) => {
  try {
    const page = await HistoryPage.findOne({ key: "history" }).lean();
    res.json({ success: true, data: page || defaults });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await HistoryPage.findOne({ key: "history" });
    const fields = Object.keys(defaults);
    const data = Object.fromEntries(fields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]]));
    const page = await HistoryPage.findOneAndUpdate(
      { key: "history" },
      { $set: data },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (existing) {
      const previousUrls = [existing.heroImage, ...(existing.gallery || []).map((item) => item.image)].filter(Boolean);
      const currentUrls = [page.heroImage, ...(page.gallery || []).map((item) => item.image)].filter(Boolean);
      await deleteAssets(previousUrls.filter((url) => !currentUrls.includes(url)));
    }
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

module.exports = { get, update };
