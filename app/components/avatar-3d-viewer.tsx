'use client'

import { useState, useEffect } from 'react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

// ============================================================
// VibeAvatar — AI-generated 3D PNG render
// No external dependencies, loads instantly
// ============================================================
function VibeAvatar({ metrics }: { metrics: BodyMetrics }) {
  const isFemale = metrics.gender === 'female'
  const avatarSrc = isFemale ? '/avatars/avatar-female.png' : '/avatars/avatar-male.png'

  return (
    <div className="relative flex items-center justify-center" style={{ height: '100%', minHeight: '320px' }}>
      {/* Soft shadow under the avatar */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '55%',
          height: '14px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.28) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(10px)',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarSrc}
        alt={isFemale ? 'Avatar femenino' : 'Avatar masculino'}
        className="object-contain"
        style={{
          height: '290px',
          maxWidth: '190px',
          filter: 'drop-shadow(0 16px 32px rgba(99,102,241,0.35))',
          userSelect: 'none',
        }}
      />
    </div>
  )
}

// ============================================================
// Avatar3DViewer
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
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden rounded-t-2xl"
        style={{ background: 'linear-gradient(180deg, #e8eaff 0%, #fafbff 45%, #f5f3ff 100%)', minHeight: '360px' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 40% at 50% 20%, rgba(255,255,255,0.9) 0%, transparent 65%)' }} />

        <div
          className="relative z-10 flex items-center justify-center transition-transform duration-500"
          style={{
            transform: `perspective(800px) rotateY(${rotation}deg) scale(${isRotating ? 1.04 : 1})`,
          }}
        >
          <VibeAvatar metrics={metrics} />
        </div>

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

        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20">
          <span>TU AVATAR</span>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
