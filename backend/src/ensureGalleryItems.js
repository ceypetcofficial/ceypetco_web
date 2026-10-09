const GalleryItem = require("./models/GalleryItem");

const samples = [
  ["aviation-ramp", "Aircraft refuelling operations", "Aviation", "/images/aviation-gallery-1.jpg", "CEYPETCO aviation fuel team supporting aircraft refuelling"],
  ["aviation-service", "Serving Sri Lanka’s aviation sector", "Aviation", "/images/aviation-gallery-4.jpg", "Aircraft receiving aviation fuel services in Sri Lanka"],
  ["refinery-operations", "Inside the refinery", "Operations", "/images/refinery-detail-1.jpg", "CEYPETCO refinery infrastructure and processing facilities"],
  ["refinery-infrastructure", "Energy infrastructure at work", "Operations", "/images/refinery-card-2.jpg", "Petroleum refinery equipment and industrial infrastructure"],
  ["distribution-network", "Fuel distribution islandwide", "Distribution", "/images/distribution.jpg", "CEYPETCO fuel distribution operations"],
  ["marine-bunkering", "Marine fuel services", "Marine", "/images/bunkering/marine-fuel-transfer.webp", "Marine fuel transfer operation"],
  ["corporate-team", "The people behind our service", "Corporate", "/images/career-team.jpg", "CEYPETCO team members working together"],
  ["heritage", "A legacy of national service", "Heritage", "/images/history-2.jpg", "Historic moment from CEYPETCO’s service to Sri Lanka"],
];

module.exports = async function ensureGalleryItems() {
  for (const [seedKey, title, category, mediaUrl, altText] of samples) {
    const existing = await GalleryItem.findOne({ seedKey });
    const deleted = await GalleryItem.findDeleted({ seedKey });
    if (existing || deleted.length) continue;
    await GalleryItem.create({ seedKey, title, category, type: "image", mediaUrl, altText, description: "A view from across CEYPETCO’s people, facilities and services.", order: samples.findIndex((item) => item[0] === seedKey) + 1, status: "published" });
  }
  console.log(`Gallery ready (${samples.length} starter records checked).`);
};
