const sql = require("mssql/msnodesqlv8");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const migrate = async () => {
  console.log("Starting Migration from MSSQL to MySQL...");

  // MSSQL config
  const mssqlConfig = {
    server: process.env.SQL_SERVER || "localhost",
    database: process.env.SQL_DATABASE || "CeypetcoWebsite",
    user: process.env.SQL_USER || "sa",
    password: process.env.SQL_PASSWORD,
    driver: "msnodesqlv8",
    options: { trustedConnection: false, encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  };
  
  if (mssqlConfig.server.includes("\\")) {
    const [server, instance] = mssqlConfig.server.split("\\");
    mssqlConfig.server = server;
    mssqlConfig.options.instanceName = instance;
  }

  // MySQL config
  const mysqlConfig = {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "root", // as requested
  };
  
  const mysqlDbName = "ceypetco_website";

  let mssqlPool;
  let mysqlPool;
  try {
    console.log("Connecting to MSSQL...");
    mssqlPool = await new sql.ConnectionPool(mssqlConfig).connect();
    console.log("MSSQL connected.");

    console.log("Connecting to MySQL...");
    mysqlPool = await mysql.createConnection(mysqlConfig);
    console.log("MySQL connected.");

    console.log(`Creating MySQL database '${mysqlDbName}' if not exists...`);
    await mysqlPool.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await mysqlPool.query(`USE \`${mysqlDbName}\``);

    console.log("Creating WebsiteDocuments table in MySQL...");
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS WebsiteDocuments (
        ModelName VARCHAR(100) NOT NULL,
        Id CHAR(36) NOT NULL,
        Data LONGTEXT NOT NULL,
        CreatedAt DATETIME(3) NOT NULL,
        UpdatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (ModelName, Id),
        INDEX IX_ModelName_UpdatedAt (ModelName, UpdatedAt DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Check if table exists and has data to optionally truncate or not.
    // We will just replace it (or ignore duplicates) but better to truncate for fresh migration.
    await mysqlPool.query(`TRUNCATE TABLE WebsiteDocuments`);

    console.log("Fetching data from MSSQL WebsiteDocuments...");
    const mssqlResult = await mssqlPool.request().query("SELECT ModelName, Id, Data, CreatedAt, UpdatedAt FROM dbo.WebsiteDocuments");
    const records = mssqlResult.recordset;
    console.log(`Found ${records.length} records in MSSQL.`);

    if (records.length > 0) {
      console.log("Inserting data into MySQL...");
      const BATCH_SIZE = 500;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const values = batch.map(r => [
          r.ModelName,
          r.Id,
          r.Data,
          new Date(r.CreatedAt),
          new Date(r.UpdatedAt)
        ]);
        
        await mysqlPool.query(
          "INSERT INTO WebsiteDocuments (ModelName, Id, Data, CreatedAt, UpdatedAt) VALUES ?",
          [values]
        );
        console.log(`Inserted ${i + batch.length} / ${records.length}`);
      }
    }

    console.log("Migration complete!");
    
    // Verification step
    const [mysqlResult] = await mysqlPool.query("SELECT COUNT(*) as count FROM WebsiteDocuments");
    const mysqlCount = mysqlResult[0].count;
    
    console.log(`Verification:`);
    console.log(`MSSQL Count: ${records.length}`);
    console.log(`MySQL Count: ${mysqlCount}`);
    
    if (records.length === mysqlCount) {
      console.log("✅ Verification SUCCESS. Data counts match.");
    } else {
      console.error("❌ Verification FAILED. Data counts mismatch.");
    }

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    if (mssqlPool) await mssqlPool.close();
    if (mysqlPool) await mysqlPool.end();
  }
};

migrate();
