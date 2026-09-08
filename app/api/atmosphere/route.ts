import { NextResponse } from "next/server";
import { normalizeWind, windLevels } from "../../../lib/atmosphere";
export async function GET() {
  const hourly = windLevels
    .flatMap((l) => [`wind_speed_${l}`, `wind_direction_${l}`])
    .join(",");
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=-6.102&longitude=105.423&hourly=${hourly}&forecast_days=2&timezone=UTC`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(10000) },
    );
    if (!r.ok) throw Error("upstream");
    const d = normalizeWind(await r.json());
    return NextResponse.json(d, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Wind data is unavailable. Try again shortly." },
      { status: 503 },
    );
  }
}
