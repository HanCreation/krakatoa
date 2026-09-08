import { NextResponse } from "next/server";
import { parseAsh, parseActivity, reportLinks } from "../../../lib/feeds";
export const maxDuration = 30;
async function publicText(url: string) {
  const r = await fetch(url, {
    ...(url.includes("/media-center/")
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300 } }),
    signal: AbortSignal.timeout(12000),
    headers: { Accept: "text/html" },
  });
  if (!r.ok) throw Error("Upstream HTTP " + r.status);
  const text = await r.text();
  if (text.length > 12000000) throw Error("Upstream response too large");
  return text;
}
export async function GET() {
  const checkedAt = new Date().toISOString();
  const [ash, activity] = await Promise.allSettled([
    publicText("https://www.bom.gov.au/products/Volc_ash_latest.shtml").then(
      (html) => ({ report: parseAsh(html) }),
    ),
    (async () => {
      const links = reportLinks(
        await publicText("https://geologi.esdm.go.id/sbg/arsip-berita"),
      );
      if (!links.length)
        throw Error("No Krakatau bulletin in the current index");
      const first = links[0];
      const report = parseActivity(
        await publicText(first.url),
        first.title,
        first.url,
      );
      return { report, news: links };
    })(),
  ]);
  return NextResponse.json(
    {
      checkedAt,
      ash:
        ash.status === "fulfilled"
          ? { status: "available", ...ash.value }
          : {
              status: "unavailable",
              message:
                "Darwin VAAC could not be checked. This is not an all-clear.",
            },
      activity:
        activity.status === "fulfilled"
          ? { status: "available", ...activity.value }
          : {
              status: "unavailable",
              message:
                "The official bulletin could not be checked. Open Badan Geologi for the latest report.",
            },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=30",
      },
    },
  );
}
