// src/app/api/push/subscribe/route.js
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis-client";

export async function POST(req) {
  try {
    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const redis = getRedis();
    const key = `push:sub:${Buffer.from(subscription.endpoint).toString("base64").slice(0, 64)}`;
    await redis.set(key, JSON.stringify(subscription), "EX", 60 * 60 * 24 * 365);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/subscribe]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: "No endpoint" }, { status: 400 });

    const redis = getRedis();
    const key = `push:sub:${Buffer.from(endpoint).toString("base64").slice(0, 64)}`;
    await redis.del(key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/unsubscribe]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}