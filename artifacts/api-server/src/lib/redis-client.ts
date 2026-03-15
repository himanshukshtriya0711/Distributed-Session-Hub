import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType;
let connected = false;

function createRedisClient(): RedisClientType {
  const client = createClient({
    url: process.env["REDIS_URL"] || "redis://localhost:6379",
  }) as RedisClientType;

  client.on("error", (err: Error) => {
    if (connected) {
      console.warn("Redis connection lost:", err.message);
    }
  });

  client.on("connect", () => {
    console.log("Connected to Redis");
    connected = true;
  });

  return client;
}

export async function connectRedis(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export default { connectRedis, getRedisClient };
