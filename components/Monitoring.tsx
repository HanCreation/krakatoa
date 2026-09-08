"use client";
import { useEffect, useState } from "react";
import type { ActivityReport, AshReport } from "../lib/feeds";
export type MonitoringData = {
  checkedAt: string;
  ash: { status: string; report?: AshReport | null; message?: string };
  activity: {
    status: string;
    report?: ActivityReport;
    news?: { title: string; url: string }[];
    message?: string;
  };
};
export function stamp(t: string | null | undefined) {
  return t
    ? new Date(t).toLocaleString("en-GB", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : "Timestamp not provided";
}
export default function Monitoring({
  data,
  loading,
  error,
  retry,
}: {
  data: MonitoringData | null;
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const report = data?.activity.report;
  const stale =
    !report?.reportedAt || now - Date.parse(report.reportedAt) > 86400000;
  const ash = data?.ash.report;
  return (
    <section className="study-sheet monitoring-sheet">
      <div className="eyebrow">07 / OFFICIAL REPORTS & OBSERVATIONS</div>
      <h1>
        Know the source.
        <br />
        Read the timestamp.
      </h1>
      <p className="sheet-lead">
        Official bulletins report volcanic activity. Wind describes the
        atmosphere. They answer different questions.
      </p>
      <div className="feed-health">
        <span>
          {loading
            ? "Checking official sources…"
            : data
              ? "Last checked: " + stamp(data.checkedAt)
              : error || "Waiting for official sources"}
        </span>
        <button onClick={retry} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh sources"}
        </button>
      </div>
      <div className="live-grid">
        <article className="report-card">
          <small>BADAN GEOLOGI · PVMBG</small>
          <h2>{report?.level ?? "Status could not be verified"}</h2>
          <p className="report-time">
            {stale
              ? "Dated bulletin · verify for changes"
              : "Reported in the latest retrieved bulletin"}
            <br />
            {stamp(report?.reportedAt)}
          </p>
          {report ? (
            <>
              <h3>{report.title}</h3>
              <p lang="id">{report.excerpt}</p>
              {report.recommendation && (
                <details>
                  <summary>Official recommendation · Bahasa Indonesia</summary>
                  <p lang="id">{report.recommendation}</p>
                </details>
              )}
              <a
                className="text-link"
                href={report.url}
                target="_blank"
                rel="noreferrer"
              >
                Read the original bulletin ↗
              </a>
            </>
          ) : (
            <>
              <p>
                {data?.activity.message ||
                  error ||
                  "Retrieving the latest official bulletin."}
              </p>
              <a
                className="text-link"
                href="https://geologi.esdm.go.id/sbg/arsip-berita"
                target="_blank"
                rel="noreferrer"
              >
                Open Badan Geologi ↗
              </a>
            </>
          )}
          <p className="lesson-boundary">
            Reported level is not an independently verified all-clear. MAGMA is
            also linked below; its availability is independent of this feed.
          </p>
        </article>
        <article className="report-card">
          <small>DARWIN VAAC · AVIATION ASH</small>
          <h2>
            {ash
              ? "Advisory " + ash.number
              : data?.ash.status === "available"
                ? "No Krakatau advisory in the retrieved 24-hour feed"
                : "Advisory unavailable"}
          </h2>
          {ash ? (
            <>
              <p className="report-time">
                Issued: {stamp(ash.issuedAt)}
                <br />
                {ash.observationKind}: {stamp(ash.layers[0].time)}
              </p>
              <p>
                {ash.nextAt && now > Date.parse(ash.nextAt)
                  ? "Next advisory is overdue in this retrieved feed. Treat this as historical information."
                  : "Observed or estimated ash is valid at its stated time; it is not moved forward using today’s wind."}
              </p>
              <div className="ash-layer-list">
                {ash.layers.map((l) => (
                  <div key={l.name}>
                    <strong>{l.name}</strong>
                    <span>{stamp(l.time)}</span>
                    <small>
                      {l.polygons.length
                        ? l.polygons.map((p) => p.altitude).join(" · ")
                        : l.description}
                    </small>
                  </div>
                ))}
              </div>
              <a
                className="text-link"
                href={ash.source}
                target="_blank"
                rel="noreferrer"
              >
                Read Darwin’s original advisory ↗
              </a>
              <p className="lesson-boundary">
                Use Atmosphere to inspect advisory polygons. Flight levels are
                aviation pressure altitudes, not ashfall depth.
              </p>
            </>
          ) : (
            <p>
              {data?.ash.message ||
                "Absence from a feed does not establish that no ash is present."}
            </p>
          )}
        </article>
      </div>
      <div className="monitoring-explain">
        <h2>What scientists watch</h2>
        {[
          [
            "Earthquakes",
            "Rock fracturing and moving fluids create different seismic signals. A change in counts is interpreted alongside other evidence.",
          ],
          [
            "Deformation",
            "Ground movement can indicate pressure changes. Instruments measure small displacements; a swollen 3D mountain would require a stated exaggeration.",
          ],
          [
            "Gas & thermal signals",
            "Gas composition, emission rates and heat can help identify changing pathways or magma supply. Weather can limit observations.",
          ],
        ].map(([a, b]) => (
          <article key={a}>
            <h3>{a}</h3>
            <p>{b}</p>
          </article>
        ))}
      </div>
      <div className="bulletin-links">
        <h2>Recent official Krakatau bulletins</h2>
        {data?.activity.news?.map((n) => (
          <a key={n.url} href={n.url} target="_blank" rel="noreferrer">
            {n.title} ↗
          </a>
        ))}
      </div>
      <footer className="lesson-source">
        <a href="https://magma.esdm.go.id/" target="_blank" rel="noreferrer">
          MAGMA Indonesia ↗
        </a>
        <span>
          No synthetic earthquakes or invented thermal readings are presented as
          monitoring data.
        </span>
      </footer>
    </section>
  );
}
