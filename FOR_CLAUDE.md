# Zen Garden App — Collaborator Briefing

> Read this before touching any code. This is everything you need to understand the game, the vision, and exactly where we're stuck.

---

## What This Is

A cozy, daily-habit gardening app. You tend plants in a painterly cabin room — water them, watch them grow, earn coins, collect rare variants.

**Vibe references:** Viridi + Duolingo + Animal Crossing + Tsuki's Odyssey  
**Stack:** React + Vite · Plain CSS · localStorage (no backend)  
**Live URL:** https://zen-garden-bos594623-mittalyashashwani-blips-projects.vercel.app  
**Dev:** `npm run dev` → http://localhost:5173

---

## North Star — Design Philosophy

**The room IS the game. No UI inside it.**

The fantasy is a believable, ambient cozy room you actually want to look at. Every interaction must feel like reaching *into* the room — not operating a game board.

### The locked rules (non-negotiable):

1. **No UI inside the room frame.** No labels, no health bars, no floating icons (except a subtle 💧 when a plant is thirsty).
2. **Watering is diegetic.** A painted watering can lives in the room. Player drags it to a plant. That's the only way to water. No buttons.
3. **No tap-to-water. No menus. No shortcuts.** The pleasure is in the act itself — picking up the can, tilting it, watching drops fall, watching the plant perk up.
4. **Plant health is visual-only.** Healthy = lush. Droopy = pale/yellowed via CSS filter. Wilting = very dim. No progress bars.
5. **Cards/menus only appear outside the room** — e.g. the plant picker overlay. Never overlaid on the room itself.

**Reference feeling:** Tamagotchi, Tsuki's Odyssey, real-life gardening. Slow, tactile, satisfying.

---

## Core Loop (MVP1)

1. Open app → see a painterly watercolour cabin room with 6 plant slots (empty terracotta pots painted into the scene)
2. Hover empty slot → amber `+ Plant here` pill appears
3. Click → PlantPickerCard overlay opens (full-screen, Pokémon card style, ‹ prev · 1/5 · next ›)
4. Choose a plant → seedling pops in with scale-bounce animation
5. Each day: drag the watering can to a thirsty plant → water drops animate → plant reacts → earn coins
6. Plants grow through stages: Seedling → Sprouting → Budding → Blooming
7. Miss watering days → plant droops/wilts via CSS filter (no stage reset on recovery)
8. Bloom = stays bloomed forever (trophy). Death = slot clears after 30+ missed days.

---

## Architecture

### Room rendering
- Room renders as SVG (`viewBox="0 0 1370 784"`)
- Room background art is a `<image>` tag inside the SVG (watercolour JPG)
- Plants render as `<image>` tags with `mixBlendMode: multiply` to remove white PNG backgrounds
- Ambient particles (dust motes, leaves, embers) are a `<canvas>` layer via `ParticleLayer.jsx`

### Slot system
- **Slot positions live in data:** `src/data/slots/room_day.json` (one file per room)
- Each slot has: `id`, `x`, `y`, `maxWidth`, `zIndex`, `label`
- Coordinates are in SVG viewBox space (0–1370 x, 0–784 y)
- Plants anchor at slot (x,y) = the BASE of the pot. Plant image renders upward from that anchor.
- **In-app drag editor:** Press `Shift+E` to toggle. Drag handles to move slots. Scroll wheel on handle to resize maxWidth. Right-click handle to delete. Click empty surface to add. `Shift+S` copies updated JSON to clipboard.
- `Shift+T` = advance one day (dev mode, for testing growth/watering)

### Watering can
- The painted green can in the room art IS the interactive element — there is NO separate SVG can body
- `CAN_HOME = { x: 168, y: 693 }` in Room.jsx — the invisible hit rect sits over the painted can
- When dragged over a valid thirsty plant: can "tilts" + water drops animate from spout tip

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | State, handlers, layout, picker routing |
| `src/App.css` | All styles + animations |
| `src/components/Room.jsx` | SVG scene, slots, watering can, hover pill |
| `src/components/ParticleLayer.jsx` | Canvas ambient layer (dust motes, leaves, embers) |
| `src/components/PlantPickerCard.jsx` | Pokémon card picker overlay |
| `src/data/plantTypes.js` | Plant catalog + trivia + resilience |
| `src/store/gameStore.js` | All game logic (growth, health, coins, streaks) |
| `src/data/slots/room_dusk.json` | Slot positions — currently used for all room variants |
| `src/dev/SlotEditor.jsx` | Dev drag editor, toggled with Shift+E |

### Room variants
- `room_day.jpg` — active room art (watercolour cabin, terracotta pots, golden sunrise, green painted can)
- `room_dusk.png`, `room_dawn.png`, `room_night.png` — exist but not yet tuned
- Time-of-day toggle: tap the time label in the HUD
- All variants currently share the same `room_dusk.json` slot data

### Data model (localStorage key: `zen_garden_state_v8`)
```js
PlantType     → static config: id, name, daysToBloom, cost, size, stages[], trivia, resilience
PlantInstance → live state: growthStage, health, wateredToday, streak, missedDays
GameState     → coins, slots: { slot_1...slot_6 → plantInstanceId }, lastOpenedAt
```

### Plant catalog (MVP1)
| ID | Name | Days to Bloom | Resilience | Cost |
|---|---|---|---|---|
| PLT_01 | Fern | 1 | High | 5 |
| PLT_02 | Monstera | 4 | Medium | 14 |
| PLT_03 | Tulip | 3 | Medium | 10 |
| PLT_06 | Jasmine | 4 | High | 15 |
| PLT_07 | Rose | 5 | Low | 20 |

Plant assets: `/public/assets/plant-assets/{name}-{stage}.png`  
Stages: seedling, sprouting, budding, blooming (flourishing for some)  
Health via CSS filter: droopy = `saturate(0.45)`, wilting = `saturate(0.2) brightness(0.78)`

### Coin economy
- Water a plant: +1/day
- 7-day streak: +5 bonus
- Plant reaches Bloom: +10
- Plant a seed: costs coins (varies by plant)
- Starting balance: 30 coins (currently 1000 for dev — restore before ship)

---

## The Problem We're Stuck On — Plant Placement

**This is the main thing to solve.**

### What's happening
The room art (`room_day.jpg`) has **6 painted terracotta pots** at specific positions on shelves, the windowsill, and the floor. Plants need to appear sitting *in* those pots.

The slot positions in `src/data/slots/room_dusk.json` are **estimated guesses** — they were eyeballed from an image analysis and have never been visually confirmed. They are almost certainly wrong.

### What "correct" looks like
- Plant image renders with its pot base sitting flush on the painted pot in the room art
- No floating above the surface
- No clipping below the surface
- Size (`maxWidth`) feels proportional — not tiny, not giant

### The anchor math
In `Room.jsx`, plant images anchor like this:
```js
// x: slot centre
// imgY = slot.y - (maxWidth * 0.92)
// width = maxWidth, height = maxWidth (square)
```
So `slot.y` = the base of the pot in SVG coordinates. Adjusting `y` moves the plant up/down. Adjusting `maxWidth` scales the plant proportionally.

### How the drag editor works
1. Run `npm run dev`
2. Open http://localhost:5173 in browser
3. Press `Shift+E` → coloured handles appear on each slot
4. Drag handle to move the slot base to the correct pot position in the room art
5. Scroll wheel on handle to adjust `maxWidth`
6. Press `Shift+S` → updated JSON copied to clipboard
7. Paste into `src/data/slots/room_dusk.json` and save → plants re-render

### What we need
The 6 correct (x, y, maxWidth) values for the 6 painted pots in `room_day.jpg`. The room art viewBox is 1370×784.

The 6 pot locations in the room art (approximate, need verification):
1. Fireplace mantle — left pot
2. Fireplace mantle — right pot
3. Windowsill — left pot
4. Windowsill — right pot
5. Floor centre — large pot
6. Floor right — large pot near sofa

### Secondary issue
After slot positions are correct, `room_dusk.json` should be duplicated/renamed to `room_day.json` and the app updated to load the correct file per room variant.

---

## What's Working
- Full game loop: plant, water, grow, earn coins
- Drag watering mechanic
- PlantPickerCard overlay
- ParticleLayer (ambient dust motes, leaves, fireplace embers)
- Health degradation via CSS filter
- HUD (coins, plant count, time)
- Toast notifications
- Day/night toggle
- localStorage persistence
- Vercel deployment (auto-deploys from main branch)

## What's Not Done Yet
- [ ] Slot positions calibrated to actual pot locations in room_day.jpg
- [ ] PlantPickerCard restyle (currently old style, target = Tsuki pastel-yellow, see STYLE_BIBLE.md)
- [ ] Night room art (room_night.jpg)
- [ ] PNG compression (current plant PNGs are too heavy)
- [ ] Mobile QA on real iPhone
- [ ] Restore production values: coins → 30

---

## Style Guide
See `STYLE_BIBLE.md` for the full visual spec. Short version:
- Flat orthographic perspective (no vanishing points)
- Watercolour, painterly, soft-edged (no hard outlines)
- Warm earth palette: cabin browns, muted greens, cream, terracotta
- Warm directional light from upper-left
- Mood: nostalgic, cosy, hazy

---

## To Start Coding
```bash
cd "/Users/yashashwani/Documents/Claude/Projects/Zen garden app"
npm install
npm run dev
```
Then open http://localhost:5173 and press `Shift+E` to see the slot editor.
