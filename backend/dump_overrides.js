const { getPool } = require('./src/config/db');
require('dotenv').config();

async function run() {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT Id, Data FROM WebsiteDocuments WHERE ModelName = 'PageContent'");
  for (const r of rows) {
    const data = JSON.parse(r.Data);
    if (data.overrides && data.overrides.length > 0) {
      console.log('=== PAGE:', data.path, '===');
      for (const o of data.overrides) {
        console.log('SELECTOR:', o.selector);
        console.log('HTML (preview):', (o.html || '').slice(0, 100));
      }
    }
  }
  process.exit(0);
}
run();
