// src/lib/redis-client.js
// Singleton Redis connection pakai ioredis

import Redis from "ioredis";

let client;

export function getRedis() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
    });
    client.on("error", (err) => console.error("[Redis]", err));
  }
  return client;
}