import app from "./app";
import { connectRedis } from "./lib/redis-client.js";

const NODE_PORT = process.env["NODE_PORT"];
const rawPort = process.env["PORT"];

if (!NODE_PORT && !rawPort) {
  throw new Error("NODE_PORT or PORT environment variable is required");
}

const port = Number(NODE_PORT || rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid port value: "${NODE_PORT || rawPort}"`);
}

process.env["NODE_PORT"] = String(port);

connectRedis()
  .then(() => {
    app.listen(port, () => {
      const nodeId = `node-${[3001, 3002, 3003].indexOf(port) + 1}`;
      console.log(`Backend node ${nodeId} listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Could not connect to Redis:", err);
    app.listen(port, () => {
      console.log(`Backend node listening on port ${port} (Redis unavailable)`);
    });
  });
