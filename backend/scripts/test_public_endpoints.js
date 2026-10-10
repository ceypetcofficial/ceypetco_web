const http = require("http");

const app = require("../src/app");
const { closeDB } = require("../src/config/db");

const endpoints = [
  "/api/health",
  "/api/admin/news",
  "/api/admin/notices",
  "/api/admin/tenders",
  "/api/admin/projects",
  "/api/admin/careers/active",
  "/api/admin/annual-reports/active",
  "/api/admin/fuel-prices/active",
  "/api/admin/aviation-prices/active",
  "/api/admin/management-contacts/active",
  "/api/admin/team-members/active",
  "/api/admin/history-page",
  "/api/admin/home-services",
  "/api/admin/services",
  "/api/admin/supplier-resources",
  "/api/admin/supplier-section",
  "/api/admin/mobile-apps",
  "/api/admin/pages/public?path=/",
];

const requestEndpoint = (port, endpoint) =>
  new Promise((resolve) => {
    const request = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path: endpoint,
        headers: {
          Accept: "application/json",
          Host: "api.ceypetco.gov.lk",
        },
        timeout: 10000,
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          let payload;
          try {
            payload = JSON.parse(body);
          } catch {
            resolve({ endpoint, ok: false, status: response.statusCode, detail: "non-JSON response" });
            return;
          }

          const ok = response.statusCode >= 200 && response.statusCode < 300 && payload.success !== false;
          const data = payload.data;
          const detail = Array.isArray(data)
            ? `${data.length} item${data.length === 1 ? "" : "s"}`
            : data && typeof data === "object"
              ? "object data"
              : payload.message || "JSON response";

          resolve({ endpoint, ok, status: response.statusCode, detail });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("request timed out"));
    });
    request.on("error", (error) => {
      resolve({ endpoint, ok: false, status: "ERR", detail: error.message });
    });
  });

const main = async () => {
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.once("error", reject);
  });

  try {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : null;
    if (!port) throw new Error("Express did not receive a local test port");

    console.log(`Testing ${endpoints.length} read-only public endpoints on 127.0.0.1:${port}\n`);

    const results = [];
    for (const endpoint of endpoints) {
      const result = await requestEndpoint(port, endpoint);
      results.push(result);
      const status = String(result.status).padEnd(3);
      console.log(`[${status}] ${result.ok ? "PASS" : "FAIL"} ${endpoint} - ${result.detail}`);
    }

    const passed = results.filter((result) => result.ok).length;
    const failed = results.length - passed;
    console.log(`\nSummary: ${passed} passed, ${failed} failed, ${results.length} total.`);

    if (failed) process.exitCode = 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closeDB().catch((error) => {
      console.error(`Database cleanup warning: ${error.message}`);
    });
  }
};

main().catch((error) => {
  console.error(`[PUBLIC ENDPOINT TEST FAILED] ${error.stack || error.message}`);
  process.exitCode = 1;
});
