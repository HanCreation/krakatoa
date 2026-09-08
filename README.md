# Krakatau — A living earth

An educational atlas with one persistent Three.js landscape and nine Next.js chapters. No paid assets, API keys, database or scheduled jobs are required.

## Development and verification

Use Node.js 22.6 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
npm start
```

The default address is http://localhost:3000. Set PORT before npm start to change it. npm run format formats source files. GitHub Actions runs the tests and production build on pushes and pull requests.

## Live data

GET /api/atmosphere retrieves Open-Meteo wind at the surface and 850, 700, 500, 300 and 200 hPa. A ten-minute cache limits upstream traffic. Invalid, future-only or old model hours are rejected. Pressure-level heights are approximate. Wind is model output at one location, not a measured three-dimensional wind field.

GET /api/monitoring independently retrieves Darwin VAAC’s last-24-hour advisories and discovers Krakatau bulletins from Badan Geologi’s news index. The normalized response is cached for five minutes. An unavailable source does not erase a successful response from the other source. The interface provides manual refresh and refreshes every five minutes while Monitoring or Atmosphere is open.

The latest retrieved bulletin provides its original title, reported time, reported alert level when identifiable, and a short original-language excerpt linked to its source. Refreshing does not turn it into a fresh observation. Bulletins older than 24 hours are identified as dated. MAGMA remains a direct reference link; its hostname can be unavailable independently of Badan Geologi.

Ash observations, estimates and +6/+12/+18-hour forecasts retain separate timestamps and altitude polygons. Multiple altitude bands stay separate. Polygons remain fixed at their advisory coordinates and are drawn at the upper flight level. They are never animated forward using current wind. Missing advisories or unidentifiable ash do not establish an all-clear. No long-term archive is implied.

Both integrations consume public publisher pages because an authenticated stable API was not supplied. Parsing contracts are tested, but publisher changes still require maintenance. Inspect source timestamps and original bulletins when operational decisions matter.

## Geography and historical states

Java and Sumatra use Natural Earth 1:10-million mapped coastlines, clipped to the Sunda Strait region. This is public-domain cartography, not a high-resolution coastal survey. scripts/build-coastlines.py reproducibly extracts the small shipped JSON asset and downloads Natural Earth when its source file is absent. Horizontal coordinates use a local kilometre projection around Krakatau. Regional mode reveals the mainland outlines; island labels simplify at regional scale.

Small volcanic islands, underwater terrain and relief are explanatory reconstructions. Relief is exaggerated. Distances are approximate horizontal model distances, not survey measurements. Ancient geometry is uncertain. Anak Krakatau and its label are absent before 1927. Pre-1883 Danan and Perbuwatan disappear after collapse. Island construction and the 2018 before/after control illustrate processes without inventing annual height measurements.

## Education and safety

Inside explains subduction, magma storage, gas exsolution, viscosity, vent conditions and seawater interaction. History explains accumulation, erosion and collapse. Safety is a dedicated study sheet with interactive mask-layer explanations, certification versus fit, and eyes/home/travel/preparation guidance. Monitoring never substitutes generated earthquake points for observations.

Eruption particles, hazard movement, cutaways and historical morphs teach mechanisms. They do not calculate evacuation zones, ash exposure, wave height, arrival time or eruption probability. Current terrain is not a live elevation survey. Sources and limitations remain visible inside the product.

## Hosting

Import this repository into Vercel with the Next.js preset. No environment variables are needed. Free-tier limits and upstream availability still apply. This repository does not create a public deployment, domain or operational monitoring service. A public release still needs scientific editorial review and an assigned owner for publisher-format changes and feed failures.

## Sources

Natural Earth; Smithsonian Global Volcanism Program; USGS; British Geological Survey; Badan Geologi/PVMBG; Darwin VAAC; Open-Meteo (CC BY 4.0); IVHHN; CDC/NIOSH. Direct links and provenance are provided in the application.
