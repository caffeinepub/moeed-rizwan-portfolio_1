import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// p5aholic.me-style GLSL background
// Domain-warped FBM / simplex noise → smooth organic light blobs on black
// Neon red (#dd2200) palette — exactly like Keita Yamada's shader effect
// ─────────────────────────────────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG_SRC = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289v(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+10.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = mod289v(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x2 = 2.0*fract(p * C.www) - 1.0;
    vec3 h  = abs(x2) - 0.5;
    vec3 ox = floor(x2 + 0.5);
    vec3 a0 = x2 - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x * x0.x   + h.x * x0.y;
    g.yz = a0.yz* x12.xz  + h.yz* x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(100.0);
    mat2  rot   = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p  = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  float pattern(vec2 p, float t) {
    vec2 drift = p + vec2(t * 0.03, t * 0.045);
    vec2 q = vec2(
      fbm(drift + vec2(0.0, 0.0)),
      fbm(drift + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(drift + 3.5*q + vec2(1.7, 9.2)),
      fbm(drift + 3.5*q + vec2(8.3, 2.8))
    );
    return fbm(drift + 3.5*r);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy / uRes.xy) * 8.0;
    uv.x *= uRes.x / uRes.y;

    float f = pattern(uv, uTime);
    float t = clamp(f * 0.5 + 0.5, 0.0, 1.0);

    vec3 black   = vec3(0.0,   0.0,   0.0);
    vec3 deepRed = vec3(0.18,  0.02,  0.0);
    vec3 neonRed = vec3(0.867, 0.133, 0.0);
    vec3 hotTip  = vec3(1.0,   0.50,  0.08);

    vec3 col;
    if (t < 0.35) {
      col = mix(black,   deepRed, t / 0.35);
    } else if (t < 0.65) {
      col = mix(deepRed, neonRed, (t - 0.35) / 0.30);
    } else {
      col = mix(neonRed, hotTip,  (t - 0.65) / 0.35);
    }

    vec2 cv = (gl_FragCoord.xy / uRes.xy) - 0.5;
    float vig = clamp(1.0 - dot(cv, cv) * 2.2, 0.0, 1.0);
    col *= vig;
    col  = pow(col, vec3(0.85));

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

  function draw() {
    gl!.uniform1f(uTimeLoc, (performance.now() - t0) * 0.001);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);

  return () => {
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
