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

  const operations = records.map((record) => {
    const parsed = parseHistoricalDate(record.kind, record.dateLabel);
    if (!parsed) throw new Error(`Invalid historical price date: ${record.dateLabel}`);
    return {
      updateOne: {
        filter: { seedId: record.seedId },
        update: { $setOnInsert: { ...record, ...parsed, status: "active" } },
        upsert: true,
      },
    };
  });

  await HistoricalPrice.bulkWrite(operations);
  console.log(`Historical price archive ready (${records.length} source entries)`);
}

module.exports = ensureHistoricalPrices;
