const archive = require("./data/historicalPrices.json");
const HistoricalPrice = require("./models/HistoricalPrice");
const parseHistoricalDate = require("./utils/historicalPriceDate");

async function ensureHistoricalPrices() {
  let previousBitumenDate = "";
  const records = [
    ...archive.fuelRows.map((row, index) => ({
      kind: "fuel",
      dateLabel: row[0],
      values: row.slice(1),
      sourceIndex: index,
      seedId: `fuel-${index}`,
    })),
    ...archive.bitumenRows.map((row, index) => {
      if (row[0]) previousBitumenDate = row[0];
      return {
        kind: "bitumen",
        dateLabel: previousBitumenDate,
        values: row.slice(1),
        note: row[0] ? "" : "Additional entry",
        sourceIndex: index,
        seedId: `bitumen-${index}`,
      };
    }),
  ];

  const existing = await HistoricalPrice.find({});
  const existingMap = new Map(existing.map(r => [r.seedId, r]));

  for (const record of records) {
    if (!existingMap.has(record.seedId)) {
      const parsed = parseHistoricalDate(record.kind, record.dateLabel);
      if (!parsed) throw new Error(`Invalid historical price date: ${record.dateLabel}`);
      await HistoricalPrice.create({ ...record, ...parsed, status: "active" });
    }
  }
  console.log(`Historical price archive ready (${records.length} source entries)`);
}

module.exports = ensureHistoricalPrices;
