const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./src/config/env");

async function analyze() {
  const pool = mysql.createPool(getDatabaseConfig());

  const [models] = await pool.query("SELECT DISTINCT ModelName FROM WebsiteDocuments");
  
  const schema = {};

  for (const { ModelName } of models) {
    const [rows] = await pool.query("SELECT Data FROM WebsiteDocuments WHERE ModelName = ?", [ModelName]);
    const fields = new Set();
    const sample = {};
    for (const row of rows) {
      try {
        const data = JSON.parse(row.Data);
        for (const key of Object.keys(data)) {
          fields.add(key);
          if (!sample[key]) {
            sample[key] = typeof data[key];
            if (Array.isArray(data[key])) sample[key] = "array";
          }
        }
      } catch(e){}
    }
    schema[ModelName] = sample;
  }

  console.log(JSON.stringify(schema, null, 2));
  await pool.end();
}

analyze();
