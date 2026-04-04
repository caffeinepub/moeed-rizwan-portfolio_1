# Moeed Rizwan Portfolio

## Current State
The background animation (`ParticleBackground.tsx`) uses a raw WebGL nano-particle grid shader: a 65×65 grid of dots lit by 6 independent traveling wave packets using sine-band ripples. Colors are in a pure red ramp (#dd2200 family). The shader uses simplex-like math via `fbm()` approximation with sin sums, not true procedural noise.

## Requested Changes (Diff)

### Add
- Full-screen GLSL shader background using procedural simplex noise (Ashima-style or equivalent in GLSL)
- Multi-octave domain-warped FBM producing smooth, organic flowing energy field
- Time uniform (`uTime`) animating the field continuously
- Neon color palette: deep red, orange, magenta — Tron/Ares-inspired
- Soft bloom/glow post-processing: additive multi-sample blur pass in shader (or CSS filter fallback)
- Subtle wave distortion and organic movement
- Gradient blending for fluid abstract energy field look

### Modify
- Replace current nano-particle wave shader with new fluid energy field shader
- Color ramp updated to include magenta and orange alongside deep red
- Keep same WebGL raw loop architecture (no Three.js/R3F) for stability

### Remove
- Nano-particle grid approach (dot rendering, cell-based math)
- Pure red-only color ramp
- Individual traveling wave packet system

## Implementation Plan
1. Rewrite `FRAG_SRC` in `ParticleBackground.tsx` with:
   - Ashima simplex noise 2D/3D functions (classic GLSL implementation)
   - 3-level domain warp FBM for organic flow
   - Time-driven continuous animation
   - Neon color gradient: black → deep red → orange → magenta → hot white tip
   - Multi-sample pseudo-bloom: sample field at offset positions and blend additively
   - Vignette and gamma correction
2. Remove all dot/grid/cell code from fragment shader
3. Keep vertex shader unchanged
4. Keep WebGL setup, resize handler, and RAF loop unchanged
