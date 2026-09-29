require("dotenv").config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");

const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length || isProduction
  ? configuredOrigins
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const parsePort = (value, name, fallback) => {
  const raw = value || fallback;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return port;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error("Boolean environment values must be either true or false");
};

const validateUrl = (value, name, { requireHttps = false } = {}) => {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  if (requireHttps && parsed.protocol !== "https:") {
    throw new Error(`${name} must use https in production`);
  }
};

const validateEnvironment = () => {
  parsePort(process.env.PORT, "PORT", "5000");
  parsePort(process.env.DB_PORT, "DB_PORT", "3306");
  parseBoolean(process.env.DB_SSL, false);
  parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true);

  if (!isProduction) return;

  const required = [
    "CLIENT_URL",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "LOCAL_ASSET_BASE_URL",
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters in production");
  }

  allowedOrigins.forEach((origin) =>
    validateUrl(origin, "CLIENT_URL", { requireHttps: true })
  );
  validateUrl(process.env.LOCAL_ASSET_BASE_URL, "LOCAL_ASSET_BASE_URL", {
    requireHttps: true,
  });
};

const getDatabaseConfig = () => {
  const config = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parsePort(process.env.DB_PORT, "DB_PORT", "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "ceypetco_website",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  if (parseBoolean(process.env.DB_SSL, false)) {
    config.ssl = {
      rejectUnauthorized: parseBoolean(
        process.env.DB_SSL_REJECT_UNAUTHORIZED,
        true
      ),
    };
  }

  return config;
};

const getPublicAssetOrigin = (req) => {
  const configured = process.env.LOCAL_ASSET_BASE_URL;
  if (configured) return normalizeOrigin(configured);
  return `${req.protocol}://${req.get("host")}`;
};

module.exports = {
  allowedOrigins,
  getDatabaseConfig,
  getPublicAssetOrigin,
  isProduction,
  validateEnvironment,
};
