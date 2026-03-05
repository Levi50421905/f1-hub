// src/app/api/predict/route.js
// API untuk simpan dan ambil prediksi semua user

import { getRedisClient } from "@/lib/redis";

// GET /api/predict?round=1          → semua prediksi untuk round 1
// GET /api/predict?round=1&user=Aldi → prediksi user Aldi untuk round 1
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get("round");
    const user  = searchParams.get("user");

    if (!round) {
      return Response.json({ success: false, error: "round wajib diisi" }, { status: 400 });
    }

    const redis = getRedisClient();

    if (user) {
      // Ambil prediksi 1 user
      const data = await redis.get(`predict:${round}:${user}`);
      return Response.json({
        success: true,
        data: data ? JSON.parse(data) : null,
      });
    }

    // Ambil semua prediksi untuk round ini
    const keys = await redis.keys(`predict:${round}:*`);
    if (keys.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const values = await redis.mget(...keys);
    const predictions = keys.map((key, i) => ({
      user: key.split(":")[2],
      prediction: values[i] ? JSON.parse(values[i]) : null,
    })).filter(p => p.prediction);

    return Response.json({ success: true, data: predictions });
  } catch (error) {
    console.error("Predict GET error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/predict
// Body: { user: "Aldi", round: 1, prediction: ["norris", "verstappen", "leclerc"] }
export async function POST(request) {
  try {
    const body = await request.json();
    const { user, round, prediction } = body;

    if (!user || !round || !prediction) {
      return Response.json({ success: false, error: "user, round, dan prediction wajib diisi" }, { status: 400 });
    }

    if (!Array.isArray(prediction) || prediction.length !== 3) {
      return Response.json({ success: false, error: "prediction harus array 3 driver" }, { status: 400 });
    }

    const redis = getRedisClient();

    // Simpan prediksi — expire 6 bulan (cukup untuk 1 musim)
    await redis.set(
      `predict:${round}:${user}`,
      JSON.stringify({ user, round, prediction, savedAt: new Date().toISOString() }),
      "EX", 60 * 60 * 24 * 180
    );

    // Simpan daftar user (supaya bisa list semua pemain)
    await redis.sadd("predict:users", user);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Predict POST error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}