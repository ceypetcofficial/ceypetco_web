const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const [rows] = await db.query('SELECT * FROM WebsitePages WHERE path = "/publications"');
    console.log(JSON.stringify(rows, null, 2));
    db.end();
  } catch (err) {
    console.error(err);
  }
})();
