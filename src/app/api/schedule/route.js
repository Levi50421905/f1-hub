// app/api/schedule/route.js
import { getSchedule } from "@/lib/f1api";

export const revalidate = 86400; // revalidate tiap 24 jam (jadwal jarang berubah)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || new Date().getFullYear();

    const data = await getSchedule(season);

    // Tambahkan status upcoming/finished berdasarkan tanggal hari ini
    const today = new Date();
    const enriched = data.map((race) => ({
      ...race,
      status: new Date(race.date) < today ? "finished" : "upcoming",
    }));

    return Response.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Schedule API error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
