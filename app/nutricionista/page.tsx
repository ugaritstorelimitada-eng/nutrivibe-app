'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Users, ChevronRight, ChevronLeft, Star, Clock, MessageSquare,
  Send, ArrowLeft, CheckCircle, AlertCircle, Crown, User, Calendar,
  Droplets, Scale, TrendingUp, FileText, ThumbsUp, X, LogOut, Shield,
  Activity, Heart, Zap, Leaf
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientProfile {
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

interface PatientMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Patient {
  id: string
  profile: PatientProfile
  messages: PatientMessage[]
  planStatus: 'pending' | 'approved' | 'needs_review'
  lastVisit: string
  streakDays: number
  waterAverage: number
  notes: NutritionistNote[]
}

interface NutritionistNote {
  id: string
  text: string
  createdAt: string
  type: 'approval' | 'correction' | 'comment'
}

// ─── Mock data (en prod: viene de la DB) ─────────────────────────────────────
const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    profile: {
      name: 'María Fernández',
      allergies: ['Gluten'],
      restrictions: ['intolerante-fructosa'],
      cookingLevel: 'intermedio',
      budget: 'medio',
      goals: ['bajar-peso', 'reducir-azucar'],
      dailyCalories: 1850,
      dailyWater: 2500,
      createdAt: '2026-07-15T10:00:00Z',
    },
    messages: [
      { id: 'm1', role: 'user', content: 'Hola, quiero bajar de peso pero me cuesta resistir los dulces por las tardes.', createdAt: '2026-08-10T09:15:00Z' },
      { id: 'm2', role: 'assistant', content: '¡Hola María! Entiendo perfectamente ese desafío. El craving por azúcar por las tardes es súper común. Te propongo una estrategia gradual: en vez de eliminar los dulces de golpe, vamos a substituirlos por alternativas más nutritivas que te den la misma satisfacción...', createdAt: '2026-08-10T09:16:00Z' },
      { id: 'm3', role: 'user', content: '¿Qué alternativas me recomiendas?', createdAt: '2026-08-10T09:20:00Z' },
      { id: 'm4', role: 'assistant', content: 'Aquí tienes mis 3 favoritos para la tarde:\n\n1. **Fruta fresca con yogurt griego** — naturales, dulces por naturaleza\n2. **Hummus con palitos de verduras** — salado y satisfactorio\n3. **Un puñadito de almendras** — las grasas saludables te dan saciedad\n\n¿Te gustaría que te prepare un plan semanal anti-craving?', createdAt: '2026-08-10T09:21:00Z' },
    ],
    planStatus: 'needs_review',
    lastVisit: '2026-08-10T09:21:00Z',
    streakDays: 12,
    waterAverage: 1800,
    notes: [],
  },
  {
    id: 'p2',
    profile: {
      name: 'Carlos Mendoza',
      allergies: [],
      restrictions: ['vegano'],
      cookingLevel: 'avanzado',
      budget: 'alto',
      goals: ['ganar-musculo', 'mas-energia'],
      dailyCalories: 2800,
      dailyWater: 3000,
      createdAt: '2026-06-20T14:30:00Z',
    },
    messages: [
      { id: 'm5', role: 'user', content: 'Soy vegano y quiero ganar músculo. ¿Cómo aseguro suficiente proteína?', createdAt: '2026-08-09T11:00:00Z' },
      { id: 'm6', role: 'assistant', content: '¡Excelente objetivo Carlos! Como vegano tienes opciones increíbles para proteína. La clave es combinar fuentes vegetales para obtener todos los aminoácidos esenciales...', createdAt: '2026-08-09T11:01:00Z' },
    ],
    planStatus: 'approved',
    lastVisit: '2026-08-09T11:01:00Z',
    streakDays: 28,
    waterAverage: 2900,
    notes: [
      { id: 'n1', text: 'Plan aprobado. Paciente responde bien a legumbres. Sugiero aumentar calorías a 2900.', createdAt: '2026-08-08T16:00:00Z', type: 'approval' },
    ],
  },
  {
    id: 'p3',
    profile: {
      name: 'Sofía Bravo',
      allergies: ['Lactosa', 'Huevos'],
      restrictions: ['vegetariano'],
      cookingLevel: 'principiante',
      budget: 'bajo',
      goals: ['comer-sano', 'dormir-mejor'],
      dailyCalories: 1600,
      dailyWater: 2000,
      createdAt: '2026-08-01T08:00:00Z',
    },
    messages: [
      { id: 'm7', role: 'user', content: 'No tengo tiempo para cocinar cosas elaborate. ¿Qué puedo comer que sea sano y rápido?', createdAt: '2026-08-11T20:00:00Z' },
      { id: 'm8', role: 'assistant', content: '¡Sofía, no estás sola! Cocinar sano no tiene que tomar horas. Aquí van mis shortcuts favoritos para gente con poco tiempo...', createdAt: '2026-08-11T20:01:00Z' },
    ],
    planStatus: 'pending',
    lastVisit: '2026-08-11T20:01:00Z',
    streakDays: 5,
    waterAverage: 1200,
    notes: [],
  },
]

const COOKING_LEVELS: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  chef: 'Chef casero',
}

const BUDGET_LABELS: Record<string, string> = {
  bajo: 'Ajustado (~30k CLP/sem)',
  medio: 'Moderado (~60k CLP/sem)',
  alto: 'Flexible (~120k CLP/sem)',
}

const GOAL_LABELS: Record<string, string> = {
  'bajar-peso': 'Bajar de peso',
  'ganar-musculo': 'Ganar músculo',
  'mas-energia': 'Más energía',
  'dormir-mejor': 'Dormir mejor',
  'comer-sano': 'Aprender a comer sano',
  'mantener': 'Mantener peso',
  'reducir-azucar': 'Reducir azúcar',
  'hidratarme': 'Mejorar hidratación',
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const input0 = useState<HTMLInputElement | null>(null)
  const input1 = useState<HTMLInputElement | null>(null)
  const input2 = useState<HTMLInputElement | null>(null)
  const input3 = useState<HTMLInputElement | null>(null)
  const refs = [input0, input1, input2, input3]

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError(false)
    if (value && index < 3) {
      (refs[index + 1][0] as HTMLInputElement)?.focus()
    }
    if (newPin.every(d => d !== '') && newPin.join('') !== '1234') {
      setTimeout(() => {
        setPin(['', '', '', ''])
        setError(true)
        ;(refs[0][0] as HTMLInputElement)?.focus()
      }, 300)
    }
    if (newPin.join('') === '1234') {
      onLogin()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      ;(refs[index - 1][0] as HTMLInputElement)?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Panel NutriGuía</h1>
        <p className="text-muted-foreground text-sm mb-6">Acceso exclusivo para nutricionistas</p>

        <div className="flex gap-3 justify-center mb-4">
          {pin.map((d, i) => (
            <input
              key={i}
              ref={refs[i][1]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all ${
                error
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : d
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-gray-50 text-gray-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mb-4"
          >
            PIN incorrecto. Intenta de nuevo.
          </motion.p>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
          <p className="text-amber-800 text-xs">
            <strong>Demo:</strong> usa el PIN <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">1234</code> para acceder
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Patient Card ──────────────────────────────────────────────────────────────
function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const initials = patient.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
    needs_review: { label: 'Revisar', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  }
  const status = statusConfig[patient.planStatus]

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 border border-gray-200 text-left hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm truncate">{patient.profile.name}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            <status.icon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>🫘 {patient.profile.restrictions.join(', ') || 'Sin restricciones'}</span>
          <span>🔥 {patient.streakDays}d racha</span>
          <span>💧 {Math.round(patient.waterAverage)}ml avg</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </motion.button>
  )
}

// ─── Patient Detail ────────────────────────────────────────────────────────────
function PatientDetail({
  patient,
  onBack,
  onAddNote,
}: {
  patient: Patient
  onBack: () => void
  onAddNote: (note: NutritionistNote) => void
}) {
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<NutritionistNote['type']>('comment')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const initials = patient.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSendNote = async () => {
    if (!newNote.trim()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    onAddNote({
      id: `n${Date.now()}`,
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
      type: noteType,
    })
    setNewNote('')
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 2000)
  }

  const handleApprovePlan = () => {
    onAddNote({
      id: `n${Date.now()}`,
      text: '✅ Plan alimenticio aprobado y	validado por nutricionista.',
      createdAt: new Date().toISOString(),
      type: 'approval',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="font-bold">{patient.profile.name}</h2>
          <p className="text-xs text-muted-foreground">Paciente VIP desde {new Date(patient.profile.createdAt).toLocaleDateString('es-CL')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApprovePlan}
            className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Aprobar plan
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Profile Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Perfil del paciente
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Calorías meta</div>
              <div className="font-bold text-primary">{patient.profile.dailyCalories ?? '—'} kcal</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Agua meta</div>
              <div className="font-bold text-blue-600">{patient.profile.dailyWater} ml</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Racha</div>
              <div className="font-bold text-green-600">🔥 {patient.streakDays} días</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-0.5">Avg. agua</div>
              <div className="font-bold text-blue-500">{Math.round(patient.waterAverage)} ml</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {patient.profile.allergies.map(a => (
              <span key={a} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full border border-red-200 font-medium">⚠️ {a}</span>
            ))}
            {patient.profile.restrictions.map(r => (
              <span key={r} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 font-medium">🌿 {r}</span>
            ))}
          </div>

          <div className="mt-2">
            <span className="text-xs text-muted-foreground">Nivel de cocina: </span>
            <span className="text-xs font-medium">{COOKING_LEVELS[patient.profile.cookingLevel]}</span>
            <span className="text-xs text-muted-foreground mx-2">·</span>
            <span className="text-xs text-muted-foreground">Presupuesto: </span>
            <span className="text-xs font-medium">{BUDGET_LABELS[patient.profile.budget]}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {patient.profile.goals.map(g => (
              <span key={g} className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-full">🎯 {GOAL_LABELS[g]}</span>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Activity, label: 'Actividad', value: 'Moderada', color: 'text-orange-500' },
            { icon: Heart, label: 'Última visita', value: new Date(patient.lastVisit).toLocaleDateString('es-CL'), color: 'text-blue-500' },
            { icon: MessageSquare, label: 'Conversaciones', value: patient.messages.length, color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="font-bold text-sm">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Notes from nutritionist */}
        {patient.notes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Mis notas ({patient.notes.length})
            </h3>
            <div className="space-y-2">
              {patient.notes.map(note => (
                <div
                  key={note.id}
                  className={`rounded-lg p-3 text-sm ${
                    note.type === 'approval'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : note.type === 'correction'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-blue-50 border border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase">
                      {note.type === 'approval' ? '✅ Aprobado' : note.type === 'correction' ? '⚠️ Corrección' : '💬 Comentario'}
                    </span>
                    <span className="text-xs opacity-60">
                      {new Date(note.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  {note.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Historial de chat ({patient.messages.length} mensajes)
          </h3>
          <div className="space-y-3">
            {patient.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="text-xs opacity-60 mb-0.5">
                    {msg.role === 'user' ? patient.profile.name : 'NutriGuía IA'} · {new Date(msg.createdAt).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add note */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-primary" />
            Agregar nota / recomendación
          </h3>

          <div className="flex gap-2 mb-3">
            {(['comment', 'approval', 'correction'] as const).map(type => (
              <button
                key={type}
                onClick={() => setNoteType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  noteType === type
                    ? type === 'approval'
                      ? 'bg-green-500 text-white'
                      : type === 'correction'
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'approval' ? '✅ Aprobar' : type === 'correction' ? '⚠️ Corregir' : '💬 Comentar'}
              </button>
            ))}
          </div>

          <textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Escribe tu recomendación o corrección para este paciente..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            {sent && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-green-600 text-xs font-medium flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Nota enviada al paciente
              </motion.span>
            )}
            {!sent && <span />}
            <button
              onClick={handleSendNote}
              disabled={!newNote.trim() || sending}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold transition-colors flex items-center gap-2 ml-auto"
            >
              {sending ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar al paciente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
export default function NutricionistaPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [nutricionistaName] = useState('Dra. Carolina Ruiz')

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.planStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: patients.length,
    pending: patients.filter(p => p.planStatus === 'pending').length,
    needsReview: patients.filter(p => p.planStatus === 'needs_review').length,
    approved: patients.filter(p => p.planStatus === 'approved').length,
  }

  const handleAddNote = (patientId: string, note: NutritionistNote) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p
      const updatedNotes = [...p.notes, note]
      const newStatus = note.type === 'approval' ? 'approved' : 'needs_review'
      return { ...p, notes: updatedNotes, planStatus: newStatus }
    }))
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(prev => prev ? {
        ...prev,
        notes: [...prev.notes, note],
        planStatus: note.type === 'approval' ? 'approved' : 'needs_review',
      } : null)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setSelectedPatient(null)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  if (selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onAddNote={note => handleAddNote(selectedPatient.id, note)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Panel Nutricionista</h1>
              <p className="text-xs text-muted-foreground">{nutricionistaName} · NutriGuía VIP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-center">
                <div className="font-bold text-lg text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Pacientes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-orange-500">{stats.needsReview}</div>
                <div className="text-xs text-muted-foreground">Por revisar</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-500">{stats.approved}</div>
                <div className="text-xs text-muted-foreground">Aprobados</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Stats mobile */}
        <div className="sm:hidden grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-primary' },
            { label: 'Pendiente', value: stats.pending, color: 'text-amber-500' },
            { label: 'Revisar', value: stats.needsReview, color: 'text-orange-500' },
            { label: 'Aprobados', value: stats.approved, color: 'text-green-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendiente' },
              { id: 'needs_review', label: 'Revisar' },
              { id: 'approved', label: 'Aprobado' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === f.id
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient list */}
        <div className="space-y-2">
          {filteredPatients.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No se encontraron pacientes</p>
            </div>
          ) : (
            filteredPatients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PatientCard
                  patient={patient}
                  onClick={() => setSelectedPatient(patient)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
