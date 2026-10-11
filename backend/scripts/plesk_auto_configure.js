/**
 * CEYPETCO Node.js Backend - Plesk Diagnostic & Auto-Configuration Helper
 *
 * IMPORTANT SAFETY CONSTRAINTS:
 * - Read-only inspection & diagnostics.
 * - Does not modify Plesk, Apache, nginx, or Passenger virtual host configs.
 * - Does not kill processes or execute administrative/root shell commands.
 * - Uses pure Node.js APIs (net, http, https, fs, path).
 * - Masks sensitive environment variables (DB_PASSWORD, JWT_SECRET).
 */

const fs = require("fs");
const path = require("path");
const net = require("net");
const http = require("http");
const https = require("https");

// Attempt to load .env if available
try {
  require("dotenv").config({ quiet: true });
} catch {
  // dotenv optional if environment variables are injected directly by host
}

// Determine backend project root
const projectRoot = fs.existsSync(path.resolve(process.cwd(), "src/server.js"))
  ? process.cwd()
  : path.resolve(__dirname, "..");

const PASSENGER_DIRECTIVES = [
  "PassengerAppType",
  "PassengerEnabled",
  "PassengerAppRoot",
  "PassengerStartupFile",
];

const REQUIRED_STRUCTURE = [
  { relPath: "app.js", type: "file" },
  { relPath: "package.json", type: "file" },
  { relPath: "src", type: "dir" },
  { relPath: "src/server.js", type: "file" },
  { relPath: "src/app.js", type: "file" },
  { relPath: "public", type: "dir" },
];

const REQUIRED_ENV_VARS = [
  "NODE_ENV",
  "CLIENT_URL",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "LOCAL_ASSET_BASE_URL",
  "PORT",
  "HOST",
];

const SENSITIVE_ENV_VARS = new Set(["DB_PASSWORD", "JWT_SECRET"]);

// 1. Recursive search ignoring node_modules and .git
function walkDir(dir, fileCallback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileCallback);
    } else if (entry.isFile()) {
      if (path.resolve(fullPath) === path.resolve(__filename)) continue;
      fileCallback(fullPath);
    }
  }
}

// 2. Check port status using Node's net module only
function checkPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);

    const onFree = () => {
      const server = net.createServer();
      server.once("error", (err) => {
        if (err.code === "EADDRINUSE") {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      server.once("listening", () => {
        server.close(() => resolve(false));
      });
      try {
        server.listen(port, "127.0.0.1");
      } catch {
        resolve(true);
      }
    };

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      onFree();
    });
    socket.once("error", () => {
      onFree();
    });
    socket.connect(port, "127.0.0.1");
  });
}

// 3. Test local health endpoint using Node's built-in http module
function testLocalHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/health",
        headers: { Host: "api.ceypetco.gov.lk" },
        timeout: 5000,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            ok: res.statusCode === 200,
            body: body.trim(),
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve({ statusCode: "TIMEOUT", ok: false, error: "Connection timed out (5s)" });
    });
    req.on("error", (err) => {
      resolve({ statusCode: "ERR", ok: false, error: err.message });
    });
  });
}

// 4. Test public production health endpoint using Node's built-in https module
function testPublicHealth() {
  return new Promise((resolve) => {
    const req = https.get(
      "https://api.ceypetco.gov.lk/api/health",
      {
        timeout: 8000,
        headers: { Accept: "application/json, text/html, */*" },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const contentType = res.headers["content-type"] || "(not set)";
          const isPleskError =
            body.includes("Page Not Found") ||
            body.includes("Server Error") ||
            body.includes("error_docs") ||
            body.includes("Forbidden") ||
            (res.statusCode === 404 && contentType.includes("text/html"));
          resolve({
            statusCode: res.statusCode,
            contentType,
            isPleskError,
            bodyPreview: body.slice(0, 200).replace(/\s+/g, " "),
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve({
        statusCode: "TIMEOUT",
        contentType: "(none)",
        isPleskError: false,
        error: "Connection timed out (8s)",
      });
    });
    req.on("error", (err) => {
      resolve({
        statusCode: "ERR",
        contentType: "(none)",
        isPleskError: false,
        error: err.message,
      });
    });
  });
}

async function main() {
  console.log("==================================================");
  console.log(" CEYPETCO PLESK AUTO-CONFIGURE & DIAGNOSTIC CHECK");
  console.log("==================================================");

  // 1. Print Node.js version
  console.log(`\n1. Node.js Version: ${process.version}`);
  const nodeVersionPass = parseInt(process.versions.node.split(".")[0], 10) >= 20;

  // 2. Print current working directory
  console.log(`2. Current Working Directory: ${process.cwd()}`);
  console.log(`   Resolved Project Root: ${projectRoot}`);

  // 3. Check expected file and folder existence
  console.log("\n3. Application Structure Check:");
  let structurePass = true;
  for (const item of REQUIRED_STRUCTURE) {
    const target = path.join(projectRoot, item.relPath);
    const exists = fs.existsSync(target);
    if (!exists) {
      structurePass = false;
      console.log(`   [MISSING] ${item.relPath}`);
    } else {
      const stat = fs.statSync(target);
      const isExpected = item.type === "dir" ? stat.isDirectory() : stat.isFile();
      if (isExpected) {
        console.log(`   [EXISTS]  ${item.relPath}`);
      } else {
        structurePass = false;
        console.log(`   [TYPE MISMATCH] ${item.relPath} (expected ${item.type})`);
      }
    }
  }

  // 4. Read package.json details
  console.log("\n4. Package Configuration (package.json):");
  const pkgPath = path.join(projectRoot, "package.json");
  let pkg = {};
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      console.log(`   main:          ${pkg.main || "(not set)"}`);
      console.log(`   scripts.start: ${pkg.scripts?.start || "(not set)"}`);
      console.log(`   type:          ${pkg.type || "(not set)"}`);
      console.log(`   engines.node:  ${pkg.engines?.node || "(not set)"}`);
    } catch (e) {
      console.log(`   [ERROR] Failed to parse package.json: ${e.message}`);
    }
  } else {
    console.log("   [ERROR] package.json not found.");
  }

  // 5 & 6. Check .plesk.startup.cjs
  console.log("\n5. Plesk Startup File Check:");
  const startupFilePath = path.join(projectRoot, ".plesk.startup.cjs");
  let pleskStartupStatus = "ABSENT";
  if (fs.existsSync(startupFilePath)) {
    console.log("   .plesk.startup.cjs: PRESENT");
    try {
      const startupContent = fs.readFileSync(startupFilePath, "utf8");
      const loadsApp =
        startupContent.includes('require("./app.js")') ||
        startupContent.includes("require('./app.js')") ||
        startupContent.includes('require("./app")') ||
        startupContent.includes("require('./app')");
      if (loadsApp) {
        console.log('   Verification: Confirmed - loads require("./app.js")');
        pleskStartupStatus = "PASS";
      } else {
        console.log('   Verification: WARNING - does not explicitly require("./app.js")');
        pleskStartupStatus = "INVALID CONTENT";
      }
    } catch (e) {
      console.log(`   Verification error: ${e.message}`);
      pleskStartupStatus = "ERROR";
    }
  } else {
    console.log("   .plesk.startup.cjs: ABSENT (Not present in application directory)");
    pleskStartupStatus = "ABSENT";
  }

  // 7. Check environment variables (mask sensitive ones)
  console.log("\n6. Environment Variables Check:");
  let envPass = true;
  for (const varName of REQUIRED_ENV_VARS) {
    const val = process.env[varName];
    const isSet = typeof val === "string" && val.trim().length > 0;
    if (SENSITIVE_ENV_VARS.has(varName)) {
      if (isSet) {
        console.log(`   ${varName.padEnd(22)}: SET`);
      } else {
        console.log(`   ${varName.padEnd(22)}: MISSING`);
        envPass = false;
      }
    } else {
      if (isSet) {
        console.log(`   ${varName.padEnd(22)}: SET (${val})`);
      } else {
        console.log(`   ${varName.padEnd(22)}: MISSING`);
        envPass = false;
      }
    }
  }

  // 8. Search recursively for Passenger directives
  console.log("\n7. Scanning Project for Passenger Directives:");
  const foundDirectives = [];
  try {
    walkDir(projectRoot, (filePath) => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          for (const directive of PASSENGER_DIRECTIVES) {
            if (line.includes(directive)) {
              foundDirectives.push({
                file: path.relative(projectRoot, filePath),
                line: index + 1,
                directive,
                snippet: line.trim(),
              });
            }
          }
        });
      } catch {
        // Skip unreadable files
      }
    });

    if (foundDirectives.length === 0) {
      console.log("   No Passenger directives found in backend project files.");
    } else {
      console.log(`   Found ${foundDirectives.length} occurrence(s) of Passenger directives:`);
      for (const item of foundDirectives) {
        console.log(`   - ${item.file}:${item.line} -> ${item.snippet}`);
      }
    }
  } catch (err) {
    console.log(`   Scan error: ${err.message}`);
  }

  // 9. Search for .htaccess files under backend project
  console.log("\n8. Scanning for .htaccess Files:");
  const htaccessFiles = [];
  try {
    walkDir(projectRoot, (filePath) => {
      if (path.basename(filePath) === ".htaccess") {
        htaccessFiles.push(path.relative(projectRoot, filePath));
      }
    });
    if (htaccessFiles.length === 0) {
      console.log("   No .htaccess files found in backend project.");
    } else {
      for (const f of htaccessFiles) {
        console.log(`   Found: ${f}`);
      }
    }
  } catch (err) {
    console.log(`   Scan error: ${err.message}`);
  }

  // 10 & 11. Specifically check public/.htaccess
  console.log("\n9. public/.htaccess Status:");
  const publicHtaccess = path.join(projectRoot, "public", ".htaccess");
  let publicHtaccessStatus = "ABSENT";
  if (fs.existsSync(publicHtaccess)) {
    publicHtaccessStatus = "PRESENT";
    console.log("   public/.htaccess: PRESENT");
    try {
      const content = fs.readFileSync(publicHtaccess, "utf8");
      const hasPassenger = PASSENGER_DIRECTIVES.some((dir) => content.includes(dir));
      if (hasPassenger) {
        console.log("   [WARNING] public/.htaccess contains manual Passenger directives.");
        console.log("   Note: Manual Passenger directives can conflict with Plesk virtual-host routing.");
      } else {
        console.log("   public/.htaccess contains no manual Passenger directives.");
      }
    } catch (e) {
      console.log(`   Could not read public/.htaccess: ${e.message}`);
    }
  } else {
    console.log("   public/.htaccess: ABSENT");
    publicHtaccessStatus = "ABSENT";
  }

  // 12. Check whether port 5001 is occupied using net module
  console.log("\n10. Port 5001 Status Check (Node.js net API):");
  const port5001Occupied = await checkPortInUse(5001);
  const portStatusStr = port5001Occupied ? "IN USE" : "FREE";
  console.log(`    Port 5001: ${portStatusStr}`);

  // 13. Test local health endpoint
  const targetPort =
    process.env.PORT && !isNaN(Number(process.env.PORT))
      ? Number(process.env.PORT)
      : 5001;
  console.log(`\n11. Local Health Endpoint Check (127.0.0.1:${targetPort}/api/health):`);
  const localHealth = await testLocalHealth(targetPort);
  if (localHealth.ok) {
    console.log(`    LOCAL HEALTH: HTTP ${localHealth.statusCode}`);
    console.log(`    Response Body: ${localHealth.body}`);
  } else {
    console.log(`    LOCAL HEALTH: HTTP ${localHealth.statusCode} ${localHealth.error ? `(${localHealth.error})` : ""}`);
  }

  // 14. Test public production endpoint
  console.log("\n12. Public Health Endpoint Check (https://api.ceypetco.gov.lk/api/health):");
  const publicHealth = await testPublicHealth();
  console.log(`    PUBLIC HEALTH: HTTP ${publicHealth.statusCode}`);
  console.log(`    Content-Type: ${publicHealth.contentType}`);
  if (publicHealth.isPleskError) {
    console.log("    Detection: Body signature matches Plesk/nginx error template.");
    console.log(`    Body Preview: ${publicHealth.bodyPreview}`);
  } else if (publicHealth.statusCode === 200) {
    console.log("    Detection: Public API responded with HTTP 200 OK.");
  } else {
    console.log(`    Detail: ${publicHealth.error || publicHealth.bodyPreview || "(no body)"}`);
  }

  // 15. Print expected Plesk settings
  console.log("\n13. Expected Plesk Configuration Settings:");
  console.log("    Application Root: /Backend/backend");
  console.log("    Document Root:    /Backend/backend/public");
  console.log("    Startup File:     .plesk.startup.cjs");
  console.log("    Node.js:          Enabled");
  console.log("    Application Mode: production");

  // 16. Print Final Summary
  console.log("\n========================================");
  console.log("CEYPETCO PLESK AUTO-CONFIGURE CHECK");
  console.log("========================================");
  console.log(`Node version:                    ${nodeVersionPass ? "PASS" : "FAIL"}`);
  console.log(`Application structure:           ${structurePass ? "PASS" : "FAIL"}`);
  console.log(`Plesk startup wrapper:           ${pleskStartupStatus}`);
  console.log(`Environment:                     ${envPass ? "PASS" : "INCOMPLETE"}`);
  console.log(`Passenger directives in project: ${foundDirectives.length === 0 ? "NONE" : "FOUND"}`);
  console.log(`public/.htaccess:                ${publicHtaccessStatus}`);
  console.log(`Port 5001:                       ${portStatusStr}`);
  console.log(`Local health:                    ${localHealth.ok ? "PASS" : "FAIL"}`);
  console.log(`Public health:                   ${publicHealth.statusCode === 200 ? "PASS" : "FAIL"}`);
  console.log("========================================");

  // 17. Diagnosis conclusion
  if (localHealth.ok && (publicHealth.statusCode === 404 || publicHealth.isPleskError)) {
    console.log("\nDIAGNOSIS:");
    console.log(
      "The Node.js/Express application is healthy locally, but the public request is not reaching Express."
    );
    console.log(
      "The remaining problem is Plesk nginx/Apache/Passenger virtual-host routing."
    );
    console.log("This cannot be repaired using application-level npm access.");
    console.log(
      "Administrator/root access is required to rebuild or repair the Plesk web configuration."
    );
  }
}

main().catch((err) => {
  console.error("Diagnostic error:", err);
  process.exitCode = 1;
});
