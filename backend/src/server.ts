import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/lakehouse/hello") {
    const body = JSON.stringify([
      { id: 1, name: "hello" },
      { id: 2, name: "lakehouse" }
    ]);

    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8"
    });
    res.end(body);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, {
    "content-type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify({ error: "not_found" }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Portal backend POC listening on port ${port}`);
});
