const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const publicRoot = path.resolve(__dirname, "frontend", "dist");
const indexFile = path.join(publicRoot, "index.html");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendFile(req, res, filePath) {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      if (filePath !== indexFile) return sendFile(req, res, indexFile);
      res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Frontend build not found. Run npm install in the application root.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const immutableAsset = filePath.startsWith(path.join(publicRoot, "assets"));
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Content-Length": stats.size,
      "Cache-Control": immutableAsset
        ? "public, max-age=31536000, immutable"
        : "no-cache"
    });

    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const requestedFile = path.resolve(publicRoot, `.${pathname}`);
  if (
    requestedFile !== publicRoot &&
    !requestedFile.startsWith(`${publicRoot}${path.sep}`)
  ) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(req, res, pathname === "/" ? indexFile : requestedFile);
});

server.listen(port, () => {
  console.log(`CEYPETCO frontend listening on port ${port}`);
});
