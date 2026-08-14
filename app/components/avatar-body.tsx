/* 'use client' */

import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

interface AvatarBodyProps {
  metrics: BodyMetrics
  style: AvatarStyle
  size: number
}

export function AvatarBody({ metrics, style, size }: AvatarBodyProps) {
  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const gender = (metrics.gender as string) || 'other'

  // ── Gender detection ──────────────────────────────────────────────────────
  const isFemale = gender === 'female'
  const isMale   = gender === 'male'

  // ── Body proportions ────────────────────────────────────────────────────
  const baseTorsoW = isFemale ? 15 : isMale ? 22 : 18
  const torsoW = baseTorsoW

  // Female: wide hips, narrow shoulders; Male: narrow hips, wide shoulders
  const hipW = isFemale ? 22 : isMale ? 14 : 18
  const armW = isMale ? 6 : isFemale ? 4 : 5
  const legW = isMale ? 9 : isFemale ? 6 : 8

  // ── Colors ─────────────────────────────────────────────────────────────
  const primary   = style.topColor
  const skin     = style.skinTone
  const hairC    = style.hairColor
  const bottomC  = style.bottomColor
  const shoeC    = style.shoeColor

  // ── Female = pink aura, Male = blue aura ───────────────────────────────
  const auraColor = isFemale ? '#fce7f3' : isMale ? '#e0e7ff' : '#f3f4f6'
  const auraBorder = isFemale ? '#f472b6' : isMale ? '#818cf8' : '#9ca3af'

  // ── Dress vs Pants color ─────────────────────────────────────────────
  const pantsColor = bottomC
  const dressColor = isFemale ? '#ec4899' : bottomC // female gets pink dress regardless of bottomColor

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={size * 1.4}
      style={{ filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.15))` }}
    >
      <defs>
        <radialGradient id={`skinGrad`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="100%" stopColor={skin} stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={shoeC} stopOpacity="1" />
          <stop offset="100%" stopColor={shoeC} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* ── AURA CIRCLE (visible behind everything) ── */}
      <circle cx="60" cy="80" r="55" fill={auraColor} stroke={auraBorder} strokeWidth="2.5" opacity="0.7" />

      {/* ── SHADOW ── */}
      <ellipse cx="60" cy="156" rx="34" ry="6" fill="rgba(0,0,0,0.2)" />

      {/* ══════════════════════════════════════════════════ */}
      {/* LOWER BODY — dress (female) vs pants (male)      */}
      {/* ══════════════════════════════════════════════════ */}

      {isFemale ? (
        /* ── DRESS (female): drawn ABOVE torso so it's visible ── */
        <>
          {/* Dress body — trapezoidal, wider at hem */}
          <path
            d={`M${60 - torsoW - 6} 50
               L${60 - hipW - 8} 152
               L${60 + hipW + 8} 152
               L${60 + torsoW + 6} 50 Z`}
            fill={dressColor}
          />
          {/* Dress bodice overlay */}
          <path
            d={`M${60 - torsoW - 4} 50
               L${60 - torsoW + 4} 50
               L${60 + torsoW - 4} 50
               L${60 + torsoW + 4} 50
               L${60 + torsoW - 2} 88
               L${60 - torsoW + 2} 88 Z`}
            fill={primary}
            opacity="0.85"
          />
          {/* Dress hem ruffle */}
          <path
            d={`M${60 - hipW - 8} 150 Q${60} 156 ${60 + hipW + 8} 150`}
            stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none"
          />
          {/* Dress center fold line */}
          <path d={`M${60} 55 L${60} 150`} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          {/* Left shoe */}
          <ellipse cx={60 - 10} cy="152" rx="7" ry="4" fill={shoeC} />
          <ellipse cx={60 - 10} cy="150" rx="4" ry="2" fill="rgba(255,255,255,0.2)" />
          {/* Right shoe */}
          <ellipse cx={60 + 10} cy="152" rx="7" ry="4" fill={shoeC} />
          <ellipse cx={60 + 10} cy="150" rx="4" ry="2" fill="rgba(255,255,255,0.2)" />
        </>
      ) : (
        /* ── PANTS (male / other) ── */
        <>
          {/* Left leg */}
          <rect x={60 - legW - 1} y="92" width={legW} height="60" rx={legW / 2} fill={pantsColor} />
          <rect x={60 - legW + 1} y="94" width="2" height="56" rx="1" fill="rgba(255,255,255,0.1)" />
          {/* Right leg */}
          <rect x="61" y="92" width={legW} height="60" rx={legW / 2} fill={pantsColor} />
          <rect x="63" y="94" width="2" height="56" rx="1" fill="rgba(255,255,255,0.1)" />
          {/* Left shoe */}
          <path
            d={`M${60 - legW - 2} 150 Q${60 - legW / 2} 145 ${60 - legW / 2 + 8} 150 L${60 + 9} 150 Q${60 + legW / 2 + 2} 153 ${60 + legW / 2 - 5} 158 L${60 - legW - 5} 158 Q${60 - legW - 4} 154 ${60 - legW - 2} 150Z`}
            fill={shoeC}
          />
          <ellipse cx={60 - legW / 2} cy="149" rx="4" ry="2.5" fill="rgba(255,255,255,0.2)" />
          {/* Right shoe */}
          <path
            d={`M${60 + 1} 150 Q${60 + legW / 2 + 1} 145 ${60 + legW / 2 + 9} 150 L${60 + legW + 4} 150 Q${60 + legW + 5} 154 ${60 + legW + 3} 158 L${60 - 1} 158 Q${60 + legW / 2 + 1} 153 ${60 + 1} 150Z`}
            fill={shoeC}
          />
          <ellipse cx={60 + legW / 2 + 1} cy="149" rx="4" ry="2.5" fill="rgba(255,255,255,0.2)" />
        </>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* TORSO / BODY — always on top of lower body        */}
      {/* ══════════════════════════════════════════════════ */}
      <rect x={60 - torsoW - 1} y="48" width={torsoW * 2 + 2} height="46" rx="10" fill="rgba(0,0,0,0.06)" />
      <rect x={60 - torsoW} y="46" width={torsoW * 2} height="46" rx="9" fill="url(#topGrad)" />
      <rect x={60 - torsoW + 3} y="48" width="6" height="42" rx="3" fill="rgba(255,255,255,0.18)" />
      {/* Collar V */}
      <path d={`M${60 - 6} 47 L${60} 55 L${60 + 6} 47`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" fill="rgba(255,255,255,0.05)" />
      {/* Heart badge */}
      <circle cx="60" cy="60" r="5" fill="rgba(255,255,255,0.15)" />
      <path d="M58 60 L60 58 L62 60 L60 62.5Z" fill="white" opacity="0.7" />

      {/* ══════════════════════════════════════════════════ */}
      {/* ARMS                                               */}
      {/* ══════════════════════════════════════════════════ */}
      {/* Left arm */}
      <rect x={60 - torsoW - armW} y="48" width={armW} height="36" rx={armW / 2} fill="url(#skinGrad)" />
      <rect x={60 - torsoW - armW + 1} y="49" width="1.5" height="34" rx="0.75" fill="rgba(255,255,255,0.15)" />
      <circle cx={60 - torsoW - armW / 2} cy="86" r={armW * 0.9} fill="url(#skinGrad)" />
      {/* Right arm */}
      <rect x={60 + torsoW + 1} y="48" width={armW} height="36" rx={armW / 2} fill="url(#skinGrad)" />
      <rect x={60 + torsoW + 1.5} y="49" width="1.5" height="34" rx="0.75" fill="rgba(255,255,255,0.1)" />
      <circle cx={60 + torsoW + armW / 2 + 1} cy="86" r={armW * 0.9} fill="url(#skinGrad)" />

      {/* ══════════════════════════════════════════════════ */}
      {/* NECK                                               */}
      {/* ══════════════════════════════════════════════════ */}
      <rect x="54" y="38" width="12" height="14" rx="4" fill="url(#skinGrad)" />

      {/* ══════════════════════════════════════════════════ */}
      {/* HEAD                                               */}
      {/* ══════════════════════════════════════════════════ */}
      <circle cx="60" cy="24" r="18" fill="url(#skinGrad)" />
      {/* Jaw definition */}
      <path d="M44 27 Q44 35 60 37 Q76 35 76 27" stroke="rgba(0,0,0,0.04)" strokeWidth="1" fill="none" />

      {/* ══════════════════════════════════════════════════ */}
      {/* EARS (and earrings for female)                   */}
      {/* ══════════════════════════════════════════════════ */}
      <ellipse cx="42" cy="25" rx="3" ry="4" fill="url(#skinGrad)" />
      <ellipse cx="78" cy="25" rx="3" ry="4" fill="url(#skinGrad)" />
      {/* Female earrings — gold hoops */}
      {isFemale && (
        <>
          <circle cx="39" cy="28" r="3" fill="#fbbf24" />
          <circle cx="39" cy="28" r="1.5" fill="#f59e0b" />
          <circle cx="81" cy="28" r="3" fill="#fbbf24" />
          <circle cx="81" cy="28" r="1.5" fill="#f59e0b" />
        </>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* HAIR — different for male/female                  */}
      {/* ══════════════════════════════════════════════════ */}
      {/* Female: long hair with volume */}
      {isFemale ? (
        <>
          <path d="M42 22 Q44 8 60 5 Q76 8 78 22 Q75 14 60 11 Q45 14 42 22Z" fill={hairC} />
          <path d="M42 22 Q36 30 37 55" stroke={hairC} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M78 22 Q84 30 83 55" stroke={hairC} strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* Hair highlight */}
          <path d="M48 14 Q52 9 60 8 Q68 9 72 14" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
        </>
      ) : isMale ? (
        /* Male: short practical hair */
        <>
          <path d="M43 22 Q45 9 60 6 Q75 9 77 22 Q74 15 60 12 Q46 15 43 22Z" fill={hairC} />
          <path d="M48 16 Q52 11 60 10 Q68 11 72 16" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
        </>
      ) : (
        /* Other: medium hair */
        <>
          <path d="M42 23 Q44 9 60 6 Q76 9 78 23 Q75 15 60 12 Q45 15 42 23Z" fill={hairC} />
        </>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* FACE                                               */}
      {/* ══════════════════════════════════════════════════ */}
      {/* Eyebrows */}
      <path d="M50 20 Q53 18 56 20" stroke={hairC} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M64 20 Q67 18 70 20" stroke={hairC} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="53" cy="25" rx="4" ry="3.5" fill="white" />
      <ellipse cx="67" cy="25" rx="4" ry="3.5" fill="white" />
      <circle cx="53" cy="25.5" r="2.2" fill="#4b5563" />
      <circle cx="67" cy="25.5" r="2.2" fill="#4b5563" />
      <circle cx="53" cy="25.5" r="1.1" fill="#1f2937" />
      <circle cx="67" cy="25.5" r="1.1" fill="#1f2937" />
      <circle cx="54" cy="24.5" r="0.8" fill="white" />
      <circle cx="68" cy="24.5" r="0.8" fill="white" />
      {/* Nose */}
      <path d="M59 28 Q60 32 61 28" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Mouth */}
      <path d="M54 33 Q60 38 66 33" stroke="#374151" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="48" cy="30" rx="4.5" ry="3" fill="#fca5a5" opacity="0.35" />
      <ellipse cx="72" cy="30" rx="4.5" ry="3" fill="#fca5a5" opacity="0.35" />

      {/* ══════════════════════════════════════════════════ */}
      {/* ACCESSORIES                                        */}
      {/* ══════════════════════════════════════════════════ */}
      {style.accessory === 1 && (
        <g>
          <rect x={60 - torsoW - armW - 3} y="78" width="8" height="8" rx="2" fill="#d4a574" />
          <rect x={60 - torsoW - armW - 5} y="79" width="12" height="6" rx="1.5" fill="#92400e" />
          <circle cx={60 - torsoW - armW + 0.5} cy="82" r="2" fill="#fbbf24" />
        </g>
      )}
      {style.accessory === 3 && (
        <g>
          <circle cx="53" cy="25" r="7" stroke="#1f2937" strokeWidth="1.5" fill="none" />
          <circle cx="67" cy="25" r="7" stroke="#1f2937" strokeWidth="1.5" fill="none" />
          <line x1="60" y1="25" x2="62" y2="25" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="46" y1="24" x2="40" y2="23" stroke="#1f2937" strokeWidth="1.5" />
          <line x1="74" y1="24" x2="80" y2="23" stroke="#1f2937" strokeWidth="1.5" />
        </g>
      )}
      {style.accessory === 5 && (
        <g>
          <path d="M42 18 Q60 7 78 18 Q60 22 42 18Z" fill="#ef4444" />
          <path d="M42 18 Q60 22 78 18 Q60 24 42 18Z" fill="#dc2626" />
          <rect x="41" y="17" width="38" height="4" rx="2" fill="#b91c1c" />
          <path d="M42 20 Q60 24 78 20 L80 22 Q60 28 40 22Z" fill="#b91c1c" />
        </g>
      )}
      {style.accessory === 6 && (
        <path d="M42 20 Q60 13 78 20" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
