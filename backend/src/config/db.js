const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./env");

let pool;
let connectPromise;

const connectDB = async () => {
  if (pool) return pool;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const config = getDatabaseConfig();
    if (!config.password) throw new Error("DB_PASSWORD is required");

    const createdPool = mysql.createPool(config);

    // This is non-destructive for existing deployments and initializes fresh databases.
    try {
      await createdPool.query("SELECT 1");
      await createdPool.query(`
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
      await createdPool.query(`
        CREATE TABLE IF NOT EXISTS ContactUsMessages (
          Id CHAR(36) NOT NULL,
          Name VARCHAR(150) NOT NULL,
          Email VARCHAR(254) NOT NULL,
          Phone VARCHAR(40) NULL,
          Subject VARCHAR(200) NOT NULL,
          Message TEXT NOT NULL,
          Status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
          CreatedAt DATETIME(3) NOT NULL,
          UpdatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (Id),
          INDEX IX_ContactUsMessages_Status_CreatedAt (Status, CreatedAt DESC),
          INDEX IX_ContactUsMessages_CreatedAt (CreatedAt DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await createdPool.query(`
        CREATE TABLE IF NOT EXISTS MediaAssets (
          StorageName VARCHAR(255) NOT NULL,
          DisplayName VARCHAR(255) NOT NULL,
          DeletedAt DATETIME(3) NULL,
          CreatedAt DATETIME(3) NOT NULL,
          UpdatedAt DATETIME(3) NOT NULL,
          PRIMARY KEY (StorageName)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const [mediaColumns] = await createdPool.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='MediaAssets'", [config.database]);
      if (!mediaColumns.some((column) => column.COLUMN_NAME.toLowerCase() === "deletedat")) {
        await createdPool.query("ALTER TABLE MediaAssets ADD COLUMN DeletedAt DATETIME(3) NULL AFTER DisplayName");
      }
      await createdPool.query(`
        INSERT IGNORE INTO ContactUsMessages
          (Id, Name, Email, Phone, Subject, Message, Status, CreatedAt, UpdatedAt)
        SELECT Id,
          JSON_UNQUOTE(JSON_EXTRACT(Data, '$.name')),
          JSON_UNQUOTE(JSON_EXTRACT(Data, '$.email')),
          NULLIF(JSON_UNQUOTE(JSON_EXTRACT(Data, '$.phone')), 'null'),
          JSON_UNQUOTE(JSON_EXTRACT(Data, '$.subject')),
          JSON_UNQUOTE(JSON_EXTRACT(Data, '$.message')),
          COALESCE(JSON_UNQUOTE(JSON_EXTRACT(Data, '$.status')), 'new'),
          CreatedAt, UpdatedAt
        FROM WebsiteDocuments
        WHERE ModelName='ContactMessage'
          AND JSON_UNQUOTE(JSON_EXTRACT(Data, '$.name')) IS NOT NULL
          AND JSON_UNQUOTE(JSON_EXTRACT(Data, '$.email')) IS NOT NULL
          AND JSON_UNQUOTE(JSON_EXTRACT(Data, '$.subject')) IS NOT NULL
          AND JSON_UNQUOTE(JSON_EXTRACT(Data, '$.message')) IS NOT NULL
      `);
      console.log(`MySQL connected: ${config.host}:${config.port}/${config.database}`);
      pool = createdPool;
      return pool;
    } catch (error) {
      console.error(`MySQL connection failed: ${error.message}`);
      await createdPool.end().catch(() => {});
      pool = undefined;
      throw error;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};

const getPool = async () => pool || await connectDB();
const closeDB = async () => { if (pool) await pool.end(); pool = undefined; connectPromise = null; };

module.exports = connectDB;
module.exports.getPool = getPool;
module.exports.closeDB = closeDB;
