# Zen Garden App — Master Context

> Single source of truth. Updated at end of every session.
> Stack: React + Vite | Path: /Users/yashashwani/Documents/Claude/Projects/Zen garden app
> Last updated: 2026-05-19

---

## What This App Is
A cozy mental health gardening app. You tend plants daily — water them, watch them grow, earn coins, collect rare variants. Think Viridi + Duolingo + Animal Crossing.

---

## Decisions Locked In

| Decision | Answer |
|---|---|
| Framework | React + Vite |
| Styling | Plain CSS (App.css) |
| Persistence | localStorage (coins + plant states + streaks) |
| On bloom | Stays bloomed forever (trophy) |
| On death | Slot clears automatically |
| Replanting | Costs coins (no free replacements) |
| Slots | 6 fixed slots in the room |
| Entry point | Click empty slot → card picker. No persistent buttons. |
| Plant picker | Full-screen overlay, Pokemon card format, one card at a time |
| Watering | Via side panel OR Ghibli watering can (tilts to thirsty plants) |
| Atmosphere | Canvas particle layer (dust motes + drifting leaves) over room |
| Colour grade | `filter: sepia(0.09) saturate(1.1) brightness(0.95)` on .room-svg |
| Rooms | 1 for MVP1, multiple rooms in MVP2 |
| Collectibles | Rare color variants via streaks (MVP2) |

---

## Interaction Model (Session 08 — rebuilt)

1. Player opens app → sees the room, ambient particles, watering can. No UI chrome.
2. Hover an empty slot → amber pill button `+ Plant here` appears above it
3. Click slot or pill → `PlantPickerCard` overlay opens (targets that slot)
4. Card carousel: ‹ prev · 1/5 · next › — each card shows hero bloom image, stats, trivia, CTA
5. Plant selected → seedling appears with scale-bounce pop animation
6. Each day: hover a thirsty (droopy/wilting) slot → watering can tilts → click can to water
7. Watered plant: toast `+1 🌿` floats up from bottom
8. Stage advance: toast names the new stage. Bloom: `🌺 +10` toast + stage-bounce animation
9. Click occupied slot → detail panel slides in from right (same Pokemon card style)

---

## New Components (Session 08)

| Component | File | Purpose |
|---|---|---|
| ParticleLayer | `src/components/ParticleLayer.jsx` | Canvas ambient particles — dust motes + drifting leaves |
| PlantPickerCard | `src/components/PlantPickerCard.jsx` | Full-screen Pokemon card picker overlay |
| WateringCan | Inside `Room.jsx` | Inline SVG can, tilts toward thirsty slots, click to water |

---

## Plant Catalog

| ID | Name | Days to Bloom | Resilience | Size | Cost |
|---|---|---|---|---|---|
| PLT_01 | Fern | 1 | High | Small | 5 |
| PLT_02 | Monstera | 4 | Medium | Large | 14 |
| PLT_03 | Tulip | 3 | Medium | Medium | 10 |
| PLT_06 | Jasmine | 4 | High | Medium | 15 |
| PLT_07 | Rose | 5 | Low | Medium | 20 |

Each plant has: `tagline`, `trivia` (real botanical fact), `resilience` field in plantTypes.js.

---

## Growth System

**Two independent axes:**
- GROWTH: Seedling → Sprouting → Budding → Blooming (→ Flourishing for some)
- HEALTH: Healthy → Droopy → Wilting → Dead

---

## Data Model (unchanged)

See gameStore.js — untouched this session.

---

## Dev Mode — Restore Before Ship

| File | Change | Restore to |
|---|---|---|
| `gameStore.js` | `coins: 9999` | `coins: 30` |
| `gameStore.js` | `wateredToday` check removed | Restore guard |
| `App.jsx` | Water button always enabled | Add back `disabled={plant.wateredToday}` |

---

## Current Status
**Session: 2026-05-19 — Autonomous loop build (sessions 08-10)**

### Interaction model (locked)
- Side panel: REMOVED. No popup, no card for occupied slots.
- Plant info: floating health bar visible on hover only (💧 always visible if thirsty)
- Watering: DRAG the watering can to a thirsty plant (SVG drag events). Can tilts + water drops when over valid target. Hearts 💗 float up on successful water.
- Right-click occupied slot → remove confirm tooltip → right-click again to remove
- Click empty slot → picker overlay

### Completed sessions 08-10
- [x] Side panel completely removed
- [x] Drag watering can mechanic (SVG onMouseDown/Move/Up, coordinate conversion)
- [x] Health bar + plant name above each plant (hover-only, 💧 always for thirsty)
- [x] Hearts animation (💗 ×4 float up on water)
- [x] Bloom burst (🌸✨🌺 float up when plant reaches final stage)
- [x] Fireplace embers particle layer (night/dusk only, 14 orange-amber embers)
- [x] Plant anchoring fix: imgY = cfg.y - w*0.92 (pot sits on surface, not floating)
- [x] Glow rect (full-image warm backing for multiply blend, opacity varies by time of day)
- [x] Cinematic vignette (radial gradient dark edges)
- [x] Greeting overlay on load (3.2s lifecycle: "Good night + plant status")
- [x] Watered-today ✓ badge + streak flames 🔥🔥 on hover
- [x] Empty garden hint (pulsing SVG text when all slots empty)
- [x] Coin milestones (50/100/250/500, localStorage tracked)
- [x] HUD: floating cream pills (coins · plant count · time)
- [x] Toast: cream background matching HUD
- [x] Picker card: amber border, bloom day dots, resilience label, stage count, card slide animation
- [x] Remove confirm: right-click twice, red SVG tooltip
- [x] Shift+T: dev day advance (waterToday reset + growth logic)
- [x] Can tooltip: first-use "Drag me to a thirsty plant 💧"
- [x] Storage v7: fresh state with 1000 coins for testing
- [x] Slot positions v2: surfaces at dresser top/bookshelf/window ledge/bench/fireplace beam/floor

### Next steps (for next session)
- [ ] Slot positions verified visually by user (Shift+E drag editor)
- [ ] Test all 4 time-of-day room variants with plants
- [ ] Restore production values: coins → 30, storage key → v8
- [ ] Plant sizes still TBD — user to verify with drag editor
- [ ] Room images for dusk/dawn/day (currently using night room for dev)
- [ ] Watering ripple CSS animation on plant (stretch)

---

## Key File Map

| File | Role |
|---|---|
| `src/App.jsx` | State, handlers, layout, picker + detail routing |
| `src/App.css` | All styles + animations |
| `src/components/Room.jsx` | SVG scene, slots, watering can, hover pill |
| `src/components/ParticleLayer.jsx` | Canvas ambient layer |
| `src/components/PlantPickerCard.jsx` | Pokemon card picker overlay |
| `src/components/PlantSprite.jsx` | SVG plant renderers (untouched) |
| `src/data/plantTypes.js` | Plant catalog + trivia + resilience |
| `src/store/gameStore.js` | All game logic (untouched) |
| `src/data/slots/room_dusk.json` | Slot positions (drag editor) |
| `src/dev/SlotEditor.jsx` | Dev drag editor, Shift+E |

---

## Miro board
https://miro.com/app/board/uXjVGyQKIZE=/

---

## MVP Roadmap
**MVP1:** Room + 6 slots + plant picker + watering + growth + coins + localStorage → near complete
**MVP2:** Multiple rooms + rare variants + seeds/saplings + collectibles
