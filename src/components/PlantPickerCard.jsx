import { useState, useEffect, useCallback, useRef } from 'react'
import { PLANT_TYPE_LIST } from '../data/plantTypes'

export default function PlantPickerCard({ targetSlot, coins, onPlant, onClose }) {
  const [idx, setIdx]       = useState(0)
  const [slideDir, setSlideDir] = useState(null) // 'left' | 'right' | null
  const slideTimeout = useRef(null)

  const total = PLANT_TYPE_LIST.length
  const pt    = PLANT_TYPE_LIST[idx]
  const canAfford = coins >= pt.cost

  function navigate(dir) {
    setSlideDir(dir)
    clearTimeout(slideTimeout.current)
    slideTimeout.current = setTimeout(() => {
      setIdx(i => dir === 'next'
        ? (i + 1) % total
        : (i - 1 + total) % total)
      setSlideDir(null)
    }, 140)
  }

  const prev = useCallback(() => navigate('prev'), [total])
  const next = useCallback(() => navigate('next'), [total])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  function handlePlant() {
    if (!canAfford) return
    onPlant(pt.id)
  }

  return (
    <div
      className='picker-overlay'
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role='dialog'
      aria-modal='true'
      aria-label='Choose a plant'
    >
      <div className='picker-card-wrap'>

        {/* Navigation */}
        <div className='pcard-nav'>
          <button className='pcard-nav-btn' onClick={prev} aria-label='Previous plant'>‹</button>
          <span className='pcard-counter'>{idx + 1} / {total}</span>
          <button className='pcard-nav-btn' onClick={next} aria-label='Next plant'>›</button>
        </div>
        <p className='pcard-nav-hint'>← → browse  ·  ESC close</p>

        {/* Card */}
        <div className={`pcard${slideDir === 'next' ? ' card-slide-left' : slideDir === 'prev' ? ' card-slide-right' : ''}`}>
          <button className='pcard-close' onClick={onClose} aria-label='Close picker'>✕</button>

          {/* Name + tagline + bloom days */}
          <div className='pcard-name-block'>
            <h2 className='pcard-name'>{pt.name}</h2>
            <p className='pcard-tagline'>{pt.tagline}</p>
            <div className='pcard-bloom-track' aria-label={`Blooms in ${pt.daysToBloom} days`}>
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={`pcard-bloom-dot ${i < pt.daysToBloom ? 'filled' : ''}`}
                />
              ))}
              <span className='pcard-bloom-label'>{pt.daysToBloom}d · {pt.stages.length} stages</span>
            </div>
          </div>

          {/* Hero window */}
          <div className='pcard-hero-window'>
            <img
              key={pt.id}
              src={`/assets/plant-assets/${pt.assetName}-blooming.png`}
              alt={`${pt.name} in bloom`}
              className='pcard-hero-img'
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling?.classList?.add('pcard-hero-fallback-visible')
              }}
            />
            <span className='pcard-hero-fallback' aria-hidden='true'>🌸</span>
            <span className='pcard-bloom-pill'>blooming</span>
          </div>

          {/* Resilience + trivia */}
          <div className='pcard-trivia-wrap'>
            <span className={`pcard-resilience-label pcard-res-${pt.resilience}`}>
              {pt.resilience === 'high' ? '💚 Forgiving' : pt.resilience === 'medium' ? '🌿 Balanced' : '🌹 Delicate'} resilience
            </span>
            <p className='pcard-trivia-text'>{pt.trivia}</p>
          </div>

          {/* CTA — cost embedded */}
          <button
            className={`pcard-cta ${canAfford ? 'pcard-cta-active' : 'pcard-cta-locked'}`}
            onClick={handlePlant}
            disabled={!canAfford}
          >
            {canAfford
              ? `Plant ${pt.name}  ·  ${pt.cost} ⟐`
              : `Need ${pt.cost - coins} more ⟐`}
          </button>
        </div>
      </div>
    </div>
  )
}
