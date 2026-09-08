export const chapters = [
  ["", "Home", "The island that began again."],
  ["explore", "Explore", "Look beneath the blue."],
  ["history", "History", "One place. Many worlds."],
  ["inside", "Inside Krakatau", "A world under pressure."],
  ["hazards", "Hazards", "When the mountain moves."],
  ["safety", "Safety", "Small actions. Real protection."],
  ["monitoring", "Monitoring", "Listening to a living volcano."],
  ["compare", "Compare", "A matter of scale."],
  ["sources", "Sources & about", "Know what you’re looking at."],
] as const;
export const eras = [
  {
    year: "Ancient",
    name: "Before the records",
    description:
      "An older volcanic complex preceded the familiar islands. Its exact shape and collapse date remain uncertain.",
    height: 3.3,
  },
  {
    year: "1883",
    name: "A landscape disappears",
    description:
      "Rakata, Danan and Perbuwatan formed one island. The August 1883 eruption destroyed much of it, leaving a submarine caldera.",
    height: 2.8,
  },
  {
    year: "1927",
    name: "A new beginning",
    description:
      "Eruptions began building a new cone in late 1927. Repeated emergence and erosion preceded the lasting island of Anak Krakatau.",
    height: 0.35,
  },
  {
    year: "2018",
    name: "The flank collapse",
    description:
      "On 22 December, the southwest flank of Anak Krakatau collapsed into the sea and generated a destructive tsunami.",
    height: 1.7,
  },
  {
    year: "Today",
    name: "Still becoming",
    description:
      "Anak Krakatau continues to reshape itself within the caldera of 1883. This terrain is an illustration, not a current survey.",
    height: 1.15,
  },
];
export const sources = [
  {
    name: "Natural Earth",
    type: "REGIONAL COASTLINES · PUBLIC DOMAIN",
    url: "https://www.naturalearthdata.com/",
    description:
      "1:10 million mapped Java and Sumatra coastlines. Relief and the small volcanic islands remain explanatory reconstructions.",
  },
  {
    name: "Badan Geologi",
    type: "OFFICIAL ACTIVITY BULLETINS",
    url: "https://geologi.esdm.go.id/sbg/arsip-berita",
    description:
      "Latest discoverable Krakatau bulletin, with reported time, quoted alert level and original recommendations.",
  },
  {
    name: "Smithsonian · Global Volcanism Program",
    type: "ERUPTIVE HISTORY",
    url: "https://volcano.si.edu/volcano.cfm?vn=262000",
    description:
      "Krakatau chronology, geological setting and eruption reports.",
  },
  {
    name: "British Geological Survey",
    type: "2018 COLLAPSE",
    url: "https://www.bgs.ac.uk/geology-projects/volcanoes/krakatau/",
    description: "Research on the flank collapse and the Sunda Strait tsunami.",
  },
  {
    name: "PVMBG · MAGMA Indonesia",
    type: "OFFICIAL MONITORING",
    url: "https://magma.esdm.go.id/",
    description:
      "Check the official authority for current activity and local restrictions.",
  },
  {
    name: "Darwin Volcanic Ash Advisory Centre",
    type: "OFFICIAL ASH",
    url: "https://www.bom.gov.au/aviation/volcanic-ash/",
    description:
      "Timestamped observed, estimated and forecast ash polygons, retrieved from the official 24-hour advisory feed.",
  },
  {
    name: "Open-Meteo",
    type: "MODEL WIND · CC BY 4.0",
    url: "https://open-meteo.com/en/docs",
    description:
      "Hourly model wind at the surface and five pressure levels; fetched on demand with a ten-minute cache.",
  },
  {
    name: "International Volcanic Health Hazard Network",
    type: "ASH SAFETY",
    url: "https://www.ivhhn.org/ash-protection",
    description:
      "Evidence-based ash exposure and respiratory protection guidance.",
  },
];
export type WindLevel = { label: string; speed: number; direction: number };
export type WindData = { time: string; fetchedAt: string; levels: WindLevel[] };
