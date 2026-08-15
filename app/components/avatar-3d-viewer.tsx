'use client'

import { useState, useEffect, useCallback } from 'react'
import { Maximize2, ExternalLink, Loader2 } from 'lucide-react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

const READY_PLAYER_ME_SUBDOMAIN = 'nutriguia'

// ============================================================
// High-quality PNG Avatar — AI-generated 3D render
// Checkerboard bg blends into gradient container background
// ============================================================
function VibeAvatar({ metrics }: { metrics: BodyMetrics; style: AvatarStyle }) {
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
// model-viewer (RPM GLB)
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
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
