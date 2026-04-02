import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// p5aholic.me faithful port
// Exact same snoise → pattern() domain-warp pipeline as Keita Yamada's shader.
// Grain + blur textures replaced with procedural FBM noise blobs.
// Colors: pure black (#000000) background → neon red (#dd2200) glow.
// ─────────────────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float time;
  uniform float seed;
  uniform vec2  resolution;

  varying vec2 vUv;

  #define PI 3.141592653589793

  // ── Ashima / Ian McEwan simplex noise (exact p5aholic copy) ──────────────
  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute3(vec3 x) { return mod289v3(((x * 34.0) + 10.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = mod289v2(i);
    vec3 p = permute3(permute3(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x * x0.x  + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float snoise01(vec2 v) { return (1.0 + snoise(v)) * 0.5; }

  // ── p5aholic noise2d: slow horizontal + vertical drift ───────────────────
  float noise2d(vec2 st) {
    return snoise01(vec2(st.x + time * 0.02, st.y - time * 0.04 + seed));
  }

  // ── p5aholic domain-warp pattern ─────────────────────────────────────────
  float pattern(vec2 p) {
    vec2 q = vec2(noise2d(p + vec2(0.0, 0.0)),
                  noise2d(p + vec2(5.2, 1.3)));
    vec2 r = vec2(noise2d(p + 4.0*q + vec2(1.7, 9.2)),
                  noise2d(p + 4.0*q + vec2(8.3, 2.8)));
    return noise2d(p + 1.0*r);
  }

  // ── Procedural grain (replaces grainTex) ─────────────────────────────────
  float grain(vec2 p) {
    // cheap high-freq hash as grain texture substitute
    vec2 ip = floor(p * 512.0);
    float h = fract(sin(dot(ip, vec2(127.1, 311.7))) * 43758.5453);
    return h;
  }

  // ── Procedural blobs (replaces blurTex alpha) ────────────────────────────
  // Multiple soft Gaussian-like blobs drifting slowly, same domain-warp logic
  float blobAlpha(vec2 uv) {
    // 5 overlapping blobs at different offsets / scales
    float b = 0.0;
    b += smoothstep(0.72, 0.0, length(uv - vec2(0.35 + snoise01(vec2(time*0.015, 0.1))*0.15,
                                                 0.55 + snoise01(vec2(0.2, time*0.012))*0.12)));
    b += smoothstep(0.65, 0.0, length(uv - vec2(0.62 + snoise01(vec2(time*0.013, 1.5))*0.14,
                                                 0.38 + snoise01(vec2(1.8, time*0.011))*0.13)));
    b += smoothstep(0.58, 0.0, length(uv - vec2(0.18 + snoise01(vec2(time*0.017, 2.9))*0.12,
                                                 0.72 + snoise01(vec2(3.1, time*0.014))*0.10)));
    b += smoothstep(0.50, 0.0, length(uv - vec2(0.80 + snoise01(vec2(time*0.011, 4.3))*0.10,
                                                 0.25 + snoise01(vec2(4.5, time*0.016))*0.11)));
    b += smoothstep(0.60, 0.0, length(uv - vec2(0.50 + snoise01(vec2(time*0.009, 6.1))*0.18,
                                                 0.50 + snoise01(vec2(6.3, time*0.010))*0.15)));
    return clamp(b, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;                         // 0..1
    vec2 p  = gl_FragCoord.xy;             // pixel coords for grain

    // ── Grain displacement (param1=0.15, param2=0.18, matching p5aholic defaults)
    float param1 = 0.15;
    float param2 = 0.18;
    float param3 = 1.8;                    // noise scale (p5aholic: ~1-2)

    vec3 grainColor;
    grainColor.r = grain(p * 0.0013);
    grainColor.g = grain(p * 0.0017 + 0.5);
    float blurAlpha = blobAlpha(uv);

    float gr = pow(grainColor.r, 1.5) + 0.5 * (1.0 - blurAlpha);
    float gg = grainColor.g;

    float ax = param2 * gr * cos(gg * 2.0 * PI);
    float ay = param2 * gr * sin(gg * 2.0 * PI);

    // ── domain-warp sample coords ─────────────────────────────────────────
    float ndx = param3 + 0.1 * (1.0 - blurAlpha);
    float ndy = 2.0 * param3 + 0.1 * (1.0 - blurAlpha);
    float nx = uv.x * ndx + ax;
    float ny = uv.y * ndy + ay;
    float n  = pattern(vec2(nx, ny));
    n = pow(n * 1.05, 6.0);
    n = smoothstep(0.0, 1.0, n);

    // ── Color mapping: black → neon red (#dd2200) → bright orange-red ────
    // back = pure black (0,0,0), front = neon red glow
    vec3 back  = vec3(0.0, 0.0, 0.0);
    vec3 front = vec3(0.867, 0.133, 0.0);  // #dd2200 normalised

    // Layered glow: deep crimson core → neon red midtone → orange-red highlight
    vec3 col = mix(back, front * 0.55, blurAlpha * 0.6);   // ambient blob glow
    col = mix(col, front, n * blurAlpha);                   // domain-warp bright core
    col += front * pow(n, 3.0) * 0.5 * blurAlpha;          // extra hotspot
    col += vec3(1.0, 0.28, 0.04) * pow(n, 8.0) * blurAlpha * 0.4; // specular tip

    // Outside blobs: near-pure black with ultra-faint red tint
    col = mix(col, back + vec3(0.018, 0.0, 0.0), 1.0 - blurAlpha);

    // Vignette
    vec2 cv = vUv - 0.5;
    float vignette = 1.0 - dot(cv, cv) * 1.6;
    col *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderPlane() {
  const matRef = useRef<THREE.RawShaderMaterial>(null);
  const { size } = useThree();

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.resolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 },
          seed: { value: Math.random() * 100.0 },
          resolution: {
            value: new THREE.Vector2(
              typeof window !== "undefined" ? window.innerWidth : 1920,
              typeof window !== "undefined" ? window.innerHeight : 1080,
            ),
          },
        }}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function ParticleBackground() {
  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{ pointerEvents: "none", background: "#000000" }}
    >
      <Canvas
        orthographic
        camera={{
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
          near: 0,
          far: 1,
          position: [0, 0, 0.5],
        }}
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        style={{ width: "100%", height: "100%" }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
