import { useRef, useState, useCallback } from 'react'
import { PLANT_TYPES } from '../data/plantTypes'

const ROOM_IMAGE = '/assets/rooms/room_day.jpg'

const HEALTH_FILTER = {
  healthy: '',
  droopy:  'saturate(0.45)',
  wilting: 'saturate(0.2) brightness(0.78)',
  dead:    'grayscale(1) brightness(0.45)',
}

const HEALTH_PROGRESS = { healthy: 1.0, droopy: 0.58, wilting: 0.28, dead: 0.05 }
const HEALTH_COLOR    = { healthy: '#3A9030', droopy: '#C8853A', wilting: '#C93054', dead: '#5C1A1A' }


/* ── Watering Can ─────────────────────────────────────────── */

const CAN_HOME = { x: 168, y: 693 }
const CAN_TIP_KEY = 'zen_can_tip_seen'

function WateringCan({ dragging, dx, dy, anyThirsty, tiltedDrag, onMouseDown }) {
  const [showTip, setShowTip] = useState(false)
  const tipTimeout = useRef(null)

  function handleHover() {
    if (dragging) return
    if (localStorage.getItem(CAN_TIP_KEY)) return
    setShowTip(true)
    localStorage.setItem(CAN_TIP_KEY, '1')
    tipTimeout.current = setTimeout(() => setShowTip(false), 3200)
  }

  function handleLeave() {
    clearTimeout(tipTimeout.current)
    setShowTip(false)
  }
  const showTilt  = dragging ? tiltedDrag : false
  const showDrops = showTilt || (dragging && tiltedDrag)

  const cx = CAN_HOME.x
  const cy = CAN_HOME.y

  return (
    <g
      transform={`translate(${dragging ? dx : 0}, ${dragging ? dy : 0})`}
      className={[
        'watering-can',
        dragging ? 'can-dragging' : '',
        anyThirsty && !dragging ? 'can-thirsty' : '',
      ].join(' ').trim()}
      onPointerDown={onMouseDown}
      onPointerEnter={handleHover}
      onPointerLeave={handleLeave}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      aria-label='Watering can — drag to a thirsty plant'
      role='button'
    >
      {/* Thirsty glow ring over the painted can */}
      {anyThirsty && !dragging && (
        <ellipse cx={cx} cy={cy + 10} rx={62} ry={22}
          fill='none'
          stroke='rgba(140,200,230,0.4)'
          strokeWidth={12}
          className='can-thirsty-ring'
        />
      )}

      {/* Water drops from spout tip when dragging over a plant */}
      {showDrops && (
        <g className='can-drops' pointerEvents='none'>
          <circle cx={cx - 62} cy={cy + 28} r={3}   fill='rgba(140,190,230,0.8)'  className='drop drop-1' />
          <circle cx={cx - 70} cy={cy + 36} r={2.5} fill='rgba(140,190,230,0.65)' className='drop drop-2' />
          <circle cx={cx - 58} cy={cy + 42} r={2}   fill='rgba(140,190,230,0.5)'  className='drop drop-3' />
        </g>
      )}

      {/* Invisible hit area over the painted green can */}
      <rect x={cx - 72} y={cy - 48} width={144} height={96} rx={12} fill='transparent' />

      {/* First-time tooltip */}
      {showTip && (
        <g pointerEvents='none' className='can-tooltip'>
          <rect x={cx - 80} y={cy - 80} width={178} height={30} rx={8}
            fill='rgba(250,240,210,0.95)'
            stroke='rgba(200,133,58,0.45)' strokeWidth={1} />
          <text x={cx + 9} y={cy - 60} textAnchor='middle'
            fill='#2F1810' fontSize={10} fontFamily="'Lora', Georgia, serif" fontStyle='italic'>
            Drag me to a thirsty plant 💧
          </text>
        </g>
      )}
    </g>
  )
}

/* ── Hearts overlay ───────────────────────────────────────── */

function Hearts({ x, y }) {
  const offsets = [-18, -6, 6, 18]
  return (
    <g pointerEvents='none'>
      {offsets.map((ox, i) => (
        <text key={i} x={x + ox} y={y}
          fontSize={13} textAnchor='middle'
          className='heart-float'
          style={{ animationDelay: `${i * 0.08}s` }}>
          💗
        </text>
      ))}
    </g>
  )
}

/* ── Bloom sparkle burst ──────────────────────────────────── */

function BloomBurst({ x, y }) {
  const pieces = ['🌸','✨','🌺','🌸','✨','🌸']
  const ox     = [-28, -10, 8, 26, -18, 16]
  return (
    <g pointerEvents='none'>
      {pieces.map((emoji, i) => (
        <text key={i} x={x + ox[i]} y={y}
          fontSize={14} textAnchor='middle'
          className='bloom-sparkle'
          style={{ animationDelay: `${i * 0.07}s` }}>
          {emoji}
        </text>
      ))}
    </g>
  )
}

/* ── Room ─────────────────────────────────────────────────── */

export default function Room({
  timeOfDay,
  slots,
  plants,
  slotConfigs,
  plantingSlot,
  hoveredSlot,
  waterEvents,
  bloomEvents,
  pendingRemoveSlot,
  onSlotClick,
  onSlotHover,
  onSlotLeave,
  onWaterSlot,
  onRemoveSlot,
}) {
  const svgRef = useRef(null)
  const [drag, setDrag]     = useState({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 })
  const [dragOver, setDragOver] = useState(null)

  const sortedSlots = [...slotConfigs].sort((a, b) => a.zIndex - b.zIndex)

  const anyThirsty = Object.values(plants).some(
    p => (p.health === 'droopy' || p.health === 'wilting') && !p.wateredToday
  )

  function toSVG(e) {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (1370 / rect.width),
      y: (e.clientY - rect.top)  * (784  / rect.height),
    }
  }

  const thirstyNear = useCallback((svgX, svgY) => {
    return sortedSlots.find(cfg => {
      const instanceId = slots[cfg.id]
      if (!instanceId) return false
      const p = plants[instanceId]
      if (!p || p.wateredToday || p.health === 'dead') return false
      return Math.hypot(svgX - cfg.x, svgY - cfg.y) < cfg.maxWidth * 0.75
    }) ?? null
  }, [sortedSlots, slots, plants])

  function onCanMouseDown(e) {
    e.preventDefault()
    e.stopPropagation()
    const p = toSVG(e)
    setDrag({ active: true, startX: p.x, startY: p.y, dx: 0, dy: 0 })
  }

  function onSVGMouseMove(e) {
    if (!drag.active) return
    const p  = toSVG(e)
    const dx = p.x - drag.startX
    const dy = p.y - drag.startY
    setDrag(prev => ({ ...prev, dx, dy }))
    setDragOver(thirstyNear(CAN_HOME.x + dx, CAN_HOME.y + dy)?.id ?? null)
  }

  function onSVGMouseUp(e) {
    if (!drag.active) return
    if (dragOver) {
      const instanceId = slots[dragOver]
      if (instanceId) onWaterSlot(instanceId)
    }
    setDrag({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 })
    setDragOver(null)
  }

  function onSVGMouseLeave() {
    if (drag.active) {
      setDrag({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 })
      setDragOver(null)
    }
    onSlotLeave()
  }

  return (
    <svg
      ref={svgRef}
      className='room-svg'
      viewBox='0 0 1370 784'
      preserveAspectRatio='xMidYMid slice'
      aria-label='Garden room'
      onPointerMove={onSVGMouseMove}
      onPointerUp={onSVGMouseUp}
      onPointerLeave={onSVGMouseLeave}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      {/* Fallback dark warm background — shown if room image is slow/missing */}
      <rect x='0' y='0' width='1370' height='784' fill='#1e1006' />

      <image href={ROOM_IMAGE}
        x='0' y='0' width='1370' height='784'
        preserveAspectRatio='xMidYMid slice' />


      {/* Vignette via CSS radial-gradient on a div overlay — avoids SVG url() black fallback bug */}

      {sortedSlots.map((cfg, slotIndex) => {
        const slotId     = cfg.id
        const instanceId = slots[slotId]
        const plant      = instanceId ? plants[instanceId] : null
        const plantType  = plant ? PLANT_TYPES[plant.plantTypeId] : null
        const scale      = plantType?.renderScale ?? 1
        const w          = cfg.maxWidth * scale
        const imgX       = cfg.x - w / 2
        /* cfg.y = painted pot rim. Clip shows top 62% — foliage base anchors here. */
        const imgY       = cfg.y - w * 0.62
        const isTargeted  = plantingSlot === slotId
        const isHovered   = hoveredSlot === slotId
        const breatheDelay = `${0.55 + slotIndex * 0.9}s`
        const isDragTarget = dragOver === slotId

        const healthProg  = HEALTH_PROGRESS[plant?.health] ?? 1
        const healthColor = HEALTH_COLOR[plant?.health]    ?? '#3A9030'
        const needsWater  = plant && !plant.wateredToday
          && (plant.health === 'droopy' || plant.health === 'wilting')

        const clickX = cfg.x - cfg.maxWidth * 0.5
        const clickY = cfg.y - cfg.maxWidth * 1.1
        const clickW = cfg.maxWidth
        const clickH = cfg.maxWidth * 1.2

        /* Hearts + bloom for this slot */
        const slotHearts = waterEvents.filter(e => e.slotId === slotId)
        const slotBlooms = (bloomEvents || []).filter(e => e.slotId === slotId)

        /* Clamp health bar position so large floor plants don't push labels to top of scene */
        const barY   = Math.max(22, imgY - 4)
        const nameY  = Math.max(15, imgY - 12)

        return (
          <g
            key={slotId}
            onClick={() => onSlotClick(slotId)}
            onContextMenu={e => {
              e.preventDefault()
              if (plant) onRemoveSlot(instanceId, slotId)
            }}
            onMouseEnter={() => onSlotHover(slotId)}
            onMouseLeave={onSlotLeave}
            style={{
              cursor: plant ? 'default' : 'pointer',
              filter: isTargeted
                ? 'drop-shadow(0 0 8px rgba(200,133,58,0.55))'
                : isDragTarget
                  ? 'drop-shadow(0 0 14px rgba(140,190,230,0.85))'
                  : 'none',
            }}
            role={plant ? undefined : 'button'}
            aria-label={plant ? `${plantType?.name}, ${plant.growthStage}` : `Empty plant slot`}
          >


            {/* Clip pot from sprite — top 62% = foliage only, bottom 38% = pot (hidden) */}
            {plant && plantType?.assetName && (
              <>
                <clipPath id={`clip-${slotId}`}>
                  <rect x={imgX} y={imgY} width={w} height={w * 0.62} />
                </clipPath>
                <image
                  key={`${slotId}-${plant.growthStage}`}
                  href={`/assets/plant-assets/${plantType.assetName}-${plant.growthStage}.png`}
                  x={imgX} y={imgY} width={w} height={w}
                  clipPath={`url(#clip-${slotId})`}
                  className='plant-in-room'
                  style={{
                    filter: `saturate(1.15) ${HEALTH_FILTER[plant.health] ?? ''}`.trim(),
                    '--breathe-delay': breatheDelay,
                  }}
                />
              </>
            )}

            {/* Thirsty indicator — 💧 only, no bars, no labels */}
            {plant && needsWater && (
              <text
                x={cfg.x} y={Math.max(22, imgY - 6)}
                textAnchor='middle' fontSize={16}
                pointerEvents='none' className='thirsty-drop'
              >
                💧
              </text>
            )}


            {/* Hearts when watered */}
            {slotHearts.map(ev => (
              <Hearts key={ev.id} x={cfg.x} y={Math.max(60, imgY - 20)} />
            ))}

            {/* Bloom sparkles when plant reaches final stage */}
            {slotBlooms.map(ev => (
              <BloomBurst key={ev.id} x={cfg.x} y={Math.max(80, imgY - 10)} />
            ))}

            {/* Pending remove tooltip — right-click once shows this, again confirms */}
            {pendingRemoveSlot === slotId && plant && (
              <g pointerEvents='none'>
                <rect x={cfg.x - 82} y={barY - 28} width={164} height={22} rx={6}
                  fill='rgba(139,26,46,0.88)'
                  stroke='rgba(201,48,84,0.5)' strokeWidth={1} />
                <text x={cfg.x} y={barY - 12}
                  textAnchor='middle' fill='#FAF0DC'
                  fontSize={9.5} fontFamily="'Lora', Georgia, serif">
                  Right-click again to remove
                </text>
              </g>
            )}

            {/* Click / context menu target */}
            <rect x={clickX} y={clickY} width={clickW} height={clickH} fill='transparent' />
          </g>
        )
      })}


      <WateringCan
        dragging={drag.active}
        dx={drag.dx}
        dy={drag.dy}
        anyThirsty={anyThirsty}
        tiltedDrag={!!dragOver}
        onMouseDown={onCanMouseDown}
      />
    </svg>
  )
}
