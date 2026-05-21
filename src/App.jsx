import { useState, useEffect, useRef, useCallback, Component } from 'react'
import { loadState, saveState, advanceDay, waterPlant, plantSeed, removePlant } from './store/gameStore'
import { PLANT_TYPES } from './data/plantTypes'
import { SvgGradientDefs } from './components/PlantSprite'
import { getRoomConfig } from './data/slotConfig'
import Room from './components/Room'
import ParticleLayer from './components/ParticleLayer'
import PlantPickerCard from './components/PlantPickerCard'
import SlotEditor, { loadEditorWorking } from './dev/SlotEditor'
import './App.css'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background:'#FAF0DC', padding:24, color:'#2F1810', fontFamily:'Georgia', position:'fixed', inset:0, zIndex:9999, overflow:'auto' }}>
          <h2 style={{ marginBottom:12 }}>App error — please paste this to Claude</h2>
          <pre style={{ fontSize:11, whiteSpace:'pre-wrap', background:'#f0e8d4', padding:12, borderRadius:8 }}>
            {this.state.error?.message}{'\n'}{this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const ROOM_ID = 'room_day'

const GREETINGS = { dawn: 'Good morning', day: 'Good afternoon', dusk: 'Good evening', night: 'Good night' }

function Greeting({ timeOfDay, plants }) {
  const all     = Object.values(plants).filter(p => p.health !== 'dead')
  const thirsty = all.filter(p => !p.wateredToday && (p.health === 'droopy' || p.health === 'wilting')).length

  let subtitle = 'Your garden awaits 🌱'
  if (all.length > 0) {
    subtitle = thirsty > 0
      ? `${thirsty} plant${thirsty > 1 ? 's' : ''} need${thirsty === 1 ? 's' : ''} water 💧`
      : `${all.length} plant${all.length > 1 ? 's' : ''} growing well 🌿`
  }

  return (
    <div className='greeting-overlay' aria-live='polite' aria-atomic='true'>
      <div className='greeting-card'>
        <p className='greeting-text'>{GREETINGS[timeOfDay] ?? 'Welcome back'}</p>
        <p className='greeting-sub'>{subtitle}</p>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5  && h < 8)  return 'dawn'
  if (h >= 8  && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

export default function App() {
  const [state, setState]             = useState(() => advanceDay(loadState()))
  const [pickerSlot, setPickerSlot]   = useState(null)
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [toasts, setToasts]           = useState([])
  const [timeOfDay, setTimeOfDay]     = useState(getTimeOfDay)
  const [waterEvents, setWaterEvents]     = useState([])
  const [bloomEvents, setBloomEvents]     = useState([])
  const [pendingRemove, setPendingRemove] = useState(null)
  const [showGreeting, setShowGreeting]   = useState(true)

  const roomConfig   = getRoomConfig(ROOM_ID)
  const [editMode, setEditMode]       = useState(false)
  const [slotConfigs, setSlotConfigs] = useState(
    () => loadEditorWorking(ROOM_ID) ?? roomConfig.slots
  )

  const prevPlantsRef  = useRef({})
  const prevCoinsRef   = useRef(state.coins)

  const addToast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2200)
  }, [])

  useEffect(() => { saveState(state) }, [state])

  useEffect(() => {
    const id = setTimeout(() => setShowGreeting(false), 3200)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.shiftKey && e.key === 'E') setEditMode(v => !v)
      if (e.shiftKey && e.key === 'T' && import.meta.env.DEV) {
        setState(s => {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          return advanceDay({ ...s, lastOpenedAt: yesterday })
        })
        addToast('⏩ Day advanced')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addToast])

  /* Coin milestones */
  useEffect(() => {
    const MILESTONES = [50, 100, 250, 500]
    const MSGS = { 50: '50 coins! 🌟 Keep growing', 100: '100 coins! 🪙 You\'re thriving', 250: '250 coins! 🏆 Master gardener', 500: '500 coins! 🌺 Legend' }
    let seen = []
    try { seen = JSON.parse(localStorage.getItem('zen_milestones') || '[]') || [] } catch {}
    const prev = prevCoinsRef.current
    const curr = state.coins
    MILESTONES.forEach(m => {
      if (prev < m && curr >= m && !seen.includes(m)) {
        addToast(MSGS[m])
        const updated = [...seen, m]
        localStorage.setItem('zen_milestones', JSON.stringify(updated))
      }
    })
    prevCoinsRef.current = curr
  }, [state.coins, addToast])

  /* Detect stage advances + bloom events */
  useEffect(() => {
    const prev = prevPlantsRef.current
    Object.values(state.plants).forEach(plant => {
      const was = prev[plant.instanceId]
      if (was && was.growthStage !== plant.growthStage) {
        const type      = PLANT_TYPES[plant.plantTypeId]
        const lastStage = type.stages[type.stages.length - 1]
        const isFinalStage = plant.growthStage === lastStage

        if (isFinalStage) {
          addToast(`${type.name} is ${lastStage}! 🌺 +10`)
          const slotId = Object.entries(state.slots).find(([, id]) => id === plant.instanceId)?.[0]
          if (slotId) {
            const eventId = Date.now() + Math.random()
            setBloomEvents(prev => [...prev, { id: eventId, slotId }])
            setTimeout(() => setBloomEvents(prev => prev.filter(e => e.id !== eventId)), 3000)
          }
        } else {
          addToast(`${type.name} is now ${plant.growthStage}`)
        }
      }
    })
    prevPlantsRef.current = { ...state.plants }
  }, [state.plants, addToast])

  /* Water via drag — find the slot this plant lives in, emit hearts event */
  function handleWaterSlot(instanceId) {
    setState(s => waterPlant(s, instanceId))
    addToast('+1 🌿')

    const slotId = Object.entries(state.slots).find(([, id]) => id === instanceId)?.[0]
    if (slotId) {
      const eventId = Date.now() + Math.random()
      setWaterEvents(prev => [...prev, { id: eventId, slotId }])
      setTimeout(() => setWaterEvents(prev => prev.filter(e => e.id !== eventId)), 2000)
    }
  }

  /* Right-click occupied slot → confirm then remove */
  function handleRemove(instanceId, slotId) {
    if (pendingRemove?.instanceId === instanceId) {
      clearTimeout(pendingRemove.timer)
      setState(s => removePlant(s, instanceId))
      setPendingRemove(null)
      addToast('Plant removed')
    } else {
      if (pendingRemove) clearTimeout(pendingRemove.timer)
      const timer = setTimeout(() => setPendingRemove(null), 2200)
      setPendingRemove({ instanceId, slotId, timer })
    }
  }

  function handlePlant(plantTypeId) {
    if (!pickerSlot) return
    setState(s => plantSeed(s, pickerSlot, plantTypeId))
    setPickerSlot(null)
    addToast('Sapling placed 🌱')
  }

  /* Empty slot → picker. Occupied → nothing (info is the health bar) */
  function handleSlotClick(slotId) {
    const instanceId = state.slots[slotId]
    if (!instanceId) {
      setPickerSlot(prev => prev === slotId ? null : slotId)
    }
  }

  return (
    <ErrorBoundary>
    <>
      <div className='rotate-prompt'>
        <span style={{ fontSize: '2rem' }}>↻</span>
        <p>Rotate your device to play</p>
      </div>

      <div className='app'>
        <SvgGradientDefs />

        <Room
          timeOfDay={timeOfDay}
          slots={state.slots}
          plants={state.plants}
          slotConfigs={slotConfigs}
          plantingSlot={pickerSlot}
          hoveredSlot={hoveredSlot}
          waterEvents={waterEvents}
          bloomEvents={bloomEvents}
          pendingRemoveSlot={pendingRemove?.slotId ?? null}
          onSlotClick={handleSlotClick}
          onSlotHover={setHoveredSlot}
          onSlotLeave={() => setHoveredSlot(null)}
          onWaterSlot={handleWaterSlot}
          onRemoveSlot={(instanceId, slotId) => handleRemove(instanceId, slotId)}
        />

        {/* Cinematic vignette — CSS radial-gradient, no SVG url() risk */}
        <div className='vignette-overlay' aria-hidden='true' />

        <ParticleLayer timeOfDay={timeOfDay} />

        <SlotEditor
          active={editMode}
          slots={slotConfigs}
          onChange={setSlotConfigs}
          viewBox={roomConfig.viewBox}
          roomId={ROOM_ID}
        />
        {editMode && (
          <div className='editor-hud'>
            <strong>SLOT EDITOR</strong>
            <span>drag · wheel = resize · right-click = delete · click empty = add</span>
            <span>Shift+S to copy JSON · Shift+E to exit</span>
            <span>{slotConfigs.length} slots</span>
          </div>
        )}

        <header className='hud'>
          <span className='coins'>🪙 {state.coins}</span>
          <span className='plant-count'>
            {Object.values(state.slots).filter(Boolean).length}/{Object.keys(state.slots).length} 🌱
          </span>
          <span
            className='time-label'
            onClick={() => {
              const cycle = ['dawn', 'day', 'dusk', 'night']
              setTimeOfDay(t => cycle[(cycle.indexOf(t) + 1) % 4])
            }}
            style={{ cursor: 'pointer' }}
            title='Tap to change time of day'
            role='button'
            aria-label={`Current time: ${timeOfDay}. Tap to change.`}
          >
            {timeOfDay}
          </span>
        </header>

        <div className='toast-stack' aria-live='polite'>
          {toasts.map(t => (
            <div key={t.id} className='toast'>{t.msg}</div>
          ))}
        </div>

        {showGreeting && (
          <Greeting timeOfDay={timeOfDay} plants={state.plants} />
        )}

        {pickerSlot && (
          <PlantPickerCard
            targetSlot={pickerSlot}
            coins={state.coins}
            onPlant={handlePlant}
            onClose={() => setPickerSlot(null)}
          />
        )}
      </div>
    </>
    </ErrorBoundary>
  )
}
