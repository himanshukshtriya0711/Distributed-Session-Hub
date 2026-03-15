import { execSync, spawn } from "child_process";

try {
  execSync("redis-server --daemonize yes --logfile /tmp/redis.log", {
    stdio: "ignore",
    timeout: 5000,
  });
  console.log("Redis started");
} catch {
  console.log("Redis already running or unavailable");
}

await new Promise((resolve) => setTimeout(resolve, 500));

const child = spawn(
  "tsx",
  ["./src/index.ts"],
  {
    stdio: "inherit",
    env: { ...process.env },
  }
);

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
