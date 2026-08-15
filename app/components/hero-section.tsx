'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, TrendingUp, Camera, Zap } from 'lucide-react'
import Avatar3DViewer from './avatar-3d-viewer'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

// Inline mini avatar customizer for the hero — no full import to keep it clean
const SKIN_TONES = ['#fde68a', '#fed7aa', '#d4a574', '#c68642', '#8d5524', '#5c3a21']
const HAIR_COLORS = ['#1f2937', '#78350f', '#d97706', '#dc2626', '#7c3aed', '#ec4899', '#e5e7eb']
const TOP_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6']
const BOTTOM_COLORS = ['#1f2937', '#374151', '#1e3a5f', '#3d1c1c', '#2d2d2d', '#4a5568']

function getBMICategory(bmi: number): { label: string; color: string; description: string } {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#f59e0b', description: 'Bajo peso' }
  if (bmi < 25) return { label: 'Normal', color: '#10b981', description: 'Peso saludable' }
  if (bmi < 30) return { label: 'Sobrepeso', color: '#f97316', description: 'Sobrepeso' }
  return { label: 'Obesidad', color: '#ef4444', description: 'Obesidad' }
}

export default function HeroSection() {
  const [userName, setUserName] = useState<string | null>(null)
  const [greeting, setGreeting] = useState('¡Hola!')
  const [rotation, setRotation] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [showClothes, setShowClothes] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const [metrics, setMetrics] = useState<BodyMetrics>({ weight: 70, height: 170, age: 30, gender: 'male' })
  const [style, setStyle] = useState<AvatarStyle>({
    skinTone: '#d4a574', hairStyle: 1, hairColor: '#1f2937',
    topStyle: 0, topColor: '#6366f1', bottomColor: '#1f2937',
    shoeColor: '#1f2937', accessory: 0,
  })
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'intense'>('moderate')

  const ACTIVITY_MULT = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
  }
  const ACTIVITY_CHIPS = [
    { id: 'sedentary' as const, label: 'Sedentario', icon: '🪑', desc: 'Poco o nada' },
    { id: 'light' as const, label: 'Ligero', icon: '🚶', desc: '1-3 días/semana' },
    { id: 'moderate' as const, label: 'Moderado', icon: '🏋️', desc: '3-5 días/semana' },
    { id: 'intense' as const, label: 'Intenso', icon: '🔥', desc: '6-7 días/semana' },
  ]

  useEffect(() => {
    // Load saved data
    const savedUser = localStorage.getItem('nutriguia_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setUserName(user.name)
      } catch {}
    }
    const savedMetrics = localStorage.getItem('nutriguia_body_metrics')
    if (savedMetrics) {
      try { setMetrics(JSON.parse(savedMetrics)) } catch {}
    }
    const savedStyle = localStorage.getItem('nutriguia_avatar_style')
    if (savedStyle) {
      try { setStyle(JSON.parse(savedStyle)) } catch {}
    }

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('¡Buenos días!')
    else if (hour < 18) setGreeting('¡Buenas tardes!')
    else setGreeting('¡Buenas noches!')
  }, [])

  const bmi = metrics.weight / Math.pow(metrics.height / 100, 2)
  const bmiCat = getBMICategory(bmi)
  const bmr = Math.round(
    metrics.gender === 'female'
      ? 447.593 + (9.247 * metrics.weight) + (3.098 * metrics.height) - (4.330 * metrics.age)
      : 88.362 + (13.397 * metrics.weight) + (4.799 * metrics.height) - (5.677 * metrics.age)
  )
  const tdee = Math.round(bmr * ACTIVITY_MULT[activityLevel])
  const calorieNeeds = tdee

  const handleRotate = () => {
    setIsRotating(true)
    let deg = rotation
    const interval = setInterval(() => {
      deg += 10
      setRotation(deg)
      if (deg >= rotation + 360) {
        clearInterval(interval)
        setIsRotating(false)
      }
    }, 16)
  }

  return (
    <section className="relative hero-gradient py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 w-fit mx-auto"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="badgeGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M16 2C16 2 8 6 8 14C8 17.866 11.134 21 15 21C15 21 11 22 9 26C14.5 25 18 21 18 16C18 11 21 8 21 8C21 8 24 11 24 16C24 21 20 26 16 28C16 28 17 24 15 21C18.866 21 22 17.866 22 14C22 8 16 2 16 2Z" fill="url(#badgeGrad)"/>
            <circle cx="16" cy="14" r="4" fill="white" fillOpacity="0.9"/>
            <circle cx="16" cy="14" r="2" fill="url(#badgeGrad)"/>
          </svg>
          Tu asistente inteligente de nutrición, entrenamiento y hábitos saludables
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
            {userName ? `${greeting}, ${userName}` : 'Come mejor, vive mejor'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {userName
              ? 'Tu plan nutricional te espera. Sigue conversando o explora nuevos temas.'
              : 'Tu asistente inteligente de nutrición, entrenamiento y hábitos saludables.'}
          </p>
        </motion.div>

        {/* MAIN LAYOUT: Avatar left, Controls right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto"
        >
          {/* LEFT: Avatar Canvas Area */}
          <div className="flex flex-col items-center">
            {/* Canvas container */}
            <div className="relative w-full max-w-sm mx-auto">
              {/* 3D-style canvas card */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/50 overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                {/* Canvas header bar */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-white/80 text-xs font-medium">Tu VibeAvatar 3D</span>
                  </div>
                  <Camera className="w-4 h-4 text-white/60" />
                </div>

                {/* Avatar 3D Viewer Component */}
                <Avatar3DViewer
                  metrics={metrics}
                  style={style}
                  isRotating={isRotating}
                  showClothes={showClothes}
                  showProgress={showProgress}
                />

                {/* Canvas action buttons */}
                <div className="px-4 py-3 bg-white border-t flex items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRotate}
                    disabled={isRotating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 text-xs font-semibold hover:bg-indigo-200 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                    Girar 360°
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowClothes(!showClothes); setShowProgress(false) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      showClothes ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👕 Ropa
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowProgress(!showProgress); setShowClothes(false) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      showProgress ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Progreso
                  </motion.button>
                </div>

                {/* Sub-panels */}
                <AnimatePresence>
                  {showClothes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t"
                    >
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1.5">Color de polera</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {TOP_COLORS.map((color, i) => (
                              <button
                                key={i}
                                onClick={() => setStyle(s => ({ ...s, topColor: color }))}
                                className={`w-7 h-7 rounded-lg border-2 transition-all ${style.topColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1.5">Color de pantalón</span>
                          <div className="flex gap-1.5">
                            {BOTTOM_COLORS.map((color, i) => (
                              <button
                                key={i}
                                onClick={() => setStyle(s => ({ ...s, bottomColor: color }))}
                                className={`w-7 h-7 rounded-lg border-2 transition-all ${style.bottomColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {showProgress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t"
                    >
                      <div className="p-4">
                        <div className="space-y-2">
                          {[
                            { label: '🔥 Racha actual', value: '7 días', color: '#f97316' },
                            { label: '💧 Hidratación', value: '1.800 / 2.000 ml', color: '#3b82f6' },
                            { label: '🥗 Comidas registradas', value: '14 / 21', color: '#10b981' },
                            { label: '⚖️ Meta de peso', value: '-2.3 kg', color: '#8b5cf6' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="text-xs text-muted-foreground">{item.label}</span>
                              <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                        <button className="w-full mt-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Ver historial completo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mini floating label */}
              <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                ¡Tu avatar!
              </div>
            </div>

            {/* CTA below avatar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
              <a href="#chat" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/25">
                <span className="text-base">▶</span>
                Comenzar
              </a>
              <a href="#temas" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors text-sm">
                <Zap className="w-4 h-4" />
                Explorar
              </a>
            </div>
          </div>

          {/* RIGHT: Customization Panel */}
          <div className="space-y-4">
            {/* Panel title */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-1">Genera tu VibeAvatar</h2>
              <p className="text-sm text-muted-foreground">Ajusta tus medidas y personaliza tu estilo</p>
            </div>

            {/* Body Measurements Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                📏 Medidas corporales
              </h3>

              <div className="space-y-4">
                {/* Gender Selector */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Sexo biológico</span>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                    {(['male', 'female', 'other'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setMetrics(m => ({ ...m, gender: g }))}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                          metrics.gender === g
                            ? g === 'male'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : g === 'female'
                              ? 'bg-pink-500 text-white shadow-sm'
                              : 'bg-gray-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {g === 'male' ? '👨' : g === 'female' ? '👩' : '⚧️'}{' '}
                        {g === 'male' ? 'Hombre' : g === 'female' ? 'Mujer' : 'Otro'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Peso</span>
                    <span className="font-bold text-indigo-600">{metrics.weight} kg</span>
                  </div>
                  <input
                    type="range" min={40} max={150} value={metrics.weight}
                    onChange={e => setMetrics(m => ({ ...m, weight: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-600 h-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>40 kg</span><span>150 kg</span>
                  </div>
                </div>

                {/* Height */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Altura</span>
                    <span className="font-bold text-indigo-600">{metrics.height} cm</span>
                  </div>
                  <input
                    type="range" min={140} max={210} value={metrics.height}
                    onChange={e => setMetrics(m => ({ ...m, height: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-600 h-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>140 cm</span><span>210 cm</span>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Edad</span>
                    <span className="font-bold text-indigo-600">{metrics.age} años</span>
                  </div>
                  <input
                    type="range" min={16} max={80} value={metrics.age}
                    onChange={e => setMetrics(m => ({ ...m, age: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-600 h-2"
                  />
                </div>

                {/* Activity Level */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Actividad física</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ACTIVITY_CHIPS.map(chip => (
                      <button
                        key={chip.id}
                        onClick={() => setActivityLevel(chip.id)}
                        title={chip.desc}
                        className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all border-2 ${
                          activityLevel === chip.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        <span className="text-base">{chip.icon}</span>
                        <span className="leading-tight text-center">{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                📊 Tu índice de masa corporal
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={bmiCat.color} strokeWidth="3" strokeDasharray={`${Math.min(bmi / 35 * 100, 100)}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: bmiCat.color }}>{bmi.toFixed(1)}</span>
                    <span className="text-[8px] text-muted-foreground">IMC</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: bmiCat.color }}>{bmiCat.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-muted-foreground/70">Gasto total (TDEE): </span>
                    <span className="font-bold text-indigo-600">{calorieNeeds} kcal/día</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-muted-foreground/70">Metabolismo basal: </span>
                    <span className="font-semibold text-gray-700">{bmr} kcal</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span className="text-muted-foreground/70">Nivel: </span>
                    <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full text-[10px]">
                      {ACTIVITY_CHIPS.find(c => c.id === activityLevel)?.icon}
                      {' '}{ACTIVITY_CHIPS.find(c => c.id === activityLevel)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                🎨 Personaliza tu estilo
              </h3>
              <div className="space-y-4">
                {/* Skin tone */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Tono de piel</span>
                  <div className="flex gap-2">
                    {SKIN_TONES.map((tone, i) => (
                      <button
                        key={i}
                        onClick={() => setStyle(s => ({ ...s, skinTone: tone }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${style.skinTone === tone ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair color */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Color de cabello</span>
                  <div className="flex gap-2">
                    {HAIR_COLORS.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setStyle(s => ({ ...s, hairColor: color }))}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${style.hairColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair style */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-3">Estilo de cabello</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 0, label: 'Corto', emoji: '👦' },
                      { id: 1, label: 'Medio', emoji: '🧑' },
                      { id: 2, label: 'Largo', emoji: '👩' },
                      { id: 3, label: 'Moño', emoji: '👩‍🦰' },
                      { id: 4, label: 'Spiky', emoji: '🧑‍🦱' },
                      { id: 5, label: 'Rizado', emoji: '👩‍🦱' },
                    ].map(h => (
                      <button
                        key={h.id}
                        onClick={() => setStyle(s => ({ ...s, hairStyle: h.id }))}
                        className={`py-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                          style.hairStyle === h.id
                            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <span>{h.emoji}</span>
                        <span>{h.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={() => {
                localStorage.setItem('nutriguia_body_metrics', JSON.stringify(metrics))
                localStorage.setItem('nutriguia_avatar_style', JSON.stringify(style))
              }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 text-sm"
            >
              Guardar cambios
            </button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-white/10 flex-wrap"
        >
          {[
            { value: '5', label: 'Mensajes gratis / día' },
            { value: '10+', label: 'Áreas de especialización' },
            { value: '$0', label: 'Plan gratuito para siempre' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-10 select-none pointer-events-none" aria-hidden="true">🥗</div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-10 select-none pointer-events-none" aria-hidden="true">🍎</div>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.03, 0.05, 0.03] }}
        transition={{ repeat: Infinity, duration: 8, delay: 1 }}
        className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-3xl pointer-events-none"
      />
    </section>
  )
}
