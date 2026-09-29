const mysql = require("mysql2/promise");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../.env') });

const schema = {
  "AnnualReport": ["year", "url", "status"],
  "AviationPrice": ["customer", "location", "price", "effectiveDate", "status"],
  "Career": ["title", "reference", "department", "location", "type", "description", "responsibilities", "requirements", "salary", "applicationDeadline", "publishedDate", "status"],
  "ContactMessage": ["status", "name", "email", "subject", "message"],
  "Division": ["slug", "title", "subtitle", "order", "kicker", "heading", "image", "detailTitle", "status"],
  "FuelPrice": ["effectiveDate", "product", "price", "status", "type", "unit", "category"],
  "FuelStation": ["dealerNo", "address", "dealerName", "district", "status"],
  "HistoricalPrice": ["seedId", "dateLabel", "kind", "note", "sortKey", "sourceIndex", "status", "year"],
  "HomeService": ["title", "description", "icon", "link", "order", "status"],
  "ManagementContact": ["group", "name", "role", "phone", "email", "order", "status"],
  "ManagementTeamMember": ["name", "role", "photo", "order", "status", "description"],
  "MobileApp": ["title", "description", "platform", "appIcon", "downloadUrl", "storeUrl", "order", "featured", "status"],
  "News": ["title", "summary", "content", "featuredImage", "category", "publishedDate", "author", "status", "slug"],
  "Notice": ["title", "slug", "summary", "content", "category", "publishedDate", "status", "document"],
  "PageContent": ["name", "path", "status", "seoTitle", "seoDescription"],
  "Project": ["title", "slug", "summary", "content", "featuredImage", "category", "location", "statusLabel", "startDate", "status"],
  "RegionalOffice": ["region", "district", "email", "manager", "name", "openingHours", "phone", "status"],
  "Service": ["title", "category", "text", "image", "link", "order", "status"],
  "SupplierResource": ["title", "url", "order", "status"],
  "SupplierSection": ["eyebrow", "title", "description"],
  "Tender": ["title", "reference", "summary", "category", "division", "publishedDate", "closingDate", "status"],
  "TenderDownload": ["tenderId", "tenderTitle", "tenderReference", "email", "mobileNumber", "downloadedAt"],
  "User": ["name", "email", "role", "status", "lastLogin"]
};

const createViews = async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "ceypetco_website"
  });

  console.log("Generating MySQL Views...");

  for (const [modelName, fields] of Object.entries(schema)) {
    let viewName = `${modelName}s`; // pluralize
    if (modelName === "News") viewName = "News";
    
    let selectCols = `Id, CreatedAt, UpdatedAt`;
    
    for (const field of fields) {
      selectCols += `, JSON_UNQUOTE(JSON_EXTRACT(Data, '$.${field}')) AS \`${field}\``;
    }

    const sql = `
      CREATE OR REPLACE VIEW ${viewName} AS 
      SELECT ${selectCols} 
      FROM WebsiteDocuments 
      WHERE ModelName = '${modelName}';
    `;
    
    try {
      await pool.query(sql);
      console.log(`✅ Created view: ${viewName}`);
    } catch (err) {
      console.error(`❌ Failed to create view ${viewName}:`, err.message);
    }
  }

  console.log("View generation complete!");
  process.exit(0);
};

createViews();
