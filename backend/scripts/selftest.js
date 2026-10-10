const http = require("http");

const app = require("../src/app");

const fail = (message, error) => {
  console.error(`[SELFTEST FAILED] ${message}`);
  if (error) console.error(error.stack || error.message || error);
  process.exitCode = 1;
};

const server = app.listen(0, "127.0.0.1", () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;

  if (!port) {
    fail("The local Express server did not receive a TCP port.");
    server.close();
    return;
  }

  const request = http.get(
    {
      hostname: "127.0.0.1",
      port,
      path: "/api/health",
      headers: { Host: "api.ceypetco.gov.lk" },
      timeout: 5000,
    },
    (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`CONTENT-TYPE: ${response.headers["content-type"] || "unknown"}`);
        console.log(`BODY: ${body}`);

        if (response.statusCode === 200) {
          console.log("[SELFTEST PASSED] Express serves /api/health correctly.");
        } else {
          fail(`Expected HTTP 200 but received ${response.statusCode}.`);
        }
        server.close();
      });
    }
  );

  request.on("timeout", () => {
    request.destroy(new Error("Internal health request timed out after 5 seconds."));
  });
  request.on("error", (error) => {
    fail("The internal health request failed.", error);
    server.close();
  });
});

server.on("error", (error) => {
  fail("Express could not start a local test listener.", error);
});

setTimeout(() => {
  if (server.listening) {
    fail("The self-test exceeded 10 seconds.");
    server.close();
  }
}, 10000).unref();
