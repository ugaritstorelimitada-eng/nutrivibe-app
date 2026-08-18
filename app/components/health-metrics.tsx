'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Scale, TrendingUp, Check } from 'lucide-react'
import { useStreakStore } from '@/app/store/useStreakStore'
import { useWeightHistoryStore } from '@/app/store/useWeightHistoryStore'
import WeightHistoryChart from './weight-history-chart'

// ─── Water Tracker ────────────────────────────────────────────────────────────
function WaterTracker() {
  const GLASS_ML = 250
  const DAILY_GOAL = 2000 // 8 vasos por defecto

  const [glasses, setGlasses] = useState(0)
  const [goal, setGoal] = useState(DAILY_GOAL)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutriguia_water')
      if (saved) {
        const parsed = JSON.parse(saved)
        const { glasses: savedGlasses, date } = parsed
        const today = new Date().toDateString()
        if (date === today) {
          setGlasses(savedGlasses)
        }
      }
    } catch {
      // localStorage corrupto — ignorar y usar estado inicial
    }
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('nutriguia_water', JSON.stringify({
      glasses,
      date: new Date().toDateString(),
    }))
  }, [glasses])

  const addGlass = () => {
    if (glasses < 16) {
      setGlasses(prev => prev + 1)
      useStreakStore.getState().recordActivity('hydration')
    }
  }

  const removeGlass = () => {
    if (glasses > 0) setGlasses(prev => prev - 1)
  }

  const resetDay = () => setGlasses(0)

  const currentMl = glasses * GLASS_ML
  const progress = Math.min((currentMl / goal) * 100, 100)
  const remaining = Math.max(goal - currentMl, 0)

  return (
    <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-sm">Hidratación 💧</h3>
      </div>

      {/* Progress ring */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-blue-500"
              strokeDasharray={`${progress * 2.64} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${progress * 2.64} 264` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
            <span className="text-xs text-muted-foreground">{currentMl}ml</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <div className="font-semibold text-blue-600">{glasses}</div>
          <div className="text-muted-foreground">vasos hoy</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <div className="font-semibold text-blue-600">{remaining > 0 ? `${remaining}ml` : '¡Listo!'}</div>
          <div className="text-muted-foreground">falta</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={removeGlass}
          disabled={glasses === 0}
          className="flex-1 py-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 text-xs font-medium transition-colors"
        >
          -1 vaso
        </button>
        <button
          onClick={addGlass}
          className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
        >
          +1 vaso
        </button>
      </div>

      {glasses >= 8 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 text-center text-xs text-green-600 font-medium"
        >
          ¡Excelente! Llegaste a tu meta de hoy 🎉
        </motion.div>
      )}

      {mounted && (() => {
        try {
          const saved = localStorage.getItem('nutriguia_water')
          if (saved) {
            const { date } = JSON.parse(saved)
            return new Date().toDateString() !== date
          }
        } catch { return true }
        return true
      })() && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          El contador se reinicia cada día automáticamente
        </p>
      )}
    </div>
  )
}

// ─── BMI Calculator ────────────────────────────────────────────────────────────
function BMICalculator() {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState('')
  const [saved, setSaved] = useState(false)

  // Cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem('nutriguia_bmi')
    if (!savedData) return
    try {
      const data = JSON.parse(savedData)
      setWeight(data.weight ?? '')
      setHeight(data.height ?? '')
      if (data.bmi) {
        setBmi(data.bmi)
        setCategory(data.category ?? '')
      }
    } catch {
      // localStorage corrupto — ignorar
    }
  }, [])

  const calculate = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)

    if (!w || !h || w <= 0 || h <= 0) return

    const heightM = h / 100
    const imc = w / (heightM * heightM)
    setBmi(imc)

    let cat = ''
    if (imc < 18.5) cat = 'Bajo peso'
    else if (imc < 25) cat = 'Peso normal ✅'
    else if (imc < 30) cat = 'Sobrepeso'
    else cat = 'Obesidad'

    setCategory(cat)

    // Guardar
    const data = { weight: w, height: h, bmi: imc, category: cat }
    localStorage.setItem('nutriguia_bmi', JSON.stringify(data))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    // Registrar streak y guardar en historial de peso
    useStreakStore.getState().recordActivity('weight')
    useWeightHistoryStore.getState().addEntry(w, imc)
  }

  const getBMIColor = () => {
    if (!bmi) return 'text-muted-foreground'
    if (bmi < 18.5) return 'text-blue-500'
    if (bmi < 25) return 'text-green-500'
    if (bmi < 30) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <Scale className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="font-semibold text-sm">Calculadora IMC ⚖️</h3>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="ej: 70"
            className="w-full px-3 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="ej: 170"
            className="w-full px-3 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors mb-3"
      >
        Calcular IMC
      </button>

      {/* Result */}
      {bmi && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className={`text-3xl font-bold mb-1 ${getBMIColor()}`}>
            {bmi.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground mb-1">tu IMC</div>
          <div className={`text-xs font-medium ${getBMIColor()}`}>{category}</div>

          {/* Feedback motivacional */}
          {bmi && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg bg-muted/60 text-center">
              {bmi < 18.5
                ? '💪 Un peso saludable es importante. Consulta con un nutricionista para un plan adecuado.'
                : bmi < 25
                ? '🎉 ¡Excelente! Estás en tu peso ideal. Mantén esos hábitos ricos y equilibrados.'
                : bmi < 30
                ? '🌱 Con pequeños cambios en tu alimentación puedes mejorar tu bienestar. ¡Estoy aquí para ayudarte!'
                : '💙 Un cambio gradual es la clave. No se trata de perfección, sino de progreso. ¡Vamos con calma!'}
            </p>
          )}

          {/* Barra visual */}
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(bmi / 35 * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${bmi < 18.5 ? 'bg-blue-500' : bmi < 25 ? 'bg-green-500' : bmi < 30 ? 'bg-orange-500' : 'bg-red-500'}`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>35+</span>
          </div>
        </motion.div>
      )}

      {saved && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-xs text-green-600 flex items-center justify-center gap-1"
        >
          <Check className="w-3 h-3" /> Guardado
        </motion.p>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        ⚠️ El IMC es un indicador general. Consulta a un profesional para una evaluación completa.
      </p>
    </div>
  )
}

// ─── Calorías diarias estimadas ───────────────────────────────────────────────
function CalorieEstimator() {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('moderate')
  const [calories, setCalories] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('nutriguia_calories')
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      setSex(data.sex ?? 'male')
      setWeight(data.weight ?? '')
      setHeight(data.height ?? '')
      setAge(data.age ?? '')
      setActivity(data.activity ?? 'moderate')
      if (data.calories) setCalories(data.calories)
    } catch {
      // localStorage corrupto — ignorar
    }
  }, [])

  const calculate = () => {
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)
    if (!w || !h || !a) return

    // Fórmula de Mifflin-St Jeor
    let bmr = sex === 'male'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }

    const result = Math.round(bmr * (multipliers[activity] ?? 1.55))
    setCalories(result)

    const data = { sex, weight: w, height: h, age: a, activity, calories: result }
    localStorage.setItem('nutriguia_calories', JSON.stringify(data))

    // Registrar streak
    useStreakStore.getState().recordActivity('weight')
  }

  return (
    <div className="bg-card rounded-xl p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold text-sm">Calorías diarias 🔥</h3>
      </div>

      {/* Sex toggle */}
      <div className="flex gap-1 mb-3 bg-muted rounded-lg p-1">
        {(['male', 'female'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSex(s)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sex === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s === 'male' ? 'Hombre' : 'Mujer'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Peso (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="70"
            className="w-full px-2 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="170"
            className="w-full px-2 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Edad</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="30"
            className="w-full px-2 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Activity */}
      <div className="mb-3">
        <label className="text-xs text-muted-foreground mb-1 block">Actividad física</label>
        <select
          value={activity}
          onChange={e => setActivity(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="sedentary">Sedentario (poco ejercicio)</option>
          <option value="light">Ligera (1-3 días/semana)</option>
          <option value="moderate">Moderada (3-5 días/semana)</option>
          <option value="active">Activa (6-7 días/semana)</option>
          <option value="veryActive">Muy activa (atleta)</option>
        </select>
      </div>

      <button
        onClick={calculate}
        className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
      >
        Calcular
      </button>

      {calories && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <div className="text-2xl font-bold text-green-600">
            ~{calories.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-muted-foreground">kcal/día estimadas</div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="inline-block bg-muted px-2 py-1 rounded mr-1">
              Pérdida: {Math.round(calories * 0.8).toLocaleString('es-CL')} kcal
            </span>
            <span className="inline-block bg-muted px-2 py-1 rounded">
              Ganar: {Math.round(calories * 1.2).toLocaleString('es-CL')} kcal
            </span>
          </div>
        </motion.div>
      )}

      <p className="mt-2 text-center text-xs text-muted-foreground">
        Fórmula Mifflin-St Jeor · approximation
      </p>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HealthMetrics() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Herramientas de salud 📊
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Usa estas herramientas para entender mejor tu cuerpo. Los datos se guardan en tu navegador.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
          >
            <WaterTracker />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BMICalculator />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CalorieEstimator />
          </motion.div>
        </div>

        {/* Historial de peso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4"
        >
          <WeightHistoryChart />
        </motion.div>
      </div>
    </section>
  )
}
