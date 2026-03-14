// src/app/api/push/vapid/route.js
// Expose VAPID public key ke client untuk subscribe

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
}