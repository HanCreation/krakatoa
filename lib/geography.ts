import * as THREE from "three";
export const project = (
  longitude: number,
  latitude: number,
): [number, number] => [
  (longitude - 105.423) * 110.7,
  -(latitude + 6.102) * 111.2,
];
export function coastlineGeometry(coordinates: number[][]) {
  const outline = coordinates.map(([lon, lat]) => {
    const [x, z] = project(lon, lat);
    return new THREE.Vector2(x, -z);
  });
  const shape = new THREE.Shape(outline);
  const source = new THREE.ShapeGeometry(shape);
  const p = source.attributes.position,
    index = source.index!;
  const points: number[] = [];
  const colors: number[] = [];
  const distance = (x: number, y: number) => {
    let min = Infinity;
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i],
        b = outline[(i + 1) % outline.length],
        dx = b.x - a.x,
        dy = b.y - a.y;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1),
        ),
      );
      min = Math.min(min, Math.hypot(x - a.x - t * dx, y - a.y - t * dy));
    }
    return min;
  };
  function vertex(v: THREE.Vector2) {
    const coast = distance(v.x, v.y);
    const wave =
      (Math.sin(v.x * 0.16 + v.y * 0.08) +
        Math.sin(v.y * 0.25 - v.x * 0.12) +
        2) /
      4;
    const h = 0.04 + Math.min(coast / 3, 1) * (0.15 + wave * 1.7);
    points.push(v.x, h, -v.y);
    const c = new THREE.Color("#385e50").lerp(
      new THREE.Color("#72846b"),
      wave * 0.7,
    );
    if (coast < 0.25) c.set("#8f9f86");
    colors.push(c.r, c.g, c.b);
  }
  function subdivide(
    a: THREE.Vector2,
    b: THREE.Vector2,
    c: THREE.Vector2,
    depth: number,
  ) {
    if (
      depth < 5 &&
      Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) > 4
    ) {
      const ab = a.clone().add(b).multiplyScalar(0.5),
        bc = b.clone().add(c).multiplyScalar(0.5),
        ca = c.clone().add(a).multiplyScalar(0.5);
      subdivide(a, ab, ca, depth + 1);
      subdivide(ab, b, bc, depth + 1);
      subdivide(ca, bc, c, depth + 1);
      subdivide(ab, bc, ca, depth + 1);
    } else {
      vertex(a);
      vertex(b);
      vertex(c);
    }
  }
  for (let i = 0; i < index.count; i += 3) {
    const v = [0, 1, 2].map(
      (j) =>
        new THREE.Vector2(p.getX(index.getX(i + j)), p.getY(index.getX(i + j))),
    );
    subdivide(v[0], v[1], v[2], 0);
  }
  source.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
