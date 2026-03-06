// src/app/api/predictions/route.js
// GET  /api/predictions?round=1          → semua prediksi untuk race itu
// GET  /api/predictions?player=arsa      → semua prediksi milik player itu
// GET  /api/predictions?all=1            → semua data (untuk leaderboard)
// POST /api/predictions                  → simpan prediksi

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Key format:
//   pred:{player}:{round}  → { picks: [p1id, p2id, p3id, p4id, p5id], savedAt: ISO }
//   players                → Set of player names

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const round  = searchParams.get("round");
  const player = searchParams.get("player");
  const all    = searchParams.get("all");

  try {
    // Semua data untuk leaderboard
    if (all) {
      const players = await redis.smembers("f1_players");
      if (!players || players.length === 0) {
        return Response.json({ success: true, data: [] });
      }

      // Fetch semua prediksi tiap player
      const allData = await Promise.all(
        players.map(async (p) => {
          const keys = await redis.keys(`f1_pred:${p}:*`);
          const preds = {};
          for (const key of keys) {
            const roundNum = key.split(":")[2];
            preds[roundNum] = await redis.get(key);
          }
          return { player: p, predictions: preds };
        })
      );

      return Response.json({ success: true, data: allData });
    }

    // Prediksi satu round semua player
    if (round) {
      const players = await redis.smembers("f1_players");
      const data = {};
      for (const p of (players || [])) {
        const val = await redis.get(`f1_pred:${p}:${round}`);
        if (val) data[p] = val;
      }
      return Response.json({ success: true, data });
    }

    // Prediksi satu player semua round
    if (player) {
      const keys = await redis.keys(`f1_pred:${player}:*`);
      const preds = {};
      for (const key of keys) {
        const roundNum = key.split(":")[2];
        preds[roundNum] = await redis.get(key);
      }
      return Response.json({ success: true, data: preds });
    }

    return Response.json({ success: false, error: "Missing params" }, { status: 400 });

  } catch (err) {
    console.error("Redis GET error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { player, round, picks } = body;

    if (!player || !round || !picks) {
      return Response.json({ success: false, error: "player, round, picks required" }, { status: 400 });
    }
    if (!Array.isArray(picks) || picks.length !== 5) {
      return Response.json({ success: false, error: "picks must be array of 5" }, { status: 400 });
    }

    const key = `f1_pred:${player.toLowerCase().trim()}:${round}`;
    const val = { picks, savedAt: new Date().toISOString() };

    await redis.set(key, val);
    await redis.sadd("f1_players", player.toLowerCase().trim());

    return Response.json({ success: true, data: val });

  } catch (err) {
    console.error("Redis POST error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
