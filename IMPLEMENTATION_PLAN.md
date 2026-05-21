# SVG Room Architecture — Implementation Plan

## Why
Room is a 1370×784 PNG rendered with CSS `background-size: cover`.
`cover` crops and scales the image per viewport. CSS `%` slot positions
are viewport-relative, not image-relative. Plants drift off their surfaces
on mobile. SVG fixes this by giving room + plants one shared coordinate system.

## Target Architecture

```
<svg viewBox="0 0 1370 784" preserveAspectRatio="xMidYMid meet">
  <image href={roomPng} width="1370" height="784" />
  {slots.map(slot =>
    <foreignObject x={slot.x - slot.maxWidth/2} y={slot.y - slot.maxWidth} ...>
      <PlantSlot ... />
    </foreignObject>
  )}
</svg>
```

All coordinates in viewBox units (= image pixels). Scales uniformly on every screen.

---

## Files to Create / Modify

### 1. `src/data/slotConfig.js` (NEW)
Replaces SLOT_CONFIG in App.jsx.
Coordinates in viewBox units based on room image (1370×784).

```js
export const SLOT_CONFIG = {
  slot_1: { x: 960,  y: 558, maxWidth: 140, zIndex: 7 }, // hearth right
  slot_2: { x: 480,  y: 445, maxWidth: 150, zIndex: 6 }, // furniture top (under window)
  slot_3: { x: 875,  y: 558, maxWidth: 120, zIndex: 7 }, // hearth center
  slot_4: { x: 890,  y: 295, maxWidth: 100, zIndex: 5 }, // mantelpiece left
  slot_5: { x: 1015, y: 295, maxWidth:  90, zIndex: 5 }, // mantelpiece right
  slot_6: { x: 500,  y: 755, maxWidth: 200, zIndex: 8 }, // floor foreground
}
```

> Coordinates are estimates from visual inspection of room_day.png.
> Wire the dev grid overlay (Step 4) to confirm and adjust.

---

### 2. `src/components/Room.jsx` (NEW)
Replaces the `<div className="room-bg">` + `.room-slots` divs in App.jsx.

```jsx
import { SLOT_CONFIG } from '../data/slotConfig'
import PlantSlotSvg from './PlantSlotSvg'

const ROOM_IMAGES = {
  dawn:  '/assets/rooms/room_dawn.png',
  day:   '/assets/rooms/room_day.png',
  dusk:  '/assets/rooms/room_dusk.png',
  night: '/assets/rooms/room_night.png',
}

export default function Room({ timeOfDay, slots, plants, plantTypes,
  selectedSlot, plantingSlot, onSlotClick, onWater }) {
  const roomSrc = ROOM_IMAGES[timeOfDay]

  return (
    <svg
      className="room-svg"
      viewBox="0 0 1370 784"
      preserveAspectRatio="xMidYMid meet"
    >
      <image href={roomSrc} width="1370" height="784" />

      {Object.entries(SLOT_CONFIG).map(([slotId, cfg]) => {
        const instanceId = slots[slotId]
        const plant = instanceId ? plants[instanceId] : null
        const w = cfg.maxWidth
        const h = cfg.maxWidth  // all assets are square

        return (
          <foreignObject
            key={slotId}
            x={cfg.x - w / 2}
            y={cfg.y - h}
            width={w}
            height={h}
            style={{ zIndex: cfg.zIndex, overflow: 'visible' }}
          >
            <PlantSlotSvg
              slotId={slotId}
              plant={plant}
              plantType={plant ? plantTypes[plant.plantTypeId] : null}
              maxWidth={w}
              isSelected={selectedSlot === slotId}
              isTargeted={plantingSlot === slotId}
              onClick={() => onSlotClick(slotId)}
              onWater={() => onWater(instanceId)}
            />
          </foreignObject>
        )
      })}
    </svg>
  )
}
```

---

### 3. `src/components/PlantSlotSvg.jsx` (NEW)
HTML content inside each foreignObject. Replaces the PlantSlot function in App.jsx.

```jsx
import { PlantSprite, EmptyPot } from './PlantSprite'
import { PLANT_TYPES } from '../data/plantTypes'

export default function PlantSlotSvg({
  plant, plantType, maxWidth, isSelected, isTargeted, onClick, onWater
}) {
  return (
    <div
      style={{ width: maxWidth, height: maxWidth, position: 'relative', cursor: 'pointer' }}
      className={`slot ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {plant ? (
        <>
          <PlantSprite
            plantTypeId={plant.plantTypeId}
            growthStage={plant.growthStage}
            health={plant.health}
            potSize={maxWidth}
            bloomColor={plant.bloomColor}
          />
          <div className="plant-label">{plantType?.name}</div>
          {plant.health !== 'dead'
            && plant.growthStage !== plantType?.stages[plantType.stages.length - 1]
            && !plant.wateredToday && (
            <button
              className="water-dot"
              onClick={e => { e.stopPropagation(); onWater() }}
              aria-label="Water plant"
            >💧</button>
          )}
          {plant.wateredToday && <div className="watered-dot">✓</div>}
        </>
      ) : isTargeted ? (
        <EmptyPot size={maxWidth} glowing={true} />
      ) : null}
    </div>
  )
}
```

---

### 4. Dev Grid Overlay (inside Room.jsx, dev-only)
Add this inside the `<svg>` when `import.meta.env.DEV` is true.
Toggle with a button. Click any point to log its viewBox coordinates.

```jsx
{showGrid && (
  <g className="dev-grid" onClick={e => {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) / rect.width * 1370)
    const y = Math.round((e.clientY - rect.top) / rect.height * 784)
    console.log(`x: ${x}, y: ${y}`)
  }}>
    {Array.from({ length: Math.ceil(1370 / 40) }, (_, i) => (
      <line key={`v${i}`} x1={i*40} y1={0} x2={i*40} y2={784}
        stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    ))}
    {Array.from({ length: Math.ceil(784 / 40) }, (_, i) => (
      <line key={`h${i}`} x1={0} y1={i*40} x2={1370} y2={i*40}
        stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    ))}
  </g>
)}
```

Use this to click each slot surface and log exact coordinates.
Update `slotConfig.js` with confirmed values.

---

### 5. `App.jsx` — Wire Room.jsx
Remove:
- `SLOT_CONFIG` constant
- `<div className="room-bg" ...>`
- `<div className="room-slots">` + PlantSlot map

Add:
```jsx
import Room from './components/Room'

// Inside return:
<Room
  timeOfDay={timeOfDay}
  slots={state.slots}
  plants={state.plants}
  plantTypes={PLANT_TYPES}
  selectedSlot={selectedSlot}
  plantingSlot={plantingSlot}
  onSlotClick={handleSlotClick}
  onWater={handleWater}
/>
```

Also remove the `PlantSlot` function from App.jsx (moved to PlantSlotSvg.jsx).

---

### 6. `App.css` — Room SVG styles
Replace `.room-bg` styles with:

```css
.room-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

---

## Execution Order

1. Create `src/data/slotConfig.js`
2. Create `src/components/PlantSlotSvg.jsx`
3. Create `src/components/Room.jsx`
4. Update `App.jsx` to use `<Room />`
5. Update `App.css`
6. Run dev server → confirm room renders + plants sit correctly
7. Toggle grid overlay → click each slot surface → confirm/adjust coordinates in slotConfig.js
8. Remove grid overlay toggle from production build

---

## Notes
- `preserveAspectRatio="xMidYMid meet"` = letterbox (whole room visible, may show bars on wide screens)
- `preserveAspectRatio="xMidYMid slice"` = fill screen (crops room, like old cover — only use if bars are unacceptable)
- `foreignObject` is broadly supported (all modern browsers incl. mobile Safari)
- Plant assets are all 1:1 square → `potSize` becomes `maxWidth` and height equals width
- Fern has baked-in shadow (see asset audit) — needs regeneration before production
