import app from "./app";
import { connectRedis } from "./lib/redis-client.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

connectRedis()
  .then(() => {
    app.listen(port, () => {
      console.log(`Distributed Session Management Server listening on port ${port}`);
      console.log(`Redis-backed sessions enabled`);
    });
  })
  .catch((err) => {
    console.warn("Redis unavailable, starting without session persistence:", (err as Error).message);
    app.listen(port, () => {
      console.log(`Server listening on port ${port} (Redis unavailable)`);
    });
  });
