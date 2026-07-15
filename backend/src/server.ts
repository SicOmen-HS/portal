import { createServer } from "node:http";
import { queryTrino } from "./trino.js";

const port = Number(process.env.PORT ?? 4000);

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/lakehouse/hello") {
    try {
      const rows = await queryTrino(`
        SELECT id, name
        FROM lakekeeper.labtest.hello_iceberg
        ORDER BY id
      `);

      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8"
      });
      res.end(JSON.stringify(rows));
    } catch (error) {
      res.writeHead(500, {
        "content-type": "application/json; charset=utf-8"
      });
      res.end(JSON.stringify({
        error: "lakehouse_query_failed",
        message: error instanceof Error ? error.message : "unknown error"
      }));
    }

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
