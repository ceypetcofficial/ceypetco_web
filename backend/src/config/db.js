require("dotenv").config();
const mysql = require("mysql2/promise");
const { modelNames, tableName } = require("../models/modelRegistry");

let pool;

const getPoolConfig = () => {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "ceypetco_website",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
};

const connectDB = async () => {
  if (pool) return pool;

  const config = getPoolConfig();
  if (!config.password) throw new Error("DB_PASSWORD is required");

  pool = mysql.createPool(config);

  // We are relying on the migrate script to have created the WebsiteDocuments table.
  // We can just verify connection works here.
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log(`MySQL connected: ${config.host}:${config.port}/${config.database}`);
  } catch (error) {
    console.error("MySQL connection failed:", error);
    throw error;
  }
  
  return pool;
};

const getPool = async () => pool || await connectDB();
const closeDB = async () => { if (pool) await pool.end(); pool = undefined; };

module.exports = connectDB;
module.exports.getPool = getPool;
module.exports.closeDB = closeDB;
