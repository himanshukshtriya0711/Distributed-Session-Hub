import session from "express-session";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "../lib/redis-client.js";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    loginTime?: string;
    requestCount?: number;
  }
}

export function createSessionMiddleware() {
  const store = new RedisStore({
    client: getRedisClient(),
    prefix: "sess:",
  });

  return session({
    store,
    secret: process.env["SESSION_SECRET"] || "distributed-session-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
    name: "dsm.sid",
  });
}
