'use client'

import { useState, useEffect, useCallback } from 'react'
import { Maximize2, ExternalLink, Loader2 } from 'lucide-react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'
import { AvatarBody } from './avatar-body'

interface Avatar3DViewerProps {
  metrics: BodyMetrics
  style: AvatarStyle
  isRotating?: boolean
  showClothes?: boolean
  showProgress?: boolean
}

// ============================================================
// READY PLAYER ME CONFIGURATION
// ============================================================
// Para activar el iframe 3D real, necesitas:
// 1. Crear una cuenta en https://readyplayer.me
// 2. Crear un subdomain (ej: "nutriguia") en tu panel de RPM
// 3. Cambiar READY_PLAYER_ME_SUBDOMAIN por tu subdomain
// 4. Descomentar la línea USE_IFRAME = true
//
// El iframe usa ?frameApi para comunicar el URL del modelo
// al componente padre vía postMessage
// ============================================================

const READY_PLAYER_ME_SUBDOMAIN = 'nutriguia' // ← Cambia esto por tu subdomain real
const USE_IFRAME = false // Cambiar a true cuando tengas subdomain real en RPM

// ============================================================
// Full-body SVG avatar using AvatarBody — the real, working avatar
// ============================================================
function AvatarDisplaySVG({ metrics, style, isRotating, rotation }: {
  metrics: BodyMetrics
  style: AvatarStyle
  isRotating: boolean
  rotation: number
}) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        transform: `perspective(1200px) rotateY(${rotation}deg) scale(${isRotating ? 1.05 : 1})`,
        transition: isRotating ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer glow aura */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '220px',
          height: '300px',
          background: `radial-gradient(ellipse, ${style.topColor}30 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Stage spotlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '180px',
          height: '80px',
          background: `radial-gradient(ellipse, ${style.topColor}20 0%, transparent 70%)`,
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(16px)',
        }}
      />

      {/* The actual AvatarBody SVG */}
      <div
        style={{
          transform: `rotateX(5deg)`,
          filter: `drop-shadow(0 30px 60px ${style.topColor}40) drop-shadow(0 0 20px ${style.topColor}30)`,
        }}
      >
        <AvatarBody metrics={metrics} style={style} size={200} />
      </div>

      {/* Gender indicator badge */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-1 rounded-full"
        style={{
          background: `${style.topColor}20`,
          color: style.topColor,
          border: `1px solid ${style.topColor}40`,
        }}
      >
        {metrics.gender === 'male' ? '👨' : metrics.gender === 'female' ? '👩' : '⚧️'}{' '}
        {metrics.gender === 'male' ? 'Hombre' : metrics.gender === 'female' ? 'Mujer' : 'Otro'}
      </div>
    </div>
  )
}

// ============================================================
// Ready Player Me Modal (full-screen iframe)
// Uses frameApi postMessage to receive avatar URL on completion
// ============================================================
function ReadyPlayerMeModal({
  onClose,
  onAvatarSelected,
  subdomain,
}: {
  onClose: () => void
  onAvatarSelected: (url: string) => void
  subdomain: string
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Listen for Ready Player Me frameApi messages
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // Ready Player Me sends messages with this structure
      try {
        const data = event.data
        if (data?.source === 'readyplayerme' && data?.eventName === 'v1.avatar.exported') {
          // User exported their avatar — data.url contains the .glb URL
          const avatarUrl = data.data?.modelUrl || data.url
          if (avatarUrl) {
            onAvatarSelected(avatarUrl)
            onClose()
          }
        }
      } catch {}
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onAvatarSelected, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
        style={{ height: 'min(620px, 85vh)' }}
      >
        {/* Window header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-white/80 text-sm font-medium">Crear tu NutriAvatar 3D</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://readyplayer.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              title="Abrir Ready Player Me"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl font-light leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Loading state */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Cargando NutriAvatar 3D...</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Personaliza tu avatar y presiona "Exportar"
            </p>
          </div>
        )}

        {/* RPM Iframe — usa ?frameApi para comunicación postMessage */}
        <iframe
          src={`https://${subdomain}.readyplayer.me/avatar?frameApi`}
          className="w-full h-full border-none"
          style={{ height: 'calc(100% - 60px)' }}
          allow="camera; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          title="Creador de Avatar 3D — Ready Player Me"
        />

        {/* Footer hint */}
        <div className="absolute bottom-0 left-0 right-0 py-2 px-4 bg-gray-50 border-t text-center">
          <p className="text-[11px] text-muted-foreground">
            Cuando termines, presiona <strong>Exportar</strong> — tu avatar se guardará automáticamente
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// model-viewer 3D fallback (cuando se tiene URL del modelo GLB)
// ============================================================
function AvatarModelViewer({ glbUrl }: { glbUrl: string }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* @ts-ignore — model-viewer is a custom element */}
      <model-viewer
        src={glbUrl}
        alt="Tu NutriAvatar 3D"
        camera-controls
        auto-rotate
        rotation-per-second="20deg"
        shadow-intensity="1"
        shadow-softness="0.8"
        environment-image="neutral"
        exposure="1"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '340px',
          backgroundColor: 'transparent',
          '--poster-color': 'transparent',
        }}
      />
    </div>
  )
}

// ============================================================
// Main Avatar3DViewer Component
// ============================================================
export default function Avatar3DViewer({
  metrics,
  style,
  isRotating,
  showClothes,
  showProgress,
}: Avatar3DViewerProps) {
  const [rotation, setRotation] = useState(0)
  const [showRPMModal, setShowRPMModal] = useState(false)
  const [avatarGlbUrl, setAvatarGlbUrl] = useState<string | null>(null)

  // Listen for postMessage from RPM modal
  const handleAvatarSelected = useCallback((url: string) => {
    setAvatarGlbUrl(url)
  }, [])

  // Rotation animation
  useEffect(() => {
    if (!isRotating) return
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setRotation(frame * 10)
      if (frame >= 36) {
        clearInterval(interval)
        setRotation(0)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [isRotating])

  return (
    <div className="relative flex flex-col" style={{ minHeight: '400px' }}>
      {/* RPM Modal */}
      {showRPMModal && (
        <ReadyPlayerMeModal
          subdomain={READY_PLAYER_ME_SUBDOMAIN}
          onClose={() => setShowRPMModal(false)}
          onAvatarSelected={handleAvatarSelected}
        />
      )}

      {/* Viewport / Canvas area */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden rounded-t-2xl"
        style={{
          background: 'linear-gradient(180deg, #e8eaff 0%, #fafbff 45%, #f5f3ff 100%)',
          minHeight: '360px',
        }}
      >
        {/* Studio ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(139,92,246,0.05) 0%, transparent 60%)' }}
        />

        {/* Studio spotlight from top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 25%, rgba(255,255,255,0.85) 0%, transparent 65%)' }}
        />

        {/* Avatar content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {avatarGlbUrl ? (
            // model-viewer con modelo GLB real exportado de RPM
            <AvatarModelViewer glbUrl={avatarGlbUrl} />
          ) : (
            // Full-body SVG avatar con silueta correcta por género
            <AvatarDisplaySVG
              metrics={metrics}
              style={style}
              isRotating={isRotating ?? false}
              rotation={rotation}
            />
          )}
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20">
          <span>TU AVATAR</span>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>

        {/* Open in RPM button */}
        <button
          onClick={() => setShowRPMModal(true)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-indigo-100 hover:bg-white hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          {avatarGlbUrl ? 'Editar en Ready Player Me' : 'Crear avatar 3D'}
        </button>
      </div>
    </div>
  )
}
