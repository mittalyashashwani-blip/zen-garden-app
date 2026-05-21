# Zen Garden — Style Bible

**Version 1 · 2026-05-19**
The single source of truth for every visual asset in this game. Every Gemini prompt, every commissioned piece, every hand-edit references this document. If an asset doesn't pass the 5 rules below, it doesn't ship.

---

## Anchor references

Pin these in your head before generating anything:

- **Tsuki's Odyssey** — the gold standard. Flat-perspective rooms, cute painterly props, soft palette, near-zero UI. Reference for cards, item placement, mood.
- **Studio Ghibli interiors** — Howl's Moving Castle (Sophie's bedroom), Kiki's Delivery Service (bakery interior), Spirited Away (boiler room). Reference for cabin warmth, light, texture.
- **Cozy Grove** — reference for painterly forest/cabin coexistence, soft shadows, hand-painted feel.
- **Miro board references:**
  - [Plant card system + collectible mechanic](https://miro.com/app/board/uXjVGyQKIZE=/?moveToWidget=3458764668301523592)
  - [Flower / plant aesthetic mood board](https://miro.com/app/board/uXjVGyQKIZE=/?moveToWidget=3458764672302700444)
  - [Menu button options + placements](https://miro.com/app/board/uXjVGyQKIZE=/?moveToWidget=3458764672354403897)

---

## The 5 Locked Rules

These rules are **non-negotiable**. Any asset that violates them gets rejected, no matter how pretty.

### Rule 1 — Perspective: FLAT / NEAR-ORTHOGRAPHIC
- Stage-set view. Side-on. Camera is straight on, not tilted, not 3D.
- Floor is a clean horizontal band. Shelves are horizontal lines. **No vanishing points. No foreshortening.**
- Depth is implied by **layering and scale**, never by perspective lines.
- *Test:* if you can trace a vanishing point on the floor or ceiling, the asset fails.

### Rule 2 — Brushwork: WATERCOLOUR, PAINTERLY, SOFT-EDGED
- Visible brushstroke texture. Soft, slightly hazy edges.
- **No hard outlines.** No vector flat fills. No anime cel-shading.
- Slight imperfection welcomed — this is hand-painted, not pristine.

### Rule 3 — Palette: WARM EARTH + MUTED GREEN + CREAM
- Dominant tones: warm cabin browns (`#8B6F47`, `#A0826D`), muted forest greens (`#7A8B6F`, `#A8B89C`), cream highlights (`#F5E6D3`, `#EFE0C9`), terracotta accents (`#C97B5C`).
- Avoid: neon, pure black, pure white, cool blues as a dominant tone (only as cool window light or sky), saturated primaries.
- Mood marker: golden-hour-through-a-window. Always slightly warm.

### Rule 4 — Lighting: WARM, DIRECTIONAL, SOFT
- Primary light source: warm sun coming through a window from upper-left.
- Soft, diffuse shadows. No hard shadows, no harsh contrast.
- Light should feel like late afternoon or early morning. Hazy. Believable.
- Night variants: cool moonlight from window + warm fireplace glow inside. Two-source.

### Rule 5 — Mood: NOSTALGIC, COSY, HAZY
- Slightly faded, like a memory of a cabin you visited once. Not photoreal.
- Specks of dust in light beams, slight grain, organic imperfection.
- The room should smell like rain, woodsmoke, and jasmine.

---

## Per-asset prompt templates

### Room background (the master asset)

```
A cozy cabin interior, flat orthographic perspective like a stage set, side-on
view, horizontal floor and shelves with no vanishing points. Watercolour Ghibli
style with soft painterly brushwork and visible texture. A wooden window on the
left looks out to misty mountain forest. A stone fireplace with mantle on the
right has a wrought-iron hook beside it for hanging tools. A cosy bookshelf
near the centre. A plush green couch with patterned cushion. A sleeping ginger
cat curled on a woven rug. A dedicated central shelf for a watering can.
Warm earth-tone palette, golden-hour light from upper-left window, soft hazy
atmosphere, nostalgic mood. Painted style references: Tsuki's Odyssey + Studio
Ghibli interiors. No vanishing point. No vector outlines. No 3D rendering.
```

### Plant sprite (per growth stage)

```
A [PLANT NAME] in [STAGE: seedling / sprouting / budding / blooming /
flourishing], painted in watercolour Ghibli style with soft brushwork. Sitting
in a terracotta pot. Transparent background. Soft drop shadow built in.
Side-on view to match a flat orthographic room. Warm earth palette, golden-hour
light from upper-left. No vector outlines. No hard edges. Hand-painted feel.
```

### Watering can

```
An old-school watering can, painted in watercolour Ghibli style. Brass or
weathered copper finish. Soft painterly brushwork. Side-on view. Transparent
background. Soft drop shadow. Hand-painted feel. No outlines. Matches a cozy
cabin aesthetic.
```

### Vase (for harvested flowers)

```
A small ceramic vase, painted in watercolour Ghibli style. Cream or terracotta
glaze with subtle hand-painted detail. Side-on view. Transparent background.
Soft drop shadow. Matches a warm cabin palette.
```

### Plant card (Tsuki pastel-yellow, handwritten voice)

```
A cute, cozy digital illustration of a collectible plant card.

Background plate: solid teal textured background.

Card body: bright pastel yellow rectangle with rounded corners (24px radius)
and a thin white inner border 8px inside the card edge.

Top-left: action word in playful all-caps sans-serif font (e.g. "WATER",
"HARVEST", "PLANT"). Top-right: point value in same font (e.g. "+1000").

Central artwork: a rectangular picture frame holding a hand-drawn doodle of
the [PLANT NAME] at peak bloom, sitting in a white ceramic pot. Style is soft,
warm, comforting with clean outlines and gentle watercolour shading.

Mid section: small horizontal yellow banner with [PLANT NAME] in white
all-caps. To the right of the banner: five stars, with [N] filled yellow
based on rarity / collection progress.

Bottom section: a cream-coloured rectangular text box with playful handwritten
lowercase text. Format: "power: [casual voice line about how the plant makes
you feel]"

At the very bottom: a punchline line centred between three small radial
decoration lines on each side. Format: "[short payoff line]"

Mood: cosy, cute, collectible. Hand-painted feel. No hard vector lines.
```

---

## Universal rejection criteria

Reject any asset that has:
- A visible vanishing point or perspective lines
- Hard vector outlines or cel-shading
- Neon, saturated, or "kids cartoon" palette
- A cool / desaturated overall tone (we are warm and cosy, always)
- 3D rendered look (Blender, Pixar, etc.)
- Anime / manga style
- Pristine, sterile, "Apple ad" look
- AI artefacts: extra fingers, melted edges, unreadable text
- Style drift from prior assets in the same set

---

## Asset spec

| Asset | Format | Max size | Resolution target | Folder |
|---|---|---|---|---|
| Room background | PNG | 800KB | 1920×1080 | `public/assets/rooms/` |
| Plant sprite (per stage) | PNG, transparent | 150KB | 512×512 | `public/assets/plant-assets/` |
| Watering can | PNG, transparent | 100KB | 256×256 | `public/assets/tools/` |
| Vase | PNG, transparent | 100KB | 256×256 | `public/assets/vase/` |
| Plant card | PNG | 200KB | 600×900 (2:3) | `public/assets/cards/` |

**Compression note:** Run every generated PNG through TinyPNG or `pngquant` before committing. Current plant PNGs are 100KB–1.3MB — way too heavy. Target ≤150KB per plant after compression.

**Filename convention:** `[asset]-[stage|variant].png` — e.g. `tulip-seedling.png`, `room_dusk.png`, `watering-can.png`, `vase-empty.png`, `card-tulip.png`. Lowercase. Hyphens, not underscores (except `room_` prefix to match existing).

---

## Working with Gemini (Nano Banana Pro)

1. Open this file. Copy the relevant prompt template.
2. Paste into Gemini chat. Attach 1-2 reference images (Tsuki screenshot + a prior approved asset from this game).
3. Generate. Apply the 5 rules + rejection criteria as a checklist.
4. If it fails any rule → reject, iterate, don't compromise. Better to spend 10 generations than ship a mismatched asset.
5. Save approved asset to the correct folder. Update this file's Asset Log section.

---

## Asset log

| Date | Asset | Status | Notes |
|---|---|---|---|
| 2026-05-19 | (bible v1 created) | — | Pre-existing plant assets and rooms still in use, awaiting style audit |

---

## Locked decisions (session 2026-05-19)

All open decisions resolved. Do not relitigate.

| Decision | Answer |
|---|---|
| Day/night variants | Day + Night, both with weather variation outside window. Dawn/dusk = MVP2. |
| Watering can location | Wrought-iron hook beside fireplace, painted into room art |
| Card style | Tsuki pastel-yellow with handwritten voice (see prompt above) |
| HUD/coins | Keep 🪙 visible for MVP1 testing. Remove after Yash signs off. |
| Sound | Silent MVP1. Ambient lofi = MVP2. |
| Plant death | "Dormant" not "dead" — CSS filter degradation, plant removed gracefully |
| Mobile | Rotate-to-landscape prompt. App is portfolio-facing — recruiters open on mobile. |
| Watering | Diegetic drag-can only. No buttons, no menus, no health bars. |

## Animation rules (MVP2 — stub)

To be populated from .mov references when Yash provides screenshots.

- Card entry: ease-in-out ~300ms
- Plant sway: gentle Y-bob (already implemented in CSS `plantBreathe`)
- Water: droplet particles from can tip (already implemented in SVG)
- Card exit: reverse mount animation
- All animations: respect `prefers-reduced-motion`
