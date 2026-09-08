import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAsh,
  parsePolygons,
  advisoryTime,
  reportLinks,
  parseActivity,
} from "../lib/feeds.ts";
import { terrainState } from "../lib/history.ts";
const advisory = `VA ADVISORY
DTG: 20260907/0530Z
VAAC: DARWIN
VOLCANO: KRAKATAU 262000
ADVISORY NR: 2026/194
OBS VA DTG: 07/0510Z
OBS VA CLD: SFC/FL150 S0606 E10525 - S0615 E10615 - S0713 E10609 MOV SW 10KT SFC/FL500 S1450 E09444 - S2148 E09053 - S1650 E07955 MOV SW 20KT
FCST VA CLD +6 HR: 07/1110Z SFC/FL150 S0606 E10525 - S0615 E10615 - S0713 E10609
RMK: EXAMPLE TEST ADVISORY
NXT ADVISORY: NO LATER THAN 20260907/0830Z=`;
test("ash keeps separate altitude polygons and forecast timestamps", () => {
  const a = parseAsh(advisory);
  assert.equal(a.number, "2026/194");
  assert.equal(a.layers[0].polygons.length, 2);
  assert.equal(a.layers[1].name, "Forecast +6h");
  assert.equal(a.layers[0].time, "2026-09-07T05:10:00.000Z");
  assert.equal(a.layers[0].polygons[0].coordinates[0][1], -6.1);
  assert.equal(a.layers[0].polygons[0].topMeters, 4572);
});
test("latest issue wins regardless of feed order", () => {
  const old = advisory
    .replace("20260907/0530Z", "20260906/2330Z")
    .replace("2026/194", "2026/193");
  assert.equal(parseAsh(advisory + old).number, "2026/194");
});
test("estimated ash is not called observed", () => {
  assert.equal(
    parseAsh(advisory.replaceAll("OBS VA", "EST VA")).observationKind,
    "Estimated",
  );
});
test("missing or unidentifiable ash never becomes an invented polygon", () => {
  assert.equal(parseAsh("No advisories"), null);
  assert.deepEqual(
    parsePolygons("VA NOT IDENTIFIABLE FROM SATELLITE DATA"),
    [],
  );
  assert.deepEqual(
    parsePolygons("SFC/FL150 S0699 E10525 - S0615 E10615 - S0713 E10609"),
    [],
  );
});
test("short dates resolve over month and year boundaries", () => {
  assert.equal(
    advisoryTime("31/2350Z", "2027-01-01T00:10:00Z"),
    "2026-12-31T23:50:00.000Z",
  );
  assert.equal(
    advisoryTime("01/0310Z", "2026-09-30T21:10:00Z"),
    "2026-10-01T03:10:00.000Z",
  );
});
test("agency discovery accepts only the official host and unique article links", () => {
  const a =
    '<a href="http://geologi.esdm.go.id/media-center/krakatau-test">Krakatau report</a>';
  assert.equal(reportLinks(a + a).length, 1);
  assert.equal(
    reportLinks('<a href="https://evil.example/krakatau">Report</a>').length,
    0,
  );
  assert.match(reportLinks(a)[0].url, /^https:/);
});
test("activity preserves reported time and does not infer an absent alert level", () => {
  const d = parseActivity(
    '<div class="article-bg-esdm">tanggal 7 September 2026 pukul 06.00 WIB. IV. Rekomendasi tingkat aktivitas tetap pada Level III (Siaga).</div>',
    "Report",
    "https://geologi.esdm.go.id/media-center/krakatau",
  );
  assert.equal(d.reportedAt, "2026-09-06T23:00:00.000Z");
  assert.equal(d.level, "Level III (Siaga)");
  assert.equal(
    parseActivity(
      '<div class="article-bg-esdm">No level supplied.</div>',
      "Report",
      "url",
    ).level,
    null,
  );
});
test("Anak Krakatau and its eruption are absent before 1927", () => {
  for (const era of [0, 1])
    for (const after of [false, true])
      assert.equal(terrainState(era, after, 100).anak, false);
  assert.equal(terrainState(2, false, 0).anak, true);
});
test("collapse removes old peaks; growth builds only the later cone", () => {
  assert.equal(terrainState(1, false, 0).oldPeaks, true);
  assert.equal(terrainState(1, true, 0).oldPeaks, false);
  assert.equal(terrainState(1, true, 0).caldera, true);
  assert.ok(
    terrainState(2, false, 100).anakHeight >
      terrainState(2, false, 0).anakHeight,
  );
  assert.ok(
    terrainState(3, true, 0).anakHeight < terrainState(3, false, 0).anakHeight,
  );
});
