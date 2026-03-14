// src/app/api/push/send/route.js
// Cron job — dipanggil tiap jam oleh Vercel
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis-client";
import webpush from "web-push";
import { SCHEDULE_2026 } from "@/lib/schedule2026";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const RACE_NAMES = {
  1:"Australia GP", 2:"China GP", 3:"Japan GP", 4:"Bahrain GP",
  5:"Saudi Arabia GP", 6:"Miami GP", 7:"Canada GP", 8:"Monaco GP",
  9:"Spain GP", 10:"Austria GP", 11:"Great Britain GP", 12:"Belgium GP",
  13:"Hungary GP", 14:"Netherlands GP", 15:"Italy GP", 16:"Madrid GP",
  17:"Azerbaijan GP", 18:"Singapore GP", 19:"USA GP", 20:"Mexico GP",
  21:"Brazil GP", 22:"Las Vegas GP", 23:"Qatar GP", 24:"Abu Dhabi GP",
};

const SESSION_LABELS = {
  fp1:"Free Practice 1", fp2:"Free Practice 2", fp3:"Free Practice 3",
  qualifying:"Qualifying", race:"RACE",
};
const SESSION_LABELS_SPRINT = {
  fp1:"Free Practice 1", fp2:"Sprint Qualifying", fp3:"Sprint Race",
  qualifying:"Qualifying", race:"RACE",
};
const SESSION_MAP = {
  fp1:"fp1", fp2:"fp2", sprintQual:"fp2",
  fp3:"fp3", sprintRace:"fp3", qualifying:"qualifying", race:"race",
};

function parseUTC(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  try {
    const raw = `${dateStr}T${timeStr}`;
    const clean = raw.endsWith("Z") ? raw : raw + "Z";
    const dt = new Date(clean);
    return isNaN(dt.getTime()) ? null : dt;
  } catch { return null; }
}

function toWIB(dt) {
  return dt.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }) + " WIB";
}

function buildNotifsToBeSent(prefs) {
  const now = Date.now();
  const WINDOW = 65 * 60 * 1000;
  const notifs = [];
  const { sessions = {}, reminderMins = 30, raceWeek = true } = prefs;

  Object.entries(SCHEDULE_2026).forEach(([roundStr, raceData]) => {
    const round = parseInt(roundStr);
    const raceName = RACE_NAMES[round] || `Race R${round}`;
    const isSprint = !!raceData.sprint;
    const labels = isSprint ? SESSION_LABELS_SPRINT : SESSION_LABELS;

    Object.entries(SESSION_MAP).forEach(([onboardKey, schedKey]) => {
      if (!sessions[onboardKey]) return;
      if ((onboardKey === "sprintQual" || onboardKey === "sprintRace") && !isSprint) return;
      if (onboardKey === "fp2" && isSprint) return;
      if (onboardKey === "fp3" && isSprint) return;

      const sData = raceData[schedKey];
      if (!sData) return;

      const sessionDt = parseUTC(sData.date, sData.time);
      if (!sessionDt) return;

      const fireAt = sessionDt.getTime() - reminderMins * 60 * 1000;
      const diff = now - fireAt;
      if (diff < 0 || diff > WINDOW) return;

      const label = labels[schedKey] || schedKey;
      const isRace = schedKey === "race";

      notifs.push({
        key: `notif-${round}-${schedKey}-${reminderMins}`,
        title: isRace ? `🏁 RACE ${reminderMins} menit lagi!` : `🏎️ ${label} ${reminderMins} menit lagi!`,
        body: `${raceName} · Mulai ${toWIB(sessionDt)}`,
        url: `/race/${round}`,
      });
    });

    if (raceWeek && raceData.fp1) {
      const fp1Dt = parseUTC(raceData.fp1.date, raceData.fp1.time);
      if (fp1Dt) {
        const fireAt = fp1Dt.getTime() - 7 * 24 * 60 * 60 * 1000;
        const diff = now - fireAt;
        if (diff >= 0 && diff <= WINDOW) {
          notifs.push({
            key: `raceweek-${round}`,
            title: `🗓️ Race Week Minggu Depan!`,
            body: `${raceName} dimulai ${fp1Dt.toLocaleString("id-ID", { weekday:"long", day:"numeric", month:"long", timeZone:"Asia/Jakarta" })}. Siap-siap! 🏁`,
            url: `/race/${round}`,
          });
        }
      }
    }
  });

  return notifs;
}

export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedis();
    const subKeys = await redis.keys("push:sub:*");
    if (!subKeys.length) return NextResponse.json({ sent: 0, message: "No subscribers" });

    let sent = 0, failed = 0, skipped = 0;

    for (const subKey of subKeys) {
      const subRaw = await redis.get(subKey);
      if (!subRaw) continue;

      const subscription = JSON.parse(subRaw);
      const subId = subKey.replace("push:sub:", "");

      const prefsRaw = await redis.get(`push:prefs:${subId}`);
      const prefs = prefsRaw
        ? JSON.parse(prefsRaw)
        : { sessions: { qualifying: true, race: true }, reminderMins: 30, raceWeek: true };

      const notifs = buildNotifsToBeSent(prefs);
      if (!notifs.length) { skipped++; continue; }

      for (const notif of notifs) {
        const firedKey = `push:fired:${subId}:${notif.key}`;
        const alreadyFired = await redis.get(firedKey);
        if (alreadyFired) continue;

        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: notif.title,
              body: notif.body,
              icon: "/icons/icon-192.png",
              badge: "/icons/badge-72.png",
              url: notif.url,
              tag: notif.key,
            })
          );
          await redis.set(firedKey, "1", "EX", 8 * 60 * 60);
          sent++;
        } catch (pushErr) {
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await redis.del(subKey);
            await redis.del(`push:prefs:${subId}`);
          }
          failed++;
        }
      }
    }

    return NextResponse.json({ sent, failed, skipped, total: subKeys.length });
  } catch (err) {
    console.error("[push/send]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}