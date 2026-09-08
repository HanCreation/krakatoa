"use client";
import { useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
const masks = {
  N95: {
    title: "Certified filtration. Fit still matters.",
    text: "N95 is a NIOSH certification: at least 95% filtration under its prescribed laboratory test. That is not a guarantee of 95% less exposure on your face. Air can bypass the filter through gaps.",
    layers: [
      [
        "Outer support",
        "A protective, porous cover helps the respirator retain its shape. It is not the principal fine-particle filter.",
      ],
      [
        "Filter medium",
        "A dense web of very fine fibres captures particles by interception, impaction and diffusion. Electrostatic attraction can also assist capture.",
      ],
      [
        "Inner lining",
        "A softer contact layer supports comfort against the face. The complete respirator—not an isolated layer—is certified.",
      ],
    ],
    note: "Construction varies by manufacturer. This is a typical arrangement, not a universal three-layer specification.",
  },
  Surgical: {
    title: "A filter with an open route around it.",
    text: "Medical masks are designed primarily as a barrier for droplets and splashes. Filter quality varies. Their loose edges generally make them less reliable against inhaled fine ash than a well-fitted certified respirator.",
    layers: [
      [
        "Outer barrier",
        "Often a fluid-resistant, nonwoven cover. Splash resistance is not proof of protection from fine airborne particles.",
      ],
      [
        "Middle filter",
        "A nonwoven filter can capture some particles passing through the material. Performance depends on the product.",
      ],
      [
        "Inner lining",
        "A skin-facing layer helps manage moisture and comfort. It does not seal the mask to the face.",
      ],
    ],
    note: "Even a good filter cannot capture air that flows around the edges.",
  },
  Cloth: {
    title: "Material and weave make a difference.",
    text: "Cloth coverings have no consistent respirator-level filtration standard. More layers may improve filtering, but can also increase breathing resistance. Gaps, weave and material all affect protection.",
    layers: [
      [
        "Outer fabric",
        "Fabric type, thread spacing and wear determine how easily particles pass.",
      ],
      [
        "Additional fabric",
        "An extra layer can reduce some penetration; it does not turn cloth into a certified respirator.",
      ],
      [
        "Face-facing fabric",
        "A comfortable layer still needs a close fit. A loose edge remains an unfiltered air path.",
      ],
    ],
    note: "Do not assume a cloth covering provides protection equivalent to an N95.",
  },
  None: {
    title: "Reduce exposure at its source.",
    text: "Without a mask, there is no filtering barrier between airborne ash and your nose or mouth. Going indoors and avoiding dusty activities can reduce exposure.",
    layers: [],
    note: "A mask is one part of protection. Follow local instructions and reduce time in ash.",
  },
};
export default function Safety() {
  const [type, setType] = useState<keyof typeof masks>("N95"),
    [layer, setLayer] = useState(1),
    [fit, setFit] = useState(true),
    [tab, setTab] = useState("Respiratory protection");
  const m = masks[type];
  return (
    <section
      className="study-sheet safety-sheet"
      aria-label="Ash safety field guide"
    >
      <Link
        href="/hazards"
        className="sheet-close"
        aria-label="Close safety guide"
      >
        <X size={20} />
      </Link>
      <div className="eyebrow">06 / SAFETY FIELD GUIDE</div>
      <h1>Understand your protection.</h1>
      <p className="sheet-lead">
        Ash is tiny fragments of rock, minerals and volcanic glass. Protection
        depends on how it reaches you.
      </p>
      <div className="lesson-tabs">
        {["Respiratory protection", "Eyes & home", "Travel & preparation"].map(
          (t) => (
            <button
              key={t}
              aria-pressed={tab === t}
              className={tab === t ? "chosen" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      {tab === "Respiratory protection" ? (
        <>
          <div className="mask-tabs">
            {Object.keys(masks).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t as keyof typeof masks);
                  setLayer(1);
                }}
                aria-pressed={type === t}
                className={type === t ? "chosen" : ""}
              >
                {t === "None" ? "No mask" : t}
              </button>
            ))}
          </div>
          <div className="mask-lesson">
            <div className="mask-illustration">
              <span className="diagram-caption">
                EXPLODED FILTER · SCHEMATIC
              </span>
              <div className="filter-stack">
                {m.layers.map(([name], i) => (
                  <button
                    key={name}
                    aria-label={"Inspect " + name}
                    aria-pressed={layer === i}
                    className={
                      "filter-layer layer-" +
                      i +
                      (layer === i ? " selected" : "")
                    }
                    onClick={() => setLayer(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </button>
                ))}
                {type === "None" && (
                  <span className="no-filter">No filtering barrier</span>
                )}
              </div>
              <div className="filter-direction">
                Outside air <span>↓</span> Face
              </div>
              <p>{m.note}</p>
            </div>
            <div>
              <h2>{m.title}</h2>
              <p>{m.text}</p>
              {m.layers.length > 0 && (
                <div className="layer-detail">
                  <small>
                    LAYER {layer + 1} / {m.layers.length}
                  </small>
                  <h3>{m.layers[layer][0]}</h3>
                  <p>{m.layers[layer][1]}</p>
                </div>
              )}
              <button
                className="fit-control"
                role="switch"
                aria-checked={fit}
                onClick={() => setFit(!fit)}
              >
                <span>Face seal</span>
                <strong>{fit ? "Close fit" : "Loose fit"}</strong>
                <span className={"switch " + (fit ? "on" : "")}>
                  <i />
                </span>
              </button>
              <p className="fit-explanation">
                {fit
                  ? "A close fit helps direct inhaled air through the material. Follow the manufacturer’s fitting and seal-check instructions each time."
                  : "A gap at the nose, cheeks or chin lets ash-laden air bypass the filter. Facial hair crossing the seal can compromise a tight-fitting respirator."}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="safety-articles">
          {(tab === "Eyes & home"
            ? [
                [
                  "Protect your eyes",
                  "Ash can irritate eyes. Use protective goggles for dusty work; ordinary spectacles do not seal around the eyes. Avoid contact lenses when ash is present.",
                ],
                [
                  "Keep ash outside",
                  "Close doors and windows where possible. Limit tracking ash indoors on shoes and clothing. Keep drinking water and food covered.",
                ],
                [
                  "A loaded roof is a structural problem",
                  "Wet ash can be substantially heavier than dry ash. Do not climb onto an ash-loaded roof. Seek local building or emergency advice before removal.",
                ],
              ]
            : [
                [
                  "Avoid unnecessary driving",
                  "Ash reduces visibility, can make roads slippery and becomes airborne again when vehicles pass. Keep windows shut and follow road closures.",
                ],
                [
                  "Prepare before ash arrives",
                  "Keep appropriate masks, eye protection, drinking water, medicines, a torch and reliable communications available. Plan for children, older people and those with breathing conditions.",
                ],
                [
                  "Follow official local instructions",
                  "Conditions and exclusion zones change. Check PVMBG, BNPB and your local BPBD. An educational website cannot decide when a particular place is safe.",
                ],
              ]
          ).map(([title, text]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      )}
      <footer className="lesson-source">
        Guidance:{" "}
        <a
          href="https://www.ivhhn.org/ash-protection"
          target="_blank"
          rel="noreferrer"
        >
          IVHHN ash protection <ArrowUpRight size={12} />
        </a>
        <a
          href="https://www.cdc.gov/niosh/ppe/respirators/ffr.html"
          target="_blank"
          rel="noreferrer"
        >
          NIOSH respirators <ArrowUpRight size={12} />
        </a>
        <span>
          Diagrams explain mechanisms; they do not predict an individual’s
          exposure.
        </span>
      </footer>
    </section>
  );
}
