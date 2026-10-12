#!/usr/bin/env node

const dns = require("node:dns").promises;
const http = require("node:http");
const https = require("node:https");

const target = process.argv[2] || "https://api.ceypetco.gov.lk/api/health";
const timeoutMs = 10_000;

function request(url) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          Accept: "application/json, text/html;q=0.5",
          "User-Agent": "ceypetco-plesk-proxy-test/1.0",
        },
        timeout: timeoutMs,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          if (body.length < 16_384) body += chunk;
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          })
        );
      }
    );

    req.on("timeout", () => req.destroy(new Error(`Timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
  });
}

async function main() {
  let url;
  try {
    url = new URL(target);
  } catch {
    throw new Error(`Invalid URL: ${target}`);
  }

  console.log(`Target: ${url.href}`);
  const addresses = await dns.resolve4(url.hostname);
  console.log(`DNS A: ${addresses.join(", ")}`);

  const response = await request(url);
  const contentType = String(response.headers["content-type"] || "(not set)");
  const server = String(response.headers.server || "(not set)");
  const normalizedBody = response.body.toLowerCase();
  const isPleskError =
    normalizedBody.includes("/error_docs/styles.css") ||
    normalizedBody.includes("page not found") ||
    normalizedBody.includes("you do not have permission to access this document");

  let json;
  try {
    json = JSON.parse(response.body);
  } catch {
    json = null;
  }

  const reachedExpress =
    response.status === 200 &&
    contentType.toLowerCase().includes("application/json") &&
    json?.success === true &&
    json?.status === "ok";

  console.log(`HTTP status: ${response.status}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`Server: ${server}`);

  if (reachedExpress) {
    console.log("RESULT: PASS - Plesk proxy/Passenger routing reached the Express backend.");
    process.exitCode = 0;
    return;
  }

  if (isPleskError) {
    console.error("RESULT: FAIL - Plesk/nginx served its own error page; the request did not reach Express.");
  } else {
    console.error("RESULT: FAIL - The expected Express health response was not received.");
    console.error(`Body preview: ${response.body.slice(0, 300).replace(/\s+/g, " ")}`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`RESULT: ERROR - ${error.message}`);
  process.exitCode = 2;
});
