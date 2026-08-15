'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Maximize2, ExternalLink, Loader2 } from 'lucide-react'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'
import type * as T from 'three'

const READY_PLAYER_ME_SUBDOMAIN = 'nutriguia'

// ============================================================
// Three.js Avatar Renderer — fully dynamic to avoid SSR crashes
// ============================================================
function Avatar3DRenderer({ metrics, style, rotation, isRotating }: {
  metrics: BodyMetrics
  style: AvatarStyle
  rotation: number
  isRotating: boolean
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<{ scene: any; camera: any; renderer: any; bodyGroup: any; animFrame: number } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threeRef = useRef<any>(null)

  const isFemale = metrics.gender === 'female'
  const isMale = metrics.gender === 'male'
  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const bmiScale = bmi < 18.5 ? 0.85 : bmi < 25 ? 1.0 : bmi < 30 ? 1.15 : 1.3
  const heightScale = metrics.height / 170

  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    let cancelled = false
    let cleanup: (() => void) | undefined

    async function init() {
      // Dynamic import — runs only in browser
      const THREE = await import('three')
      if (cancelled || !mountRef.current) return
      threeRef.current = THREE

      const w = container.clientWidth || 300
      const h = container.clientHeight || 380

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100)
      camera.position.set(0, 0, 6)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
      container.appendChild(renderer.domElement)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.65))
      const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.5)
      keyLight.position.set(3, 5, 4)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.setScalar(1024)
      keyLight.shadow.camera.near = 0.5
      keyLight.shadow.camera.far = 20
      scene.add(keyLight)
      const fillLight = new THREE.DirectionalLight(0xc8e0ff, 0.5)
      fillLight.position.set(-4, 2, 2)
      scene.add(fillLight)
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.35)
      rimLight.position.set(0, 3, -4)
      scene.add(rimLight)

      // Shadow plane
      const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShadowMaterial({ opacity: 0.12 }))
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -2.3
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      const bodyGroup = new THREE.Group()
      scene.add(bodyGroup)
      const sc = bmiScale * heightScale

      const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.skinTone), roughness: 0.62, metalness: 0.05 })
      const topMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.topColor), roughness: 0.72, metalness: 0.02 })
      const bottomMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.bottomColor), roughness: 0.8, metalness: 0.02 })
      const shoeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.shoeColor), roughness: 0.55, metalness: 0.05 })
      const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.hairColor), roughness: 0.85, metalness: 0.0 })

      function addMesh(geo: T.BufferGeometry, mat: T.Material, group: T.Group, x = 0, y = 0, z = 0) {
        const m = new THREE.Mesh(geo, mat)
        m.position.set(x, y, z)
        m.castShadow = true
        m.receiveShadow = true
        group.add(m)
      }

      // LEGS
      const legR = (isMale ? 0.18 : 0.155) * sc
      const legLen = 1.3 * heightScale
      const legY = -0.85 * heightScale
      const legGeo = new THREE.CapsuleGeometry(legR * 0.9, legLen - legR * 2, 6, 12)
      addMesh(legGeo, bottomMat, bodyGroup, -legR * 1.3, legY, 0)
      addMesh(legGeo.clone(), bottomMat, bodyGroup, legR * 1.3, legY, 0)

      // SHOES
      const shoeGeo = new THREE.SphereGeometry(legR * 1.3, 10, 8)
      const ls = new THREE.Mesh(shoeGeo, shoeMat)
      ls.scale.set(1.2, 0.48, 1.7)
      ls.position.set(-legR * 1.3, legY - legLen / 2 - 0.07, 0.08)
      ls.castShadow = true
      bodyGroup.add(ls)
      const rs = new THREE.Mesh(shoeGeo.clone(), shoeMat)
      rs.scale.set(1.2, 0.48, 1.7)
      rs.position.set(legR * 1.3, legY - legLen / 2 - 0.07, 0.08)
      rs.castShadow = true
      bodyGroup.add(rs)

      // TORSO
      const torsoW = (isMale ? 0.52 : 0.46) * sc
      const torsoH = 1.05 * heightScale
      const torsoD = 0.30 * sc
      addMesh(new THREE.CapsuleGeometry(Math.min(torsoW, torsoD) * 0.78, torsoH - torsoW * 1.5, 8, 16), topMat, bodyGroup, 0, 0.5 * heightScale, 0)

      // ARMS
      const armR = (isMale ? 0.11 : 0.095) * sc
      const armLen = 0.88 * heightScale
      const shoulderY = 0.88 * heightScale
      const leftPivot = new THREE.Group()
      leftPivot.position.set(-torsoW * 0.88, shoulderY, 0)
      leftPivot.rotation.z = 0.12
      addMesh(new THREE.CapsuleGeometry(armR, armLen - armR * 2, 6, 10), skinMat, leftPivot, 0, -armLen / 2, 0)
      bodyGroup.add(leftPivot)
      const rightPivot = new THREE.Group()
      rightPivot.position.set(torsoW * 0.88, shoulderY, 0)
      rightPivot.rotation.z = -0.12
      addMesh(new THREE.CapsuleGeometry(armR, armLen - armR * 2, 6, 10), skinMat, rightPivot, 0, -armLen / 2, 0)
      bodyGroup.add(rightPivot)

      // NECK
      addMesh(new THREE.CylinderGeometry(0.095 * sc, 0.115 * sc, 0.17, 10), skinMat, bodyGroup, 0, 1.1 * heightScale, 0)

      // HEAD
      const headR = 0.40 * sc
      addMesh(new THREE.SphereGeometry(headR, 20, 16), skinMat, bodyGroup, 0, 1.64 * heightScale, 0)

      // HAIR
      if (isFemale) {
        addMesh(new THREE.SphereGeometry(headR * 1.06, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat, bodyGroup, 0, 1.75 * heightScale, 0)
        const strandGeo = new THREE.CylinderGeometry(0.075 * sc, 0.055 * sc, 0.75 * heightScale, 8)
        const ls2 = new THREE.Mesh(strandGeo, hairMat)
        ls2.position.set(-headR * 0.88, 1.28 * heightScale, 0)
        ls2.rotation.z = 0.18
        ls2.castShadow = true
        bodyGroup.add(ls2)
        const rs2 = new THREE.Mesh(strandGeo.clone(), hairMat)
        rs2.position.set(headR * 0.88, 1.28 * heightScale, 0)
        rs2.rotation.z = -0.18
        rs2.castShadow = true
        bodyGroup.add(rs2)
      } else {
        addMesh(new THREE.SphereGeometry(headR * 1.02, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.53), hairMat, bodyGroup, 0, 1.77 * heightScale, 0)
      }

      // EYES
      const eyeY = 1.67 * heightScale
      const eyeX = 0.155 * sc
      const eyeR = headR * 0.135
      const eyeWMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0 })
      const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.25, metalness: 0.1 })
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const eyeGeo = new THREE.SphereGeometry(eyeR, 10, 10)
      const hlGeo = new THREE.SphereGeometry(eyeR * 0.28, 6, 6)
      addMesh(eyeGeo, eyeWMat, bodyGroup, -eyeX, eyeY, headR * 0.87)
      addMesh(eyeGeo, eyeWMat, bodyGroup, eyeX, eyeY, headR * 0.87)
      addMesh(new THREE.SphereGeometry(eyeR * 0.65, 8, 8), pupilMat, bodyGroup, -eyeX, eyeY, headR * 0.9)
      addMesh(new THREE.SphereGeometry(eyeR * 0.65, 8, 8), pupilMat, bodyGroup, eyeX, eyeY, headR * 0.9)
      addMesh(hlGeo, hlMat, bodyGroup, -eyeX + eyeR * 0.35, eyeY + eyeR * 0.4, headR * 0.92)
      addMesh(hlGeo.clone(), hlMat, bodyGroup, eyeX + eyeR * 0.35, eyeY + eyeR * 0.4, headR * 0.92)

      // MOUTH
      const smileMesh = new THREE.Mesh(new THREE.TorusGeometry(0.075 * sc, 0.013 * sc, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0xe07070, roughness: 0.7 }))
      smileMesh.position.set(0, 1.54 * heightScale, headR * 0.89)
      smileMesh.rotation.x = Math.PI
      bodyGroup.add(smileMesh)

      // BLUSH
      const blushGeo = new THREE.CircleGeometry(0.075 * sc, 12)
      const blushMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.9, transparent: true, opacity: 0.32 })
      const lb = new THREE.Mesh(blushGeo, blushMat)
      lb.position.set(-headR * 0.62, 1.6 * heightScale, headR * 0.86)
      bodyGroup.add(lb)
      const rb = new THREE.Mesh(blushGeo.clone(), blushMat)
      rb.position.set(headR * 0.62, 1.6 * heightScale, headR * 0.86)
      bodyGroup.add(rb)

      bodyGroup.position.y = 0.1
      sceneRef.current = { scene, camera, renderer, bodyGroup, animFrame: 0 }

      // Animate
      let frame = 0
      const loop = () => {
        if (!sceneRef.current || cancelled) return
        frame++
        if (!isRotating) sceneRef.current.bodyGroup.position.y = 0.1 + Math.sin(frame * 0.04) * 0.04
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
        sceneRef.current.animFrame = requestAnimationFrame(loop)
      }
      loop()

      // Resize
      const ro = new ResizeObserver(() => {
        if (!container || !sceneRef.current) return
        const nw = container.clientWidth
        const nh = container.clientHeight
        sceneRef.current.camera.aspect = nw / nh
        sceneRef.current.camera.updateProjectionMatrix()
        sceneRef.current.renderer.setSize(nw, nh)
      })
      ro.observe(container)

      cleanup = () => {
        ro.disconnect()
        cancelAnimationFrame(sceneRef.current?.animFrame ?? 0)
        sceneRef.current?.renderer.dispose()
        const dom = sceneRef.current?.renderer?.domElement
        if (dom && container.contains(dom)) container.removeChild(dom)
      }
    }

    init()
    return () => {
      cancelled = true
      cleanup?.()
      sceneRef.current = null
      threeRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update colors on style change
  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.bodyGroup.traverse((child: T.Mesh) => {
      if (!(child instanceof threeRef.current.Mesh)) return
      const m = child.material as T.MeshStandardMaterial
      if (!m.isMeshStandardMaterial) return
      const r = child.geometry.boundingSphere?.radius ?? 0.3
      if (r > 0.38 && r < 0.45) m.color.set(style.skinTone)
      else if (r > 0.15 && r < 0.38 && child.position.y > 0.3) m.color.set(style.topColor)
      else if (r > 0.15 && r < 0.38 && child.position.y < -0.4) m.color.set(style.bottomColor)
      else if (r > 0.05 && r < 0.14 && child.position.y > 1.2) m.color.set(style.hairColor)
      else if (r > 0.05 && r < 0.14 && child.position.y < -1.5) m.color.set(style.shoeColor)
      m.needsUpdate = true
    })
  }, [style])

  // Rotation
  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.bodyGroup.rotation.y = (rotation * Math.PI) / 180
  }, [rotation])

  return <div ref={mountRef} className="w-full h-full" style={{ minHeight: '340px' }} />
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
// model-viewer fallback
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
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(139,92,246,0.05) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 25%, rgba(255,255,255,0.85) 0%, transparent 65%)' }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {glbUrl ? (
            <AvatarModelViewer glbUrl={glbUrl} />
          ) : (
            <Avatar3DRenderer metrics={metrics} style={style} rotation={rotation} isRotating={isRotating ?? false} />
          )}
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
