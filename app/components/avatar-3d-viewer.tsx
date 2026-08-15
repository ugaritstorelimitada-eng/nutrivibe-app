'use client'

import { useState, useEffect, useCallback } from 'react'
import { Maximize2, ExternalLink, Loader2 } from 'lucide-react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

const READY_PLAYER_ME_SUBDOMAIN = 'nutriguia'

// ============================================================
// High-quality SVG Avatar — stylized Pixar/Memoji look
// Body proportions respond to gender, weight (BMI), height
// ============================================================
function VibeAvatar({ metrics, style }: {
  metrics: BodyMetrics
  style: AvatarStyle
}) {
  const isFemale = metrics.gender === 'female'
  const isMale = metrics.gender === 'male'

  // BMI-based scale: wider body for higher BMI
  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const bmiScale = bmi < 18.5 ? 0.82 : bmi < 25 ? 1.0 : bmi < 30 ? 1.18 : 1.35

  // Height-based overall scale (head + body)
  const heightScale = 0.75 + (metrics.height / 210) * 0.35

  // Proportions
  const W = 240 * heightScale
  const H = 340 * heightScale
  const cx = W / 2

  // Body widths
  const torsoW = (isFemale ? 42 : 50) * bmiScale
  const hipW = (isFemale ? 58 : 40) * bmiScale
  const armW = (isMale ? 14 : 11) * bmiScale
  const legW = (isMale ? 18 : 14) * bmiScale
  const torsoH = 85
  const neckH = 16

  // Y positions (top-down, SVG coords)
  const headY = 40 * heightScale
  const headR = 36 * heightScale
  const neckY = headY + headR + neckH / 2
  const torsoY = neckY + neckH / 2 + torsoH / 2
  const hipY = torsoY + torsoH / 2
  const legLen = 100 * heightScale
  const legY = hipY + 8
  const shoeY = legY + legLen

  // Colors
  const skin = style.skinTone
  const hairC = style.hairColor
  const topC = style.topColor
  const bottomC = style.bottomColor
  const shoeC = style.shoeColor
  const dressC = isFemale ? '#ec4899' : bottomC

  // Skin gradient
  const skinHex = skin
  const skinGradId = 'skinG'
  const topGradId = 'topG'
  const dressGradId = 'dressG'
  const pantsGradId = 'pantsG'
  const hairGradId = 'hairG'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))', maxWidth: '100%' }}
    >
      <defs>
        {/* Skin gradient — subtle lighting */}
        <radialGradient id={skinGradId} cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor={skin} stopOpacity="1" />
          <stop offset="100%" stopColor={skin} stopOpacity="0.78" />
        </radialGradient>
        {/* Top gradient */}
        <linearGradient id={topGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={topC} stopOpacity="1" />
          <stop offset="100%" stopColor={topC} stopOpacity="0.75" />
        </linearGradient>
        {/* Dress gradient (female) */}
        <linearGradient id={dressGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={dressC} stopOpacity="1" />
          <stop offset="100%" stopColor={dressC} stopOpacity="0.8" />
        </linearGradient>
        {/* Pants gradient */}
        <linearGradient id={pantsGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={bottomC} stopOpacity="1" />
          <stop offset="100%" stopColor={bottomC} stopOpacity="0.75" />
        </linearGradient>
        {/* Hair gradient */}
        <linearGradient id={hairGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={hairC} stopOpacity="1" />
          <stop offset="100%" stopColor={hairC} stopOpacity="0.7" />
        </linearGradient>
        {/* Soft shadow */}
        <filter id="softShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx={cx} cy={shoeY + 8} rx={hipW * 1.2} ry="8" fill="rgba(0,0,0,0.15)" />

      {/* ══════════════════════════════════════ */}
      {/* LOWER BODY — dress (female) / pants  */}
      {/* ══════════════════════════════════════ */}

      {isFemale ? (
        /* ── DRESS ── */
        <>
          {/* Dress body — A-line silhouette */}
          <path
            d={`M${cx - torsoW * 0.9} ${torsoY - torsoH * 0.45}
               Q${cx - torsoW * 0.85} ${hipY - 5} ${cx - hipW} ${shoeY - 5}
               L${cx + hipW} ${shoeY - 5}
               Q${cx + torsoW * 0.85} ${hipY - 5} ${cx + torsoW * 0.9} ${torsoY - torsoH * 0.45}
               Z`}
            fill={`url(#${dressGradId})`}
          />
          {/* Dress bodice overlay */}
          <path
            d={`M${cx - torsoW * 0.85} ${torsoY - torsoH * 0.45}
               L${cx - torsoW * 0.75} ${torsoY - torsoH * 0.1}
               L${cx + torsoW * 0.75} ${torsoY - torsoH * 0.1}
               L${cx + torsoW * 0.85} ${torsoY - torsoH * 0.45}
               Q${cx} ${torsoY - torsoH * 0.35} ${cx - torsoW * 0.85} ${torsoY - torsoH * 0.45} Z`}
            fill={topC}
            opacity="0.9"
          />
          {/* Dress ruffle at hem */}
          <path
            d={`M${cx - hipW} ${shoeY - 10} Q${cx} ${shoeY} ${cx + hipW} ${shoeY - 10}`}
            stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none"
          />
          {/* Dress center fold */}
          <path d={`M${cx} ${torsoY - torsoH * 0.3} L${cx} ${shoeY - 12}`}
            stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" fill="none" />
          {/* Shoes */}
          <ellipse cx={cx - 14} cy={shoeY - 3} rx="12" ry="6" fill={shoeC} />
          <ellipse cx={cx + 14} cy={shoeY - 3} rx="12" ry="6" fill={shoeC} />
          {/* Shoe highlights */}
          <ellipse cx={cx - 14} cy={shoeY - 6} rx="6" ry="2.5" fill="rgba(255,255,255,0.18)" />
          <ellipse cx={cx + 14} cy={shoeY - 6} rx="6" ry="2.5" fill="rgba(255,255,255,0.18)" />
        </>
      ) : (
        /* ── PANTS ── */
        <>
          {/* Left leg */}
          <rect
            x={cx - legW * 1.8} y={legY}
            width={legW} height={legLen}
            rx={legW / 2} fill={`url(#${pantsGradId})`}
          />
          {/* Right leg */}
          <rect
            x={cx + legW * 0.8} y={legY}
            width={legW} height={legLen}
            rx={legW / 2} fill={`url(#${pantsGradId})`}
          />
          {/* Leg crease highlights */}
          <rect x={cx - legW * 1.8 + 2} y={legY + 4} width="2.5" height={legLen - 8} rx="1.25" fill="rgba(255,255,255,0.1)" />
          <rect x={cx + legW * 0.8 + 2} y={legY + 4} width="2.5" height={legLen - 8} rx="1.25" fill="rgba(255,255,255,0.1)" />
          {/* Shoes */}
          <path
            d={`M${cx - legW * 1.8 - 2} ${shoeY}
               Q${cx - legW * 1.8 - legW / 2} ${shoeY - 8} ${cx - legW / 2 + 10} ${shoeY}
               L${cx + 14} ${shoeY}
               Q${cx + legW * 1.8 + legW / 2 + 2} ${shoeY + 5} ${cx + legW * 1.8 + 4} ${shoeY + 10}
               L${cx - legW * 1.8 - 5} ${shoeY + 10}
               Q${cx - legW * 1.8 - 4} ${shoeY + 5} ${cx - legW * 1.8 - 2} ${shoeY}Z`}
            fill={shoeC}
          />
          <path
            d={`M${cx + legW * 0.8 + 1} ${shoeY}
               Q${cx + legW * 0.8 + legW / 2} ${shoeY - 8} ${cx + legW * 0.8 + legW + 10} ${shoeY}
               L${cx + legW * 1.8 + 14} ${shoeY}
               Q${cx + legW * 1.8 + legW + 16} ${shoeY + 5} ${cx + legW * 1.8 + 14} ${shoeY + 10}
               L${cx + legW * 0.8 - 4} ${shoeY + 10}
               Q${cx + legW * 0.8} ${shoeY + 5} ${cx + legW * 0.8 + 1} ${shoeY}Z`}
            fill={shoeC}
          />
          {/* Shoe highlights */}
          <ellipse cx={cx - legW * 1.0} cy={shoeY - 2} rx="5" ry="2.5" fill="rgba(255,255,255,0.15)" />
          <ellipse cx={cx + legW * 1.4} cy={shoeY - 2} rx="5" ry="2.5" fill="rgba(255,255,255,0.15)" />
        </>
      )}

      {/* ── Torso shadow ── */}
      <rect
        x={cx - torsoW - 1} y={torsoY - torsoH / 2 + 2}
        width={torsoW * 2 + 2} height={torsoH - 2}
        rx="12" fill="rgba(0,0,0,0.08)"
      />

      {/* ── Torso / Top ── */}
      <rect
        x={cx - torsoW} y={torsoY - torsoH / 2}
        width={torsoW * 2} height={torsoH}
        rx="10" fill={`url(#${topGradId})`}
      />
      {/* Top highlight strip */}
      <rect
        x={cx - torsoW + 5} y={torsoY - torsoH / 2 + 4}
        width="9" height={torsoH - 8}
        rx="4.5" fill="rgba(255,255,255,0.2)"
      />
      {/* Collar V */}
      <path
        d={`M${cx - 9} ${torsoY - torsoH / 2 + 3} L${cx} ${torsoY - torsoH / 2 + 16} L${cx + 9} ${torsoY - torsoH / 2 + 3}`}
        stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="rgba(255,255,255,0.06)"
      />
      {/* Heart / logo badge */}
      <circle cx={cx} cy={torsoY + 8} r="7" fill="rgba(255,255,255,0.15)" />
      <path d={`M${cx - 3} ${torsoY + 8} L${cx} ${torsoY + 5.5} L${cx + 3} ${torsoY + 8} L${cx} ${torsoY + 11.5}Z`}
        fill="white" opacity="0.75" />

      {/* ── Arms ── */}
      {/* Left arm */}
      <rect
        x={cx - torsoW - armW} y={torsoY - torsoH / 2 + 4}
        width={armW} height={torsoH * 0.65}
        rx={armW / 2} fill={`url(#${skinGradId})`}
      />
      {/* Left hand */}
      <circle cx={cx - torsoW - armW / 2} cy={torsoY - torsoH / 2 + torsoH * 0.65 + armW * 0.4} r={armW * 0.9} fill={`url(#${skinGradId})`} />
      {/* Right arm */}
      <rect
        x={cx + torsoW} y={torsoY - torsoH / 2 + 4}
        width={armW} height={torsoH * 0.65}
        rx={armW / 2} fill={`url(#${skinGradId})`}
      />
      {/* Right hand */}
      <circle cx={cx + torsoW + armW / 2} cy={torsoY - torsoH / 2 + torsoH * 0.65 + armW * 0.4} r={armW * 0.9} fill={`url(#${skinGradId})`} />

      {/* ── Neck ── */}
      <rect
        x={cx - 13 * heightScale} y={neckY - neckH / 2}
        width={26 * heightScale} height={neckH}
        rx="6" fill={`url(#${skinGradId})`}
      />

      {/* ── Head ── */}
      <circle cx={cx} cy={headY} r={headR} fill={`url(#${skinGradId})`} />

      {/* ── HAIR ── */}
      {isFemale ? (
        /* Long hair — volume + strands */
        <>
          {/* Top dome */}
          <path
            d={`M${cx - headR * 0.92} ${headY}
               Q${cx - headR * 0.8} ${headY - headR * 1.05} ${cx} ${headY - headR * 1.12}
               Q${cx + headR * 0.8} ${headY - headR * 1.05} ${cx + headR * 0.92} ${headY}
               Q${cx + headR * 0.7} ${headY - headR * 0.5} ${cx} ${headY - headR * 0.8}
               Q${cx - headR * 0.7} ${headY - headR * 0.5} ${cx - headR * 0.92} ${headY} Z`}
            fill={hairC}
          />
          {/* Hair highlight */}
          <path
            d={`M${cx - headR * 0.5} ${headY - headR * 0.9}
               Q${cx} ${headY - headR * 1.05} ${cx + headR * 0.5} ${headY - headR * 0.9}`}
            stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" fill="none"
          />
          {/* Left side strand */}
          <path
            d={`M${cx - headR * 0.85} ${headY - headR * 0.3}
               Q${cx - headR * 1.1} ${headY + headR * 0.2} ${cx - headR * 1.0} ${hipY - torsoH * 0.4}
               Q${cx - headR * 0.9} ${hipY} ${cx - headR * 0.75} ${torsoY - torsoH * 0.45}`}
            stroke={hairC} strokeWidth={headR * 0.45} fill="none"
            strokeLinecap="round"
          />
          {/* Right side strand */}
          <path
            d={`M${cx + headR * 0.85} ${headY - headR * 0.3}
               Q${cx + headR * 1.1} ${headY + headR * 0.2} ${cx + headR * 1.0} ${hipY - torsoH * 0.4}
               Q${cx + headR * 0.9} ${hipY} ${cx + headR * 0.75} ${torsoY - torsoH * 0.45}`}
            stroke={hairC} strokeWidth={headR * 0.45} fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        /* Short hair — practical cut */
        <>
          <path
            d={`M${cx - headR * 0.9} ${headY}
               Q${cx - headR * 0.78} ${headY - headR * 1.02} ${cx} ${headY - headR * 1.08}
               Q${cx + headR * 0.78} ${headY - headR * 1.02} ${cx + headR * 0.9} ${headY}
               Q${cx + headR * 0.65} ${headY - headR * 0.55} ${cx} ${headY - headR * 0.75}
               Q${cx - headR * 0.65} ${headY - headR * 0.55} ${cx - headR * 0.9} ${headY} Z`}
            fill={hairC}
          />
          {/* Hair highlight */}
          <path
            d={`M${cx - headR * 0.5} ${headY - headR * 0.88}
               Q${cx} ${headY - headR * 1.0} ${cx + headR * 0.5} ${headY - headR * 0.88}`}
            stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none"
          />
        </>
      )}

      {/* ── EARS ── */}
      <ellipse cx={cx - headR - 1} cy={headY + 2} rx="5" ry="6" fill={`url(#${skinGradId})`} />
      <ellipse cx={cx + headR + 1} cy={headY + 2} rx="5" ry="6" fill={`url(#${skinGradId})`} />
      {/* Female earrings — gold hoops */}
      {isFemale && (
        <>
          <circle cx={cx - headR - 4} cy={headY + 7} r="4" fill="#fbbf24" />
          <circle cx={cx - headR - 4} cy={headY + 7} r="2" fill={dressC} />
          <circle cx={cx + headR + 4} cy={headY + 7} r="4" fill="#fbbf24" />
          <circle cx={cx + headR + 4} cy={headY + 7} r="2" fill={dressC} />
        </>
      )}

      {/* ── FACE ── */}
      {/* Eyebrows */}
      <path d={`M${cx - headR * 0.52} ${headY - headR * 0.25}
                Q${cx - headR * 0.38} ${headY - headR * 0.32} ${cx - headR * 0.22} ${headY - headR * 0.26}`}
        stroke={hairC} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={`M${cx + headR * 0.22} ${headY - headR * 0.26}
                Q${cx + headR * 0.38} ${headY - headR * 0.32} ${cx + headR * 0.52} ${headY - headR * 0.25}`}
        stroke={hairC} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Eyes — white sclera */}
      <ellipse cx={cx - headR * 0.35} cy={headY + headR * 0.1} rx={headR * 0.22} ry={headR * 0.19} fill="white" />
      <ellipse cx={cx + headR * 0.35} cy={headY + headR * 0.1} rx={headR * 0.22} ry={headR * 0.19} fill="white" />
      {/* Iris */}
      <circle cx={cx - headR * 0.35} cy={headY + headR * 0.12} r={headR * 0.14} fill="#5b7fa6" />
      <circle cx={cx + headR * 0.35} cy={headY + headR * 0.12} r={headR * 0.14} fill="#5b7fa6" />
      {/* Pupil */}
      <circle cx={cx - headR * 0.35} cy={headY + headR * 0.13} r={headR * 0.08} fill="#1a1a2e" />
      <circle cx={cx + headR * 0.35} cy={headY + headR * 0.13} r={headR * 0.08} fill="#1a1a2e" />
      {/* Eye highlight */}
      <circle cx={cx - headR * 0.31} cy={headY + headR * 0.07} r={headR * 0.045} fill="white" />
      <circle cx={cx + headR * 0.31} cy={headY + headR * 0.07} r={headR * 0.045} fill="white" />
      {/* Eyelashes */}
      <path d={`M${cx - headR * 0.52} ${headY + headR * 0.04}
                Q${cx - headR * 0.35} ${headY - headR * 0.1} ${cx - headR * 0.18} ${headY + headR * 0.04}`}
        stroke={hairC} strokeWidth="1.5" fill="none" />
      <path d={`M${cx + headR * 0.18} ${headY + headR * 0.04}
                Q${cx + headR * 0.35} ${headY - headR * 0.1} ${cx + headR * 0.52} ${headY + headR * 0.04}`}
        stroke={hairC} strokeWidth="1.5" fill="none" />
      {/* Nose */}
      <path d={`M${cx - 3 * heightScale} ${headY + headR * 0.28}
                Q${cx} ${headY + headR * 0.42} ${cx + 3 * heightScale} ${headY + headR * 0.28}`}
        stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Mouth — smile */}
      <path d={`M${cx - headR * 0.28} ${headY + headR * 0.52}
                Q${cx} ${headY + headR * 0.68} ${cx + headR * 0.28} ${headY + headR * 0.52}`}
        stroke="#d47070" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx={cx - headR * 0.55} cy={headY + headR * 0.35} rx={headR * 0.22} ry={headR * 0.14} fill="#fca5a5" opacity="0.38" />
      <ellipse cx={cx + headR * 0.55} cy={headY + headR * 0.35} rx={headR * 0.22} ry={headR * 0.14} fill="#fca5a5" opacity="0.38" />

      {/* ── ACCESSORIES ── */}
      {style.accessory === 1 && (
        <>
          {/* Watch */}
          <rect x={cx - torsoW - armW - 4} y={torsoY - torsoH * 0.15} width="10" height="10" rx="3" fill="#d4a574" />
          <rect x={cx - torsoW - armW - 7} y={torsoY - torsoH * 0.15 + 1} width="16" height="8" rx="2" fill="#92400e" />
          <circle cx={cx - torsoW - armW + 1} cy={torsoY - torsoH * 0.15 + 5} r="2.5" fill="#fbbf24" />
        </>
      )}
      {style.accessory === 3 && (
        <>
          {/* Glasses */}
          <circle cx={cx - headR * 0.35} cy={headY + headR * 0.1} r={headR * 0.26} stroke="#1f2937" strokeWidth="1.8" fill="none" />
          <circle cx={cx + headR * 0.35} cy={headY + headR * 0.1} r={headR * 0.26} stroke="#1f2937" strokeWidth="1.8" fill="none" />
          <line x1={cx - headR * 0.09} y1={headY + headR * 0.1} x2={cx + headR * 0.09} y2={headY + headR * 0.1} stroke="#1f2937" strokeWidth="1.8" />
          <line x1={cx - headR * 0.61} y1={headY + headR * 0.1} x2={cx - headR - 1} y2={headY + headR * 0.05} stroke="#1f2937" strokeWidth="1.8" />
          <line x1={cx + headR * 0.61} y1={headY + headR * 0.1} x2={cx + headR + 1} y2={headY + headR * 0.05} stroke="#1f2937" strokeWidth="1.8" />
        </>
      )}
      {style.accessory === 5 && (
        <>
          {/* Cap */}
          <path
            d={`M${cx - headR * 0.88} ${headY - headR * 0.6} Q${cx} ${headY - headR * 1.18} ${cx + headR * 0.88} ${headY - headR * 0.6} Q${cx} ${headY - headR * 0.75} ${cx - headR * 0.88} ${headY - headR * 0.6} Z`}
            fill="#ef4444"
          />
          <path
            d={`M${cx - headR * 0.88} ${headY - headR * 0.6} Q${cx} ${headY - headR * 0.78} ${cx + headR * 0.88} ${headY - headR * 0.6}`}
            fill="#dc2626"
          />
          <rect x={cx - headR * 0.88} y={headY - headR * 0.62} width={headR * 1.76} height="5" rx="2.5" fill="#b91c1c" />
          <path
            d={`M${cx - headR * 0.88} ${headY - headR * 0.6} Q${cx} ${headY - headR * 0.78} ${cx + headR * 0.88} ${headY - headR * 0.6} L${cx + headR * 1.1} ${headY - headR * 0.55} Q${cx} ${headY - headR * 0.78} ${cx - headR * 1.1} ${headY - headR * 0.55} Z`}
            fill="#b91c1c"
          />
        </>
      )}
      {style.accessory === 6 && (
        <>
          {/* Headband */}
          <path d={`M${cx - headR * 0.92} ${headY - headR * 0.5} Q${cx} ${headY - headR * 0.72} ${cx + headR * 0.92} ${headY - headR * 0.5}`} stroke="#f59e0b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

// ============================================================
// Ready Player Me Modal
// ============================================================
function ReadyPlayerMeModal({ onClose, onAvatarSelected, subdomain }: {
  onClose: () => void
  onAvatarSelected: (url: string) => void
  subdomain: string
}) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        if (e.data?.source === 'readyplayerme' && e.data?.eventName === 'v1.avatar.exported') {
          const url = e.data.data?.modelUrl || e.data.url
          if (url) { onAvatarSelected(url); onClose() }
        }
      } catch {}
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onAvatarSelected, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden" style={{ height: 'min(620px, 85vh)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-white/80 text-sm font-medium">Crear tu VibeAvatar 3D</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://readyplayer.me" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-light leading-none">×</button>
          </div>
        </div>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Cargando VibeAvatar 3D...</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Personaliza tu avatar y presiona &quot;Exportar&quot;</p>
          </div>
        )}
        <iframe
          src={`https://${subdomain}.readyplayer.me/avatar?frameApi`}
          className="w-full h-full border-none"
          style={{ height: 'calc(100% - 60px)' }}
          allow="camera; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title="Creador de Avatar 3D"
        />
        <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gray-50 border-t text-center">
          <p className="text-[11px] text-muted-foreground">Cuando termines, presiona <strong>Exportar</strong> — tu avatar se guardará automáticamente</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// model-viewer (when RPM GLB URL available)
// ============================================================
function AvatarModelViewer({ glbUrl }: { glbUrl: string }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* @ts-ignore */}
      <model-viewer
        src={glbUrl}
        alt="Tu VibeAvatar 3D"
        camera-controls
        auto-rotate
        rotation-per-second="20deg"
        shadow-intensity="1"
        shadow-softness="0.8"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', minHeight: '340px', backgroundColor: 'transparent', '--poster-color': 'transparent' }}
      />
    </div>
  )
}

// ============================================================
// Main Avatar3DViewer
// ============================================================
export default function Avatar3DViewer({
  metrics,
  style,
  isRotating,
}: {
  metrics: BodyMetrics
  style: AvatarStyle
  isRotating?: boolean
  showClothes?: boolean
  showProgress?: boolean
}) {
  const [rotation, setRotation] = useState(0)
  const [showRPM, setShowRPM] = useState(false)
  const [glbUrl, setGlbUrl] = useState<string | null>(null)

  const onAvatarSelected = useCallback((url: string) => setGlbUrl(url), [])

  useEffect(() => {
    if (!isRotating) return
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setRotation(frame * 10)
      if (frame >= 36) { clearInterval(interval); setRotation(0) }
    }, 50)
    return () => clearInterval(interval)
  }, [isRotating])

  return (
    <div className="relative flex flex-col" style={{ minHeight: '400px' }}>
      {showRPM && (
        <ReadyPlayerMeModal subdomain={READY_PLAYER_ME_SUBDOMAIN} onClose={() => setShowRPM(false)} onAvatarSelected={onAvatarSelected} />
      )}

      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden rounded-t-2xl"
        style={{ background: 'linear-gradient(180deg, #e8eaff 0%, #fafbff 45%, #f5f3ff 100%)', minHeight: '360px' }}
      >
        {/* Aura glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
        {/* Studio spotlight */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 40% at 50% 20%, rgba(255,255,255,0.9) 0%, transparent 65%)' }} />

        <div
          className="relative z-10 flex items-center justify-center transition-transform duration-500"
          style={{
            transform: `perspective(800px) rotateY(${rotation}deg) scale(${isRotating ? 1.04 : 1})`,
          }}
        >
          {glbUrl ? (
            <AvatarModelViewer glbUrl={glbUrl} />
          ) : (
            <VibeAvatar metrics={metrics} style={style} />
          )}
        </div>

        {/* Gender badge */}
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl z-30"
          style={{
            background: metrics.gender === 'female' ? '#ec4899' : metrics.gender === 'male' ? '#6366f1' : '#6b7280',
            color: 'white',
            border: '2px solid white',
          }}
        >
          {metrics.gender === 'male' ? '👨 HOMBRE' : metrics.gender === 'female' ? '👩 MUJER' : '⚧️ OTRO'}
        </div>

        {/* Avatar badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20">
          <span>TU AVATAR</span>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>

        <button
          onClick={() => setShowRPM(true)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-indigo-100 hover:bg-white hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          {glbUrl ? 'Editar en Ready Player Me' : 'Crear avatar 3D'}
        </button>
      </div>
    </div>
  )
}
