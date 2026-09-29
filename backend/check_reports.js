const { getPool } = require('./src/config/db');

async function checkAnnualReports() {
  const pool = await getPool();
  const [rows] = await pool.query("SELECT * FROM WebsiteDocuments WHERE ModelName = 'AnnualReport'");
  console.log(`Found ${rows.length} Annual Reports in DB.`);
  if (rows.length > 0) {
    console.log(JSON.parse(rows[0].Data));
  }
  process.exit(0);
}

checkAnnualReports();
