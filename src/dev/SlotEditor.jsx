import { useEffect, useRef, useState } from 'react'

// Dev-only slot editor.
// Shift+E toggle · drag handle to move · wheel on handle to resize
// click empty area to add · right-click handle to delete · Shift+S export JSON
//
// Working state persists to localStorage so reloads don't lose your edits.

const LS_KEY = 'zen.slotEditor.working'

export default function SlotEditor({
  active,
  slots,
  onChange,
  viewBox,
  roomId,
}) {
  const svgRef = useRef(null)
  const [drag, setDrag] = useState(null) // { id, dx, dy }

  // Convert a pointer event (client coords) into viewBox coords.
  function toViewBox(evt) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = evt.clientX
    pt.y = evt.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const { x, y } = pt.matrixTransform(ctm.inverse())
    return { x: Math.round(x), y: Math.round(y) }
  }

  function updateSlot(id, patch) {
    const next = slots.map(s => s.id === id ? { ...s, ...patch } : s)
    onChange(next)
  }

  function handlePointerDown(evt, slot) {
    evt.stopPropagation()
    const { x, y } = toViewBox(evt)
    setDrag({ id: slot.id, dx: x - slot.x, dy: y - slot.y })
    evt.currentTarget.setPointerCapture(evt.pointerId)
  }

  function handlePointerMove(evt) {
    if (!drag) return
    const { x, y } = toViewBox(evt)
    updateSlot(drag.id, { x: x - drag.dx, y: y - drag.dy })
  }

  function handlePointerUp(evt) {
    if (!drag) return
    evt.currentTarget.releasePointerCapture?.(evt.pointerId)
    setDrag(null)
  }

  function handleWheel(evt, slot) {
    evt.preventDefault()
    const delta = evt.deltaY < 0 ? 5 : -5
    const next = Math.max(20, Math.min(400, slot.maxWidth + delta))
    updateSlot(slot.id, { maxWidth: next })
  }

  function handleBgClick(evt) {
    if (drag) return
    if (evt.target !== svgRef.current && evt.target.tagName !== 'rect') return
    const { x, y } = toViewBox(evt)
    const nextId = `slot_${slots.length + 1}_${Date.now().toString(36).slice(-4)}`
    onChange([
      ...slots,
      { id: nextId, x, y, maxWidth: 110, zIndex: 7, label: 'new' },
    ])
  }

  function handleContextMenu(evt, slot) {
    evt.preventDefault()
    evt.stopPropagation()
    onChange(slots.filter(s => s.id !== slot.id))
  }

  // Persist + export
  useEffect(() => {
    if (!active) return
    localStorage.setItem(LS_KEY, JSON.stringify({ roomId, slots }))
  }, [active, slots, roomId])

  useEffect(() => {
    if (!active) return
    function onKey(e) {
      if (e.shiftKey && e.key === 'S') {
        const payload = {
          roomId,
          viewBox,
          slots: slots.map(({ id, x, y, maxWidth, zIndex, label }) => ({
            id, x, y, maxWidth, zIndex, label: label ?? '',
          })),
        }
        const json = JSON.stringify(payload, null, 2)
        navigator.clipboard?.writeText(json)
        console.log('[SlotEditor] JSON copied to clipboard:\n' + json)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, slots, viewBox, roomId])

  if (!active) return null

  return (
    <svg
      ref={svgRef}
      className="slot-editor-svg"
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      preserveAspectRatio="xMidYMid slice"
      onClick={handleBgClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Transparent capture layer so empty-area clicks register */}
      <rect x="0" y="0" width={viewBox.width} height={viewBox.height} fill="transparent" />

      {slots.map(slot => {
        const r = Math.max(10, slot.maxWidth / 6)
        return (
          <g key={slot.id}>
            {/* Footprint preview = matches slot size in viewBox units */}
            <ellipse
              cx={slot.x}
              cy={slot.y}
              rx={slot.maxWidth / 2}
              ry={slot.maxWidth / 8}
              fill="rgba(200,133,58,0.18)"
              stroke="rgba(200,133,58,0.55)"
              strokeWidth="2"
              strokeDasharray="6 4"
              pointerEvents="none"
            />
            {/* Drag handle */}
            <circle
              cx={slot.x}
              cy={slot.y}
              r={r}
              fill="rgba(200,133,58,0.85)"
              stroke="#1a1208"
              strokeWidth="2"
              style={{ cursor: drag?.id === slot.id ? 'grabbing' : 'grab' }}
              onPointerDown={e => handlePointerDown(e, slot)}
              onWheel={e => handleWheel(e, slot)}
              onContextMenu={e => handleContextMenu(e, slot)}
            />
            <text
              x={slot.x}
              y={slot.y + 4}
              textAnchor="middle"
              fontSize="14"
              fontFamily="ui-monospace, monospace"
              fill="#1a1208"
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {slot.id.replace('slot_', '')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function loadEditorWorking(roomId) {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.roomId !== roomId) return null
    return parsed.slots
  } catch {
    return null
  }
}
