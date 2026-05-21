// Slot data loads from per-room JSON. Edit positions via the in-app SlotEditor
// (Shift+E), then Shift+S to export updated JSON to your clipboard.
//
// Render order = ascending zIndex (SVG painter model — higher zIndex renders on top).

import roomDusk from './slots/room_dusk.json'

// room_day and room_night share the same slot layout as room_dusk until
// new rooms are generated and slots are re-derived via Shift+E editor.
const ROOMS = {
  room_dusk: roomDusk,
  room_day:  roomDusk,
  room_night: roomDusk,
  room_dawn: roomDusk,
}

export function getRoomConfig(roomId = 'room_dusk') {
  return ROOMS[roomId] ?? ROOMS.room_dusk
}

export function getSlotsByDepth(roomId = 'room_dusk') {
  const room = getRoomConfig(roomId)
  return [...room.slots].sort((a, b) => a.zIndex - b.zIndex)
}

// Back-compat exports (Room.jsx + anywhere else still reading the old shape).
export const SLOT_CONFIG = Object.fromEntries(
  roomDusk.slots.map(s => [s.id, { x: s.x, y: s.y, maxWidth: s.maxWidth, zIndex: s.zIndex }])
)

export const SLOTS_BY_DEPTH = getSlotsByDepth('room_dusk').map(s => [s.id, s])
