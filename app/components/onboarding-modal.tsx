'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import AnimatedAvatar from './animated-avatar'
import AvatarCustomizer from './avatar-customizer'
import type { BodyMetrics, AvatarStyle } from './avatar-customizer'

interface UserProfile {
  primaryGoal: string
  name: string
  allergies: string[]
  restrictions: string[]
  cookingLevel: string
  budget: string
  goals: string[]
  dailyCalories: number | null
  dailyWater: number
  createdAt: string
}

const ALLERGIES = [
  'Gluten', 'Lactosa', 'Huevos', 'Frutos secos', 'Mariscos', 'Soja', 'Sésamo', 'Mostaza', 'Apio', 'Altramuces'
]

const RESTRICTIONS = [
  { id: 'vegano', label: 'Vegano', emoji: '🌱' },
  { id: 'vegetariano', label: 'Vegetariano', emoji: '🥬' },
  { id: 'keto', label: 'Keto', emoji: '🥑' },
  { id: 'paleo', label: 'Paleo', emoji: '🦴' },
  { id: 'sin-sal', label: 'Bajo en sodio', emoji: '🧂' },
  { id: 'sin-azucar', label: 'Bajo en azúcar', emoji: '🚫' },
  { id: 'diabetico', label: 'Diabético', emoji: '💉' },
  { id: 'intolerante-fructosa', label: 'Intolerante a fructosa', emoji: '🍎' },
]

const COOKING_LEVELS = [
  { id: 'principiante', label: 'Principiante', desc: 'Apenas basics, prefiero cosas ready-to-eat', icon: '🍳' },
  { id: 'intermedio', label: 'Intermedio', desc: 'Puedo seguir recetas y hacer platos simples', icon: '🥘' },
  { id: 'avanzado', label: 'Avanzado', desc: 'Me gusta experimentar y crear recetas', icon: '👨‍🍳' },
  { id: 'chef', label: 'Chef casero', desc: 'Cocino elaborate y disfruto el proceso', icon: '⭐' },
]

const BUDGETS = [
  { id: 'bajo', label: 'Ajustado', desc: '~$30.000 CLP / semana', color: 'bg-green-100 text-green-700' },
  { id: 'medio', label: 'Moderado', desc: '~$60.000 CLP / semana', color: 'bg-blue-100 text-blue-700' },
  { id: 'alto', label: 'Flexible', desc: '~$120.000 CLP / semana', color: 'bg-purple-100 text-purple-700' },
]

const GOALS = [
  { id: 'bajar-peso', label: 'Bajar de peso', emoji: '⚖️' },
  { id: 'ganar-musculo', label: 'Ganar músculo', emoji: '💪' },
  { id: 'mas-energia', label: 'Tener más energía', emoji: '🔋' },
  { id: 'dormir-mejor', label: 'Dormir mejor', emoji: '😴' },
  { id: 'comer-sano', label: 'Aprender a comer sano', emoji: '📚' },
  { id: 'mantener', label: 'Mantener mi peso', emoji: '🎯' },
  { id: 'reducir-azucar', label: 'Reducir el azúcar', emoji: '🍬' },
  { id: 'hidratarme', label: 'Mejorar hidratación', emoji: '💧' },
]

const STEPS = ['Tu Objetivo', '¡Hola!', 'Tu Avatar', 'Alergias', 'Dietas', 'Cocina', 'Metas', '¡Listo!']

const PRIMARY_GOALS = [
  { id: 'bajar-peso', label: 'Bajar de peso', emoji: '⚖️', color: 'from-blue-500 to-indigo-600', desc: 'Reducir grasa corporal de forma saludable' },
  { id: 'ganar-musculo', label: 'Ganar músculo', emoji: '💪', color: 'from-orange-500 to-red-600', desc: 'Aumentar masa muscular y fuerza' },
  { id: 'comer-sano', label: 'Aprender a comer sano', emoji: '🌿', color: 'from-green-500 to-emerald-600', desc: 'Mejorar hábitos y alimentación diaria' },
]

function getSystemPromptAddition(profile: UserProfile): string {
  const parts: string[] = []

  if (profile.primaryGoal) {
    const goalLabels: Record<string, string> = {
      'bajar-peso': 'Bajar de peso',
      'ganar-musculo': 'Ganar músculo',
      'comer-sano': 'Aprender a comer sano',
    }
    parts.push(`🎯 OBJETIVO PRINCIPAL: ${goalLabels[profile.primaryGoal] || profile.primaryGoal}`)
  }

  if (profile.name) {
    parts.push(`El usuario se llama ${profile.name}.`)
  }

  if (profile.allergies.length > 0) {
    parts.push(`⚠️ ALERGIAS: ${profile.allergies.join(', ')}. NUNCA sugieras alimentos que contengan estos ingredientes.`)
  }

  if (profile.restrictions.length > 0) {
    parts.push(`📌 RESTRICCIONES alimentarias: ${profile.restrictions.join(', ')}.`)
  }

  if (profile.cookingLevel) {
    const levelLabels: Record<string, string> = {
      principiante: 'principiante (recetas muy simples, máximo 5 ingredientes, máximo 20 min)',
      intermedio: 'intermedio (recetas con instrucciones claras, hasta 45 min)',
      avanzado: 'avanzado (recetas con técnicas, hasta 1h)',
      chef: 'chef casero (recetas creativas y elaboradas)',
    }
    parts.push(`👨‍🍳 Nivel de cocina del usuario: ${levelLabels[profile.cookingLevel] || profile.cookingLevel}.`)
  }

  if (profile.budget) {
    const budgetLabels: Record<string, string> = {
      bajo: 'presupuesto ajustado (~$30.000 CLP/semana)',
      medio: 'presupuesto moderado (~$60.000 CLP/semana)',
      alto: 'presupuesto flexible (~$120.000 CLP/semana)',
    }
    parts.push(`💰 Presupuesto semanal en groceries: ${budgetLabels[profile.budget] || profile.budget}.`)
  }

  if (profile.goals.length > 0) {
    parts.push(`🎯 Objetivos del usuario: ${profile.goals.join(', ')}.`)
  }

  if (profile.dailyCalories) {
    parts.push(`📊 Calorías diarias objetivo: ~${profile.dailyCalories} kcal.`)
  }

  if (profile.dailyWater) {
    parts.push(`💧 Agua diaria objetivo: ${profile.dailyWater} ml.`)
  }

  // Body metrics context would be added from bodyMetrics passed separately
  // (BMI and calories are calculated dynamically)

  return parts.length > 0
    ? `\n\n## CONTEXTO DEL USUARIO\n${parts.join('\n')}`
    : ''
}

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    primaryGoal: '',
    name: '',
    allergies: [],
    restrictions: [],
    cookingLevel: '',
    budget: '',
    goals: [],
    dailyCalories: null,
    dailyWater: 2000,
    createdAt: '',
  })
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({
    weight: 70,
    height: 170,
    age: 30,
    gender: 'other',
  })
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>({
    skinTone: '#d4a574',
    hairStyle: 1,
    hairColor: '#1f2937',
    topStyle: 0,
    topColor: '#6366f1',
    bottomColor: '#1f2937',
    shoeColor: '#1f2937',
    accessory: 0,
  })
  const [visible, setVisible] = useState(true)

  // Saltar — marca como visto sin guardar datos
  const handleSkip = () => {
    localStorage.setItem('nutriguia_onboarding_seen', 'true')
    setVisible(false)
    setTimeout(() => onComplete({
      primaryGoal: '',
      name: '',
      allergies: [],
      restrictions: [],
      cookingLevel: '',
      budget: '',
      goals: [],
      dailyCalories: null,
      dailyWater: 2000,
      createdAt: '',
    }), 300)
  }

  const handleComplete = () => {
    const finalProfile = {
      ...profile,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('nutriguia_profile', JSON.stringify(finalProfile))
    localStorage.setItem('nutriguia_body_metrics', JSON.stringify(bodyMetrics))
    localStorage.setItem('nutriguia_avatar_style', JSON.stringify(avatarStyle))
    localStorage.setItem('nutriguia_onboarding_seen', 'true')
    setVisible(false)
    setTimeout(() => onComplete(finalProfile), 300)
  }

  const toggleAllergy = (a: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(a)
        ? prev.allergies.filter(x => x !== a)
        : [...prev.allergies, a],
    }))
  }

  const toggleRestriction = (id: string) => {
    setProfile(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(id)
        ? prev.restrictions.filter(x => x !== id)
        : [...prev.restrictions, id],
    }))
  }

  const toggleGoal = (id: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(x => x !== id)
        : [...prev.goals, id],
    }))
  }

  const canContinue = () => {
    switch (step) {
      // Todos los pasos son opcionales — el usuario puede saltar
      case 0: return true
      case 1: return true
      case 2: return true
      case 3: return true
      case 4: return true
      case 5: return true
      case 6: return true
      default: return true
    }
  }

  const totalSteps = STEPS.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white/80" />
                <div>
                  <h2 className="text-white font-bold text-lg">Configura tu perfil</h2>
                  <p className="text-white/70 text-xs">Paso {step + 1} de {totalSteps}: {STEPS[step]}</p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                title="Saltar configuración"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-primary/10">
              <motion.div
                className="h-full bg-primary transition-all duration-300"
                animate={{ width: `${((step) / totalSteps) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Step 0: Primary Objective */}
              {step === 0 && (
                <motion.div key="step0" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-xl font-bold mb-1">¿Cuál es tu objetivo?</h3>
                    <p className="text-muted-foreground text-sm">Elige uno — esto personaliza todo tu plan</p>
                  </div>
                  <div className="space-y-3 max-w-sm mx-auto">
                    {PRIMARY_GOALS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setProfile(prev => ({ ...prev, primaryGoal: g.id }))}
                        className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                          profile.primaryGoal === g.id
                            ? `bg-gradient-to-r ${g.color} text-white border-transparent shadow-lg scale-[1.02]`
                            : 'bg-muted hover:bg-muted/80 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{g.emoji}</span>
                          <div>
                            <div className={`font-bold text-base ${profile.primaryGoal === g.id ? 'text-white' : ''}`}>{g.label}</div>
                            <div className={`text-xs ${profile.primaryGoal === g.id ? 'text-white/80' : 'text-muted-foreground'}`}>{g.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Name */}
              {step === 1 && (
                <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">👋</div>
                    <h3 className="text-xl font-bold mb-1">¡Bienvenido a NutriGuía!</h3>
                    <p className="text-muted-foreground text-sm">Conozcámonos. ¿Cómo te llamas?</p>
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Escribe tu nombre..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-muted text-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-center font-medium"
                    onKeyDown={e => e.key === 'Enter' && canContinue() && setStep(s => s + 1)}
                  />
                </motion.div>
              )}

              {/* Step 2: Avatar + Body */}
              {step === 2 && (
                <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">🧍</div>
                    <h3 className="text-lg font-bold mb-0.5">Genera tu Avatar y Perfil</h3>
                    <p className="text-muted-foreground text-xs">Ajusta tus medidas y personaliza tu estilo</p>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto pr-1 -mr-1">
                    <AvatarCustomizer
                      metrics={bodyMetrics}
                      onMetricsChange={setBodyMetrics}
                      style={avatarStyle}
                      onStyleChange={setAvatarStyle}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Allergies */}
              {step === 3 && (
                <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold mb-1">¿Tienes alguna alergia?</h3>
                    <p className="text-muted-foreground text-xs">Selecciona las que apliquen, o salta este paso</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ALLERGIES.map(a => (
                      <button
                        key={a}
                        onClick={() => toggleAllergy(a)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          profile.allergies.includes(a)
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {profile.allergies.includes(a) && '✓ '}{a}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Restrictions */}
              {step === 4 && (
                <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">🌿</div>
                    <h3 className="text-lg font-bold mb-1">¿Sigues alguna dieta?</h3>
                    <p className="text-muted-foreground text-xs">Selecciona todas las que apliquen</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {RESTRICTIONS.map(r => (
                      <button
                        key={r.id}
                        onClick={() => toggleRestriction(r.id)}
                        className={`px-3 py-3 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-2 ${
                          profile.restrictions.includes(r.id)
                            ? 'bg-primary/10 text-primary border-2 border-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.label}</span>
                        {profile.restrictions.includes(r.id) && (
                          <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Cooking level + Budget */}
              {step === 5 && (
                <motion.div key="step5" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">👨‍🍳</div>
                    <h3 className="text-lg font-bold mb-1">¿Cómo cocinas?</h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    {COOKING_LEVELS.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setProfile(prev => ({ ...prev, cookingLevel: level.id }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all text-left flex items-center gap-3 ${
                          profile.cookingLevel === level.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <span className="text-xl">{level.icon}</span>
                        <div>
                          <div className="font-semibold">{level.label}</div>
                          <div className={`text-xs ${profile.cookingLevel === level.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{level.desc}</div>
                        </div>
                        {profile.cookingLevel === level.id && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    ))}
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">🛒</div>
                    <h4 className="font-semibold text-sm">Presupuesto semanal en groceries</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BUDGETS.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setProfile(prev => ({ ...prev, budget: b.id }))}
                        className={`px-2 py-3 rounded-xl text-center transition-all ${
                          profile.budget === b.id
                            ? `${b.color} border-2 border-current`
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div className="font-bold text-sm">{b.label}</div>
                        <div className="text-xs opacity-70">{b.desc.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Goals */}
              {step === 6 && (
                <motion.div key="step6" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-bold mb-1">¿Cuáles son tus metas?</h3>
                    <p className="text-muted-foreground text-xs">Selecciona hasta 3</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => {
                          if (profile.goals.includes(g.id)) {
                            toggleGoal(g.id)
                          } else if (profile.goals.length < 3) {
                            toggleGoal(g.id)
                          }
                        }}
                        className={`px-3 py-3 rounded-xl text-sm transition-all flex items-center gap-2 ${
                          profile.goals.includes(g.id)
                            ? 'bg-primary/10 text-primary border-2 border-primary'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <span>{g.emoji}</span>
                        <span className="text-left leading-tight">{g.label}</span>
                        {profile.goals.includes(g.id) && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 7: Ready */}
              {step === 7 && (
                <motion.div key="step6" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                  <div className="text-center py-4">
                    {/* Avatar full body preview */}
                    <div className="mb-4">
                      <AvatarCustomizer
                        metrics={bodyMetrics}
                        onMetricsChange={setBodyMetrics}
                        style={avatarStyle}
                        onStyleChange={setAvatarStyle}
                        compact
                      />
                    </div>

                    {/* Small animated avatar */}
                    <AnimatedAvatar
                      size={72}
                      mood="celebrate"
                      autoSpeech={true}
                      speechText={`¡Hola${profile.name ? `, ${profile.name}` : ''}! Tu perfil está listo. ¡Hablamos pronto!`}
                      className="mx-auto mb-3"
                    />

                    <h3 className="text-xl font-bold mb-1">
                      ¡Listo{profile.name ? `, ${profile.name}!` : '!'}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Tu perfil está configurado. Ahora puedo darte consejos mucho más personalizados.
                    </p>

                    <div className="bg-muted/50 rounded-xl p-4 text-left text-xs space-y-1.5">
                      {profile.primaryGoal && (
                        <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-3 py-2 mb-1">
                          <span>🎯</span>
                          <span className="font-semibold">Objetivo:</span>
                          <span>{PRIMARY_GOALS.find(g => g.id === profile.primaryGoal)?.label}</span>
                        </div>
                      )}
                      {profile.allergies.length > 0 && (
                        <div><span className="font-semibold">Alergias:</span> {profile.allergies.join(', ')}</div>
                      )}
                      {profile.restrictions.length > 0 && (
                        <div><span className="font-semibold">Dietas:</span> {profile.restrictions.join(', ')}</div>
                      )}
                      {profile.cookingLevel && (
                        <div><span className="font-semibold">Nivel:</span> {COOKING_LEVELS.find(l => l.id === profile.cookingLevel)?.label}</div>
                      )}
                      {profile.budget && (
                        <div><span className="font-semibold">Presupuesto:</span> {BUDGETS.find(b => b.id === profile.budget)?.desc}</div>
                      )}
                      {profile.goals.length > 0 && (
                        <div><span className="font-semibold">Metas:</span> {profile.goals.map(g => GOALS.find(x => x.id === g)?.label).join(', ')}</div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Tu perfil se guarda en el navegador. Puedes cambiarlo en cualquier momento desde el chat.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              )}
              <div className="flex-1" />
              {step < totalSteps ? (
                <button
                  onClick={() => canContinue() && setStep(s => s + 1)}
                  disabled={!canContinue()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Empezar
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { getSystemPromptAddition }
export type { UserProfile }
