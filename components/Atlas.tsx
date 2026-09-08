"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  ArrowRight,
  Mountain,
  Globe2,
  History,
  Layers3,
  Flame,
  ShieldCheck,
  Radio,
  ChartNoAxesCombined,
  BookOpen,
  Wind,
  X,
  Plus,
  Minus,
  RotateCcw,
  Maximize,
  Play,
  Pause,
  Compass,
  ChevronDown,
  Eye,
  Ruler,
  Menu,
  Check,
  ExternalLink,
} from "lucide-react";
import { chapters, eras, sources, type WindData } from "../lib/data";
import type { WorldSettings } from "./World";
import Safety from "./Safety";
import Learning from "./Learning";
import Monitoring, { stamp, type MonitoringData } from "./Monitoring";
const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => (
    <div className="loading-world">Building your view of the Sunda Strait…</div>
  ),
});
const icons = [
  Globe2,
  Compass,
  History,
  Layers3,
  Flame,
  ShieldCheck,
  Radio,
  ChartNoAxesCombined,
  BookOpen,
];
const hazards = [
  "Ash",
  "Lava",
  "Ballistics",
  "Pyroclastic flow",
  "Volcanic gas",
  "Flank collapse",
  "Tsunami",
];
const descriptions: Record<string, string> = {
  explore:
    "An island is only the part you can see. Lower the water and discover the caldera beneath the Sunda Strait.",
  history:
    "Land rises. Land disappears. Move through the moments that made—and remade—Krakatau.",
  inside:
    "Open the mountain. Follow magma from its reservoir to the crater, then explore what changes an eruption.",
  hazards:
    "Explore how volcanic processes travel across land, through the air, and into the sea.",
  safety:
    "Follow ash from the volcano to everyday life. Explore how a fitted mask and a closed home reduce exposure.",
  monitoring:
    "Earthquakes, ground movement and gas help scientists understand what happens beneath the surface.",
};
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      className="toggle-row"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    >
      <span>{label}</span>
      <span className={"switch " + (checked ? "on" : "")}>
        <i />
      </span>
    </button>
  );
}
export default function Atlas() {
  const pathname = usePathname();
  const chapter = pathname.split("/")[1] || "";
  const index = Math.max(
    0,
    chapters.findIndex((c) => c[0] === chapter),
  );
  const [after, setAfter] = useState(false),
    [growth, setGrowth] = useState(15),
    [region, setRegion] = useState(false);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null),
    [monitorLoading, setMonitorLoading] = useState(false),
    [monitorError, setMonitorError] = useState(""),
    [ashLayer, setAshLayer] = useState(-1);
  async function getMonitoring() {
    setMonitorLoading(true);
    setMonitorError("");
    try {
      const r = await fetch("/api/monitoring");
      if (!r.ok) throw Error("Official sources are temporarily unavailable");
      setMonitoring(await r.json());
    } catch (e) {
      setMonitorError(e instanceof Error ? e.message : "Connection failed");
      setAshLayer(-1);
      setMonitoring(null);
    } finally {
      setMonitorLoading(false);
    }
  }

  const [era, setEra] = useState(4),
    [mode, setMode] = useState("Surface"),
    [drain, setDrain] = useState(0),
    [labels, setLabels] = useState(true),
    [atmosphere, setAtmosphere] = useState(false),
    [wind, setWind] = useState(false),
    [windData, setWindData] = useState<WindData | null>(null),
    [windError, setWindError] = useState(""),
    [loadingWind, setLoadingWind] = useState(false),
    [altitude, setAltitude] = useState(1),
    [allAltitudes, setAllAltitudes] = useState(false),
    [plume, setPlume] = useState(5),
    [hazard, setHazard] = useState("Ash"),
    [erupt, setErupt] = useState(false),
    [pressure, setPressure] = useState(50),
    [viscosity, setViscosity] = useState(40),
    [vent, setVent] = useState(true),
    [water, setWater] = useState(false),
    [measure, setMeasure] = useState(false),
    [measurement, setMeasurement] = useState(
      "Choose two points on the landscape",
    ),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(0),
    [paused, setPaused] = useState(false),
    [selected, setSelected] = useState(""),
    [menu, setMenu] = useState(false),
    [mask, setMask] = useState("N95"),
    [seal, setSeal] = useState(true),
    [windows, setWindows] = useState(true),
    [tour, setTour] = useState(false);
  useEffect(() => {
    if (chapter !== "monitoring" && !atmosphere) return;
    getMonitoring();
    const timer = setInterval(getMonitoring, 300000);
    return () => clearInterval(timer);
  }, [chapter, atmosphere]);
  useEffect(() => {
    setMenu(false);
    setSelected("");
    setMeasure(false);
    setMode(chapter === "inside" ? "Cutaway" : "Surface");
    setDrain(0);
    if (chapter === "inside" || chapter === "hazards") setEra(4);
    setAfter(false);
    setRegion(false);
    if (pathname === "/history/1883") setEra(1);
    if (pathname === "/history/anak-krakatau") setEra(2);
    if (pathname === "/history/2018") setEra(3);
  }, [pathname, chapter]);
  useEffect(() => {
    if (!tour) return;
    const timer = setInterval(
      () =>
        setEra((e) => {
          if (e === 4) {
            setTour(false);
            return e;
          }
          return e + 1;
        }),
      4000,
    );
    return () => clearInterval(timer);
  }, [tour]);
  async function getWind() {
    setLoadingWind(true);
    setWindError("");
    try {
      const r = await fetch("/api/atmosphere");
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setWindData(d);
    } catch (e) {
      setWindError(e instanceof Error ? e.message : "Wind unavailable");
      setWind(false);
      setWindData(null);
    } finally {
      setLoadingWind(false);
    }
  }
  useEffect(() => {
    if (!atmosphere) return;
    getWind();
    const timer = setInterval(getWind, 300000);
    return () => clearInterval(timer);
  }, [atmosphere]);
  const settings: WorldSettings = {
    after,
    growth,
    region,
    ashPolygons: monitoring?.ash.report?.layers[ashLayer]?.polygons ?? [],
    chapter,
    era,
    mode,
    drain,
    labels:
      labels &&
      !["compare", "sources", "safety", "monitoring"].includes(chapter),
    hazard,
    erupt,
    pressure,
    viscosity,
    vent,
    water,
    wind: wind && !!windData,
    windDirection: windData?.levels[altitude]?.direction ?? 90,
    windSpeed: windData?.levels[altitude]?.speed ?? 10,
    windLevels: windData?.levels ?? [],
    altitude,
    allAltitudes,
    plume,
    measure,
    reset,
    zoom,
    paused,
    mask,
    seal,
    windows,
  };
  const narrative =
    chapter === "history" ? eras[era].description : descriptions[chapter];
  const segments = pathname.split("/").filter(Boolean);
  if (
    !chapters.some((c) => c[0] === chapter) ||
    (segments.length > 1 &&
      !(
        chapter === "history" &&
        segments.length === 2 &&
        ["1883", "anak-krakatau", "2018"].includes(segments[1])
      ))
  )
    return null;
  return (
    <div className="atlas">
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <button
          className="drawer-close"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={18} />
        </button>
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Mountain size={27} strokeWidth={1.5} />
          </span>
          <span>
            KRAKATAU<small>A LIVING EARTH</small>
          </span>
        </Link>
        <div className="nav-label">
          THE FIELD GUIDE <span>01—09</span>
        </div>
        <nav aria-label="Main chapters">
          {chapters.map(([slug, name], i) => {
            const Icon = icons[i];
            return (
              <Link
                href={"/" + slug}
                key={slug}
                className={"nav-link " + (chapter === slug ? "active" : "")}
                aria-current={chapter === slug ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{name}</span>
                <small>{String(i + 1).padStart(2, "0")}</small>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="location-mark">
            <span /> SUNDA STRAIT, INDONESIA
          </div>
          <div className="coordinates">
            6.102° S <span>/</span> 105.423° E
          </div>
          <p>
            One landscape.
            <br />
            An extraordinary story.
          </p>
          <Link href="/sources">
            An independent educational project <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>
      <main
        className={
          "main " +
          (["compare", "sources", "safety", "monitoring"].includes(chapter)
            ? "reading-mode"
            : "")
        }
      >
        <World
          settings={settings}
          onMeasure={setMeasurement}
          onSelect={setSelected}
        />
        <div className="scene-shade" />
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            THE KRAKATAU EXPLORER <span>/</span> <b>{chapters[index][1]}</b>
          </div>
          <button
            className={"atmosphere-button " + (atmosphere ? "selected" : "")}
            onClick={() => setAtmosphere(!atmosphere)}
          >
            <span className="status-dot" />
            <Wind size={15} /> Atmosphere <ChevronDown size={13} />
          </button>
        </header>
        {chapter === "safety" ? (
          <Safety />
        ) : chapter === "monitoring" ? (
          <Monitoring
            data={monitoring}
            loading={monitorLoading}
            error={monitorError}
            retry={getMonitoring}
          />
        ) : ["compare", "sources"].includes(chapter) ? (
          <section className="reading-content">
            <div className="eyebrow">
              {chapter === "compare"
                ? "SCALE & PERSPECTIVE"
                : "SCIENCE, WITH CONTEXT"}
            </div>
            <h1>{chapters[index][2]}</h1>
            {chapter === "compare" ? (
              <>
                <p className="reading-intro">
                  A changing volcano, measured against familiar landmarks.
                </p>
                <div className="comparison-chart">
                  {[
                    {
                      name: "Anak Krakatau",
                      sub: "Before the 2018 collapse",
                      height: 338,
                      color: "orange",
                    },
                    {
                      name: "Eiffel Tower",
                      sub: "Original architectural height",
                      height: 300,
                      color: "mint",
                    },
                    {
                      name: "Monas",
                      sub: "Jakarta",
                      height: 132,
                      color: "mint",
                    },
                    {
                      name: "Human",
                      sub: "Reference height",
                      height: 1.7,
                      color: "mint",
                    },
                  ].map((d) => (
                    <div className="bar-column" key={d.name}>
                      <span className="bar-value">
                        {d.height}
                        <small> m</small>
                      </span>
                      <div
                        className={"chart-bar " + d.color}
                        style={{ height: Math.max(3, d.height * 0.75) }}
                      />
                      <strong>{d.name}</strong>
                      <small>{d.sub}</small>
                    </div>
                  ))}
                </div>
                <p className="fine-print">
                  Height above sea level for Anak Krakatau; structure or person
                  height for references. Different baselines. Pre-collapse
                  estimate: Smithsonian GVP. Not a current height.
                </p>
                <Link className="text-link" href="/history/2018">
                  Explore the 2018 collapse <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <p className="reading-intro">
                  The landscape is a teaching model. Its sources—and its
                  limits—should always be visible.
                </p>
                <div className="provenance-grid">
                  {[
                    [
                      "Observed",
                      "Measurements or direct observations from a named source.",
                    ],
                    [
                      "Reconstructed",
                      "A past landscape inferred from scientific evidence.",
                    ],
                    [
                      "Simulated",
                      "A simplified process, never a hazard forecast.",
                    ],
                    [
                      "Illustrative",
                      "Procedural terrain and visual scale, not survey data.",
                    ],
                  ].map(([a, b]) => (
                    <div key={a}>
                      <span className="tiny-dot" />
                      <h3>{a}</h3>
                      <p>{b}</p>
                    </div>
                  ))}
                </div>
                <div className="source-list">
                  {sources.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div>
                        <small>{s.type}</small>
                        <h3>{s.name}</h3>
                        <p>{s.description}</p>
                      </div>
                      <ArrowUpRight size={21} />
                    </a>
                  ))}
                </div>
                <p className="fine-print">
                  Java and Sumatra coastlines use Natural Earth map data. The
                  small volcanic islands and their relief are reconstructed for
                  teaching. Island arrangement is approximate, relief is
                  exaggerated, and no surveyed elevation model is used. Particle
                  paths and waves illustrate mechanisms; they cannot estimate
                  exposure, inundation, arrival times or evacuation zones.
                </p>
              </>
            )}
          </section>
        ) : (
          <>
            <section
              className={"chapter-intro " + (chapter ? "compact" : "")}
              key={chapter}
            >
              <div className="eyebrow">
                <span />{" "}
                {chapter
                  ? `${String(index + 1).padStart(2, "0")} / ${chapters[index][1].toUpperCase()}`
                  : "A VOLCANO. A COLLAPSE. A NEW BEGINNING."}
              </div>
              <h1>
                {chapter ? (
                  chapters[index][2]
                ) : (
                  <>
                    This is not
                    <br />
                    the original
                    <br />
                    <em>Krakatau.</em>
                  </>
                )}
              </h1>
              <p>
                {chapter
                  ? narrative
                  : "An island born from the sea. A landscape rewritten by fire. Step inside the story of the world’s most extraordinary volcanic archipelago."}
              </p>
              {!chapter ? (
                <>
                  <Link className="primary-button" href="/explore">
                    Explore the landscape <ArrowUpRight size={18} />
                  </Link>
                  <Link href="/history/1883" className="secondary-link">
                    <span className="play-circle">
                      <Play size={11} fill="currentColor" />
                    </span>{" "}
                    Start with the story <span>3 MIN JOURNEY</span>
                  </Link>
                </>
              ) : null}
              {chapter === "explore" && (
                <div className="control-panel">
                  <div className="segmented">
                    {["Surface", "Bathymetry", "X-ray"].map((m) => (
                      <button
                        key={m}
                        className={mode === m ? "chosen" : ""}
                        aria-pressed={mode === m}
                        onClick={() => {
                          setMode(m);
                          setDrain(m === "Bathymetry" ? 90 : 0);
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <label className="range-label">
                    Drain the ocean <span>{drain}%</span>
                    <input
                      aria-label="Drain the ocean"
                      type="range"
                      value={drain}
                      onChange={(e) => setDrain(+e.target.value)}
                    />
                  </label>
                  <Toggle
                    label="Island labels"
                    checked={labels}
                    onChange={() => setLabels(!labels)}
                  />
                  <button
                    className={"utility-action " + (measure ? "selected" : "")}
                    onClick={() => setMeasure(!measure)}
                  >
                    <Ruler size={15} />{" "}
                    {measure ? "Exit distance tool" : "Measure a distance"}
                  </button>
                  {measure && <p className="control-note">{measurement}</p>}
                </div>
              )}
              {chapter === "history" && (
                <div className="history-detail">
                  {(era === 1 || era === 3) && (
                    <div className="segmented">
                      <button
                        aria-pressed={!after}
                        className={!after ? "chosen" : ""}
                        onClick={() => setAfter(false)}
                      >
                        Before collapse
                      </button>
                      <button
                        aria-pressed={after}
                        className={after ? "chosen" : ""}
                        onClick={() => setAfter(true)}
                      >
                        After collapse
                      </button>
                    </div>
                  )}
                  {era === 2 && (
                    <label className="range-label">
                      Build the island{" "}
                      <span>{growth}% of construction sequence</span>
                      <input
                        aria-label="Island construction"
                        type="range"
                        value={growth}
                        onChange={(e) => setGrowth(+e.target.value)}
                      />
                    </label>
                  )}

                  <span className="large-year">{eras[era].year}</span>
                  <h3>{eras[era].name}</h3>
                  <div className="history-links">
                    <Link href="/history/1883">1883 eruption</Link>
                    <Link href="/history/anak-krakatau">Anak Krakatau</Link>
                    <Link href="/history/2018">2018 collapse</Link>
                  </div>
                </div>
              )}
              {chapter === "inside" && (
                <div className="control-panel">
                  <div className="panel-heading">
                    ERUPTION LAB <span>ILLUSTRATIVE</span>
                  </div>
                  <label className="range-label">
                    Gas pressure <span>{pressure}%</span>
                    <input
                      aria-label="Gas pressure"
                      type="range"
                      value={pressure}
                      onChange={(e) => setPressure(+e.target.value)}
                    />
                  </label>
                  <label className="range-label">
                    Magma viscosity <span>{viscosity}%</span>
                    <input
                      aria-label="Magma viscosity"
                      type="range"
                      value={viscosity}
                      onChange={(e) => setViscosity(+e.target.value)}
                    />
                  </label>
                  <Toggle
                    label="Open vent"
                    checked={vent}
                    onChange={() => setVent(!vent)}
                  />
                  <Toggle
                    label="Seawater interaction"
                    checked={water}
                    onChange={() => setWater(!water)}
                  />
                  <button
                    className="primary-button"
                    onClick={() => {
                      setErupt(!erupt);
                      if (era < 2) setEra(4);
                      setHazard(water ? "Ash" : "Ballistics");
                    }}
                  >
                    <Flame size={16} />
                    {erupt ? "Stop eruption" : "Make Krakatau erupt"}
                  </button>
                  <Link className="text-link" href="/hazards">
                    Follow the eruption <ArrowRight size={15} />
                  </Link>
                </div>
              )}
              {chapter === "hazards" && (
                <div className="control-panel">
                  <div className="hazard-options">
                    {hazards.map((h) => (
                      <button
                        key={h}
                        onClick={() => setHazard(h)}
                        className={hazard === h ? "chosen" : ""}
                        aria-pressed={hazard === h}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <p className="control-note">
                    {hazard === "Tsunami"
                      ? "Waves spread from a displaced water mass. Rings do not model wave height or arrival time."
                      : hazard === "Flank collapse"
                        ? "Material enters the sea and displaces water. The resulting waves continue into the tsunami view."
                        : "Simplified motion illustrates the process. No forecast, exclusion radius or exposure estimate."}
                  </p>
                  <Link className="text-link" href="/safety">
                    Follow ash to human scale <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
            {(chapter === "inside" || chapter === "history") && (
              <Learning chapter={chapter} era={era} />
            )}
            <div className="map-coordinate">
              <span>INDIAN OCEAN</span>
              <span>SUNDA STRAIT</span>
            </div>
            <div className="scene-badge">
              <span className="tiny-dot" />{" "}
              {mode === "Surface" ? "ILLUSTRATIVE TERRAIN" : mode.toUpperCase()}{" "}
              <span className="badge-divider" />{" "}
              {eras[era].year === "Today" ? "PRESENT-DAY VIEW" : eras[era].year}
            </div>
            <div className="world-tools">
              <button
                aria-label={
                  region ? "Return to Krakatau" : "Show regional geography"
                }
                aria-pressed={region}
                onClick={() => setRegion(!region)}
              >
                <Globe2 size={18} />
              </button>
              <button aria-label="Zoom in" onClick={() => setZoom(zoom + 1)}>
                <Plus size={18} />
              </button>
              <button aria-label="Zoom out" onClick={() => setZoom(zoom - 1)}>
                <Minus size={18} />
              </button>
              <span />
              <button
                aria-label="Reset camera"
                onClick={() => setReset(reset + 1)}
              >
                <RotateCcw size={17} />
              </button>
              <button
                aria-label="Toggle labels"
                aria-pressed={labels}
                onClick={() => setLabels(!labels)}
              >
                <Eye size={17} />
              </button>
              <button
                aria-label="Fullscreen"
                onClick={() => {
                  if (document.fullscreenElement)
                    document.exitFullscreen().catch(() => {});
                  else
                    document.documentElement
                      .requestFullscreen()
                      .catch(() => {});
                }}
              >
                <Maximize size={16} />
              </button>
            </div>
            <div className="compass">
              <span>N</span>
              <Compass size={48} strokeWidth={0.8} />
              <small>Orientation</small>
            </div>
            <div className="terrain-note">
              <span className="tiny-dot" /> Relief exaggerated for clarity{" "}
              <Link href="/sources">
                About this model <ArrowUpRight size={11} />
              </Link>
            </div>
            <section className="timeline">
              <div className="timeline-caption">
                <History size={16} />
                <div>
                  ONE LANDSCAPE<span>Through time</span>
                </div>
                <button
                  aria-label={tour ? "Pause timeline" : "Play timeline"}
                  onClick={() => {
                    if (!tour && era === 4) setEra(0);
                    setTour(!tour);
                  }}
                >
                  {tour ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
              <div className="era-track">
                {eras.map((e, i) => (
                  <button
                    key={e.year}
                    onClick={() => {
                      setTour(false);
                      setEra(i);
                    }}
                    className={era === i ? "current" : ""}
                    aria-pressed={era === i}
                  >
                    <span className="era-dot" />
                    <strong>{e.year}</strong>
                    <small>
                      {
                        [
                          "Early volcano",
                          "The great eruption",
                          "Anak emerges",
                          "Flank collapse",
                          "Still becoming",
                        ][i]
                      }
                    </small>
                  </button>
                ))}
              </div>
              <span className="timeline-help">
                Change the year.
                <br />
                Watch the world change.
              </span>
            </section>
            <footer className="scene-footer">
              <span>
                <span className="mouse-symbol" /> Drag to orbit <b>·</b> Scroll
                to zoom
              </span>
              <button onClick={() => setPaused(!paused)}>
                {paused ? <Play size={12} /> : <Pause size={12} />}{" "}
                {paused ? "Resume motion" : "Pause motion"}
              </button>
              <span>
                EXPLORE WITH CURIOSITY <ArrowUpRight size={12} />
              </span>
            </footer>
          </>
        )}
        {selected && (
          <div className="island-card">
            <button
              className="close-button"
              aria-label="Close island details"
              onClick={() => setSelected("")}
            >
              <X size={15} />
            </button>
            <small>IN THE SUNDA STRAIT</small>
            <h3>{selected}</h3>
            <p>
              {selected === "Anak Krakatau"
                ? "“Child of Krakatau.” The new volcanic island grew inside the caldera left by the 1883 eruption."
                : selected === "Rakata"
                  ? "The surviving southern remnant of the pre-1883 volcanic island."
                  : selected === "SUMATRA"
                    ? "Lampung forms the northern side of the Sunda Strait."
                    : selected === "JAVA"
                      ? "Banten forms the southeastern side of the Sunda Strait."
                      : `${selected} is part of the island landscape surrounding Krakatau.`}
            </p>
            <Link href="/explore" onClick={() => setSelected("")}>
              Explore this landscape <ArrowUpRight size={13} />
            </Link>
          </div>
        )}
        {atmosphere && (
          <aside className="atmosphere-panel">
            <div className="panel-heading">
              <Wind size={16} /> ATMOSPHERE
              <button
                aria-label="Close atmosphere"
                onClick={() => setAtmosphere(false)}
              >
                <X size={17} />
              </button>
            </div>
            <p>Read the wind above Krakatau.</p>
            {loadingWind && !windData ? (
              <div className="data-message">Loading model wind…</div>
            ) : windError ? (
              <div className="data-message">
                {windError}
                <button onClick={getWind}>Retry</button>
              </div>
            ) : windData ? (
              <>
                <div className="wind-reading">
                  {windData.levels[altitude].speed.toFixed(1)}
                  <small> km/h</small>
                  <Wind size={30} />
                </div>
                <div className="data-timestamp">
                  Model valid:{" "}
                  {new Date(windData.time).toLocaleString("en-GB", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </div>
                <Toggle
                  label="Wind particles"
                  checked={wind}
                  onChange={() => setWind(!wind)}
                />
                <label className="select-label">
                  Wind altitude
                  <select
                    value={altitude}
                    onChange={(e) => setAltitude(+e.target.value)}
                  >
                    {windData.levels.map((l, i) => (
                      <option key={l.label} value={i}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Toggle
                  label="Show all altitudes"
                  checked={allAltitudes}
                  onChange={() => setAllAltitudes(!allAltitudes)}
                />
              </>
            ) : null}
            <div className="panel-rule" />
            <Toggle
              label="Potential ash transport"
              checked={erupt}
              onChange={() => {
                setErupt(!erupt);
                setHazard("Ash");
              }}
            />
            <label className="range-label">
              Plume height <span>{plume} km</span>
              <input
                aria-label="Plume height"
                type="range"
                min="1"
                max="12"
                value={plume}
                onChange={(e) => setPlume(+e.target.value)}
              />
            </label>
            <p className="simulation-notice">
              Educational wind-driven simulation, not an ashfall forecast.
            </p>
            <div className="panel-rule" />
            <div className="official-ash-panel">
              <div className="panel-heading">OFFICIAL ASH · DARWIN VAAC</div>
              {monitorLoading && !monitoring ? (
                <p className="control-note">Checking advisory feed…</p>
              ) : monitoring?.ash.report ? (
                <>
                  <p className="data-timestamp">
                    Advisory {monitoring.ash.report.number}
                    <br />
                    Issued: {stamp(monitoring.ash.report.issuedAt)}
                  </p>
                  <label className="select-label">
                    Official layer
                    <select
                      aria-label="Official ash layer"
                      value={ashLayer}
                      onChange={(e) => setAshLayer(+e.target.value)}
                    >
                      <option value={-1}>Off</option>
                      {monitoring.ash.report.layers.map((l, i) => (
                        <option value={i} key={l.name}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {ashLayer >= 0 && (
                    <p className="simulation-notice">
                      {monitoring.ash.report.layers[ashLayer]?.name} at{" "}
                      {stamp(monitoring.ash.report.layers[ashLayer]?.time)}.
                      Fixed advisory geometry; never advanced with current wind.{" "}
                      {Date.now() -
                        Date.parse(
                          monitoring.ash.report.layers[ashLayer]?.time ?? "",
                        ) >
                      21600000
                        ? "Historical layer: more than 6 hours old."
                        : ""}
                    </p>
                  )}
                  <p className="control-note">
                    Polygons are drawn at their upper flight level. Their
                    geographic coverage can extend far beyond this view. No
                    polygon does not mean no ash.
                  </p>
                </>
              ) : (
                <p className="control-note">
                  {monitoring?.ash.message ||
                    monitorError ||
                    "No Krakatau advisory found in the retrieved feed. This is not an all-clear."}
                </p>
              )}
              <Link
                className="text-link"
                href="/monitoring"
                onClick={() => setAtmosphere(false)}
              >
                Read official reports <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="attribution">
              Wind: Open-Meteo · model data · CC BY 4.0
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
