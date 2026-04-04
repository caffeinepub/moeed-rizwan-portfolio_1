import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// p5aholic.me-style background: flowing particle wave field
// Uses domain-warped simplex noise to create organic, flowing wave patterns
// The effect looks like soft light waves / aurora ripples — NOT solid blobs
// ─────────────────────────────────────────────────────────────────────────────

const VERT_SRC = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG_SRC = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;

  // ─── Simplex noise (Ashima Arts / Ian McEwan) ─────────────────────────────
  vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec2 mod289(vec2 x){ return x - floor(x*(1./289.))*289.; }
  vec3 permute(vec3 x){ return mod289(((x*34.)+1.)*x); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.,i1.y,1.))
                           + i.x + vec3(0.,i1.x,1.));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.);
    m = m*m*m*m;
    vec3 x2 = 2.*fract(p*C.www) - 1.;
    vec3 h  = abs(x2) - 0.5;
    vec3 ox = floor(x2 + 0.5);
    vec3 a0 = x2 - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x*x0.x  + h.x*x0.y;
    g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130. * dot(m, g);
  }

  // ─── FBM with rotation to avoid axis-alignment artefacts ─────────────────
  float fbm(vec2 p){
    float v = 0., a = 0.5;
    mat2 rot = mat2( 0.80,  0.60,
                    -0.60,  0.80);  // ~36.87 deg
    for(int i=0; i<5; i++){
      v  += a * snoise(p);
      p   = rot * p * 2.0;
      a  *= 0.5;
    }
    return v;
  }

  // ─── Wave-field: creates the flowing "light wave" look ───────────────────
  // Two layers of domain-warped FBM, combined to produce thin flowing bands
  float waveField(vec2 p, float t){
    // Slow drift
    vec2 pd = p + vec2(t * 0.06, t * 0.04);

    // First warp — creates the large sweeping curves
    vec2 q = vec2(
      fbm(pd + vec2(0.0, 0.0)),
      fbm(pd + vec2(5.2, 1.3))
    );

    // Second warp — adds the tight wave bands
    vec2 r = vec2(
      fbm(pd + 3.0*q + vec2(1.7, 9.2) + t*0.012),
      fbm(pd + 3.0*q + vec2(8.3, 2.8) + t*0.008)
    );

    return fbm(pd + 3.5*r);
  }

  // ─── Particle wave: sharp sine bands over the noise field ────────────────
  float particleWave(vec2 p, float t){
    float field = waveField(p, t);

    // Create multiple wave bands — the sine wave turns smooth noise into
    // sharp, thin wave stripes that look like particle lines
    float waves  = sin(field * 12.0 + t * 0.4) * 0.5 + 0.5;
    float waves2 = sin(field *  7.0 - t * 0.25 + 1.5) * 0.5 + 0.5;
    float waves3 = sin(field * 18.0 + t * 0.18 + 3.0) * 0.5 + 0.5;

    // Soft power to make wave peaks sharp (like lit lines)
    waves  = pow(waves,  4.0);
    waves2 = pow(waves2, 5.0);
    waves3 = pow(waves3, 6.0);

    // Blend — primary waves dominate, finer detail layers underneath
    float combined = waves * 0.55 + waves2 * 0.30 + waves3 * 0.15;

    // Modulate amplitude by the underlying field to cluster brightness
    float amp = smoothstep(-0.1, 0.6, field);
    return combined * amp;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    // Aspect-correct centered UV, scaled to match p5aholic field density
    vec2 p  = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.8;

    float intensity = particleWave(p, uTime);

    // ─── Color ramp: dark → neon red → bright tip ──────────────────────────
    // Very low intensity: pure black
    // Mid intensity: deep dark red glow
    // High intensity: vivid #dd2200 neon red
    // Peak: bright orange-red / near-white hot tip
    vec3 dark   = vec3(0.00, 0.00, 0.00);   // black
    vec3 glow   = vec3(0.08, 0.01, 0.00);   // deep dark red
    vec3 mid    = vec3(0.45, 0.05, 0.00);   // dark crimson
    vec3 neon   = vec3(0.867, 0.133, 0.00); // #dd2200 neon red
    vec3 bright = vec3(1.00, 0.50, 0.12);   // orange-red
    vec3 tip    = vec3(1.00, 0.85, 0.60);   // near-white hot

    vec3 col;
    float t2 = clamp(intensity, 0.0, 1.0);
    if      (t2 < 0.12) col = mix(dark,   glow,   t2 / 0.12);
    else if (t2 < 0.30) col = mix(glow,   mid,    (t2-0.12)/0.18);
    else if (t2 < 0.55) col = mix(mid,    neon,   (t2-0.30)/0.25);
    else if (t2 < 0.78) col = mix(neon,   bright, (t2-0.55)/0.23);
    else                col = mix(bright, tip,    (t2-0.78)/0.22);

    // Vignette — darkens corners
    vec2 cv  = uv - 0.5;
    float vig = 1.0 - dot(cv, cv) * 1.8;
    col *= clamp(vig, 0.0, 1.0);

    // Slight gamma for punch
    col = pow(max(col, vec3(0.0)), vec3(0.85));

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
