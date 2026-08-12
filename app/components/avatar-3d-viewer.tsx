'use client'

import { useState, useEffect, useCallback } from 'react'
import { Maximize2, ExternalLink, Loader2 } from 'lucide-react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

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

// URL pública de un modelo GLB de ejemplo (CC0 license)
// Reemplazar por tu modelo exportado de Ready Player Me
const SAMPLE_GLB_URL = 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/kuluma/model.gltf'

// ============================================================
// Pick avatar image based on BMI category
// ============================================================
function getAvatarImage(bmi: number): string {
  if (bmi < 18.5) return '/avatar-3d-slim.png'
  if (bmi >= 25) return '/avatar-3d-broad.png'
  return '/avatar-3d-average.png'
}

// ============================================================
// 3D Memoji-style avatar display (PNG fallback)
// ============================================================
function AvatarDisplayPNG({ metrics, style, isRotating, rotation }: {
  metrics: BodyMetrics
  style: AvatarStyle
  isRotating: boolean
  rotation: number
}) {
  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const avatarSrc = getAvatarImage(bmi)

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        transform: `perspective(1000px) rotateY(${rotation}deg) ${isRotating ? 'scale(1.02)' : 'scale(1)'}`,
        transition: isRotating ? 'none' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow aura */}
      <div
        className="absolute rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${style.topColor}99 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      {/* Main 3D Avatar Image */}
      <img
        key={avatarSrc}
        src={avatarSrc}
        alt="Tu NutriAvatar 3D"
        className="relative z-10 object-contain transition-all duration-500"
        style={{
          height: '340px',
          width: 'auto',
          maxWidth: '100%',
          filter: `drop-shadow(0 25px 50px rgba(99, 102, 241, 0.25)) drop-shadow(0 0 12px ${style.topColor}60)`,
        }}
      />

      {/* Skin tone overlay */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-20 mix-blend-multiply"
        style={{
          background: `radial-gradient(ellipse at 40% 20%, ${style.skinTone}20 0%, transparent 50%)`,
          height: '340px',
          width: '240px',
        }}
      />

      {/* Floor reflection */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
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
// Floating food elements for background decoration
// ============================================================
function FloatingEl({ emoji, size, top, left, right, bottom, delay, blur, opacity }: {
  emoji: string
  size: number
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay: number
  blur: number
  opacity: number
}) {
  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{
        top, left, right, bottom,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        opacity,
        animation: `float${delay} ${4 + delay * 0.5}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{
        fontSize: `${size}px`,
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))',
        transform: blur > 0 ? 'scale(0.85)' : 'scale(1)',
      }}>
        {emoji}
      </div>
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

        {/* Floating food elements — 3 depth layers */}
        <FloatingEl emoji="🥗" size={38} top="10%" left="7%" delay={0} blur={0} opacity={0.7} />
        <FloatingEl emoji="🍎" size={34} top="18%" right="8%" delay={0.4} blur={0} opacity={0.65} />
        <FloatingEl emoji="🥑" size={30} bottom="28%" left="5%" delay={0.8} blur={0.5} opacity={0.3} />
        <FloatingEl emoji="🥦" size={36} bottom="22%" right="7%" delay={1.2} blur={0} opacity={0.7} />
        <FloatingEl emoji="🍊" size={28} top="38%" left="3%" delay={0.3} blur={1} opacity={0.25} />
        <FloatingEl emoji="🥕" size={26} top="50%" right="4%" delay={0.7} blur={1.5} opacity={0.2} />
        <FloatingEl emoji="🌿" size={22} bottom="38%" right="2%" delay={1.5} blur={2} opacity={0.15} />
        <FloatingEl emoji="🍇" size={24} top="25%" left="12%" delay={0.6} blur={0.5} opacity={0.3} />

        {/* Avatar content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {avatarGlbUrl ? (
            // model-viewer con modelo GLB real exportado de RPM
            <AvatarModelViewer glbUrl={avatarGlbUrl} />
          ) : (
            // Fallback PNG con 3 tipos corporales según BMI
            <AvatarDisplayPNG
              metrics={metrics}
              style={style}
              isRotating={isRotating ?? false}
              rotation={rotation}
            />
          )}
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg z-20">
          <span>{avatarGlbUrl ? '3D LIVE' : '3D'}</span>
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
