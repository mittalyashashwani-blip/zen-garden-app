// ── SVG Gradient Defs ─────────────────────────────────────────────────────
// Render <SvgGradientDefs /> once at the app root (App.jsx).
// All plant fills (url(#zg-*)) reference these IDs globally in the document.
export function SvgGradientDefs() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        <linearGradient id="zg-lime" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8ef4b" />
          <stop offset="100%" stopColor="#7ecb45" />
        </linearGradient>
        <linearGradient id="zg-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#11b26f" />
          <stop offset="100%" stopColor="#007a5a" />
        </linearGradient>
        <linearGradient id="zg-mid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fcf45" />
          <stop offset="100%" stopColor="#0e9154" />
        </linearGradient>
        <linearGradient id="zg-pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d36d35" />
          <stop offset="100%" stopColor="#b65228" />
        </linearGradient>
        <linearGradient id="zg-pot-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e07a3e" />
          <stop offset="100%" stopColor="#c35d2e" />
        </linearGradient>
        <linearGradient id="zg-monstera" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3db86a" />
          <stop offset="100%" stopColor="#1a7a42" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// 5 plant SVG sprites: Fern, Monstera, Tulip, Sunflower, Rose
// Foliage viewBox: 0 0 120 114  (y=114 = soil level)
// Pot viewBox:     14 107 92 53 (pot section only)
// POT SIZE IS ALWAYS FIXED — only foliage scales with growth stage

const HEALTH_FILTER = {
  healthy: 'none',
  droopy:  'saturate(0.45)',
  wilting: 'saturate(0.2) brightness(0.78)',
  dead:    'grayscale(1) brightness(0.45)',
}

// Fraction of potSize used for foliage at each stage (scale both width & height)
const FOLIAGE_SCALE = {
  seedling:    0.18,
  sprouting:   0.42,
  budding:     0.68,
  blooming:    1.0,
  flourishing: 1.0,
}

// Pot section in original viewBox: x≈14-106, y≈107-160 → 92×53 units
const POT_H_RATIO  = 53 / 92   // ≈ 0.576  pot height relative to pot width
const MAX_FOL_RATIO = 1.3       // max foliage height = potSize × this

const PLANTS = {
  PLT_01: Fern,
  PLT_02: Monstera,
  PLT_03: Tulip,
  PLT_06: Jasmine,
  PLT_07: Rose,
}

// potSize = fixed pixel width of the pot — never changes with growth stage
export function PlantSprite({ plantTypeId, growthStage, health, potSize = 80, bloomColor }) {
  const filter = HEALTH_FILTER[health] ?? 'none'
  const PlantComp = (plantTypeId && PLANTS[plantTypeId]) ?? Fern
  const fScale   = FOLIAGE_SCALE[growthStage] ?? 1.0

  const potH    = Math.round(potSize * POT_H_RATIO)
  const maxFH   = Math.round(potSize * MAX_FOL_RATIO)  // reserved space above pot
  const folW    = Math.round(potSize * fScale)
  const folH    = Math.round(maxFH   * fScale)
  const totalH  = maxFH + potH

  // Image-based plants (e.g. Rose) — SVG/PNG assets include the pot already
  if (PlantComp.isImageAsset) {
    const src = `/assets/plant-assets/${PlantComp.assetName}-${growthStage}.png`
    return (
      <div style={{ width: potSize, height: totalH, position: 'relative', filter }}>
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: totalH,
            width: 'auto',
            mixBlendMode: 'multiply',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ width: potSize }}>
      {/* Foliage area: fixed height container so pot stays grounded */}
      <div style={{
        height: maxFH,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        filter,
      }}>
        <svg
          width={folW}
          height={folH}
          viewBox="0 0 120 114"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <PlantComp stage={growthStage} bloomColor={bloomColor} />
        </svg>
      </div>
      {/* Pot: ALWAYS potSize wide — never scaled */}
      <svg
        width={potSize}
        height={potH}
        viewBox="14 107 92 53"
        style={{ display: 'block' }}
      >
        <Pot />
      </svg>
    </div>
  )
}

// Empty pot shown at unoccupied slots — looks like room decor, clickable to plant
export function EmptyPot({ size = 70, glowing = false }) {
  const h = Math.round(size * (53 / 92))
  return (
    <svg
      width={size}
      height={h}
      viewBox="14 107 92 53"
      style={{
        display: 'block',
        opacity: glowing ? 1 : 0.82,
        filter: glowing ? 'drop-shadow(0 0 10px rgba(200,133,58,0.8))' : 'none',
        transition: 'opacity 0.2s, filter 0.2s',
      }}
    >
      <Pot />
    </svg>
  )
}

// ── Shared pot ────────────────────────────────────────────────────────────────
function Pot() {
  return (
    <g>
      {/* Body */}
      <path d="M19,160 L27,115 L93,115 L101,160 Z"
        fill="url(#zg-pot)" stroke="#8a3a18" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left-side shade strip */}
      <polygon points="19,160 27,115 33,115 25,160" fill="#9e3a18" opacity="0.35" />
      {/* Rim */}
      <rect x="14" y="108" width="92" height="10" rx="4"
        fill="url(#zg-pot-rim)" stroke="#8a3a18" strokeWidth="1.5" />
      {/* Soil */}
      <ellipse cx="60" cy="114" rx="40" ry="7" fill="#1a0d05" />
    </g>
  )
}

// ── Shared seedling base (same for all plants — tiny 2-leaf sprout) ──────────
function Seedling({ leafColor = '#2d7020', highlightColor = '#8fd640' }) {
  return (
    <g>
      <line x1="59" y1="114" x2="55" y2="100" stroke="#2a7018" strokeWidth="2.5" />
      <line x1="61" y1="114" x2="65" y2="98"  stroke="#2a7018" strokeWidth="2.5" />
      <ellipse cx="52" cy="97" rx="8"  ry="10" fill={leafColor}
        transform="rotate(-18 52 97)" />
      <ellipse cx="68" cy="95" rx="8"  ry="10" fill={leafColor}
        transform="rotate(18 68 95)" />
      <ellipse cx="52" cy="97" rx="3"  ry="4"  fill={highlightColor} opacity="0.45"
        transform="rotate(-18 52 97)" />
      <ellipse cx="68" cy="95" rx="3"  ry="4"  fill={highlightColor} opacity="0.45"
        transform="rotate(18 68 95)" />
    </g>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// PLT_01  FERN  (monstera-style split leaves — geometry from plant-growth.svg)
// 1 day to bloom
// ════════════════════════════════════════════════════════════════════════════

// Heart-shaped leaf — exact path from plant-growth.svg #heartLeaf
function HeartLeaf({ fill = 'url(#zg-green)' }) {
  return (
    <g>
      <path
        d="M0 0C-22 -24 -66 -9 -60 27C-56 53 -27 75 0 98C27 75 56 53 60 27C66 -9 22 -24 0 0Z"
        fill={fill} stroke="#2d4b36" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M0 8V90" stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
    </g>
  )
}

// Split (monstera-style) leaf — exact path from plant-growth.svg #splitLeafGreen/Lime/Mid
function SplitLeaf({ fill = 'url(#zg-green)' }) {
  return (
    <g>
      <path
        d="M0 -92C-44 -86 -88 -45 -98 12C-106 58 -83 114 -24 140C46 150 88 97 98 34C104 -7 82 -54 44 -82C29 -95 16 -98 0 -92Z"
        fill={fill} stroke="#2d4b36" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Midrib + side veins — exact from reference */}
      <path d="M0 -78C-3 -30 -5 32 12 130"  stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-12 -40C-34 -48 -53 -44 -69 -30" stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-18 -6C-46 -9 -65 0 -82 22"  stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M8 -26C34 -44 58 -45 78 -33"  stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M12 10C43 -2 67 3 86 18"      stroke="#9fd84f" strokeWidth="1" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </g>
  )
}

// Coordinate system note:
// All stage groups use transform="translate(60,114) scale(s,s)"
// This maps reference origin (0,0) = pot rim → our (60, 114) = soil centre
// Reference plant grows in -y (upward); our SVG also has -y upward. No flip needed.
function Fern({ stage }) {

  // ── Stage 1: Seedling ───────────────────────────────────────────────────
  if (stage === 'seedling') return (
    <g transform="translate(60,114) scale(0.45,0.45)">
      <path d="M0,-8 V-62" stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
      <path d="M-2,-48 C-30,-70 -52,-59 -53,-31 C-40,-20 -20,-22 -2,-48Z"
        fill="url(#zg-green)" stroke="#2d4b36" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
      <path d="M2,-48 C30,-70 52,-59 53,-31 C40,-20 20,-22 2,-48Z"
        fill="url(#zg-lime)" stroke="#2d4b36" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
        vectorEffect="non-scaling-stroke" />
    </g>
  )

  // ── Stage 2: Sprouting ──────────────────────────────────────────────────
  if (stage === 'sprouting') return (
    <g transform="translate(60,114) scale(0.42,0.42)">
      <path d="M-12,-8 C-14,-70 -18,-120 -28,-168" stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M10,-8 C12,-62 12,-112 4,-164"        stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-34,-10 C-36,-82 -40,-132 -50,-180"  stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <g transform="translate(-60,-182) scale(0.56) rotate(-18)"><SplitLeaf fill="url(#zg-lime)" /></g>
      <g transform="translate(18,-164) scale(0.48) rotate(18)"><SplitLeaf fill="url(#zg-green)" /></g>
      <g transform="translate(-2,-92) scale(0.30) rotate(-12)"><HeartLeaf fill="url(#zg-green)" /></g>
      <g transform="translate(-42,-56) scale(0.32) rotate(-25)"><HeartLeaf fill="url(#zg-lime)" /></g>
    </g>
  )

  // ── Stage 3: Budding ────────────────────────────────────────────────────
  if (stage === 'budding') return (
    <g transform="translate(60,114) scale(0.36,0.36)">
      <path d="M-14,-10 C-12,-72 -2,-142 18,-212"  stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M8,-10 C12,-88 8,-168 -8,-248"       stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M28,-10 C40,-94 58,-164 84,-228"     stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <g transform="translate(-36,-196) scale(0.54) rotate(-26)"><SplitLeaf fill="url(#zg-lime)" /></g>
      <g transform="translate(52,-176) scale(0.56) rotate(21)"><SplitLeaf fill="url(#zg-mid)" /></g>
      <g transform="translate(-8,-108) scale(0.38) rotate(-4)"><SplitLeaf fill="url(#zg-green)" /></g>
      <g transform="translate(62,-86) scale(0.42) rotate(14)"><SplitLeaf fill="url(#zg-mid)" /></g>
      <g transform="translate(10,-26) scale(0.16)"><HeartLeaf fill="url(#zg-green)" /></g>
      <path d="M-34,-52 c-8,-22 -18,-28 -28,-14 c4,11 12,18 28,14Z"
        fill="none" stroke="#7db63e" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M40,-56 c9,-22 18,-28 28,-14 c-4,11 -12,18 -28,14Z"
        fill="none" stroke="#7db63e" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </g>
  )

  // ── Stage 4: Blooming ───────────────────────────────────────────────────
  return (
    <g transform="translate(60,114) scale(0.25,0.25)">
      <path d="M-54,-10 C-44,-122 -18,-246 42,-378"   stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-26,-10 C-14,-136 0,-266 18,-414"      stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M0,-10 C16,-154 38,-296 86,-446"         stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M24,-10 C48,-146 82,-274 132,-390"       stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M52,-10 C78,-124 118,-230 180,-320"      stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-78,-10 C-96,-116 -126,-214 -174,-292"  stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d="M-96,-10 C-122,-144 -162,-252 -214,-344"  stroke="#2f7a46" strokeWidth="3.5" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <g transform="translate(-244,-352) scale(0.84) rotate(-35)"><SplitLeaf fill="url(#zg-green)" /></g>
      <g transform="translate(-166,-230) scale(0.80) rotate(-22)"><SplitLeaf fill="url(#zg-green)" /></g>
      <g transform="translate(-96,-82)  scale(0.75) rotate(-20)"><SplitLeaf fill="url(#zg-lime)"  /></g>
      <g transform="translate(22,-440)  scale(0.88) rotate(-8)"><SplitLeaf  fill="url(#zg-lime)"  /></g>
      <g transform="translate(114,-352) scale(0.82) rotate(18)"><SplitLeaf  fill="url(#zg-green)" /></g>
      <g transform="translate(210,-314) scale(0.76) rotate(34)"><SplitLeaf  fill="url(#zg-lime)"  /></g>
      <g transform="translate(206,-130) scale(0.90) rotate(28)"><SplitLeaf  fill="url(#zg-lime)"  /></g>
      <g transform="translate(122,-70)  scale(0.62) rotate(14)"><SplitLeaf  fill="url(#zg-green)" /></g>
      <g transform="translate(-26,-256) scale(0.58) rotate(-6)"><HeartLeaf  fill="url(#zg-green)" /></g>
      <g transform="translate(92,-220)  scale(0.54) rotate(18)"><HeartLeaf  fill="url(#zg-lime)"  /></g>
      <g transform="translate(-4,-14)   scale(0.20)"><HeartLeaf              fill="url(#zg-green)" /></g>
    </g>
  )
}

Fern.isImageAsset = true
Fern.assetName = 'fern'

// ════════════════════════════════════════════════════════════════════════════
// PLT_02  MONSTERA  (iconic split tropical leaves, fenestrations)
// 4 days to bloom
// ════════════════════════════════════════════════════════════════════════════

// Single monstera leaf with holes — fillRule="evenodd" cuts fenestrations
function MonsteraLeaf({ cx, cy, scale = 1, rotate = 0, flip = false }) {
  const sx = flip ? -scale : scale
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rotate}) scale(${sx},${scale})`}>
      {/* Petiole */}
      <line x1="0" y1="0" x2="0" y2="-8" stroke="#1a6b3a" strokeWidth="3"
        strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* Leaf body + fenestration holes via evenodd */}
      <path
        fillRule="evenodd"
        d="
          M0,-10
          C-8,-18 -26,-38 -30,-55
          C-34,-72 -28,-90 -18,-98
          C-8,-106 8,-108 18,-100
          C30,-92 38,-74 36,-56
          C34,-38 22,-20 12,-10
          C8,-6 4,-8 0,-10 Z
          M-14,-52 C-18,-60 -16,-72 -10,-74 C-4,-76 0,-68 2,-60 C4,-52 2,-44 -4,-44 C-10,-44 -12,-46 -14,-52 Z
          M6,-72 C4,-80 6,-90 12,-90 C18,-90 20,-82 18,-74 C16,-66 12,-62 8,-64 C4,-66 8,-66 6,-72 Z
        "
        fill="url(#zg-monstera)"
        stroke="#1a5530"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      {/* Midrib */}
      <path d="M0,-10 C-4,-30 -8,-60 -14,-96" stroke="#3de87a" strokeWidth="0.9"
        fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.6" />
      {/* Side veins */}
      <path d="M-4,-28 C-12,-32 -18,-30 -22,-26" stroke="#3de87a" strokeWidth="0.7"
        fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.5" />
      <path d="M-6,-48 C-16,-50 -24,-46 -28,-40" stroke="#3de87a" strokeWidth="0.7"
        fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.5" />
      <path d="M-2,-24 C4,-28 12,-26 16,-22" stroke="#3de87a" strokeWidth="0.7"
        fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.5" />
    </g>
  )
}

function Monstera({ stage }) {
  if (stage === 'seedling') return <Seedling leafColor="#2a8a50" highlightColor="#6deba0" />

  if (stage === 'sprouting') return (
    <g>
      {/* Single small heart-shaped leaf — no holes yet (young monstera) */}
      <line x1="60" y1="114" x2="60" y2="86" stroke="#2a7a40" strokeWidth="3" />
      <ellipse cx="60" cy="72" rx="16" ry="20" fill="url(#zg-monstera)"
        stroke="#1a5530" strokeWidth="1.2" />
      <path d="M60,86 C58,78 56,70 60,56" stroke="#3de87a" strokeWidth="0.9"
        fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M60,72 C52,68 46,64 44,58" stroke="#3de87a" strokeWidth="0.7"
        fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M60,72 C68,68 74,64 76,58" stroke="#3de87a" strokeWidth="0.7"
        fill="none" strokeLinecap="round" opacity="0.5" />
    </g>
  )

  if (stage === 'budding') return (
    <g>
      {/* Two leaves — first signs of splits */}
      <line x1="60" y1="114" x2="52" y2="82" stroke="#2a7a40" strokeWidth="3" />
      <line x1="60" y1="114" x2="72" y2="78" stroke="#2a7a40" strokeWidth="3" />
      <MonsteraLeaf cx={46} cy={72} scale={0.9} rotate={-18} />
      <MonsteraLeaf cx={78} cy={68} scale={0.85} rotate={15} flip />
      {/* Baby unfurling leaf */}
      <line x1="60" y1="114" x2="60" y2="90" stroke="#2a7a40" strokeWidth="2.5" />
      <ellipse cx="60" cy="84" rx="6" ry="9" fill="#3db86a" transform="rotate(-8 60 84)" />
    </g>
  )

  // Blooming — 3 full fenestrated leaves + unfurling new growth
  return (
    <g>
      <line x1="60" y1="114" x2="38" y2="76"  stroke="#2a7a40" strokeWidth="3.5" />
      <line x1="60" y1="114" x2="60" y2="68"  stroke="#2a7a40" strokeWidth="3.5" />
      <line x1="60" y1="114" x2="82" y2="72"  stroke="#2a7a40" strokeWidth="3.5" />
      {/* Back leaf (rendered first) */}
      <MonsteraLeaf cx={60} cy={58} scale={1.15} rotate={5} />
      {/* Left leaf */}
      <MonsteraLeaf cx={30} cy={66} scale={1.1} rotate={-25} />
      {/* Right leaf */}
      <MonsteraLeaf cx={88} cy={62} scale={1.05} rotate={22} flip />
      {/* New unfurling scroll — signature monstera detail */}
      <line x1="60" y1="114" x2="64" y2="92" stroke="#2a7a40" strokeWidth="2.5" />
      <path d="M64,92 C68,88 72,82 70,76 C68,72 64,74 64,78"
        fill="#2db85e" stroke="#1a5530" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  )
}

Monstera.isImageAsset = true
Monstera.assetName = 'monstera'

// ════════════════════════════════════════════════════════════════════════════
// PLT_03  TULIP  (single elegant stem, cupped flower — randomised bloom color)
// 3 days to bloom
// ════════════════════════════════════════════════════════════════════════════
function Tulip({ stage, bloomColor = '#e03030' }) {
  // Derive a slightly darker shade for depth
  const strap = (x1, y1, x2, y2) => (
    <path d={`M${x1},${y1} Q${(x1+x2)/2-8},${(y1+y2)/2} ${x2},${y2}`}
      stroke="#2a8a28" strokeWidth="5" fill="none" strokeLinecap="round" />
  )
  if (stage === 'seedling') return (
    <g>
      <line x1="60" y1="114" x2="60" y2="96" stroke="#3a9030" strokeWidth="3" />
      <ellipse cx="60" cy="93" rx="5" ry="8" fill="#2d8a28" />
    </g>
  )
  if (stage === 'sprouting') return (
    <g>
      {strap(52, 114, 40, 76)} {strap(68, 114, 80, 78)}
      <line x1="60" y1="114" x2="60" y2="72" stroke="#3a9030" strokeWidth="3" />
    </g>
  )
  if (stage === 'budding') return (
    <g>
      {strap(50, 114, 36, 72)} {strap(70, 114, 84, 74)}
      <line x1="60" y1="114" x2="60" y2="52" stroke="#3a9030" strokeWidth="3.5" />
      {/* Closed bud — uses bloomColor tinted dark */}
      <ellipse cx="60" cy="42" rx="10" ry="16" fill={bloomColor} opacity="0.75" />
      <ellipse cx="60" cy="42" rx="6"  ry="12" fill={bloomColor} />
      <ellipse cx="60" cy="42" rx="2.5" ry="7" fill="white" opacity="0.25" />
    </g>
  )
  return (
    <g>
      {strap(48, 114, 30, 68)} {strap(72, 114, 90, 70)}
      <line x1="60" y1="114" x2="60" y2="42" stroke="#3a9030" strokeWidth="4" />
      {/* Open tulip — 6 cupped petals in bloomColor */}
      {[0,60,120,180,240,300].map(a => {
        const r = a * Math.PI / 180
        const px = Math.cos(r)*14, py = Math.sin(r)*10
        return <ellipse key={a} cx={60+px} cy={36+py} rx="9" ry="18" fill={bloomColor}
          transform={`rotate(${a} ${60+px} ${36+py})`} />
      })}
      <ellipse cx="60" cy="36" rx="12" ry="10" fill={bloomColor} opacity="0.8" />
      <circle  cx="60" cy="36" r="5"           fill="#f8c840" />
    </g>
  )
}

Tulip.isImageAsset = true
Tulip.assetName = 'tulip'

// ════════════════════════════════════════════════════════════════════════════
// PLT_04  SUNFLOWER  (tall dramatic stem, large disc flower)
// 3 days to bloom — grows tall fast
// ════════════════════════════════════════════════════════════════════════════
function Sunflower({ stage }) {
  const leaf = (x, y, rot) => (
    <ellipse cx={x} cy={y} rx="14" ry="9" fill="#3a9030"
      transform={`rotate(${rot} ${x} ${y})`} />
  )
  if (stage === 'seedling') return <Seedling leafColor="#3a9030" highlightColor="#7ac830" />
  if (stage === 'sprouting') return (
    <g>
      <line x1="60" y1="114" x2="60" y2="78" stroke="#4a8a2a" strokeWidth="4" />
      {leaf(44, 104, -28)} {leaf(76, 98, 26)}
      {leaf(42, 88, -32)} {leaf(78, 84, 30)}
    </g>
  )
  if (stage === 'budding') return (
    <g>
      <line x1="60" y1="114" x2="60" y2="44" stroke="#4a8a2a" strokeWidth="4.5" />
      {leaf(42, 102, -30)} {leaf(78, 96, 28)}
      {leaf(40, 84, -35)} {leaf(80, 78, 32)}
      {/* Drooping bud — not yet open, face tilted */}
      <line x1="60" y1="44" x2="68" y2="50" stroke="#4a8a2a" strokeWidth="3" />
      <ellipse cx="72" cy="54" rx="16" ry="13" fill="#c4a020" />
      <ellipse cx="72" cy="54" rx="10" ry="8"  fill="#6b3810" />
    </g>
  )
  return (
    <g>
      <line x1="60" y1="114" x2="60" y2="28" stroke="#4a8a2a" strokeWidth="5" />
      {leaf(40, 100, -30)} {leaf(80, 94, 28)}
      {leaf(38, 82, -36)} {leaf(82, 76, 34)}
      {leaf(42, 64, -28)} {leaf(78, 60, 26)}
      {/* Open sunflower face */}
      {[0,22,44,66,88,110,132,154,176,198,220,242,264,286,308,330].map(a => {
        const r = a * Math.PI / 180
        const px = 60 + Math.cos(r)*20, py = 22 + Math.sin(r)*20
        return <ellipse key={a} cx={px} cy={py} rx="5" ry="12" fill="#f5c428"
          transform={`rotate(${a} ${px} ${py})`} />
      })}
      <circle cx="60" cy="22" r="14" fill="#6b3810" />
      <circle cx="60" cy="22" r="9"  fill="#4a2808" />
    </g>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// PLT_06  JASMINE  — image-based asset from /assets/plant-assets/
// ════════════════════════════════════════════════════════════════════════════
function Jasmine() { return null }
Jasmine.isImageAsset = true
Jasmine.assetName = 'jasmine'

// ════════════════════════════════════════════════════════════════════════════
// PLT_07  ROSE  — image-based asset from /assets/plant-assets/
// ════════════════════════════════════════════════════════════════════════════
function Rose() { return null }
Rose.isImageAsset = true
Rose.assetName = 'rose'
