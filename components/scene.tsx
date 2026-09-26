"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// World units the camera descends from the hero (y=0) to the final section.
const DEPTH = 34;
const BG = "#0c1017";

// Accent light per stretch of the journey: title-screen gold → Greenpath →
// Crystal Peak → Grimm → Radiance.
const STOPS: [number, THREE.Color][] = [
  [0, new THREE.Color("#ffd9a0")],
  [0.3, new THREE.Color("#5fe0c6")],
  [0.55, new THREE.Color("#c08cff")],
  [0.8, new THREE.Color("#ff5a6e")],
  [1, new THREE.Color("#ffd38a")],
];

function paletteAt(t: number, out: THREE.Color) {
  for (let i = 1; i < STOPS.length; i++) {
    const [b, cb] = STOPS[i];
    const [a, ca] = STOPS[i - 1];
    if (t <= b) return out.copy(ca).lerp(cb, (t - a) / (b - a));
  }
  return out.copy(STOPS[STOPS.length - 1][1]);
}

// Seeded PRNG: keeps render pure and the scene layout identical on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const scroll = { target: 0, smooth: 0, max: 1 };

// Page height is measured only on resize; reading scrollHeight every frame
// forces a layout per frame, which is what made phone scrolling stutter.
function measure() {
  scroll.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  onScroll();
}
function onScroll() {
  scroll.target = Math.min(1, window.scrollY / scroll.max);
}

// Phones: lighter rendering (lower resolution, no MSAA).
const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

// --- The Knight -----------------------------------------------------------
// Rigged Blender model (source/The_Knight-1_0.blend) exported to GLB with its
// pose baked in. Blender's toon node groups don't survive glTF, so materials
// are reassigned by name: flat toon shading, plus the model's own solidify
// shells ("Cell"/"Outline") rendered as black ink outlines.

const INK = "#07080c";

function toonRamp() {
  const data = new Uint8Array([90, 170, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function knightMaterials(accent: THREE.Color) {
  const ramp = toonRamp();
  const toon = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: ramp });
  const mask = toon("#e8edf7");
  mask.emissive = accent;
  mask.emissiveIntensity = 0.05;
  const ink = new THREE.MeshBasicMaterial({ color: INK });
  return {
    Toon_Shader: mask, // head / mask
    "Toon_Shader.001": ink, // eyes + body
    "Toon_Shader.002": toon("#323b50"), // cloak
    "Toon_Shader.003": toon("#323b50"),
    Nail: toon("#b9c2d9"),
    Cell: ink,
    Outline: ink,
  } as Record<string, THREE.Material>;
}

function KnightMask({ accent }: { accent: THREE.Color }) {
  const group = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();
  const gltf = useLoader(GLTFLoader, "/models/knight.glb");
  const model = useMemo(() => {
    const mats = knightMaterials(accent);
    const root = gltf.scene.clone(true);
    // Head only: drop the body, cloak and nail.
    for (const child of [...root.children]) {
      if (child.name !== "Head" && child.name !== "Eyes") child.removeFromParent();
    }
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const name = (mesh.material as THREE.Material).name;
      mesh.material = mats[name] ?? mats.Toon_Shader;
    });
    return root;
  }, [gltf, accent]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = scroll.smooth;
    const mobile = viewport.width < 6;
    const hero = THREE.MathUtils.smoothstep(s, 0, 0.12);

    // Hero: big and to the right of the headline. After: a companion that sweeps
    // side to side, receding into the fog so it never fights the copy.
    const sweep = Math.sin(s * Math.PI * 3) * (mobile ? 0.8 : 3);
    const x = THREE.MathUtils.lerp(mobile ? 0 : 2.1, sweep, hero);
    const z = THREE.MathUtils.lerp(mobile ? -3.4 : 0, mobile ? -5 : -3.5, hero);
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 0.9) * 0.08;
    // Finale: settle into the lower half of the Radiance ring, clear of the CTA.
    const finale = THREE.MathUtils.smoothstep(s, 0.85, 1) * (mobile ? 2 : 1.35);
    const y = camera.position.y + THREE.MathUtils.lerp(mobile ? 1.7 : 0.15, 0.1, hero) + bob - finale;

    g.position.x = THREE.MathUtils.damp(g.position.x, x, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, y, 6, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, z, 3, dt);

    // Mostly face the viewer (the mask is the point); scroll adds a turn and a
    // gentle look toward the middle of the screen.
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      -g.position.x * 0.12 + state.pointer.x * 0.35 + Math.sin(s * Math.PI * 4) * 0.6,
      4,
      dt,
    );
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.15, 4, dt);
    g.rotation.z = Math.sin(t * 0.6) * 0.04;
  });

  return (
    <group ref={group} scale={1.25}>
      {/* Model origin is at its feet; shift so the pivot is the middle of the head. */}
      <primitive object={model} position={[0, -2.05, 0]} />
    </group>
  );
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function SoulMotes({ accent, count }: { accent: THREE.Color; count: number }) {
  const points = useRef<THREE.Points>(null);
  const [positions, map] = useMemo(() => {
    const rand = seeded(7);
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rand() - 0.5) * 16;
      p[i * 3 + 1] = 6 - rand() * (DEPTH + 12);
      p[i * 3 + 2] = -rand() * 10 + 2;
    }
    return [p, dotTexture()];
  }, [count]);

  useFrame((state, dt) => {
    const pts = points.current;
    if (!pts) return;
    pts.rotation.y += dt * 0.02;
    pts.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    (pts.material as THREE.PointsMaterial).color.copy(accent);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        size={0.12}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Crystals() {
  const group = useRef<THREE.Group>(null);
  const shards = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: 18 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        return {
          pos: [side * (3 + rand() * 3), -6 - rand() * (DEPTH - 6), -1 - rand() * 4] as const,
          scale: 0.3 + rand() * 0.6,
          spin: 0.2 + rand() * 0.6,
          tilt: rand() * Math.PI,
        };
      });
  }, []);
  const last = useRef(0);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // Scroll velocity gives the shards a kick, then they settle back to idle spin.
    const v = Math.abs(scroll.smooth - last.current) / Math.max(dt, 1e-3);
    last.current = scroll.smooth;
    g.children.forEach((m, i) => {
      m.rotation.y += dt * shards[i].spin * (1 + v * 40);
      m.rotation.x += dt * 0.1;
    });
  });

  return (
    <group ref={group}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, 0, s.tilt]} scale={[s.scale * 0.35, s.scale, s.scale * 0.35]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#d7b8ff"
            emissive="#7a3cff"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.1}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function RadianceRing({ accent }: { accent: THREE.Color }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const r = ring.current;
    if (!r) return;
    const s = scroll.smooth;
    r.rotation.z = state.clock.elapsedTime * 0.15;
    const m = r.material as THREE.MeshBasicMaterial;
    m.color.copy(accent);
    m.opacity = THREE.MathUtils.smoothstep(s, 0.85, 1);
  });
  return (
    <mesh ref={ring} position={[0, -DEPTH, -3]}>
      <torusGeometry args={[2.6, 0.025, 16, 160]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function Rig({ accent, light }: { accent: THREE.Color; light: React.RefObject<THREE.PointLight | null> }) {
  useFrame((state, dt) => {
    scroll.smooth = THREE.MathUtils.damp(scroll.smooth, scroll.target, 3.5, dt);
    const s = scroll.smooth;
    const cam = state.camera;
    cam.position.y = -s * DEPTH;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.4, 2, dt);
    cam.rotation.z = THREE.MathUtils.damp(cam.rotation.z, (scroll.target - s) * 0.6, 4, dt);
    paletteAt(s, accent);
    if (light.current) {
      light.current.color.copy(accent);
      light.current.position.set(cam.position.x + 2, cam.position.y + 1, 3);
    }
  });
  return null;
}

export default function Scene() {
  const accent = useMemo(() => paletteAt(0, new THREE.Color()), []);
  const light = useRef<THREE.PointLight>(null);
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Canvas
      aria-hidden
      dpr={coarse ? [1, 1.25] : [1, 1.75]}
      // Fixed to the viewport, so skip R3F's default re-measure on every scroll event.
      resize={{ scroll: false }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: !coarse, powerPreference: "high-performance" }}
      className="!fixed inset-0 !h-[100lvh] !w-full"
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 5, 16]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 4, 5]} intensity={1.4} color="#dfe8ff" />
      <pointLight ref={light} intensity={30} distance={14} />
      <Rig accent={accent} light={light} />
      <Suspense fallback={null}>
        <KnightMask accent={accent} />
      </Suspense>
      <SoulMotes accent={accent} count={mobile ? 350 : 800} />
      <Crystals />
      <RadianceRing accent={accent} />
    </Canvas>
  );
}
