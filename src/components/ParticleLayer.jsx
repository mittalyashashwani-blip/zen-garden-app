import { useEffect, useRef } from 'react'

const MOTE_COUNT  = 20
const LEAF_COUNT  = 6
const EMBER_COUNT = 14

function initMotes() {
  return Array.from({ length: MOTE_COUNT }, () => ({
    x: Math.random() * 1370,
    y: Math.random() * 784,
    r: 0.7 + Math.random() * 1.5,
    speed: 6 + Math.random() * 10,
    driftPhase: Math.random() * Math.PI * 2,
    driftAmp: 12 + Math.random() * 28,
    driftFreq: 0.2 + Math.random() * 0.35,
    opacity: 0.14 + Math.random() * 0.28,
  }))
}

function initLeaves() {
  const colors = ['#7a9b5c', '#6b8a4a', '#8db070', '#5e7a3e', '#9ab86a', '#4a7030']
  return Array.from({ length: LEAF_COUNT }, (_, i) => ({
    x: 1370 + 80 + Math.random() * 300,
    y: 60 + Math.random() * 550,
    size: 6 + Math.random() * 9,
    vx: -(0.3 + Math.random() * 0.55),
    vy: 0.1 + Math.random() * 0.28,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 0.85,
    opacity: 0.3 + Math.random() * 0.38,
    color: colors[i % colors.length],
    swayPhase: Math.random() * Math.PI * 2,
  }))
}

/* Embers rise from the fireplace area (right side, ~x=900-1100 in 1370px scene) */
function initEmbers() {
  return Array.from({ length: EMBER_COUNT }, () => resetEmber({}))
}

function resetEmber(e) {
  return Object.assign(e, {
    x: 950 + Math.random() * 130,   // fireplace mouth width
    y: 620 + Math.random() * 80,    // fireplace base area
    r: 0.8 + Math.random() * 1.6,
    vy: -(0.4 + Math.random() * 0.9),
    vx: (Math.random() - 0.5) * 0.35,
    opacity: 0.55 + Math.random() * 0.4,
    life: 0,
    maxLife: 90 + Math.random() * 120,
    hue: 25 + Math.random() * 20,   // orange-amber range
  })
}

export default function ParticleLayer({ timeOfDay = 'night' }) {
  const canvasRef  = useRef(null)
  const motesRef   = useRef(initMotes())
  const leavesRef  = useRef(initLeaves())
  const embersRef  = useRef(initEmbers())
  const tRef       = useRef(0)
  const rafRef     = useRef(null)
  const todRef     = useRef(timeOfDay)

  useEffect(() => { todRef.current = timeOfDay }, [timeOfDay])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function draw() {
      const W = canvas.width
      const H = canvas.height
      if (W === 0 || H === 0) { rafRef.current = requestAnimationFrame(draw); return }

      const sx = W / 1370
      const sy = H / 784
      const t  = (tRef.current += 0.01)
      const tod = todRef.current

      ctx.clearRect(0, 0, W, H)

      /* ── Dust motes ── */
      motesRef.current.forEach(m => {
        const px  = (m.x + Math.sin(t * m.driftFreq + m.driftPhase) * m.driftAmp) * sx
        const rawY = m.y - t * m.speed
        const py  = (((rawY % 784) + 784) % 784) * sy

        ctx.beginPath()
        ctx.arc(px, py, m.r * Math.min(sx, sy) * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 215, 150, ${m.opacity})`
        ctx.fill()
      })

      /* ── Drifting leaves ── */
      leavesRef.current.forEach(l => {
        l.x += l.vx
        l.y += l.vy + Math.sin(t * 0.6 + l.swayPhase) * 0.18
        l.rot += l.rotSpeed
        if (l.x < -50) {
          l.x = 1370 + 80 + Math.random() * 200
          l.y = 50 + Math.random() * 500
        }
        const px   = l.x * sx
        const py   = l.y * sy
        const size = l.size * Math.min(sx, sy)

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate((l.rot * Math.PI) / 180)
        ctx.globalAlpha = l.opacity
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.bezierCurveTo(size * 0.75, -size * 0.35, size * 0.55, size * 0.45, 0, size * 0.75)
        ctx.bezierCurveTo(-size * 0.55, size * 0.45, -size * 0.75, -size * 0.35, 0, -size)
        ctx.fillStyle = l.color
        ctx.fill()
        ctx.globalAlpha = l.opacity * 0.45
        ctx.beginPath()
        ctx.moveTo(0, -size * 0.85)
        ctx.lineTo(0, size * 0.65)
        ctx.strokeStyle = 'rgba(25, 55, 15, 0.9)'
        ctx.lineWidth = 0.6 * Math.min(sx, sy)
        ctx.stroke()
        ctx.restore()
        ctx.globalAlpha = 1
      })

      /* ── Fireplace embers — only night/dusk ── */
      if (tod === 'night' || tod === 'dusk') {
        embersRef.current.forEach(e => {
          e.life++
          e.x  += e.vx + Math.sin(t * 1.8 + e.life * 0.05) * 0.18
          e.y  += e.vy
          e.vy += -0.008 // slight acceleration upward

          const lifeRatio = e.life / e.maxLife
          const fade      = lifeRatio < 0.2 ? lifeRatio / 0.2 : 1 - (lifeRatio - 0.2) / 0.8
          const alpha     = e.opacity * Math.max(0, fade)

          if (e.life >= e.maxLife) resetEmber(e)

          const px = e.x * sx
          const py = e.y * sy
          const r  = e.r * Math.min(sx, sy)

          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${e.hue}, 100%, ${65 + 20 * fade}%, ${alpha})`
          ctx.shadowColor = `hsla(${e.hue}, 100%, 70%, ${alpha * 0.6})`
          ctx.shadowBlur  = 4 * Math.min(sx, sy)
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  )
}
