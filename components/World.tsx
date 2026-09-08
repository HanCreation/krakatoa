"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import coastlines from "../public/data/sunda-coastlines.json";
import { coastlineGeometry, project } from "../lib/geography";
import { terrainState } from "../lib/history";
import type { AshPolygon } from "../lib/feeds";
export type WorldSettings = {
  after: boolean;
  growth: number;
  region: boolean;
  ashPolygons: AshPolygon[];
  chapter: string;
  era: number;
  mode: string;
  drain: number;
  labels: boolean;
  hazard: string;
  erupt: boolean;
  pressure: number;
  viscosity: number;
  vent: boolean;
  water: boolean;
  wind: boolean;
  windDirection: number;
  windSpeed: number;
  windLevels: { direction: number; speed: number }[];
  altitude: number;
  allAltitudes: boolean;
  plume: number;
  measure: boolean;
  reset: number;
  zoom: number;
  paused: boolean;
  mask: string;
  seal: boolean;
  windows: boolean;
};
type Props = {
  settings: WorldSettings;
  onMeasure: (value: string) => void;
  onSelect: (name: string) => void;
};
function noise(x: number, y: number) {
  const hash = (a: number, b: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = x - ix,
    fy = y - iy,
    u = fx * fx * (3 - 2 * fx),
    v = fy * fy * (3 - 2 * fy);
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), u),
    THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), u),
    v,
  );
}
function terrain(radius: number, height: number, seed: number, crater = false) {
  const g = new THREE.PlaneGeometry(radius * 2.5, radius * 2.5, 100, 100);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const colors = [];
  const color = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i),
      a = Math.atan2(z, x),
      r = Math.hypot(x, z) / radius;
    const edge =
      1 + 0.1 * Math.sin(a * 5 + seed) + 0.06 * Math.sin(a * 9 + seed * 2);
    const rough =
      noise(x * 2 + seed, z * 2) * 0.12 +
      noise(x * 5 + seed, z * 5) * 0.06 +
      noise(x * 12, z * 12) * 0.025;
    const ridge =
      (Math.sin(a * 19 + r * 4 + noise(x, z) * 3 + seed) * 0.5 + 0.5) * 0.07 +
      rough;
    let h = Math.pow(Math.max(0, 1 - r / edge), 1.35) * height;
    if (crater) h -= height * 0.45 * Math.exp((-r * r) / 0.018);
    h += ridge * height * Math.max(0, 1 - r);
    if (r > edge) h = -0.16;
    p.setY(i, h - 0.04);
    if (h < 0.025) color.set("#315c59");
    else if (h < 0.09) color.set("#7c8b77");
    else if (crater) {
      color
        .set("#636459")
        .lerp(new THREE.Color("#a5a18b"), Math.min(h / height, 1));
    } else {
      color.set("#3d6553").lerp(new THREE.Color("#788066"), h / height);
    }
    color.multiplyScalar(0.78 + noise(x * 4 + seed, z * 4) * 0.3);
    colors.push(color.r, color.g, color.b);
  }
  const original = g.index!;
  const indices: number[] = [];
  for (let i = 0; i < original.count; i += 3) {
    const a = original.getX(i),
      b = original.getX(i + 1),
      c = original.getX(i + 2);
    if (p.getY(a) > -0.19 && p.getY(b) > -0.19 && p.getY(c) > -0.19)
      indices.push(a, b, c);
  }
  g.setIndex(indices);
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
export default function World({ settings, onMeasure, onSelect }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const config = useRef(settings);
  const callbacks = useRef({ onMeasure, onSelect });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    config.current = settings;
    callbacks.current = { onMeasure, onSelect };
  }, [settings, onMeasure, onSelect]);
  useEffect(() => {
    const el = mount.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor("#10282e");
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = true;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#10282e", 0.003);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 700);
    camera.position.set(24, 28, 42);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-2, 0, 0);
    controls.enableDamping = true;
    controls.minDistance = 6;
    controls.maxDistance = 260;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.enablePan = true;
    scene.add(new THREE.HemisphereLight("#e5eee0", "#132c34", 2));
    const sun = new THREE.DirectionalLight("#fff4cd", 3);
    sun.position.set(-12, 20, 9);
    scene.add(sun);
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader:
        "varying vec3 v; void main(){v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:
        "varying vec3 v; uniform float time; void main(){float n=sin(v.x*11.0+v.z*8.0+time*.6)*sin(v.z*19.0-v.x*3.0+time*.4); float s=pow(max(0.0,n),14.0); float grid=step(.988,fract(v.x/5.0))*.022+step(.988,fract(v.z/5.0))*.022; vec3 c=vec3(.061,.164,.188)+s*.024+grid;gl_FragColor=vec4(c,1.0);}",
    });
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      oceanMaterial,
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.045;
    scene.add(ocean);
    const bedGeometry = new THREE.CircleGeometry(8, 90, 0, Math.PI * 2);
    bedGeometry.rotateX(-Math.PI / 2);
    const bp = bedGeometry.attributes.position;
    for (let i = 0; i < bp.count; i++) {
      const r = Math.hypot(bp.getX(i), bp.getZ(i));
      bp.setY(i, r < 1 ? -2.4 : -0.4);
    }
    bedGeometry.computeVertexNormals();
    const bed = new THREE.Mesh(
      bedGeometry,
      new THREE.MeshStandardMaterial({
        color: "#325457",
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    scene.add(bed);
    const islands: THREE.Mesh[] = [];
    const labels: {
      el: HTMLButtonElement;
      point: THREE.Vector3;
      regional: boolean;
      name: string;
    }[] = [];
    function island(
      name: string,
      x: number,
      z: number,
      r: number,
      h: number,
      seed: number,
      crater = false,
      regional = false,
    ) {
      const m = new THREE.Mesh(
        terrain(r, h, seed, crater),
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.96,
          side: THREE.DoubleSide,
        }),
      );
      m.position.set(x, 0, z);
      m.userData.name = name;
      scene.add(m);
      islands.push(m);
      const b = document.createElement("button");
      b.className =
        "world-label" +
        (crater ? " primary-label" : "") +
        (regional ? " region-label" : "");
      b.textContent = name;
      b.onclick = () => callbacks.current.onSelect(name);
      el.appendChild(b);
      labels.push({
        el: b,
        point:
          name === "JAVA"
            ? new THREE.Vector3(14, 3, 9)
            : new THREE.Vector3(x, regional ? 1 : h + 0.3, z),
        regional,
        name,
      });
      return m;
    }
    const anak = island("Anak Krakatau", 0, -0.7, 1.4, 1.7, 2, true);
    island("Rakata", 2.2, 3.9, 3.0, 3.0, 5);
    island("Sertung", -4, -1, 2.45, 1.45, 8).scale.z = 1.5;
    island("Panjang", 3.3, -3, 1.2, 1.0, 12).scale.z = 1.8;
    island("Sebesi", 9.1, -14, 3, 2.8, 10);
    for (const polygon of coastlines.polygons) {
      const mesh = new THREE.Mesh(
        coastlineGeometry(polygon.coordinates),
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 1,
          side: THREE.DoubleSide,
        }),
      );
      scene.add(mesh);
      const b = document.createElement("button");
      b.className = "world-label region-label";
      b.textContent = polygon.name.toUpperCase();
      b.onclick = () => callbacks.current.onSelect(polygon.name.toUpperCase());
      el.appendChild(b);
      const [x, z] =
        polygon.name === "Java" ? project(105.9, -6.5) : project(105.3, -5.5);
      labels.push({
        el: b,
        point: new THREE.Vector3(x, 2, z),
        regional: true,
        name: polygon.name.toUpperCase(),
      });
    }
    const groupLabel = document.createElement("button");
    groupLabel.className = "world-label primary-label";
    groupLabel.textContent = "Krakatau";
    groupLabel.onclick = () => callbacks.current.onSelect("Krakatau");
    el.appendChild(groupLabel);
    labels.push({
      el: groupLabel,
      point: new THREE.Vector3(0, 1, 0),
      regional: false,
      name: "Krakatau",
    });
    const danan = island("Danan", 1, 1.2, 1.5, 2.1, 44);
    const perbuwatan = island("Perbuwatan", 0.2, -1.2, 1.4, 1.3, 45);
    const ashGroup = new THREE.Group();
    scene.add(ashGroup);
    let lastAsh = "";

    const oldCone = new THREE.Mesh(
      terrain(3.3, 2.1, 41),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    );
    oldCone.position.set(1, 0, 1.5);
    scene.add(oldCone);
    const caldera = new THREE.Mesh(
      new THREE.RingGeometry(5.8, 5.84, 100),
      new THREE.MeshBasicMaterial({
        color: "#90b7a1",
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    );
    caldera.rotation.x = -Math.PI / 2;
    caldera.position.y = 0.05;
    scene.add(caldera);
    const inside = new THREE.Group();
    scene.add(inside);
    const chamber = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 24),
      new THREE.MeshStandardMaterial({
        color: "#ff6b2d",
        emissive: "#f43d08",
        emissiveIntensity: 1.6,
      }),
    );
    chamber.scale.set(1.45, 0.65, 1);
    chamber.position.set(0, -1.3, -0.7);
    inside.add(chamber);
    const conduit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.3, 2, 20),
      new THREE.MeshStandardMaterial({
        color: "#ff9949",
        emissive: "#f64a1d",
        emissiveIntensity: 1.4,
      }),
    );
    conduit.position.set(0, -0.2, -0.7);
    inside.add(conduit);
    const count = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: "#c6c6b9",
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      }),
    );
    scene.add(particles);
    const windGeometry = new THREE.BufferGeometry();
    const windPositions = new Float32Array(600 * 3);
    windGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(windPositions, 3),
    );
    const winds = new THREE.LineSegments(
      windGeometry,
      new THREE.LineBasicMaterial({
        color: "#9bc9ba",
        transparent: true,
        opacity: 0.38,
      }),
    );
    scene.add(winds);
    const waves = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1, 1.025, 100),
        new THREE.MeshBasicMaterial({
          color: "#c7eee5",
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04 + i * 0.005;
      waves.add(ring);
    }
    scene.add(waves);
    let start: THREE.Vector3 | null = null;
    const measureLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: "#ff8a50" }),
    );
    scene.add(measureLine);
    const ray = new THREE.Raycaster();
    let down = { x: 0, y: 0 };
    const pointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const pointerUp = (e: PointerEvent) => {
      if (
        !config.current.measure ||
        Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5
      )
        return;
      const rect = el.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hits = ray.intersectObjects([...islands, ocean]);
      if (!hits.length) return;
      const p = hits[0].point;
      if (!start) {
        start = p.clone();
        callbacks.current.onMeasure("Choose the second point");
      } else {
        measureLine.geometry.dispose();
        measureLine.geometry = new THREE.BufferGeometry().setFromPoints([
          start.clone().add(new THREE.Vector3(0, 0.15, 0)),
          p.clone().add(new THREE.Vector3(0, 0.15, 0)),
        ]);
        callbacks.current.onMeasure(
          `${Math.hypot(start.x - p.x, start.z - p.z).toFixed(2)} km · approximate map distance`,
        );
        start = null;
      }
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    let frame = 0,
      time = 0,
      last = performance.now(),
      lastReset = 0,
      lastZoom = 0,
      lastChapter = "__initial";
    let lastRegion = false;
    let transition = 0;
    let destination = new THREE.Vector3(14, 16, 23),
      target = new THREE.Vector3(-2, 0, 0);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const now = performance.now(),
        delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = config.current;
      if (!s.paused && !reduce) time += delta;
      if (
        s.chapter !== lastChapter ||
        s.reset !== lastReset ||
        s.region !== lastRegion
      ) {
        lastChapter = s.chapter;
        lastRegion = s.region;
        lastReset = s.reset;
        destination = s.region
          ? new THREE.Vector3(60, 120, 135)
          : s.chapter === "inside"
            ? new THREE.Vector3(7, 6, 11)
            : s.chapter === "safety"
              ? new THREE.Vector3(12, 5, 13)
              : s.chapter === "monitoring"
                ? new THREE.Vector3(9, 11, 17)
                : new THREE.Vector3(14, 16, 23);
        target = s.region
          ? new THREE.Vector3(10, 0, 10)
          : s.chapter === "safety"
            ? new THREE.Vector3(7, 1, 5)
            : new THREE.Vector3(-2, 0, 0);
        transition = 1;
      }
      if (transition > 0.005) {
        camera.position.lerp(destination, reduce ? 1 : 0.045);
        controls.target.lerp(target, reduce ? 1 : 0.045);
        transition *= 0.95;
      }
      if (s.zoom !== lastZoom) {
        camera.position
          .sub(controls.target)
          .multiplyScalar(s.zoom > lastZoom ? 0.8 : 1.25)
          .add(controls.target);
        lastZoom = s.zoom;
        transition = 0;
      }
      controls.update();
      const compass =
        el.parentElement?.querySelector<SVGElement>(".compass svg");
      if (compass)
        compass.style.transform = `rotate(${(-controls.getAzimuthalAngle() * 180) / Math.PI}deg)`;
      const cut = s.mode === "X-ray" || s.chapter === "inside";
      inside.visible = cut;
      ocean.position.y = THREE.MathUtils.lerp(
        ocean.position.y,
        cut ? -2.7 : -0.045 - s.drain * 0.025,
        0.07,
      );
      islands.forEach((m) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.transparent = cut;
        mat.opacity = cut ? 0.35 : 1;
        mat.wireframe = s.mode === "X-ray";
        mat.clippingPlanes =
          s.chapter === "inside" && m === anak
            ? [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)]
            : [];
      });
      bed.visible = !cut;
      const state = terrainState(s.era, s.after, s.growth);
      bed.visible = !cut && state.caldera;
      anak.visible = state.anak;
      islands
        .filter((m) =>
          ["Rakata", "Sertung", "Panjang"].includes(m.userData.name),
        )
        .forEach((m) => {
          m.visible = !state.ancient;
        });
      danan.visible = state.oldPeaks;
      perbuwatan.visible = state.oldPeaks;
      anak.scale.y = THREE.MathUtils.lerp(
        anak.scale.y,
        state.anakHeight,
        0.045,
      );
      oldCone.scale.y = THREE.MathUtils.lerp(
        oldCone.scale.y,
        state.ancient ? 2 : state.oldPeaks ? 1 : 0.001,
        0.055,
      );
      oldCone.visible = oldCone.scale.y > 0.005;
      caldera.visible =
        state.caldera &&
        (s.chapter === "explore" || s.chapter === "history" || s.drain > 0);
      chamber.scale.y = 0.65 + (Math.sin(time * 2) * s.pressure) / 1000;
      const effect = state.anak && (s.erupt || s.chapter === "hazards");
      particles.visible = effect;
      const mat = particles.material as THREE.PointsMaterial;
      mat.color.set(
        s.hazard === "Lava" || s.hazard === "Ballistics"
          ? "#ff8244"
          : s.hazard === "Volcanic gas"
            ? "#abc887"
            : "#ccc9bc",
      );
      const height = s.plume * 0.7;
      for (let i = 0; i < count; i++) {
        const phase =
          (time *
            (0.09 + s.pressure * 0.001) *
            (s.vent ? 1 : 0.45) *
            (1 - s.viscosity * 0.005) +
            i / count) %
          1;
        const angle = i * 2.399;
        let x = Math.cos(angle) * phase * 0.65,
          y = 1 + phase * height * (s.water ? 1.35 : 1),
          z = -0.7 + Math.sin(angle) * phase * 0.65;
        if (s.hazard === "Ballistics") {
          x = Math.cos(angle) * phase * 4;
          y = 1 + Math.sin(phase * Math.PI) * 3;
          z = -0.7 + Math.sin(angle) * phase * 4;
        } else if (
          ["Lava", "Pyroclastic flow", "Flank collapse"].includes(s.hazard)
        ) {
          x = Math.cos(angle * 0.2) * phase * 5;
          y = Math.max(0.1, 1.2 - phase * 2);
          z = -0.7 + phase * 4;
        } else {
          const heights = [0, 1.5, 3, 5.5, 9, 12];
          const particleAltitude = phase * s.plume;
          const level = heights.reduce(
            (best, h, j) =>
              Math.abs(h - particleAltitude) <
              Math.abs(heights[best] - particleAltitude)
                ? j
                : best,
            0,
          );
          const wind = s.windLevels[level];
          const direction = (((wind?.direction ?? 90) + 180) * Math.PI) / 180;
          const drift = wind ? wind.speed * 0.12 : 3;
          x += Math.sin(direction) * phase * phase * drift;
          z -= Math.cos(direction) * phase * phase * drift;
          y += Math.sin(i * 9) * phase * 0.6;
        }
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      particleGeometry.attributes.position.needsUpdate = true;
      winds.visible = s.wind;
      for (let i = 0; i < 300; i++) {
        const level = s.allAltitudes ? i % 6 : s.altitude;
        const data = s.windLevels[level] ?? {
          direction: s.windDirection,
          speed: s.windSpeed,
        };
        const a = ((data.direction + 180) * Math.PI) / 180,
          wx = Math.sin(a),
          wz = -Math.cos(a);
        const travel = time * data.speed * 0.03;
        const wrap = (n: number, size: number) =>
          (((n % size) + size) % size) - size / 2;
        const x = wrap(i * 7.1 + travel * wx, 35),
          z = wrap(i * 11.3 + travel * wz, 27),
          y = 0.3 + level * 1.3;
        windPositions.set([x, y, z, x + wx * 0.4, y, z + wz * 0.4], i * 6);
      }
      windGeometry.attributes.position.needsUpdate = true;
      waves.visible =
        effect && (s.hazard === "Tsunami" || s.hazard === "Flank collapse");
      waves.children.forEach((w, i) => {
        const scale = 1 + ((time * 0.9 + i * 3) % 15);
        w.scale.setScalar(scale);
      });
      const ashKey = JSON.stringify(s.ashPolygons);
      if (ashKey !== lastAsh) {
        lastAsh = ashKey;
        for (const o of [...ashGroup.children]) {
          const m = o as THREE.Mesh;
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
          ashGroup.remove(m);
        }
        for (const polygon of s.ashPolygons) {
          const shape = new THREE.Shape(
            polygon.coordinates.map(([lon, lat]) => {
              const [x, z] = project(lon, lat);
              return new THREE.Vector2(x, -z);
            }),
          );
          const g = new THREE.ShapeGeometry(shape);
          g.rotateX(-Math.PI / 2);
          const mesh = new THREE.Mesh(
            g,
            new THREE.MeshBasicMaterial({
              color: "#e9b28e",
              transparent: true,
              opacity: 0.17,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          mesh.position.y = Math.max(0.3, polygon.topMeters / 1000);
          ashGroup.add(mesh);
        }
      }
      labels.forEach((l) => {
        const p = l.point.clone().project(camera);
        const regionalView = camera.position.distanceTo(controls.target) > 55;
        const semanticVisible =
          l.name === "Krakatau"
            ? regionalView
            : regionalView
              ? ["SUMATRA", "JAVA", "Sebesi"].includes(l.name)
              : true;
        const historicalVisible =
          l.name === "Anak Krakatau"
            ? state.anak
            : ["Danan", "Perbuwatan"].includes(l.name)
              ? state.oldPeaks
              : state.ancient
                ? !["Rakata", "Sertung", "Panjang"].includes(l.name)
                : true;
        const visible =
          semanticVisible &&
          historicalVisible &&
          s.labels &&
          p.z < 1 &&
          Math.abs(p.x) < 0.95 &&
          Math.abs(p.y) < 0.9;
        l.el.style.display = visible ? "block" : "none";
        l.el.style.left = `${(p.x * 0.5 + 0.5) * el.clientWidth}px`;
        l.el.style.top = `${(-p.y * 0.5 + 0.5) * el.clientHeight}px`;
      });
      oceanMaterial.uniforms.time.value = time;
      renderer.render(scene, camera);
    };
    tick();
    const stopTransition = () => {
      transition = 0;
    };
    controls.addEventListener("start", stopTransition);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        if (
          o instanceof THREE.Mesh ||
          o instanceof THREE.Points ||
          o instanceof THREE.Line
        ) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      el.replaceChildren();
    };
  }, []);
  return (
    <div
      className="world"
      ref={mount}
      aria-label="Interactive 3D Krakatau landscape"
    >
      {failed && (
        <div className="webgl-error">
          3D requires WebGL. Try a browser with hardware acceleration. All
          chapter text and comparisons remain available.
        </div>
      )}
    </div>
  );
}
