// src/app/api/driver/route.js
import { getDriverProfile } from "@/lib/f1api";

export const revalidate = 3600;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id     = searchParams.get("id");
    const season = searchParams.get("season") || new Date().getFullYear();

    if (!id) {
      return Response.json({ success: false, error: "id parameter wajib" }, { status: 400 });
    }

    const data = await getDriverProfile(id, season);

    if (!data) {
      return Response.json({ success: false, error: "Driver tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Driver API error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}