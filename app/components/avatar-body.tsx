/* 'use client' */

import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

interface AvatarBodyProps {
  metrics: BodyMetrics
  style: AvatarStyle
  size: number
}

export function AvatarBody({ metrics, style, size }: AvatarBodyProps) {
  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const gender = metrics.gender ?? 'other'

  // DEBUG: remove in production
  if (typeof window !== 'undefined') {
    console.log('[AvatarBody] gender:', gender, 'isFemale:', gender === 'female', 'metrics:', JSON.stringify({ w: metrics.weight, h: metrics.height, a: metrics.age, g: metrics.gender }))
  }

  // ── Gender-specific proportions ──────────────────────────────────────────────
  const isMale   = gender === 'male'
  const isFemale = gender === 'female'

  // Base torso width: male > neutral > female
  let baseTorsoW = isFemale ? 16 : isMale ? 24 : 20
  if (bmi >= 25 && bmi < 30) baseTorsoW += 4
  else if (bmi >= 30) baseTorsoW += 8
  else if (bmi < 18.5) baseTorsoW -= 3
  const torsoW = baseTorsoW

  // Shoulder vs hip ratio: female = hips > shoulders; male = shoulders > hips
  const shoulderHipRatio = isFemale ? 0.72 : isMale ? 1.18 : 1.0

  // Hip width
  let hipW = Math.round(torsoW * shoulderHipRatio)
  if (bmi >= 30) hipW += 4
  if (bmi < 18.5) hipW -= 2

  // Arms
  let armW = isFemale ? 4 : isMale ? 6 : 5
  if (bmi >= 30) armW += 1

  // Legs
  let legW = isFemale ? 7 : isMale ? 9 : 8
  if (bmi < 18.5) legW -= 1
  else if (bmi >= 25 && bmi < 30) legW += 2
  else if (bmi >= 30) legW += 4

  const svgH = size * 1.4
  const primary = style.topColor
  const bottomC = style.bottomColor
  const skin = style.skinTone
  const hairC = style.hairColor

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={svgH}
      className="drop-shadow-xl"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))' }}
    >
      <defs>
        {/* Skin gradient — top-left studio lighting */}
        <radialGradient id="skinGrad" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="60%" stopColor={skin} stopOpacity="0.95" />
          <stop offset="100%" stopColor={skin} stopOpacity="0.75" />
        </radialGradient>

        {/* Top clothing gradient */}
        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="40%" stopColor={primary} stopOpacity="0.95" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.8" />
        </linearGradient>

        {/* Bottom clothing gradient */}
        <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={bottomC} stopOpacity="1" />
          <stop offset="100%" stopColor={bottomC} stopOpacity="0.75" />
        </linearGradient>

        {/* Hair gradient */}
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hairC} stopOpacity="1" />
          <stop offset="100%" stopColor={hairC} stopOpacity="0.6" />
        </linearGradient>

        {/* Shadow under feet — soft radial */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Shoe gradient */}
        <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={style.shoeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={style.shoeColor} stopOpacity="0.7" />
        </linearGradient>

        {/* Soft glow behind head */}
        <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.08" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>

        {/* Drop shadow filter */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.2)" />
        </filter>

        {/* Inner glow for 3D effect */}
        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset in="blur" dx="1" dy="1" result="offsetBlur" />
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
        </filter>

        {/* Clip path for body */}
        <clipPath id="bodyClip">
          <rect x="0" y="0" width="120" height="160" />
        </clipPath>
      </defs>

      {/* ====== SOFT SHADOW ON FLOOR ====== */}
      <ellipse cx="60" cy="156" rx="32" ry="5" fill="url(#shadowGrad)" />

      {/* ====== LOWER BODY (gender-differentiated) ====== */}
      {isFemale ? (
        /* ── FEMALE: A-line dress silhouette — wider hips, no leg separation ── */
        <>
          {/* Dress body — trapezoidal A-line from waist to hem */}
          <path
            d={`M${60 - torsoW} 88
               L${60 - hipW - 4} 150
               L${60 + hipW + 4} 150
               L${60 + torsoW} 88Z`}
            fill="url(#bottomGrad)"
          />
          {/* Dress main body — full coverage, no leg split */}
          <path
            d={`M${60 - torsoW + 4} 88
               Q${60 - hipW - 8} 120 ${60 - hipW - 4} 150
               L${60 + hipW + 4} 150
               Q${60 + hipW + 8} 120 ${60 + torsoW - 4} 88Z`}
            fill="url(#bottomGrad)"
          />
          {/* Dress neckline / bodice */}
          <path
            d={`M${60 - torsoW + 4} 88 Q${60 - torsoW + 10} 82 ${60} 80 Q${60 + torsoW - 10} 82 ${60 + torsoW - 4} 88Z`}
            fill={primary}
            opacity="0.9"
          />
          {/* Dress hem ruffle */}
          <path
            d={`M${60 - hipW - 4} 150 Q${60 - hipW / 2} 153 ${60} 150 Q${60 + hipW / 2} 153 ${60 + hipW + 4} 150`}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none"
          />
          {/* Dress pleat lines */}
          <path d={`M${60 - hipW / 2} 92 L${60 - hipW / 2 - 2} 150`} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <path d={`M${60 + hipW / 2} 92 L${60 + hipW / 2 + 2} 150`} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          {/* Left shoe (feminine — slight heel) */}
          <path
            d={`M${60 - legW - 2} 148 Q${60 - legW / 2} 143 ${60 - legW / 2 + 6} 148 L${60 + 7} 148 Q${60 + legW / 2 + 1} 150 ${60 + legW / 2 - 4} 156 L${60 - legW - 5} 156 Q${60 - legW - 4} 151 ${60 - legW - 2} 148Z`}
            fill="url(#shoeGrad)"
          />
          <ellipse cx={60 - legW / 2} cy="147" rx="3.5" ry="2" fill="rgba(255,255,255,0.2)" />
          {/* Right shoe */}
          <path
            d={`M${60 + 1} 148 Q${60 + legW / 2 + 1} 143 ${60 + legW / 2 + 7} 148 L${60 + legW + 4} 148 Q${60 + legW + 5} 151 ${60 + legW + 3} 156 L${60 - 1} 156 Q${60 + legW / 2 + 1} 150 ${60 + 1} 148Z`}
            fill="url(#shoeGrad)"
          />
          <ellipse cx={60 + legW / 2 + 1} cy="147" rx="3.5" ry="2" fill="rgba(255,255,255,0.2)" />
          {/* Debug label inside SVG */}
          <text x="60" y="118" textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.3)" fontFamily="sans-serif">MUJER</text>
        </>
      ) : (
        /* ── MALE/OTHER: pants silhouette ── */
        <>
          {/* Left leg */}
          <rect x={58 - legW - 1} y="94" width={legW} height="55" rx={legW / 2} fill="url(#bottomGrad)" />
          <rect x={58 - legW - 1 + 2} y="96" width="2" height="52" rx="1" fill="rgba(255,255,255,0.08)" />
          {/* Left shoe */}
          <path
            d={`M${58 - legW - 1 - 1} 148 Q${58 - legW / 2 - 1} 143 ${58 - legW / 2 + 7} 148 L${58 + 9} 148 Q${58 + legW / 2 + 1} 151 ${58 + legW / 2 - 5} 156 L${58 - legW - 4} 156 Q${58 - legW - 3} 152 ${58 - legW - 1 - 1} 148Z`}
            fill="url(#shoeGrad)"
          />
          <ellipse cx={58 - legW / 2} cy="147" rx="4" ry="2" fill="rgba(255,255,255,0.2)" />
          {/* Right leg */}
          <rect x="61" y="94" width={legW} height="55" rx={legW / 2} fill="url(#bottomGrad)" />
          <rect x="63" y="96" width="2" height="52" rx="1" fill="rgba(255,255,255,0.08)" />
          {/* Right shoe */}
          <path
            d={`M${60 + 1} 148 Q${60 + legW / 2 + 1} 143 ${60 + legW / 2 + 9} 148 L${60 + legW + 3} 148 Q${60 + legW + 4} 152 ${60 + legW + 2} 156 L${60 - 1} 156 Q${60 + legW / 2 + 1} 151 ${60 + 1} 148Z`}
            fill="url(#shoeGrad)"
          />
          <ellipse cx={60 + legW / 2 + 1} cy="147" rx="4" ry="2" fill="rgba(255,255,255,0.2)" />
        </>
      )}

      {/* ====== TORSO / BODY ====== */}
      {/* Torso shadow layer */}
      <rect x={60 - torsoW - 1} y="52" width={torsoW * 2 + 2} height="44" rx="10" fill="rgba(0,0,0,0.08)" />
      {/* Torso main */}
      <rect x={60 - torsoW} y="50" width={torsoW * 2} height="44" rx="9" fill="url(#topGrad)" />
      {/* Torso highlight (left light source) */}
      <rect x={60 - torsoW + 3} y="52" width="6" height="40" rx="3" fill="rgba(255,255,255,0.18)" />
      {/* Torso seam/collar detail */}
      <path d={`M${60 - 8} 50 Q60 56 ${60 + 8} 50`} stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" fill="none" />
      {/* Collar V */}
      <path d={`M${60 - 5} 51 L${60} 58 L${60 + 5} 51`} stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="rgba(255,255,255,0.05)" />
      {/* Heart badge */}
      <circle cx="60" cy="60" r="4.5" fill="rgba(255,255,255,0.15)" />
      <path d="M58 60 L60 58 L62 60 L60 62.5Z" fill="white" opacity="0.7" />

      {/* ====== ARMS ====== */}
      {/* Left arm shadow */}
      <rect x={60 - torsoW - armW} y="52" width={armW} height="35" rx={armW / 2} fill="rgba(0,0,0,0.06)" />
      {/* Left arm */}
      <rect x={60 - torsoW - armW} y="51" width={armW} height="34" rx={armW / 2} fill="url(#skinGrad)" />
      {/* Left arm highlight */}
      <rect x={60 - torsoW - armW + 1} y="52" width="1.5" height="32" rx="0.75" fill="rgba(255,255,255,0.15)" />
      {/* Left hand */}
      <circle cx={60 - torsoW - armW / 2} cy="87" r={armW * 0.95} fill="url(#skinGrad)" />
      <circle cx={60 - torsoW - armW / 2 - 0.5} cy="86" r={armW * 0.3} fill="rgba(255,255,255,0.1)" />

      {/* Right arm shadow */}
      <rect x={60 + torsoW + 1} y="52" width={armW} height="35" rx={armW / 2} fill="rgba(0,0,0,0.06)" />
      {/* Right arm */}
      <rect x={60 + torsoW + 1} y="51" width={armW} height="34" rx={armW / 2} fill="url(#skinGrad)" />
      {/* Right arm highlight */}
      <rect x={60 + torsoW + 1.5} y="52" width="1.5" height="32" rx="0.75" fill="rgba(255,255,255,0.08)" />
      {/* Right hand */}
      <circle cx={60 + torsoW + armW / 2 + 1} cy="87" r={armW * 0.95} fill="url(#skinGrad)" />
      <circle cx={60 + torsoW + armW / 2 + 1.5} cy="86" r={armW * 0.3} fill="rgba(255,255,255,0.1)" />

      {/* ====== NECK ====== */}
      <rect x="54" y="42" width="12" height="14" rx="4" fill="url(#skinGrad)" />
      {/* Neck shadow from head */}
      <rect x="54" y="42" width="12" height="4" rx="2" fill="rgba(0,0,0,0.05)" />

      {/* ====== HEAD ====== */}
      {/* Head glow background */}
      <circle cx="60" cy="27" r="22" fill="url(#headGlow)" />
      {/* Head main */}
      <circle cx="60" cy="27" r="18" fill="url(#skinGrad)" />
      {/* Head highlight (top-left light) */}
      <ellipse cx="53" cy="20" rx="8" ry="6" fill="rgba(255,255,255,0.12)" />
      {/* Jaw definition */}
      <path d="M44 30 Q44 38 60 40 Q76 38 76 30" stroke="rgba(0,0,0,0.05)" strokeWidth="1" fill="none" />

      {/* ====== EARS ====== */}
      <ellipse cx="42" cy="28" rx="3" ry="4" fill="url(#skinGrad)" />
      <ellipse cx="78" cy="28" rx="3" ry="4" fill="url(#skinGrad)" />

      {/* Female earrings */}
      {isFemale && (
        <>
          <circle cx="39" cy="31" r="2.5" fill="#fbbf24" />
          <circle cx="39" cy="31" r="1.5" fill="#f59e0b" />
          <circle cx="81" cy="31" r="2.5" fill="#fbbf24" />
          <circle cx="81" cy="31" r="1.5" fill="#f59e0b" />
        </>
      )}

      {/* ====== HAIR ====== */}
      {style.hairStyle === 0 && ( // Short
        <path d="M43 24 Q45 10 60 7 Q75 10 77 24 Q74 16 60 13 Q46 16 43 24Z" fill="url(#hairGrad)" />
      )}
      {style.hairStyle === 1 && ( // Medium
        <>
          <path d="M42 26 Q44 9 60 6 Q76 9 78 26 Q75 17 60 14 Q45 17 42 26Z" fill="url(#hairGrad)" />
          <path d="M42 26 Q38 32 39 42" stroke={hairC} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M78 26 Q82 32 81 42" stroke={hairC} strokeWidth="7" fill="none" strokeLinecap="round" />
        </>
      )}
      {style.hairStyle === 2 && ( // Long
        <>
          <path d="M42 26 Q44 9 60 6 Q76 9 78 26 Q75 17 60 14 Q45 17 42 26Z" fill="url(#hairGrad)" />
          <path d="M42 26 Q36 34 37 55" stroke={hairC} strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M78 26 Q84 34 83 55" stroke={hairC} strokeWidth="8" fill="none" strokeLinecap="round" />
        </>
      )}
      {style.hairStyle === 3 && ( // Bun
        <>
          <path d="M43 24 Q45 10 60 7 Q75 10 77 24 Q74 16 60 13 Q46 16 43 24Z" fill="url(#hairGrad)" />
          <circle cx="60" cy="7" r="8" fill={hairC} />
          <ellipse cx="57" cy="5" rx="3" ry="2" fill="rgba(255,255,255,0.15)" />
        </>
      )}
      {style.hairStyle === 4 && ( // Spiky
        <>
          <path d="M43 24 Q45 10 60 7 Q75 10 77 24 Q74 16 60 13 Q46 16 43 24Z" fill="url(#hairGrad)" />
          <path d="M46 20 L42 8 L50 17Z" fill={hairC} />
          <path d="M60 17 L60 4 L63 15Z" fill={hairC} />
          <path d="M74 20 L78 8 L70 17Z" fill={hairC} />
        </>
      )}
      {style.hairStyle === 5 && ( // Curly
        <>
          <path d="M43 24 Q45 10 60 7 Q75 10 77 24 Q74 16 60 13 Q46 16 43 24Z" fill="url(#hairGrad)" />
          {[0, 1, 2, 3, 4].map(i => (
            <circle key={i} cx={44 + i * 8} cy={13 - Math.abs(i - 2) * 2} r="5" fill={hairC} />
          ))}
        </>
      )}

      {/* ====== FACE ====== */}
      {/* Eyebrows */}
      <path d="M50 22 Q53 20 56 22" stroke={hairC} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M64 22 Q67 20 70 22" stroke={hairC} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Eyes — white sclera */}
      <ellipse cx="53" cy="27" rx="4" ry="3.5" fill="white" />
      <ellipse cx="67" cy="27" rx="4" ry="3.5" fill="white" />
      {/* Iris */}
      <circle cx="53" cy="27.5" r="2.2" fill="#4b5563" />
      <circle cx="67" cy="27.5" r="2.2" fill="#4b5563" />
      {/* Pupil */}
      <circle cx="53" cy="27.5" r="1.2" fill="#1f2937" />
      <circle cx="67" cy="27.5" r="1.2" fill="#1f2937" />
      {/* Eye shine */}
      <circle cx="54" cy="26.5" r="0.8" fill="white" />
      <circle cx="68" cy="26.5" r="0.8" fill="white" />
      {/* Eye upper shadow */}
      <ellipse cx="53" cy="25.5" rx="4" ry="1.5" fill="rgba(0,0,0,0.06)" />
      <ellipse cx="67" cy="25.5" rx="4" ry="1.5" fill="rgba(0,0,0,0.06)" />

      {/* Nose */}
      <path d="M59 30 Q60 34 61 30" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Mouth — friendly smile */}
      <path d="M54 35 Q60 40 66 35" stroke="#374151" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Blush — rosy cheeks */}
      <ellipse cx="48" cy="32" rx="4.5" ry="3" fill="#fca5a5" opacity="0.35" />
      <ellipse cx="72" cy="32" rx="4.5" ry="3" fill="#fca5a5" opacity="0.35" />

      {/* ====== ACCESSORIES ====== */}
      {style.accessory === 1 && ( // Watch
        <g>
          <rect x={60 - torsoW - armW - 3} y="80" width="7" height="7" rx="1.5" fill="#d4a574" />
          <rect x={60 - torsoW - armW - 5} y="81" width="11" height="5" rx="1" fill="#92400e" />
          <circle cx={60 - torsoW - armW + 0.5} cy="83.5" r="1.5" fill="#fbbf24" />
        </g>
      )}
      {style.accessory === 3 && ( // Glasses
        <g>
          <circle cx="53" cy="27" r="6" stroke="#1f2937" strokeWidth="1.2" fill="none" />
          <circle cx="67" cy="27" r="6" stroke="#1f2937" strokeWidth="1.2" fill="none" />
          <line x1="59" y1="27" x2="61" y2="27" stroke="#1f2937" strokeWidth="1.2" />
          <line x1="47" y1="26" x2="42" y2="25" stroke="#1f2937" strokeWidth="1.2" />
          <line x1="73" y1="26" x2="78" y2="25" stroke="#1f2937" strokeWidth="1.2" />
          {/* Glass reflection */}
          <ellipse cx="51" cy="25" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" />
          <ellipse cx="65" cy="25" rx="2" ry="1.5" fill="rgba(255,255,255,0.2)" />
        </g>
      )}
      {style.accessory === 5 && ( // Cap
        <g>
          <path d="M42 20 Q60 9 78 20 Q60 24 42 20Z" fill="#ef4444" />
          <path d="M42 20 Q60 24 78 20 Q60 26 42 20Z" fill="#dc2626" />
          <rect x="41" y="19" width="38" height="4" rx="1.5" fill="#b91c1c" />
          {/* Cap brim */}
          <path d="M42 22 Q60 26 78 22 L80 24 Q60 30 40 24Z" fill="#b91c1c" />
        </g>
      )}
      {style.accessory === 6 && ( // Headband
        <path d="M42 22 Q60 15 78 22" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}

      {/* ====== SUBTLE OVERALL LIGHTING OVERLAY ====== */}
      {/* Top-left light source highlight on entire figure */}
      <ellipse cx="40" cy="40" rx="50" ry="80" fill="url(#headGlow)" opacity="0.3" />
    </svg>
  )
}
