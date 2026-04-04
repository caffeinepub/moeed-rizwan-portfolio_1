import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// p5aholic.me-style animated background
// Domain-warped FBM shader with deep color variation — neon red palette
// Multiple layers of domain-warped noise create the organic flowing blobs
// ─────────────────────────────────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG_SRC = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;

  // Simplex noise helpers (Ashima Arts)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x)  { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4( 0.211324865405187,
                         0.366025403784439,
                        -0.577350269189626,
                         0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = x0.x > x0.y ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),
                             dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m*m*m;
    vec3 x2 = 2.0*fract(p * C.www) - 1.0;
    vec3 h  = abs(x2) - 0.5;
    vec3 ox = floor(x2 + 0.5);
    vec3 a0 = x2 - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x*x0.x    + h.x*x0.y;
    g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130.0 * dot(m, g);
  }

  // 6-octave fractional Brownian motion
  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      sum  += amp * snoise(p * freq);
      p     = rot * p + vec2(3.7, 1.4);
      amp  *= 0.5;
      freq *= 2.0;
    }
    return sum;
  }

  // 3-level domain-warp — creates the nested blob-within-blob look
  float domainWarp(vec2 p, float t) {
    // Layer 0: slow drift
    vec2 p0 = p + vec2(t * 0.04, t * 0.025);

    // Layer 1: warp by fbm
    vec2 q = vec2(
      fbm(p0 + vec2(0.0,  0.0)),
      fbm(p0 + vec2(5.2,  1.3))
    );

    // Layer 2: warp by warped fbm
    vec2 r = vec2(
      fbm(p0 + 4.0*q + vec2(1.7, 9.2) + t*0.015),
      fbm(p0 + 4.0*q + vec2(8.3, 2.8) + t*0.010)
    );

    // Layer 3: final value
    return fbm(p0 + 4.0*r + t*0.008);
  }

  void main() {
    // UV — aspect-corrected, centered slightly higher
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec2 p  = uv * vec2(uRes.x / uRes.y, 1.0) * 3.5;

    float f = domainWarp(p, uTime);
    // f is roughly in [-1, 1]; map to [0,1]
    float t = clamp(f * 0.5 + 0.5, 0.0, 1.0);

    // ── Color ramp — 5 stops, p5aholic-inspired with neon red palette ──
    // 0.00 → 0.20  black → very dark red
    // 0.20 → 0.45  very dark red → deep crimson
    // 0.45 → 0.68  deep crimson → vivid neon red
    // 0.68 → 0.85  neon red → bright orange-red
    // 0.85 → 1.00  orange-red → near-white hot tip
    vec3 c0 = vec3(0.00, 0.00, 0.00);  // black
    vec3 c1 = vec3(0.10, 0.01, 0.00);  // very dark red
    vec3 c2 = vec3(0.32, 0.03, 0.00);  // deep crimson
    vec3 c3 = vec3(0.87, 0.13, 0.00);  // neon red  #dd2200
    vec3 c4 = vec3(1.00, 0.38, 0.05);  // bright orange-red
    vec3 c5 = vec3(1.00, 0.75, 0.45);  // hot white tip

    vec3 col;
    if      (t < 0.20) col = mix(c0, c1, t / 0.20);
    else if (t < 0.45) col = mix(c1, c2, (t-0.20)/0.25);
    else if (t < 0.68) col = mix(c2, c3, (t-0.45)/0.23);
    else if (t < 0.85) col = mix(c3, c4, (t-0.68)/0.17);
    else               col = mix(c4, c5, (t-0.85)/0.15);

    // Subtle vignette
    vec2 cv = uv - 0.5;
    float vig = 1.0 - dot(cv, cv) * 1.6;
    col *= clamp(vig, 0.0, 1.0);

    // Gamma correction (mild — keeps neons punchy)
    col = pow(max(col, vec3(0.0)), vec3(0.9));

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
