const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./env");

let pool;

const connectDB = async () => {
  if (pool) return pool;

  const config = getDatabaseConfig();
  if (!config.password) throw new Error("DB_PASSWORD is required");

  pool = mysql.createPool(config);

  // This is non-destructive for existing deployments and initializes fresh databases.
  try {
    await pool.query("SELECT 1");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS WebsiteDocuments (
        ModelName VARCHAR(100) NOT NULL,
        Id CHAR(36) NOT NULL,
        Data LONGTEXT NOT NULL,
        CreatedAt DATETIME(3) NOT NULL,
        UpdatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (ModelName, Id),
        INDEX IX_ModelName_UpdatedAt (ModelName, UpdatedAt DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(`MySQL connected: ${config.host}:${config.port}/${config.database}`);
  } catch (error) {
    console.error(`MySQL connection failed: ${error.message}`);
    await pool.end().catch(() => {});
    pool = undefined;
    throw error;
  }
  
  return pool;
};

const getPool = async () => pool || await connectDB();
const closeDB = async () => { if (pool) await pool.end(); pool = undefined; };

module.exports = connectDB;
module.exports.getPool = getPool;
module.exports.closeDB = closeDB;
