# Building a Cinematic Animated World Map in React + SVG

*A practical walkthrough of the "Strategic Global Hubs" component on glzbearings.com — origin-to-destination arcs, traveling comets, pulsing radar HQ, and a dimmed real-world basemap, all in pure SVG with a sprinkle of Framer Motion.*

---

## The brief

> "Every transport route should originate from one place — Haryana, India — and connect dynamically to all global hubs. India should feel like the central energy/source node. Premium industrial-tech aesthetic. Smooth. Expensive. Precision-engineered. Not flashy."

A static map with dots wasn't going to cut it. We needed motion that *says something* — that India is the operational core powering a global supply network — without descending into Web 2.0 dashboard cliché.

Here's how it was built, layer by layer.

---

## The mental model

Think of the map as **four stacked layers**:

1. **Basemap** — a dimmed, real-world SVG of the world. Reference, not centerpiece.
2. **Atmosphere** — a soft yellow radial glow under HQ. Establishes "this place is hot."
3. **Network overlay** — an absolutely-positioned `<svg>` matching the basemap's viewBox, holding all the arcs and nodes.
4. **Vignette** — a radial fade so the edges fall into the page background.

Critically: the network overlay shares the **same `viewBox`** as the basemap (`0 0 2000 857`). This means we can position every hub in the *real coordinate system of the map* — Haryana sits where Haryana actually is. No magic numbers, no pixel-pushing.

```tsx
<div className="relative aspect-[2000/857] w-full">
  <img src="/world.svg" className="absolute inset-0 ..." />
  <div /* radial glow */ />
  <svg viewBox="0 0 2000 857" className="absolute inset-0 w-full h-full">
    {/* arcs + nodes */}
  </svg>
  <div /* vignette */ />
</div>
```

The world.svg used here is the free [SimpleMaps world](https://simplemaps.com/resources/svg-maps) — 2000×857, MIT-licensed.

---

## Step 1 — Defining the network

Two flat arrays, one origin and one list of destinations:

```ts
type Hub = { id: string; label: string; x: number; y: number; primary?: boolean };

const HQ: Hub = { id: "ind", label: "HARYANA · INDIA", x: 1418, y: 320, primary: true };

const DESTINATIONS: Hub[] = [
  { id: "nam", label: "NORTH AMERICA", x: 488, y: 250 },
  { id: "eu",  label: "EUROPE",        x: 1040, y: 200 },
  { id: "afr", label: "AFRICA",        x: 1110, y: 530 },
  { id: "jp",  label: "JAPAN",         x: 1780, y: 280 },
  { id: "oce", label: "OCEANIA",       x: 1820, y: 620 },
  // ...
];
```

The coordinates are eyeballed against the real map — and because the SVG overlay shares the viewBox, they line up perfectly regardless of how the container is scaled.

---

## Step 2 — The arcs (the "expensive" curves)

Straight lines on a map look like a UPS receipt. Curves look like flight paths. We use **quadratic Bézier paths** with a vertical lift proportional to distance:

```ts
function arcPath(x1: number, y1: number, x2: number, y2: number, bend = 0.3) {
  const mx = (x1 + x2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const lift = Math.min(220, dist * bend);
  const my = Math.min(y1, y2) - lift;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}
```

Why this works:

- **Symmetric** — the control point sits at the horizontal midpoint, so the arch is balanced.
- **Distance-aware** — short hops have shallow arches, long hops soar. Geographically intuitive.
- **Capped lift** — `Math.min(220, …)` stops trans-Pacific routes from disappearing off the top.
- **Dampened bend** — clamped between 0.22 and 0.40, multiplied by a hash of the destination id so each route gets its own subtle character.

---

## Step 3 — Per-route layering (the secret to "premium")

Every connection is **four stacked SVG paths**, not one. This is the single biggest reason the result feels expensive:

```tsx
{/* 1. Soft outer glow — blurred wide stroke, faint */}
<motion.path d={path} stroke="#F4C400" strokeWidth={4}
  strokeOpacity={0.18} filter="url(#soft)"  /* feGaussianBlur stdDeviation=3 */
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 0.35 }} />

{/* 2. Sharp core line — gradient-filled stroke for depth */}
<motion.path d={path} stroke="url(#lineGrad)" strokeWidth={1}
  initial={{ pathLength: 0 }}
  whileInView={{ pathLength: 1 }} />

{/* 3. Traveling dash — a short bright segment that slides along */}
<motion.path d={path} stroke="#FFE066" strokeWidth={1.6}
  initial={{ strokeDasharray: "26 700", strokeDashoffset: 700 }}
  animate={{ strokeDashoffset: [700, -120] }}
  transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }} />

{/* 4. Comet head — animateMotion riding the same path */}
<circle r={3.2} fill="#FFE680">
  <animateMotion dur={`${dur}s`} repeatCount="indefinite"
    begin={`${delay}s`} rotate="auto" path={path} />
</circle>
```

What each layer contributes:

| Layer | Job |
|---|---|
| Outer glow | Bloom — makes the line look hot, not drawn |
| Core line | Crisp identity — the actual route |
| Traveling dash | Implies flow direction |
| Comet head | Foreground motion — the eye locks onto it |

Drop any one of these and the magic dies.

### The line gradient

```tsx
<linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%"   stopColor="#F4C400" stopOpacity="0.0" />
  <stop offset="20%"  stopColor="#F4C400" stopOpacity="0.55" />
  <stop offset="80%"  stopColor="#F4C400" stopOpacity="0.55" />
  <stop offset="100%" stopColor="#F4C400" stopOpacity="0.0" />
</linearGradient>
```

The endpoints fade to transparent — so the line *kisses* into the dots instead of stopping at them with a hard tip. Tiny touch, huge effect.

---

## Step 4 — `<animateMotion>` is criminally underused

Framer Motion is great for layout animations, but for moving an element along an arbitrary path, native SVG `<animateMotion>` is one line and runs at 60fps with zero JS overhead:

```xml
<circle r={3.2} fill="#FFE680">
  <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path={path} />
  <animate attributeName="opacity" values="0;1;1;0"
           keyTimes="0;0.08;0.9;1" dur="6s" repeatCount="indefinite" />
</circle>
```

`rotate="auto"` rotates the element to follow the path's tangent — useful if you swap the circle for an arrow or aircraft glyph. The opacity `<animate>` fades the comet in at the start of each loop and out at the end, so it doesn't pop in/out at the endpoints.

We add a *second* smaller circle on the same path with a **0.18s delay** as a trailing micro-particle. It's barely visible, but the eye notices when it's missing.

---

## Step 5 — Killing robotic synchronization

This is the difference between "cool" and "screensaver." If every route ticks in unison, the brain reads it as a regular loop and tunes out. We need *organic* timing.

```ts
function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const r = seed(d.id);
const dur = 6 + r * 3.5;          // 6.0s – 9.5s per route
const delay = (i * 0.7 + r * 1.2) % 6;
```

A tiny **FNV-1a hash** of the destination id gives each route a stable pseudo-random number in `[0, 1)`. We use that to vary:

- duration (6.0s → 9.5s)
- start delay (spread across a 6s window)
- the bend factor of the curve (0.22 → 0.40)

It's stable across SSR/CSR (no `Math.random()`), and the values are deterministic per id — so refreshing doesn't reshuffle them.

---

## Step 6 — Drawing-in on scroll

When the user scrolls into the section, the routes shouldn't be there waiting; they should *materialize outward from India*. Framer Motion's `pathLength` makes this trivial:

```tsx
<motion.path
  d={path}
  fill="none"
  stroke="url(#lineGrad)"
  initial={{ pathLength: 0, opacity: 0 }}
  whileInView={{ pathLength: 1, opacity: 0.9 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{
    duration: 1.4,
    delay: 0.15 + i * 0.07,    // staggered draw
    ease: [0.22, 1, 0.36, 1],  // smooth, decelerating
  }}
/>
```

`pathLength` is a normalized 0→1 value; Motion translates it into the right `stroke-dasharray`/`stroke-dashoffset` under the hood. Because all our arcs originate at the HQ point, `pathLength: 0 → 1` literally draws *outward from HQ*. That's the whole feeling, free.

The `i * 0.07` stagger means routes draw in waves rather than all at once. That ease (`[0.22, 1, 0.36, 1]`) is a custom cubic-bezier — fast start, soft landing. It's the easing equivalent of a heavy door closing on a Mercedes.

---

## Step 7 — The HQ node (where the brand lives)

Destination nodes are simple — a halo, a pulsing ring, a solid core. The HQ does five things at once:

```tsx
<g transform={`translate(${HQ.x} ${HQ.y})`}>
  {/* a) Energy field — large radial gradient circle */}
  <circle r={70} fill="url(#hqGlow)" />

  {/* b) Three concentric pulse rings, staggered */}
  {[0, 0.6, 1.2].map((d, i) => (
    <motion.circle key={i} r={9} fill="none" stroke="#F4C400"
      animate={{ scale: [1, 5.5], opacity: [0.85, 0] }}
      transition={{ duration: 3, repeat: Infinity, delay: d }} />
  ))}

  {/* c) Slow rotating dashed reticle — radar feel */}
  <motion.g animate={{ rotate: 360 }}
    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
    <circle r={16} stroke="#F4C400" strokeDasharray="4 6" />
    <circle r={24} stroke="#F4C400" strokeDasharray="2 8" />
  </motion.g>

  {/* d) Breathing core */}
  <motion.circle r={9} fill="#FFE066"
    animate={{ scale: [1, 1.15, 1] }}
    transition={{ duration: 2.2, repeat: Infinity }}
    style={{ filter: "drop-shadow(0 0 14px rgba(244,196,0,0.95))" }} />
  <circle r={3} fill="#0B0B0B" />

  {/* e) Label */}
  <text>HARYANA · INDIA</text>
</g>
```

The trio of pulse rings staggered at 0s, 0.6s, 1.2s creates a continuous heartbeat — there's always one ring expanding. The rotating dashed reticle is a 24-second revolution: slow enough not to draw attention, fast enough to be noticed if you stare. Together they say *control center* without saying *sci-fi*.

One gotcha worth noting: SVG circles rotate around `(0, 0)` by default. To get them to scale/rotate around their own center, you need:

```css
transform-origin: center;
transform-box: fill-box;
```

`transform-box: fill-box` switches the reference from the SVG root to the element's own bounding box. Forget this and your pulses fly off into the corner.

---

## Step 8 — The basemap, dimmed correctly

The world.svg is rendered as a plain `<img>` with three CSS tricks stacked:

```html
<img src="/world.svg"
     class="opacity-[0.16] [filter:invert(1)_grayscale(1)_brightness(1.4)]" />
```

- `invert(1)` flips the original light-gray map to dark — so it works on a black background.
- `grayscale(1)` strips any color leakage.
- `brightness(1.4)` recovers a little contrast after the invert.
- `opacity: 0.16` pushes it back so the network is the hero.

The resulting effect: a phantom map. Visible enough to read continents, faint enough to not compete with the animation.

---

## Step 9 — The vignette (the cherry on top)

```tsx
<div className="absolute inset-0 pointer-events-none
  bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(11,11,11,0.7)_100%)]" />
```

A single radial gradient fades the corners into the page background. This stops the rectangular map block from looking like a screenshot pasted onto the page. It belongs.

---

## Performance notes

A few things that keep this smooth at 60fps:

- **Everything is SVG.** No canvas. No WebGL. The browser composites SVG paths cheaply.
- **`<animateMotion>` runs natively.** No JS-driven RAF loop.
- **`pathLength` animations are GPU-accelerated** in Framer Motion via `stroke-dashoffset`.
- **No `box-shadow` on animated elements.** We use `drop-shadow` filters only on small static circles. (`box-shadow` on an animating element triggers per-frame paint work; `drop-shadow` is GPU.)
- **`viewport={{ once: true }}`** on the draw-in animations means they fire exactly once. After they're done, the only motion is the looping comets.
- **`prefers-reduced-motion`** isn't yet handled in this snippet, but you'd add it by checking the media query in a `useEffect` and returning a static version.

The whole component adds about **3 KB gzipped** to the bundle. Compare that to a Lottie file or a video.

---

## The lessons

If you take only three things from this:

1. **Layer your strokes.** A single colored line is a line. A wide blurred glow + a thin gradient core + a moving dash + a glowing comet is *a route*.
2. **Hash your timings.** `Math.random()` is unstable across SSR; a deterministic hash of an ID gives you organic feel without hydration mismatches.
3. **Use the same viewBox as your reference.** Real-world coordinates beat pixel-pushing every time.

The whole component is ~280 lines of TypeScript. It looks like it cost a six-figure agency contract. That's the gap good SVG closes when you stop reaching for a library and start composing primitives.

---

*Source for the GLZ Bearings implementation lives in `src/components/WorldNetwork.tsx`. Yours can too.*
