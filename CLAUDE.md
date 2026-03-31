# Zen Garden App — Master Context

> Single source of truth. Updated at end of every session.
> Stack: React + Vite | Path: /Users/yashashwani/Documents/Claude/Projects/Zen garden app

---

## What This App Is
A cozy mental health gardening app. You tend plants daily — water them, watch them grow, earn coins, collect rare variants. Think Viridi + Duolingo + Animal Crossing.

---

## Decisions Locked In

| Decision | Answer |
|---|---|
| Framework | React + Vite |
| Styling | TBD (plain CSS for now) |
| Persistence | localStorage (coins + plant states + streaks) |
| On bloom | Stays bloomed forever (trophy) |
| On death | Slot clears automatically |
| Replanting | Costs coins (no free replacements) |
| Slots | 6 fixed slots in the room |
| Plant types | 8 (any combo across 6 slots) |
| Rooms | 1 for MVP1, multiple rooms in MVP2 |
| Collectibles | Rare color variants via streaks (MVP2) |

---

## Plant Catalog

| ID | Name | Days to Bloom | Resilience | Size | Personality |
|---|---|---|---|---|---|
| PLT_01 | Pothos | 1 | High | Small | Chill, asks for nothing |
| PLT_02 | Petunia | 2 | Medium | Small | Cheerful, easy |
| PLT_03 | Tulip | 3 | Medium | Medium | Elegant, quiet |
| PLT_04 | Sunflower | 3 | Low | Large | Needy, dramatic |
| PLT_05 | Lily | 4 | Medium | Medium | Graceful, patient |
| PLT_06 | Jasmine | 4 | High | Medium | Calm, forgiving |
| PLT_07 | Rose | 5 | Low | Medium | High-maintenance, worth it |
| PLT_08 | Bougainvillea | 7 | High | Large | Stubborn, slow burn |

---

## Growth System

**Two independent axes:**
- GROWTH: Seedling → Sprouting → Budding → Blooming
- HEALTH: Healthy → Droopy → Wilting → Dead

**Rules:**
- Water once a day → growth progresses
- Water multiple times a day → counts as once (no bonus to growth)
- Miss 1-2 days → Droopy
- Miss 3-5 days → Wilting
- Water when Droopy/Wilting → bounces back, no stage reset
- Miss 30+ days → Dead (slot clears)

---

## Coin Economy

**Earn:**
- +1 coin per plant watered per day
- +5 coins for 7-day streak on any plant
- +10 coins when plant reaches Blooming

**Spend:**
- Planting a seed → costs coins (amount TBD per plant rarity)
- Rare variant seeds → more expensive (MVP2)

**Starting balance:** Enough to plant 3 plants on day one (TBD exact amount)

---

## Data Model

```js
// PlantType — static config
{
  id: 'PLT_01',
  name: 'Pothos',
  daysToBloom: 1,
  wiltsAfterDays: 2,   // days missed before Wilting
  deadAfterDays: 30,
  size: 'small',       // small | medium | large
  personality: 'Chill, asks for nothing',
  cost: 10,            // coins to plant
}

// PlantInstance — live state in localStorage
{
  instanceId: 'uuid',
  plantTypeId: 'PLT_01',
  slotId: 'slot_1',    // slot_1 through slot_6
  growthStage: 'seedling', // seedling | sprouting | budding | blooming
  health: 'healthy',      // healthy | droopy | wilting | dead
  wateredToday: false,
  consecutiveDaysWatered: 0,
  missedDays: 0,
  plantedAt: '2026-03-31',
  lastWateredAt: null,
}

// GameState — global
{
  coins: 30,
  slots: { slot_1: instanceId | null, ... slot_6 },
  lastOpenedAt: date,   // for calculating missed days
}
```

---

## Room UI
- Opens directly to room scene (no splash/onboarding)
- Side panel slides in for plant management
- Reference: cozy Ghibli/lofi room — fireplace, couch, warm amber lighting
- 6 plant slots with fixed positions in the room
- Visual reference: Pinterest board (user to add link)
- Miro board: https://miro.com/app/board/uXjVGyQKIZE=/

---

## Current Status
**Session: 2026-03-31**
- [x] Vite + React scaffolded
- [x] All decisions locked
- [x] Plant catalog defined
- [x] Data model designed
- [x] Economy system designed
- [ ] Pinterest room reference (pending — user to share image)
- [ ] Build data layer (plantTypes config + localStorage)
- [ ] Build core watering loop
- [ ] Build room UI with 6 slots
- [ ] Build side panel / plant picker

## Next Step
Share the Pinterest room reference image → then build data layer first.

---

## MVP Roadmap
**MVP1:** Room + 6 slots + plant picker + watering + growth + coins + localStorage
**MVP2:** Multiple rooms + rare variants + seeds/saplings + collectibles
