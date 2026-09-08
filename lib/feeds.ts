export type AshPolygon = {
  altitude: string;
  topMeters: number;
  coordinates: [number, number][];
};
export type AshLayer = {
  name: string;
  time: string;
  description: string;
  polygons: AshPolygon[];
};
export type AshReport = {
  number: string;
  issuedAt: string;
  nextAt: string | null;
  observationKind: string;
  layers: AshLayer[];
  source: string;
};
export type ActivityReport = {
  title: string;
  url: string;
  reportedAt: string | null;
  level: string | null;
  excerpt: string;
  recommendation: string | null;
};
export function plainText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
function fullDate(d: string) {
  const m = d.match(/^(\d{4})(\d{2})(\d{2})\/(\d{2})(\d{2})Z$/);
  if (!m) return null;
  const date = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
export function advisoryTime(short: string, issuedAt: string) {
  const m = short.match(/(\d{2})\/(\d{2})(\d{2})Z/);
  if (!m) return null;
  const base = new Date(issuedAt);
  const candidates = [-1, 0, 1]
    .map(
      (offset) =>
        new Date(
          Date.UTC(
            base.getUTCFullYear(),
            base.getUTCMonth() + offset,
            +m[1],
            +m[2],
            +m[3],
          ),
        ),
    )
    .filter(
      (d) =>
        d.getUTCDate() === +m[1] &&
        d.getUTCHours() === +m[2] &&
        d.getUTCMinutes() === +m[3],
    );
  candidates.sort((a, b) => Math.abs(+a - +base) - Math.abs(+b - +base));
  return candidates[0]?.toISOString() ?? null;
}
export function parsePolygons(text: string): AshPolygon[] {
  const groups = [
    ...text.matchAll(
      /(SFC|FL\d{2,3})\/(FL\d{2,3})\s+([\s\S]*?)(?=(?:SFC|FL\d{2,3})\/FL\d|$)/g,
    ),
  ];
  return groups.flatMap((m) => {
    const coordinates: [number, number][] = [];
    for (const c of m[3].matchAll(
      /([NS])(\d{2})(\d{2})\s+([EW])(\d{3})(\d{2})/g,
    )) {
      if (+c[3] >= 60 || +c[6] >= 60 || +c[2] > 90 || +c[5] > 180) return [];
      coordinates.push([
        (+c[5] + +c[6] / 60) * (c[4] === "W" ? -1 : 1),
        (+c[2] + +c[3] / 60) * (c[1] === "S" ? -1 : 1),
      ]);
    }
    if (coordinates.length < 3) return [];
    return [
      {
        altitude: m[1] + "/" + m[2],
        topMeters: +m[2].slice(2) * 100 * 0.3048,
        coordinates,
      },
    ];
  });
}
export function parseAsh(html: string): AshReport | null {
  const raw = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  const reports = raw
    .split(/VA ADVISORY\s*/)
    .slice(1)
    .filter(
      (b) =>
        /VOLCANO:\s*KRAKATAU\s+262000\b/.test(b) && /VAAC:\s*DARWIN/.test(b),
    );
  const parsed = reports.flatMap((block) => {
    const issuedAt = fullDate(block.match(/DTG:\s*(\d{8}\/\d{4}Z)/)?.[1] ?? "");
    const number = block.match(/ADVISORY NR:\s*([\d/]+)/)?.[1];
    if (!issuedAt || !number) return [];
    const kind = block.match(/\b(OBS|EST) VA DTG:/)?.[1];
    const observed = block.match(/(?:OBS|EST) VA DTG:\s*(\d{2}\/\d{4}Z)/)?.[1];
    if (!kind || !observed) return [];
    const observedTime = advisoryTime(observed, issuedAt);
    if (!observedTime) return [];
    const layers: AshLayer[] = [];
    const desc = block.match(
      /(?:OBS|EST) VA CLD:\s*([\s\S]*?)(?=FCST VA CLD|RMK:|NXT ADVISORY:)/,
    )?.[1];
    if (!desc) return [];
    layers.push({
      name: kind === "OBS" ? "Observed" : "Estimated",
      time: observedTime,
      description: desc.replace(/\s+/g, " ").trim(),
      polygons: parsePolygons(desc),
    });
    for (const m of block.matchAll(
      /FCST VA CLD \+(6|12|18) HR:\s*(\d{2}\/\d{4}Z)\s*([\s\S]*?)(?=FCST VA CLD|RMK:|NXT ADVISORY:)/g,
    )) {
      const time = advisoryTime(m[2], issuedAt);
      if (time)
        layers.push({
          name: `Forecast +${m[1]}h`,
          time,
          description: m[3].replace(/\s+/g, " ").trim(),
          polygons: parsePolygons(m[3]),
        });
    }
    return [
      {
        number,
        issuedAt,
        nextAt: fullDate(
          block.match(/NXT ADVISORY:[^=]*?(\d{8}\/\d{4}Z)/)?.[1] ?? "",
        ),
        observationKind: kind === "OBS" ? "Observed" : "Estimated",
        layers,
        source: "https://www.bom.gov.au/products/Volc_ash_latest.shtml",
      },
    ];
  });
  return (
    parsed.sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt))[0] ??
    null
  );
}
export function reportLinks(html: string) {
  const matches = [
    ...html.matchAll(
      /<a\b[^>]*href=["'](https?:\/\/geologi\.esdm\.go\.id\/media-center\/[^"']*krakatau[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    ),
  ];
  const seen = new Set<string>();
  return matches
    .flatMap((m) => {
      const url = m[1].replace("http:", "https:");
      const title = plainText(m[2]);
      if (seen.has(url) || !title) return [];
      seen.add(url);
      return [{ url, title }];
    })
    .slice(0, 5);
}
export function parseActivity(
  html: string,
  title: string,
  url: string,
): ActivityReport {
  const start = html.indexOf('class="article-bg-esdm"');
  if (start < 0) throw Error("Article format changed");
  const article = html
    .slice(start)
    .split(/<aside|<div class="col-lg-4|<div class="col-md-4|<section/)[0];
  const text = plainText(article);
  const months = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember",
  ];
  const d = text.match(
    /tanggal\s+(\d{1,2})\s+([a-z]+)\s+(\d{4})\s+pukul\s+(\d{2})[.:](\d{2})\s*WIB/i,
  );
  let reportedAt: string | null = null;
  if (d && months.includes(d[2].toLowerCase()))
    reportedAt = new Date(
      Date.UTC(
        +d[3],
        months.indexOf(d[2].toLowerCase()),
        +d[1],
        +d[4] - 7,
        +d[5],
      ),
    ).toISOString();
  const recommendationSection =
    text.split(/IV\.\s*Rekomendasi|Rekomendasi/i)[1] ?? "";
  const level = recommendationSection.match(
    /(?:tetap pada|berada pada|dinaikkan[^.]{0,80}?menjadi)\s*Level\s+(IV|III|II|I)\s*\(([^)]+)\)/i,
  );
  const recommendation =
    recommendationSection.match(/Masyarakat di sekitar[^.]+\./i)?.[0] ?? null;
  const excerpt =
    text.match(/Pengamatan visual dan CCTV[^.]+\./i)?.[0] ??
    text.match(/Selama periode[^.]+\./i)?.[0] ??
    "Read the official bulletin for the full observation and recommendations.";
  return {
    title,
    url,
    reportedAt,
    level: level ? `Level ${level[1]} (${level[2]})` : null,
    excerpt: excerpt.slice(0, 600),
    recommendation: recommendation?.slice(0, 800) ?? null,
  };
}
