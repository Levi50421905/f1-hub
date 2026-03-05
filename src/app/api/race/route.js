// app/api/race/route.js
import {
  getRaceResult,
  getQualifyingResult,
  getPracticeResult,
  getPitStops,
  getLapTimes,
} from "@/lib/f1api";

export const revalidate = 3600;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || new Date().getFullYear();
    const round  = searchParams.get("round");
    const session = searchParams.get("session") || "race"; // race | qualifying | fp1 | fp2 | fp3 | pitstops | laps

    if (!round) {
      return Response.json({ success: false, error: "round parameter wajib" }, { status: 400 });
    }

    let data;
    switch (session) {
      case "race":
        data = await getRaceResult(season, round);
        break;
      case "qualifying":
        data = await getQualifyingResult(season, round);
        break;
      case "fp1":
        data = await getPracticeResult(season, round, 1);
        break;
      case "fp2":
        data = await getPracticeResult(season, round, 2);
        break;
      case "fp3":
        data = await getPracticeResult(season, round, 3);
        break;
      case "pitstops":
        data = await getPitStops(season, round);
        break;
      case "laps":
        data = await getLapTimes(season, round);
        break;
      default:
        return Response.json({ success: false, error: `Session tidak dikenal: ${session}` }, { status: 400 });
    }

    if (!data) {
      return Response.json({ success: false, error: "Data belum tersedia" }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Race API error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
