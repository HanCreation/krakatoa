"use client";
import { useState } from "react";
const topics = [
  [
    "Where magma comes from",
    "Subduction supplies the conditions for melting.",
    "The oceanic Indo-Australian plate descends beneath the Sunda margin. Water and other volatiles released from the descending slab lower the melting temperature of the mantle above it. Some of this melt rises toward the crust. The slab does not simply turn into a tank of lava.",
  ],
  [
    "Storage & pathways",
    "Magma is more than molten rock.",
    "Magma contains liquid melt, crystals and dissolved gases. It can collect in interconnected storage zones and move through fractures called dykes. The glowing reservoir and conduit in this model simplify a much more complex plumbing system; their size and depth are not measured here.",
  ],
  [
    "Gas & eruption",
    "Pressure falls as magma rises.",
    "Gas becomes less soluble as pressure drops toward the surface. Bubbles form and expand. If gas escapes easily, magma may emerge more gently; if gas remains trapped, expansion can fragment magma into ash and larger pieces. The lab controls illustrate these tendencies, not an eruption threshold.",
  ],
  [
    "Viscosity & the vent",
    "Flow resistance changes how gas escapes.",
    "Viscosity describes resistance to flow. Temperature, composition, crystals and bubbles affect it. More resistant magma can retain gas; an obstructed vent can restrict release. No single slider determines whether a real volcano will erupt. Scientists interpret several observations together.",
  ],
  [
    "Water & fragmentation",
    "Seawater can change an eruption.",
    "Hot magma contacting water can transfer heat rapidly, producing steam and fragmenting material. This is called phreatomagmatic activity when new magma interacts with water. Strombolian activity instead involves bursts driven by expanding magmatic gas. Krakatau’s island setting makes both processes important.",
  ],
];
const historyLessons = [
  [
    "An older volcanic system",
    "Before the historical island, earlier construction and collapse shaped this volcanic complex. The detailed form and timing are uncertain. No Anak Krakatau exists in this state. Modern island names are suppressed to avoid presenting the schematic ancient landscape as a surveyed reconstruction.",
    "What survives in the record? Rock deposits, island remnants and later surveys constrain interpretations; they do not uniquely recover every old coastline.",
  ],
  [
    "Three peaks, then a caldera",
    "Before the climactic eruption in August 1883, Rakata, Danan and Perbuwatan belonged to one island. Eruption removed material and collapse lowered much of the island into a caldera. Part of Rakata survived. Anak Krakatau had not yet formed.",
    "Use Before / After to separate the pre-eruption island from the post-collapse sea. Collapse is a loss of land, not the instant birth of Anak Krakatau.",
  ],
  [
    "How a volcano becomes an island",
    "New eruptions began beneath the sea in late 1927. Fragmented material accumulated around the vent. Early islands were repeatedly eroded by waves; continued eruptions eventually built a lasting island. Lava flows and falling tephra added new layers, while waves, gravity and eruptions also removed material.",
    "Move the growth control to add layers through the construction period. This demonstrates accumulation; it is not a yearly height dataset or a constant growth rate.",
  ],
  [
    "Growth can create instability",
    "By 2018, repeated eruptions had built a much larger cone. On 22 December, its southwest flank collapsed into the sea, rapidly displacing water and generating a tsunami. Subsequent eruptive activity further changed the crater and coastline.",
    "Compare the cone before and after collapse. Height loss and sideways flank loss are different measurements; a lower summit alone does not tell you the displaced volume.",
  ],
  [
    "Construction continues",
    "Krakatau grows through repeated additions of lava and fragmented volcanic material. Erosion, landslides and collapse compete with that growth. Each eruptive episode can alter the summit, crater and shoreline.",
    "Today is a modern conceptual landscape, not a live elevation survey. Read the dated official reports in Monitoring to understand current activity.",
  ],
];
export default function Learning({
  chapter,
  era,
}: {
  chapter: string;
  era: number;
}) {
  const [topic, setTopic] = useState(0);
  const h = historyLessons[era];
  return (
    <aside className="learning-card">
      <div className="eyebrow">
        {chapter === "inside"
          ? "READ THE MOUNTAIN"
          : "HOW THE LANDSCAPE CHANGES"}
      </div>
      {chapter === "inside" ? (
        <>
          <div className="topic-tabs">
            {topics.map(([name], i) => (
              <button
                key={name}
                aria-pressed={topic === i}
                className={topic === i ? "chosen" : ""}
                onClick={() => setTopic(i)}
              >
                {name}
              </button>
            ))}
          </div>
          <h2>{topics[topic][1]}</h2>
          <p>{topics[topic][2]}</p>
          <div className="geology-key">
            <span>
              <i className="hot" /> Magma storage
            </span>
            <span>
              <i /> Conduit & fractures
            </span>
            <span>
              <i className="rock" /> Accumulated rock
            </span>
          </div>
          <p className="lesson-boundary">
            Cross-section: conceptual geometry. Not a measured magma reservoir.
          </p>
        </>
      ) : (
        <>
          <h2>{h[0]}</h2>
          <p>{h[1]}</p>
          <div className="learning-prompt">{h[2]}</div>
        </>
      )}
      <a
        className="text-link"
        href={
          chapter === "inside"
            ? "https://www.usgs.gov/faqs/how-do-volcanoes-erupt"
            : "https://volcano.si.edu/volcano.cfm?vn=262000"
        }
        target="_blank"
        rel="noreferrer"
      >
        {chapter === "inside"
          ? "USGS · How volcanoes erupt ↗"
          : "Smithsonian · Krakatau history ↗"}
      </a>
    </aside>
  );
}
