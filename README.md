# Zen Garden App

A cozy daily-habit gardening game. Tend plants, water them, watch them grow. Built with React + Vite.

**Vibe:** Viridi × Duolingo × Animal Crossing × Tsuki's Odyssey

---

## Play it

| Version | Link |
|---|---|
| **Current** (new watercolour room) | https://zen-garden-yash.vercel.app |
| **Original room art** (old PNG backgrounds) | https://zen-garden-app-ochre.vercel.app |

---

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173 — landscape only (rotate prompt on portrait).

**Dev shortcuts:**
- `Shift+E` — toggle slot drag editor (move plant slots onto painted pots)
- `Shift+S` — copy updated slot JSON to clipboard
- `Shift+T` — advance one day (test growth/watering)

---

## Docs in this repo

| File | What it covers |
|---|---|
| [`FOR_CLAUDE.md`](./FOR_CLAUDE.md) | Full collaborator briefing — read this first. Game design, architecture, the plant placement problem. |
| [`STYLE_BIBLE.md`](./STYLE_BIBLE.md) | Visual spec for all assets. Gemini prompts, style rules, rejection criteria. |
| [`GAME_UI_BIBLE.md`](./GAME_UI_BIBLE.md) | Interaction model, UI rules, locked decisions. |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | MVP1 milestone plan. |

---

## Stack

- React + Vite
- Plain CSS (no Tailwind)
- localStorage — no backend
- SVG room scene with canvas particle layer

## Current status

MVP1 core loop is working: plant, water, grow, earn coins. Main open issue is **plant slot positions** — the 6 terracotta pots in the room art need slots calibrated to them. See `FOR_CLAUDE.md` for full context.
