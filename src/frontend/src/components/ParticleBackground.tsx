import { useEffect, useRef } from "react";

const VERT_SRC = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Fluid energy field shader:
// - Ashima simplex noise 2D
// - 3-level domain-warp FBM
// - Continuous time animation
// - Neon red/orange/magenta color ramp
// - Pseudo-bloom via additive multi-sample
const FRAG_SRC = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;

  // --- Ashima simplex noise 2D ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),
                            dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x * x0.x    + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 5-octave FBM
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    vec2  s = vec2(1.0);
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p  = p * 2.03 + vec2(5.721, 9.138);
      a *= 0.5;
    }
    return v;
  }

  // 3-level domain warp FBM (produces organic flowing shapes)
  float domainWarp(vec2 p) {
    // level 1 warp
    vec2 q = vec2(
      fbm(p + vec2(0.000, 0.000) + uTime * 0.04),
      fbm(p + vec2(5.201, 1.300) + uTime * 0.04)
    );
    // level 2 warp
    vec2 r = vec2(
      fbm(p + 3.2 * q + vec2(1.700, 9.200) + uTime * 0.025),
      fbm(p + 3.2 * q + vec2(8.300, 2.800) + uTime * 0.025)
    );
    // level 3 warp + final eval
    return fbm(p + 4.1 * r + uTime * 0.015);
  }

  // Neon color ramp: black -> deep red -> orange -> magenta -> hot white
  vec3 neonRamp(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 col;
    if (t < 0.12) {
      col = mix(vec3(0.00, 0.00, 0.00), vec3(0.10, 0.00, 0.02), t / 0.12);
    } else if (t < 0.32) {
      col = mix(vec3(0.10, 0.00, 0.02), vec3(0.55, 0.04, 0.00), (t - 0.12) / 0.20);
    } else if (t < 0.55) {
      col = mix(vec3(0.55, 0.04, 0.00), vec3(0.86, 0.22, 0.00), (t - 0.32) / 0.23);
    } else if (t < 0.72) {
      col = mix(vec3(0.86, 0.22, 0.00), vec3(0.90, 0.10, 0.55), (t - 0.55) / 0.17);
    } else if (t < 0.88) {
      col = mix(vec3(0.90, 0.10, 0.55), vec3(1.00, 0.55, 0.10), (t - 0.72) / 0.16);
    } else {
      col = mix(vec3(1.00, 0.55, 0.10), vec3(1.00, 0.90, 0.70), (t - 0.88) / 0.12);
    }
    return col;
  }

  // Sample the energy field value at a given uv
  float field(vec2 uv) {
    vec2 p = uv * 2.5 - 1.25;
    float f = domainWarp(p);
    // map -1..1 noise to 0..1, add slow global pulse
    f = f * 0.5 + 0.5;
    f = pow(f, 1.4);                         // contrast boost
    return clamp(f, 0.0, 1.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    // correct for aspect
    vec2 suv = vec2(uv.x * aspect, uv.y);

    // --- primary field sample ---
    float f0 = field(suv);

    // --- pseudo bloom: 4 offset samples blended additively ---
    float spread = 0.008;
    float f1 = field(vec2((uv.x + spread) * aspect, uv.y));
    float f2 = field(vec2((uv.x - spread) * aspect, uv.y));
    float f3 = field(vec2(uv.x * aspect, uv.y + spread));
    float f4 = field(vec2(uv.x * aspect, uv.y - spread));
    float bloom = (f1 + f2 + f3 + f4) * 0.25;

    // blend primary with bloom
    float intensity = f0 * 0.70 + bloom * 0.45;
    intensity = clamp(intensity, 0.0, 1.0);

    // --- color ---
    vec3 col = neonRamp(intensity);

    // --- soft vignette ---
    vec2 vc  = uv - 0.5;
    float vig = 1.0 - dot(vc, vc) * 1.4;
    col *= clamp(vig, 0.0, 1.0);

    // --- subtle brightness wave: global pulse adds life ---
    float pulse = 0.04 * sin(uTime * 0.37 + 1.57);
    col = clamp(col + pulse * vec3(0.8, 0.1, 0.3), 0.0, 1.0);

    // gamma
    col = pow(max(col, vec3(0.0)), vec3(0.88));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const s = gl.createShader(type) as WebGLShader;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(s));
  }
  return s;
}

function startGL(canvas: HTMLCanvasElement): () => void {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  }) as WebGLRenderingContext | null;
  if (!gl) return () => {};

  const prog = gl.createProgram() as WebGLProgram;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT_SRC));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
  gl.linkProgram(prog);
  WebGLRenderingContext.prototype.useProgram.call(gl, prog);

  const buf = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPosLoc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPosLoc);
  gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

  const uTimeLoc = gl.getUniformLocation(prog, "uTime");
  const uResLoc = gl.getUniformLocation(prog, "uRes");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(uResLoc, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize);

  const t0 = performance.now();
  let rafId: number;
  let alive = true;

  function draw() {
    if (!alive) return;
    gl!.uniform1f(uTimeLoc, (performance.now() - t0) * 0.001);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);

  return () => {
    alive = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startGL(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        background: "#000",
      }}
    />
  );
}
