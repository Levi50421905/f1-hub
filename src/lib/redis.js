// src/lib/redis.js
// Redis client — pakai REDIS_URL dari Vercel/Upstash

import Redis from "ioredis";

const getRedis = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL tidak ditemukan di .env.local");
  }
  return new Redis(process.env.REDIS_URL, {
    tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
    maxRetriesPerRequest: 3,
  });
};

// Singleton supaya tidak buat koneksi baru tiap request
let client = null;
export function getRedisClient() {
  if (!client) client = getRedis();
  return client;
}