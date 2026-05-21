# Zen Garden — Game UI Bible
> Version 1.0 · May 2026 · North star: the watercolor cabin room

---

## THE NORTH STAR

The room is a cozy watercolor cabin at golden sunset. Every UI element must feel like it **belongs inside this room** — physical, warm, slightly imperfect. Like handmade objects you'd find on a shelf. Never cold, never tech, never pasted-on.

**Rule:** If an element would look wrong sitting on the wooden mantel, it doesn't belong in the game.

---

## 1. TYPOGRAPHY

**Font family:** Lora (primary) → Georgia (fallback) → serif  
**Max font families per screen:** 2  
**Minimum readable size:** 10px SVG-scale (≈14px at 1080p). Nothing smaller.

| Role | Style | Size | Color |
|---|---|---|---|
| Card title / plant name | Lora Bold | 22px | `#C8853A` terracotta |
| Section header | Lora Bold | 18px | `#2F1810` walnut |
| Body / descriptions | Lora Regular | 14px | `#2F1810` walnut |
| HUD labels | Lora Bold | 13px | `#2F1810` walnut |
| Captions / taglines | Lora Italic | 13px | `#5C3A1A` warm brown |
| Hint text | Lora Italic | 11px | `rgba(252,238,200,0.88)` |
| Stats / numbers | Lora Bold + `font-variant-numeric: tabular-nums` | 13px | matches context |

**Rules:**
- Italics = ambient/ambient hints and taglines only
- Bold = names, labels, CTAs
- No uppercase for body text — sentence case everywhere
- Numbers must use tabular figures so they don't jump when digits change

---

## 2. COLOR PALETTE

Derived directly from the watercolor room. Every color has a role — never swap them.

| Token | Hex | Role |
|---|---|---|
| `--cream` | `#FAF0DC` | Primary surface, card backgrounds, HUD fill |
| `--terracotta` | `#C8853A` | Brand, CTAs, interactive borders, plant names |
| `--walnut` | `#2F1810` | Primary text, deep overlays |
| `--walnut-light` | `#5C3A1A` | Secondary text, captions |
| `--sage` | `#6B8F6A` | Healthy state, success, coins earned |
| `--gold` | `#F4A832` | Coins, bloom reward, highlight |
| `--ember` | `#C93054` | Danger, wilting, remove action |
| `--stone` | `rgba(200,133,58,0.15)` | Disabled state, inactive hover |
| `--glass` | `rgba(250,240,210,0.92)` | HUD backdrop, semi-transparent surfaces |

**Accessibility rules:**
- Never use color alone to convey state — always pair with icon or shape change
- Text on `--glass`: always `--walnut` (#2F1810) — contrast ≥4.5:1 ✓
- Danger state (`--ember`): always pair red with an icon (✕ or 💀)
- Disabled: 40% opacity + cursor:not-allowed, not just grey

---

## 3. SPACING & LAYOUT

**Base unit:** 8px  
**Safe zone from viewport edges:** 24px desktop, `env(safe-area-inset)` mobile  

| Size | Value | Use |
|---|---|---|
| XS | 4px | Icon gaps, tight pairs |
| S | 8px | Inline padding |
| M | 12px | Component inner padding |
| L | 16px | Card padding, section gaps |
| XL | 24px | Modal padding, safe zone |
| XXL | 40px | Major section separation |

**Border radius:**
- Pill (HUD, tags): `14px`
- Card (plant picker, modals): `12px`
- Button: `10px`
- Tooltip: `8px`
- Never `border-radius: 0` — everything is slightly rounded in a cozy room

**Border width:**
- Standard: `1px`
- Emphasis (card frame, active state): `1.5px`
- Never `2px+` — heavy borders break the watercolor feel

---

## 4. COMPONENTS

### 4A · HUD Pills
Floating status indicators. Always visible. No hover state.

```
Surface:    rgba(250,240,210,0.92) + backdrop-blur(8px)
Border:     1px solid rgba(200,133,58,0.35)
Border-r:   14px (pill)
Padding:    6px 14px
Font:       Lora Bold 13px, #2F1810
Position:   Fixed to SVG viewport — coins top-left, count top-center, time top-right
Shadow:     none — HUD should be invisible when you stop looking at it
```

---

### 4B · Plant Picker Card (TO REBUILD — Moonlighter style)
Opens when player clicks an empty pot. Full visual redesign needed.

```
Container:  centered modal overlay, max 420×580px
Backdrop:   rgba(0,0,0,0.45) blur behind
Frame:      wooden border — box-shadow: inset + outer warm amber glow
Interior:   #FAF0DC parchment
```

**Card layout (top to bottom):**
1. Plant illustration — 240×240px, centered, transparent bg
2. Plant name — Lora Bold 22px, `--terracotta`
3. Tagline — Lora Italic 13px, `--walnut-light`
4. Divider line — 1px `rgba(200,133,58,0.3)`
5. Stats row: coin cost (🪙 + number) · resilience (●●● dots) · days to bloom
6. Botanical trivia — Lora Regular 12px, italic, `--walnut-light`, max 2 lines
7. CTA button — "Plant for X 🪙" — terracotta fill, cream text, Lora Bold 14px
8. Navigation — ‹ 1/5 › centered, Lora 12px

**States:**
- Can afford: CTA active, terracotta fill
- Cannot afford: CTA disabled, `--stone` fill + "Not enough coins" text

---

### 4C · Toast Notifications
Feedback on actions. 2.5s lifecycle.

```
Surface:    rgba(250,240,210,0.95)
Border:     1px solid rgba(200,133,58,0.4)
Border-r:   10px
Padding:    8px 16px
Font:       Lora Regular 13px, #2F1810
Animation:  slide up 200ms ease-out → hold → fade out 300ms
Position:   bottom-center, 80px from bottom edge
```

Examples: `+ 1 🌿` · `🌺 Monstera bloomed! +10` · `Not enough coins`

---

### 4D · Plant in Pot — THE CORE RULE

> **The pot is always the background painting. Never the sprite.**

```
Sprite:     Foliage only — no pot, no soil, no container in the PNG
Clip:       Browser clips bottom 38% of sprite (SVG clipPath) — hides any pot remnant
Blend:      mix-blend-mode: multiply — removes white background
Anchor:     cfg.y = painted pot rim level. imgY = cfg.y - w * 0.62
Size:       maxWidth = painted pot width × 2.5 (plants spread wider than their pots)
```

**Health states (visual only — no bars, no numbers):**
- Healthy: full saturation
- Droopy: `saturate(0.45)`
- Wilting: `saturate(0.2) brightness(0.78)`
- Dead: `grayscale(1) brightness(0.45)`
- Thirsty: 💧 emoji above plant. No text. No bars.

---

### 4E · Watering Can
Diegetic interactive object. Painted in room art = the visual.

```
Home:       Bottom-left of room, next to fireplace. CAN_HOME = {x:168, y:693}
Hit area:   Invisible rect over painted can — 144×96px, rx:12
Thirsty:    Animated glow ring when any plant needs water (rgba(140,200,230,0.4))
Drag:       Water drops animate from spout tip when over valid plant
Return:     Auto-snaps back to home after watering
Tooltip:    First use only — "Drag me to a thirsty plant 💧" — never shown again
```

---

### 4F · Remove Confirmation
Triggered by right-click on occupied slot.

```
Surface:    rgba(139,26,46,0.88)
Border:     1px solid rgba(201,48,84,0.5)
Border-r:   6px
Text:       "Right-click again to remove" — Lora Regular 9.5px, #FAF0DC
Trigger:    Right-click once = show. Right-click again = confirm remove.
Dismiss:    Click elsewhere or hover away
```

---

### 4G · Greeting Overlay
Shown on app load. 3.2s lifecycle.

```
Surface:    rgba(250,240,210,0.88) — same glass as HUD
Border:     1px solid rgba(200,133,58,0.3)
Border-r:   16px
Padding:    20px 32px
Font:       "Good morning/evening" — Lora Regular 22px, #2F1810
Subtext:    Plant status summary — Lora Italic 13px, #5C3A1A
Animation:  fade in 400ms → hold 2s → fade out 600ms
```

---

## 5. INTERACTION STATES

| State | Visual change | Duration |
|---|---|---|
| Button hover | scale(1.03) + brightness(1.05) | 150ms ease |
| Button press | scale(0.97) | 80ms |
| Card enter | slide up 16px + fade in | 200ms ease-out |
| Card exit | fade out | 150ms |
| Plant placed | scale bounce 0→1.08→1.0 | 300ms spring |
| Watered hearts | float up + fade | 800ms |
| Bloom burst | 6 emoji scatter | 600ms stagger |
| Toast appear | slide up + fade in | 200ms |
| Toast dismiss | fade out | 300ms |

**Touch targets:** Minimum 44×44px on all interactive elements (mobile requirement).  
**No hover-only interactions** — everything must work on touch.

---

## 6. GEMINI ASSET SPEC — LOCKED PROMPTS

### Rules that must never change
- **White background always** — our code strips it. Never ask for transparent.
- **No pot, no soil, no container** — the room's painted pots are the pots.
- **Stem base at bottom-centre** — plant grows upward from the bottom edge.
- **Vibrant, saturated colours** — never muted, never faded, never dark.
- **Square 1:1, 1024×1024** — always.
- **Consistent style across all stages** — same watercolor artist, same light direction.

### Base template (never change this part)
```
[STAGE + PLANT DESCRIPTION]. 
Isolated on a plain white background. No pot, no soil, no container. 
Stem base at the very bottom-centre of the image, stems exit the frame 
at the bottom edge. Vibrant, saturated watercolor illustration — rich, 
bold colours, not muted or faded. Soft ink outlines. Warm golden light 
from the left. Pure white background, no ground shadow. 
Square crop, 1024×1024.
```

---

### MONSTERA (4 stages — no flourishing)

**monstera-seedling.png**
```
A single tiny monstera deliciosa seedling — one small heart-shaped 
leaf on a short stem, just emerging. Isolated on a plain white 
background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
rich bright green, bold colours, not muted or faded. Soft ink outlines. 
Neutral even lighting, no directional light casting onto background. Pure white background, no colour bleed, no warm wash, no ambient glow, no shadow behind the plant. 
Square crop, 1024×1024.
```

**monstera-sprouting.png**
```
A young monstera deliciosa with 3 small leaves on short stems, growing 
upward with energy. Leaves are solid heart-shaped, no holes yet. 
Isolated on a plain white background. No pot, no soil, no container. 
Stem base at the very bottom-centre of the image. Vibrant, saturated 
watercolor illustration — rich bright green, bold colours, not muted or 
faded. Soft ink outlines. Warm golden light from the left. Pure white 
background, no ground shadow. Square crop, 1024×1024.
```

**monstera-budding.png**
```
An established monstera deliciosa with 5–6 leaves, some beginning to 
show their first small fenestrations (holes). Full and bushy. Isolated 
on a plain white background. No pot, no soil, no container. Stem base 
at the very bottom-centre of the image. Vibrant, saturated watercolor 
illustration — rich deep green, bold colours, not muted or faded. Soft 
ink outlines. Warm golden light from the left. Pure white background, 
no ground shadow. Square crop, 1024×1024.
```

**monstera-blooming.png**
```
A fully mature monstera deliciosa at peak growth — 7–9 large dramatic 
leaves with prominent natural fenestrations (holes and splits). Lush, 
full canopy spreading wide. Isolated on a plain white background. No pot, 
no soil, no container. Stem base at the very bottom-centre of the image, 
stems exit the frame at the bottom edge. Vibrant, saturated watercolor 
illustration — rich deep green with bright highlights, bold colours, not 
muted or faded. Soft ink outlines. Warm golden light from the left. 
Pure white background, no ground shadow. Square crop, 1024×1024.
```

---

### FERN (5 stages)

**fern-seedling.png**
```
A single tiny Boston fern seedling — 2–3 small delicate fronds just 
unfurling. Isolated on a plain white background. No pot, no soil, no 
container. Stem base at the very bottom-centre of the image. Vibrant, 
saturated watercolor illustration — bright fresh green, bold colours, 
not muted or faded. Soft ink outlines. Warm golden light from the left. 
Pure white background, no ground shadow. Square crop, 1024×1024.
```

**fern-sprouting.png**
```
A young Boston fern with 5–6 arching fronds spreading outward. Fronds 
have visible leaflets. Isolated on a plain white background. No pot, no 
soil, no container. Stem base at the very bottom-centre of the image. 
Vibrant, saturated watercolor illustration — bright and dark greens, bold 
colours, not muted or faded. Soft ink outlines. Warm golden light from 
the left. Pure white background, no ground shadow. Square crop, 1024×1024.
```

**fern-budding.png**
```
An established Boston fern — full, rounded shape with many arching fronds 
covered in bright leaflets, some drooping gracefully. Isolated on a plain 
white background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
rich layered greens, bold colours, not muted or faded. Soft ink outlines. 
Neutral even lighting, no directional light casting onto background. Pure white background, no colour bleed, no warm wash, no ambient glow, no shadow behind the plant. 
Square crop, 1024×1024.
```

**fern-blooming.png**
```
A lush, full-grown Boston fern at peak beauty — dense, overflowing with 
long arching fronds that cascade outward in all directions. Isolated on a 
plain white background. No pot, no soil, no container. Stem base at the 
very bottom-centre of the image. Vibrant, saturated watercolor 
illustration — rich deep and bright greens, bold colours, not muted or 
faded. Soft ink outlines. Warm golden light from the left. Pure white 
background, no ground shadow. Square crop, 1024×1024.
```

**fern-flourishing.png**
```
An abundant, magnificent Boston fern — enormous, overflowing with dozens 
of long cascading fronds filling the entire frame. The most lush version 
possible. Isolated on a plain white background. No pot, no soil, no 
container. Stem base at the very bottom-centre of the image. Vibrant, 
saturated watercolor illustration — maximum richness of green tones, bold 
colours, not muted or faded. Soft ink outlines. Warm golden light from 
the left. Pure white background, no ground shadow. Square crop, 1024×1024.
```

---

### TULIP (5 stages)

**tulip-seedling.png**
```
A single tiny tulip seedling — one or two thin green shoots just emerging 
upright. Isolated on a plain white background. No pot, no soil, no 
container. Stem base at the very bottom-centre of the image. Vibrant, 
saturated watercolor illustration — bright fresh green stems, bold 
colours, not muted or faded. Soft ink outlines. Warm golden light from 
the left. Pure white background, no ground shadow. Square crop, 1024×1024.
```

**tulip-sprouting.png**
```
A young tulip — 3 upright green stems with strap-like leaves, growing 
tall and straight. No buds yet. Isolated on a plain white background. No 
pot, no soil, no container. Stem base at the very bottom-centre of the 
image. Vibrant, saturated watercolor illustration — bright bold greens, 
not muted or faded. Soft ink outlines. Warm golden light from the left. 
Pure white background, no ground shadow. Square crop, 1024×1024.
```

**tulip-budding.png**
```
Tulip stems with closed, pointed buds at the top — red buds tightly 
closed, about to open. Upright elegant stems with leaves. Isolated on a 
plain white background. No pot, no soil, no container. Stem base at the 
very bottom-centre of the image. Vibrant, saturated watercolor 
illustration — rich red buds and bright green stems, bold colours, not 
muted or faded. Soft ink outlines. Warm golden light from the left. 
Pure white background, no ground shadow. Square crop, 1024×1024.
```

**tulip-blooming.png**
```
Tulips in full bloom — 3–4 stems each topped with a wide-open, 
cup-shaped red tulip flower. Dramatic and beautiful. Isolated on a plain 
white background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
bold red petals, rich green stems, not muted or faded. Soft ink outlines. 
Neutral even lighting, no directional light casting onto background. Pure white background, no colour bleed, no warm wash, no ambient glow, no shadow behind the plant. 
Square crop, 1024×1024.
```

**tulip-flourishing.png**
```
An abundant cluster of fully open red tulips — 5–6 blooms at different 
heights, lush and celebratory. Isolated on a plain white background. No 
pot, no soil, no container. Stem base at the very bottom-centre of the 
image. Vibrant, saturated watercolor illustration — maximum red and green 
vibrancy, bold colours, not muted or faded. Soft ink outlines. Warm 
golden light from the left. Pure white background, no ground shadow. 
Square crop, 1024×1024.
```

---

### JASMINE (5 stages)

**jasmine-seedling.png**
```
A single tiny jasmine seedling — a small vine with 2–3 tiny oval dark 
green leaves. Isolated on a plain white background. No pot, no soil, no 
container. Stem base at the very bottom-centre of the image. Vibrant, 
saturated watercolor illustration — bright fresh green, bold colours, not 
muted or faded. Soft ink outlines. Warm golden light from the left. Pure 
white background, no ground shadow. Square crop, 1024×1024.
```

**jasmine-sprouting.png**
```
A young jasmine vine — trailing stems with small clusters of dark oval 
leaves, beginning to spread. No flowers yet. Isolated on a plain white 
background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
rich dark green leaves, bold colours, not muted or faded. Soft ink 
outlines. Warm golden light from the left. Pure white background, no 
ground shadow. Square crop, 1024×1024.
```

**jasmine-budding.png**
```
A jasmine plant with full foliage and tiny round flower buds in clusters 
— buds white and about to open. Bushy and full. Isolated on a plain white 
background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
rich green with white buds, bold colours, not muted or faded. Soft ink 
outlines. Warm golden light from the left. Pure white background, no 
ground shadow. Square crop, 1024×1024.
```

**jasmine-blooming.png**
```
A jasmine plant in full bloom — covered in small, star-shaped white 
flowers scattered across lush dark green foliage. Trailing, romantic, 
fragrant-looking. Isolated on a plain white background. No pot, no soil, 
no container. Stem base at the very bottom-centre of the image. Vibrant, 
saturated watercolor illustration — bright white flowers against rich 
dark green, bold colours, not muted or faded. Soft ink outlines. Warm 
golden light from the left. Pure white background, no ground shadow. 
Square crop, 1024×1024.
```

**jasmine-flourishing.png**
```
An abundant jasmine in full peak bloom — overflowing with hundreds of 
tiny white star flowers across lush cascading green foliage. Maximum 
beauty and fullness. Isolated on a plain white background. No pot, no 
soil, no container. Stem base at the very bottom-centre of the image. 
Vibrant, saturated watercolor illustration — dazzling white flowers on 
deep rich green, bold colours, not muted or faded. Soft ink outlines. 
Neutral even lighting, no directional light casting onto background. Pure white background, no colour bleed, no warm wash, no ambient glow, no shadow behind the plant. 
Square crop, 1024×1024.
```

---

### ROSE (5 stages)

**rose-seedling.png**
```
A tiny rose seedling — a single thin thorny stem with 2–3 small 
compound leaves just emerging. Isolated on a plain white background. No 
pot, no soil, no container. Stem base at the very bottom-centre of the 
image. Vibrant, saturated watercolor illustration — bright green leaves, 
bold colours, not muted or faded. Soft ink outlines. Warm golden light 
from the left. Pure white background, no ground shadow. Square crop, 
1024×1024.
```

**rose-sprouting.png**
```
A young rose bush — multiple thorny stems with compound leaves growing 
upward. No buds yet, just confident green growth. Isolated on a plain 
white background. No pot, no soil, no container. Stem base at the very 
bottom-centre of the image. Vibrant, saturated watercolor illustration — 
rich greens with visible thorns, bold colours, not muted or faded. Soft 
ink outlines. Warm golden light from the left. Pure white background, no 
ground shadow. Square crop, 1024×1024.
```

**rose-budding.png**
```
A rose bush with full green foliage and tight deep red rose buds forming 
at the tips of stems — about to open. Elegant and anticipatory. Isolated 
on a plain white background. No pot, no soil, no container. Stem base at 
the very bottom-centre of the image. Vibrant, saturated watercolor 
illustration — rich red buds and deep greens, bold colours, not muted or 
faded. Soft ink outlines. Warm golden light from the left. Pure white 
background, no ground shadow. Square crop, 1024×1024.
```

**rose-blooming.png**
```
A rose bush in full bloom — 3–4 large, fully open deep red roses with 
layered petals, surrounded by lush green foliage and thorny stems. 
Classic, romantic, dramatic. Isolated on a plain white background. No 
pot, no soil, no container. Stem base at the very bottom-centre of the 
image. Vibrant, saturated watercolor illustration — bold crimson red 
roses, rich greens, not muted or faded. Soft ink outlines. Warm golden 
light from the left. Pure white background, no ground shadow. Square 
crop, 1024×1024.
```

**rose-flourishing.png**
```
An abundant rose bush at absolute peak — covered in large, fully open 
deep red roses at multiple heights, overflowing with blooms and lush 
foliage. Maximum beauty and drama. Isolated on a plain white background. 
No pot, no soil, no container. Stem base at the very bottom-centre of the 
image. Vibrant, saturated watercolor illustration — maximum crimson 
richness and deep greens, bold colours, not muted or faded. Soft ink 
outlines. Warm golden light from the left. Pure white background, no 
ground shadow. Square crop, 1024×1024.
```

---

## 7. WHAT NEVER BELONGS IN THIS UI

- Drop shadows on plants (grey discs = floating platforms)
- Health bars, numbers, percentages (everything is visual)
- Hover text on empty pots (pots speak for themselves)
- Confirmation modals for low-stakes actions
- Loading spinners (preload everything)
- Any color from outside the palette
- Any font that isn't Lora/serif
- Uppercase buttons (use sentence case)
- More than 2 overlapping UI layers at once

---

## 8. OPEN DECISIONS (not locked yet)

- [ ] Plant picker grid vs carousel (leaning Moonlighter grid)
- [ ] Coin milestone animation (50/100/250/500 coins)
- [ ] Night/dusk room variants (MVP2)
- [ ] Harvest → vase mechanic (ladder as trophy shelf)
- [ ] Rare color variant reveal animation

---

*Update this file at the end of every session. It is the contract between the room and the UI.*
