// src/app/api/push/prefs/route.js
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis-client";

export async function POST(req) {
  try {
    const { endpoint, prefs } = await req.json();
    if (!endpoint || !prefs) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const redis = getRedis();
    const key = `push:prefs:${Buffer.from(endpoint).toString("base64").slice(0, 64)}`;
    await redis.set(key, JSON.stringify(prefs), "EX", 60 * 60 * 24 * 365);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/prefs]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}