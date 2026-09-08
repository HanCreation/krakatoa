type HourlyPayload = { hourly?: Record<string, unknown> };
export const windLevels = [
  "10m",
  "850hPa",
  "700hPa",
  "500hPa",
  "300hPa",
  "200hPa",
];
export function normalizeWind(payload: HourlyPayload, now = Date.now()) {
  const hourly = payload.hourly;
  if (!hourly || !Array.isArray(hourly.time) || !hourly.time.length)
    throw new Error("Missing model timestamps");
  const times = hourly.time.map((t) =>
    typeof t === "string" ? Date.parse(t + "Z") : NaN,
  );
  if (times.some((t) => !Number.isFinite(t)))
    throw new Error("Invalid model timestamp");
  let index = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i] <= now && (index === -1 || times[i] > times[index])) index = i;
  }
  if (index < 0 || now - times[index] > 2 * 60 * 60 * 1000)
    throw new Error("No current model hour");
  const labels = ["Surface", "~1.5 km", "~3 km", "~5.5 km", "~9 km", "~12 km"];
  const levels = windLevels.map((level, i) => {
    const speeds = hourly[`wind_speed_${level}`],
      directions = hourly[`wind_direction_${level}`];
    const speed = Array.isArray(speeds) ? speeds[index] : null,
      direction = Array.isArray(directions) ? directions[index] : null;
    if (
      typeof speed !== "number" ||
      !Number.isFinite(speed) ||
      speed < 0 ||
      typeof direction !== "number" ||
      !Number.isFinite(direction) ||
      direction < 0 ||
      direction > 360
    )
      throw new Error("Invalid wind data");
    return { label: labels[i], speed, direction };
  });
  return {
    time: new Date(times[index]).toISOString(),
    fetchedAt: new Date(now).toISOString(),
    levels,
  };
}
