/* 'use client' */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AvatarBody } from './avatar-body'

interface BodyMetrics {
  weight: number  // kg
  height: number   // cm
  age: number
  gender: 'male' | 'female' | 'other'
}

interface AvatarStyle {
  skinTone: string
  hairStyle: number
  hairColor: string
  topStyle: number
  topColor: string
  bottomColor: string
  shoeColor: string
  accessory: number
}

interface AvatarCustomizerProps {
  metrics: BodyMetrics
  onMetricsChange: (m: BodyMetrics) => void
  style: AvatarStyle
  onStyleChange: (s: AvatarStyle) => void
  compact?: boolean
}

const SKIN_TONES = ['#fde68a', '#fed7aa', '#d4a574', '#c68642', '#8d5524', '#5c3a21']
const HAIR_COLORS = ['#1f2937', '#78350f', '#d97706', '#dc2626', '#7c3aed', '#ec4899', '#e5e7eb']
const TOP_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6']
const BOTTOM_COLORS = ['#1f2937', '#374151', '#1e3a5f', '#3d1c1c', '#2d2d2d', '#4a5568']
const SHOE_COLORS = ['#1f2937', '#ffffff', '#dc2626', '#f59e0b', '#3b82f6', '#6b7280']

const HAIR_STYLES = ['short', 'medium', 'long', 'bun', 'spiky', 'curly']
const TOP_STYLES = ['tshirt', 'tank', 'hoodie', 'polo', 'sweater']
const ACCESSORIES = ['none', 'watch', 'necklace', 'glasses', 'earrings', 'cap', 'headband']

function getBMICategory(bmi: number): { label: string; color: string; description: string } {
  if (bmi < 18.5) return { label: 'Bajo peso', color: '#f59e0b', description: 'Bajo peso' }
  if (bmi < 25) return { label: 'Normal', color: '#10b981', description: 'Peso saludable' }
  if (bmi < 30) return { label: 'Sobrepeso', color: '#f97316', description: 'Sobrepeso' }
  return { label: 'Obesidad', color: '#ef4444', description: 'obesidad' }
}

function calculateBMR(metrics: BodyMetrics): number {
  if (metrics.gender === 'male') {
    return 88.362 + (13.397 * metrics.weight) + (4.799 * metrics.height) - (5.677 * metrics.age)
  }
  return 447.593 + (9.247 * metrics.weight) + (3.098 * metrics.height) - (4.330 * metrics.age)
}

function getBodyShape(weight: number, height: number, gender: string): { torso: string; arms: string; legs: string } {
  const bmi = weight / Math.pow(height / 100, 2)
  const heightFactor = height / 170  // normalize to 170cm

  if (bmi < 18.5) {
    return { torso: 'slim', arms: 'thin', legs: 'thin' }
  } else if (bmi < 25) {
    return { torso: 'normal', arms: 'normal', legs: 'normal' }
  } else if (bmi < 30) {
    return { torso: 'average', arms: 'stocky', legs: 'average' }
  } else {
    return { torso: 'broad', arms: 'thick', legs: 'thick' }
  }
}

export default function AvatarCustomizer({
  metrics,
  onMetricsChange,
  style,
  onStyleChange,
  compact = false,
}: AvatarCustomizerProps) {
  const bmi = useMemo(() => metrics.weight / Math.pow(metrics.height / 100, 2), [metrics])
  const bmiCat = getBMICategory(bmi)
  const bmr = useMemo(() => Math.round(calculateBMR(metrics)), [metrics])
  const calorieNeeds = useMemo(() => Math.round(bmr * 1.55), [bmr])

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border">
        <AvatarBody metrics={metrics} style={style} size={100} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{metrics.weight} kg · {metrics.height} cm</div>
          <div className="text-xs text-muted-foreground">IMC: {bmi.toFixed(1)} — {bmiCat.description}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-4 left-4 text-xl opacity-20">🥗</div>
        <div className="absolute top-4 right-4 text-xl opacity-20">🍎</div>
        <div className="absolute bottom-4 left-4 text-xl opacity-20">🥑</div>
        <div className="absolute bottom-4 right-4 text-xl opacity-20">🥕</div>

        <motion.div
          key={JSON.stringify({ metrics, style })}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <AvatarBody metrics={metrics} style={style} size={180} />
        </motion.div>

        <div className="mt-3 text-center">
          <div className="text-xs text-muted-foreground">Tu NutriGuía Avatar</div>
        </div>

        {/* AI Assistant mini reference */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs">🍃</span>
          </div>
          <span className="text-[10px] text-muted-foreground">IA</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {/* Body Measurements */}
        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            📏 Medidas corporales
          </h4>

          {/* Weight */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Peso</span>
              <span className="font-semibold">{metrics.weight} kg</span>
            </div>
            <input
              type="range"
              min={40}
              max={150}
              value={metrics.weight}
              onChange={e => onMetricsChange({ ...metrics, weight: parseInt(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>40 kg</span><span>150 kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Altura</span>
              <span className="font-semibold">{metrics.height} cm</span>
            </div>
            <input
              type="range"
              min={140}
              max={210}
              value={metrics.height}
              onChange={e => onMetricsChange({ ...metrics, height: parseInt(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>140 cm</span><span>210 cm</span>
            </div>
          </div>

          {/* Age */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Edad</span>
              <span className="font-semibold">{metrics.age} años</span>
            </div>
            <input
              type="range"
              min={16}
              max={80}
              value={metrics.age}
              onChange={e => onMetricsChange({ ...metrics, age: parseInt(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Gender */}
          <div className="mb-2">
            <span className="text-xs text-muted-foreground block mb-2">Género</span>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => onMetricsChange({ ...metrics, gender: g })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    metrics.gender === g
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g === 'male' ? '♂️' : g === 'female' ? '♀️' : '⚧️'} {g === 'male' ? 'Hombre' : g === 'female' ? 'Mujer' : 'Otro'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            📊 Tu índice de masa corporal
          </h4>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
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
              <div className="text-sm font-semibold" style={{ color: bmiCat.color }}>{bmiCat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Calorías necesarias: <span className="font-semibold">{calorieNeeds} kcal/día</span></div>
              <div className="text-xs text-muted-foreground">Metabolismo basal: <span className="font-semibold">{bmr} kcal</span></div>
            </div>
          </div>
        </div>

        {/* Style Customization */}
        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            🎨 Personaliza tu estilo
          </h4>

          {/* Skin Tone */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Tono de piel</span>
            <div className="flex gap-1.5">
              {SKIN_TONES.map((tone, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, skinTone: tone })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${style.skinTone === tone ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: tone }}
                  title={`Tono ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Estilo de cabello</span>
            <div className="flex gap-1.5">
              {HAIR_STYLES.map((h, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, hairStyle: i })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    style.hairStyle === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {['Corto', 'Medio', 'Largo', 'Moño', 'Spiky', 'Rizado'][i]}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Color de cabello</span>
            <div className="flex gap-1.5">
              {HAIR_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, hairColor: color })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${style.hairColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Top Color */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Color de polera</span>
            <div className="flex gap-1.5 flex-wrap">
              {TOP_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, topColor: color })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${style.topColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Color */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Color de pantalón</span>
            <div className="flex gap-1.5">
              {BOTTOM_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, bottomColor: color })}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${style.bottomColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Shoe Color */}
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1.5">Color de zapatos</span>
            <div className="flex gap-1.5">
              {SHOE_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, shoeColor: color })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${style.shoeColor === color ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Accessory */}
          <div>
            <span className="text-xs text-muted-foreground block mb-1.5">Accesorio</span>
            <div className="flex gap-1.5 flex-wrap">
              {ACCESSORIES.map((a, i) => (
                <button
                  key={i}
                  onClick={() => onStyleChange({ ...style, accessory: i })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    style.accessory === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {['Ninguno', 'Reloj', 'Collar', 'Lentes', 'Aretes', 'Gorra', 'Bandana'][i]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { BodyMetrics, AvatarStyle }
