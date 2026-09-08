import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeWind, windLevels } from "../lib/atmosphere.ts";
const now = Date.parse("2026-09-07T05:30:00Z");
function fixture() {
  const hourly = {
    time: ["2026-09-07T04:00", "2026-09-07T05:00", "2026-09-07T06:00"],
  };
  for (const [i, l] of windLevels.entries()) {
    hourly[`wind_speed_${l}`] = [10 + i, 20 + i, 30 + i];
    hourly[`wind_direction_${l}`] = [90, 120, 180];
  }
  return { hourly };
}
test("selects the latest model hour, retaining each pressure level", () => {
  const d = normalizeWind(fixture(), now);
  assert.equal(d.time, "2026-09-07T05:00:00.000Z");
  assert.equal(d.levels.length, 6);
  assert.equal(d.levels[5].speed, 25);
  assert.equal(d.levels[0].direction, 120);
});
test("retains the final hour instead of falling back to the first", () => {
  assert.equal(normalizeWind(fixture(), now + 3600000).levels[0].speed, 30);
});
test("rejects null and out-of-range data rather than inventing calm wind", () => {
  for (const bad of [null, -1, NaN]) {
    const d = fixture();
    d.hourly.wind_speed_850hPa[1] = bad;
    assert.throws(() => normalizeWind(d, now), /Invalid wind/);
  }
  const d = fixture();
  d.hourly.wind_direction_200hPa[1] = 400;
  assert.throws(() => normalizeWind(d, now), /Invalid wind/);
});
test("rejects stale, future-only and malformed timestamps", () => {
  assert.throws(
    () => normalizeWind(fixture(), now + 86400000),
    /current model hour/,
  );
  assert.throws(
    () => normalizeWind(fixture(), now - 86400000),
    /current model hour/,
  );
  assert.throws(
    () => normalizeWind({ hourly: { time: ["invalid"] } }, now),
    /Invalid model timestamp/,
  );
});
