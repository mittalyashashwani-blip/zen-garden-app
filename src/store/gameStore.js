import { PLANT_TYPES, GROWTH_STAGES, TULIP_COLORS } from '../data/plantTypes'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'zen_garden_state_v8'
const LEGACY_KEY  = 'zen_garden_state_v7'
const SLOT_IDS = ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA)
  const b = new Date(dateStrB)
  return Math.floor((b - a) / (1000 * 60 * 60 * 24))
}

function initialState() {
  const slots = {}
  SLOT_IDS.forEach(id => { slots[id] = null })

  return {
    coins: 1000,
    slots,
    plants: {},
    lastOpenedAt: todayStr(),
  }
}

export function loadState() {
  try {
    // Nuke legacy v7 state — v8 starts clean
    if (localStorage.getItem(LEGACY_KEY)) {
      console.info('[zen] v7 state cleared — fresh start on v8')
      localStorage.removeItem(LEGACY_KEY)
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : initialState()
  } catch {
    return initialState()
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// Call once on app open — advances growth/health for missed days
export function advanceDay(state) {
  const today = todayStr()
  const lastOpened = state.lastOpenedAt

  if (lastOpened === today) return state  // already processed today

  const missedDays = daysBetween(lastOpened, today)
  const updated = { ...state, plants: { ...state.plants }, slots: { ...state.slots } }

  for (const [instanceId, plant] of Object.entries(state.plants)) {
    if (plant.health === 'dead') continue
    const plantType = PLANT_TYPES[plant.plantTypeId]
    if (!plantType) {
      updated.slots[plant.slotId] = null
      delete updated.plants[instanceId]
      continue
    }
    const plantStages = plantType.stages
    if (plant.growthStage === plantStages[plantStages.length - 1]) {
      updated.plants[instanceId] = { ...plant }
      continue
    }

    const newMissed = plant.wateredToday
      ? plant.missedDays  // was watered last session
      : plant.missedDays + missedDays

    let health = plant.health
    let growthStage = plant.growthStage

    if (newMissed >= plantType.deadAfterDays) {
      health = 'dead'
    } else if (newMissed >= plantType.wiltsAfterDays) {
      health = 'wilting'
    } else if (newMissed >= plantType.droopyAfterDays) {
      health = 'droopy'
    } else {
      health = 'healthy'
    }

    let daysWatered = plant.consecutiveDaysWatered
    if (plant.wateredToday && health !== 'dead') {
      const stageIndex = plantStages.indexOf(growthStage)
      if (stageIndex !== -1 && stageIndex < plantStages.length - 1) {
        const stageThresholds = getStageThresholds(plantType.daysToBloom, plantStages.length)
        const nextThreshold = stageThresholds[stageIndex + 1]
        if (daysWatered >= nextThreshold) {
          growthStage = plantStages[stageIndex + 1]
        }
      }
    }

    if (health === 'dead') {
      // remove from slot
      const slotId = plant.slotId
      updated.slots[slotId] = null
      delete updated.plants[instanceId]
    } else {
      updated.plants[instanceId] = {
        ...plant,
        health,
        growthStage,
        missedDays: newMissed,
        wateredToday: false,  // reset for new day
      }
    }
  }

  updated.lastOpenedAt = today
  return updated
}

// Stage thresholds: how many total watered days to reach each stage
function getStageThresholds(daysToBloom, stageCount) {
  const step = daysToBloom / (stageCount - 1)
  return Array.from({ length: stageCount }, (_, i) => (i === stageCount - 1 ? daysToBloom : i * step))
}

export function waterPlant(state, instanceId) {
  const plant = state.plants[instanceId]
  if (!plant || plant.health === 'dead' || plant.wateredToday) return state

  const plantType = PLANT_TYPES[plant.plantTypeId]
  if (!plantType) return state
  const today = todayStr()

  let newDaysWatered = plant.consecutiveDaysWatered + 1
  let newMissed = 0
  let health = 'healthy'

  // Recover health on watering
  if (plant.health === 'droopy' || plant.health === 'wilting') {
    health = 'healthy'
  }

  // Advance growth stage
  const plantStages = plantType.stages
  const stageThresholds = getStageThresholds(plantType.daysToBloom, plantStages.length)
  let stageIndex = plantStages.indexOf(plant.growthStage)
  if (stageIndex === -1) return state
  if (stageIndex < plantStages.length - 1) {
    const nextThreshold = stageThresholds[stageIndex + 1]
    if (newDaysWatered >= nextThreshold) {
      stageIndex = stageIndex + 1
    }
  }
  const growthStage = plantStages[stageIndex]

  // Coins: +1 for watering, +10 for reaching final stage
  let coinsEarned = 1
  const finalStage = plantStages[plantStages.length - 1]
  const justBloomed = growthStage === finalStage && plant.growthStage !== finalStage
  if (justBloomed) coinsEarned += 10

  // 7-day streak bonus
  if (newDaysWatered % 7 === 0) coinsEarned += 5

  return {
    ...state,
    coins: state.coins + coinsEarned,
    plants: {
      ...state.plants,
      [instanceId]: {
        ...plant,
        growthStage,
        health,
        wateredToday: true,
        consecutiveDaysWatered: newDaysWatered,
        missedDays: newMissed,
        lastWateredAt: today,
      },
    },
  }
}

export function plantSeed(state, slotId, plantTypeId) {
  const plantType = PLANT_TYPES[plantTypeId]
  if (!plantType) return state
  if (state.slots[slotId] !== null) return state
  if (state.coins < plantType.cost) return state

  const instanceId = uuidv4()
  const instance = {
    instanceId,
    plantTypeId,
    slotId,
    growthStage: 'blooming', /* DEV — restore to 'seedling' before launch */
    health: 'healthy',
    wateredToday: false,
    consecutiveDaysWatered: 0,
    missedDays: 0,
    plantedAt: todayStr(),
    lastWateredAt: null,
    ...(plantTypeId === 'PLT_03' && {
      bloomColor: TULIP_COLORS[Math.floor(Math.random() * TULIP_COLORS.length)],
    }),
  }

  return {
    ...state,
    coins: state.coins - plantType.cost,
    slots: { ...state.slots, [slotId]: instanceId },
    plants: { ...state.plants, [instanceId]: instance },
  }
}

export function resetPlant(state, instanceId) {
  const plant = state.plants[instanceId]
  if (!plant) return state
  return {
    ...state,
    plants: {
      ...state.plants,
      [instanceId]: {
        ...plant,
        growthStage: 'seedling',
        health: 'healthy',
        wateredToday: false,
        consecutiveDaysWatered: 0,
        missedDays: 0,
        lastWateredAt: null,
      },
    },
  }
}

export function removePlant(state, instanceId) {
  const plant = state.plants[instanceId]
  if (!plant) return state
  const newPlants = { ...state.plants }
  delete newPlants[instanceId]
  return {
    ...state,
    slots: { ...state.slots, [plant.slotId]: null },
    plants: newPlants,
  }
}

export const SLOT_IDS_LIST = SLOT_IDS
