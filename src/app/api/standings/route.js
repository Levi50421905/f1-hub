// app/api/standings/route.js
import { getDriverStandings, getConstructorStandings } from "@/lib/f1api";

export const revalidate = 3600; // revalidate tiap 1 jam

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "drivers"; // "drivers" atau "constructors"
    const season = searchParams.get("season") || new Date().getFullYear();

    let data;
    if (type === "constructors") {
      data = await getConstructorStandings(season);
    } else {
      data = await getDriverStandings(season);
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Standings API error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
