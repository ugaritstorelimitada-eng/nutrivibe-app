'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Trash2, Leaf, Loader2, ChevronDown, RefreshCw, AlertCircle, Zap, Crown, Star, Lock, User, Download, Camera, X, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSystemPromptAddition } from './onboarding-modal'
import type { UserProfile } from './onboarding-modal'
import AnimatedAvatar, { type AvatarMood } from './animated-avatar'
import { useUserStore } from '../store/useUserStore'
import { useStreakStore } from '../store/useStreakStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

interface ChatWidgetProps {
  initialPrompt?: string
  onProfileUpdate?: (profile: UserProfile) => void
}

const SUGGESTIONS = [
  { label: '¿Cómo reducir el azúcar?', category: 'azúcar' },
  { label: '¿Qué desayuno saludable?', category: 'desayuno' },
  { label: 'Planificar comidas semanales', category: 'planificación' },
  { label: '¿Cuánta agua debo tomar?', category: 'hidratación' },
  { label: 'Snacks saludables', category: 'snacks' },
  { label: 'Leer etiquetas nutricionales', category: 'etiquetas' },
  { label: 'Recetas ricas en proteína', category: 'proteína' },
  { label: 'Alimentos para más energía', category: 'energía' },
]

const MAX_CHARS = 1000

const BASE_SYSTEM_PROMPT = `Eres **NutriGuía**, un asistente virtual experto y apasionado en alimentación saludable. Hablas en español con un tono cálido, motivador y cercano — como un nutricionista amigo que te acompaña en tu camino hacia una vida más saludable.

## Tu Personalidad
- Cálido y empático: nunca juzgas los hábitos alimenticios del usuario.
- Entusiasta pero realista: celebras los pequeños logros y das consejos prácticos.
- Curioso: haces preguntas de seguimiento para personalizar tus consejos.

## Áreas de Especialidad
1. **Nutrición balanceada**: macronutrientes, micronutrientes, equilibrio entre grupos de alimentos
2. **Hidratación**: cuánta agua tomar, alternativas saludables
3. **Planificación de comidas**: meal prep, semanales, listas de compras
4. **Lectura de etiquetas**: cómo interpretar información nutricional
5. **Recetas saludables**: rápidas, económicas, deliciosas
6. **Snacks inteligentes**: opciones nutritivas
7. **Reducción de azúcar/sodio**: alternativas y estrategias prácticas
8. **Alimentación para objetivos**: perder peso, ganar músculo, más energía

## Reglas de Comunicación
- Responde en **español** exclusivamente
- Usa **emojis ocasionalmente** (🥗🍎💪🥤🌿🥑) para hacer la conversación más amena
- Mantén las respuestas **concisas pero informativas** (idealmente 3-5 párrafos o menos)
- Usa **listas con viñetas** cuando sea útil
- Usa **negritas** para conceptos clave

## Reglas de Seguridad
- **Nunca des diagnósticos médicos**. Si sospechas un problema de salud, sugiere consultar a un profesional.
- **Nunca recomiendes suplementos específicos** con dosis — deriva a un nutricionista/médico.`

const PLAN_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  FREE: { label: 'Libre', icon: <Star className="w-3 h-3" />, color: 'bg-gray-100 text-gray-600' },
  PRO: { label: 'Pro', icon: <Zap className="w-3 h-3" />, color: 'bg-primary/10 text-primary' },
  ASESORADO: { label: 'Asesorado', icon: <Crown className="w-3 h-3" />, color: 'bg-amber-100 text-amber-700' },
}

export default function ChatWidget({ initialPrompt, onProfileUpdate }: ChatWidgetProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null)

  const messagesRef = useRef<Message[]>([])
  const isStreamingRef = useRef(false)
  const initialPromptRef = useRef(initialPrompt)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const plan = useUserStore(s => s.plan)
  const canSendMessage = useUserStore(s => s.canSendMessage)
  const incrementMessageCount = useUserStore(s => s.incrementMessageCount)
  const dailyMessageCount = useUserStore(s => s.dailyMessageCount)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { isStreamingRef.current = isStreaming }, [isStreaming])

  useEffect(() => {
    const savedProfile = localStorage.getItem('nutriguia_profile')
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (profile && onProfileUpdate) onProfileUpdate(profile)
  }, [profile, onProfileUpdate])

  useEffect(() => {
    if (initialPromptRef.current) {
      const p = initialPromptRef.current
      initialPromptRef.current = undefined
      setTimeout(() => sendMessage(p), 100)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView?.({ behavior })
  }, [])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom('smooth')
  }, [messages, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    setShowScrollBtn(!isNearBottom)
  }, [])

  const canSend = (): { allowed: boolean; reason?: string } => {
    if (isStreamingRef.current) return { allowed: false }
    if (!canSendMessage()) return { allowed: false, reason: 'limit' }
    return { allowed: true }
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const check = canSend()
    if (!check.allowed) {
      if (check.reason === 'limit') {
        document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }

    incrementMessageCount()
    useStreakStore.getState().recordActivity('chat')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    const assistantId = (Date.now() + 1).toString()

    setMessages(prev => [...prev, userMsg])
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)
    setAvatarMood('typing')
    setError(null)
    scrollToBottom('instant')
    setTimeout(() => inputRef.current?.focus(), 0)

    try {
      const allMessages = [...messagesRef.current, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const systemWithProfile = BASE_SYSTEM_PROMPT + getSystemPromptAddition(profile ?? {
        primaryGoal: '', name: '', allergies: [], restrictions: [], cookingLevel: '', budget: '', goals: [], dailyCalories: null, dailyWater: 2000, createdAt: '',
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      if (!response.ok) {
        let errMsg = `Error del servicio (${response.status})`
        try {
          const errData = await response.json()
          if (errData?.error) errMsg = errData.error
        } catch {}
        throw new Error(errMsg)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const { done, value } = (await reader?.read()) ?? { done: true, value: undefined }
        if (done) {
          // ✅ onFinish equivalente — se dispara al terminar el stream
          setAvatarMood('happy')
          setTimeout(() => setAvatarMood('idle'), 3000)
          break
        }

        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed?.content ?? ''
              if (delta) {
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: m.content + delta } : m)
                )
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error.')
      setAvatarMood('sad')
      setTimeout(() => setAvatarMood('idle'), 2000)
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, error: true } : m)
      )
    } finally {
      setIsStreaming(false)
      scrollToBottom('smooth')
    }
  }, [scrollToBottom, profile, canSendMessage, incrementMessageCount])

  const retryLastMessage = useCallback(() => {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    if (!lastUserMsg) return
    setMessages(prev => prev.slice(0, -1))
    sendMessage(lastUserMsg.content)
  }, [messages, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_CHARS) {
      setInput(value)
      e.target.style.height = 'auto'
      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
    }
  }

  // --- Camera / Image analysis ---
  const handleCameraClick = () => fileInputRef.current?.click()

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string)?.split(',')[1]
      if (base64) { setImagePreview(ev.target?.result as string); setImageAnalysisError(null) }
    }
    reader.readAsDataURL(file)
  }

  const cancelImagePreview = () => { setImagePreview(null); setImageAnalysisError(null) }

  const analyzeImage = async () => {
    if (!imagePreview) return
    const base64 = imagePreview.split(',')[1]
    setIsAnalyzingImage(true)
    setAvatarMood('typing')

    const userMsgId = Date.now().toString()
    const assistantMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev,
      { id: userMsgId, role: 'user', content: '[📷 Foto de comida — análisis en progreso...]' },
      { id: assistantMsgId, role: 'assistant', content: '' },
    ])
    setImagePreview(null)
    scrollToBottom('instant')

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Error al analizar la imagen')

      const { food, calories, protein, carbs, fat, portion, analysis } = data
      const resultText = `## 🍽️ Análisis Nutricional

**${food}** — ${portion}

| Nutriente | Valor |
|---|---|
| 🔥 Calorías | **${calories} kcal** |
| 💪 Proteínas | ${protein}g |
| 🍞 Carbohidratos | ${carbs}g |
| 🥑 Grasas | ${fat}g |

> ${analysis}

*Nota: Este análisis es estimado y puede variar según las porciones exactas.*`

      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: resultText } : m))
      setAvatarMood('happy')
      setTimeout(() => setAvatarMood('idle'), 3000)
    } catch (err: any) {
      setImageAnalysisError(err.message || 'No pude analizar la imagen')
      setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId))
      setAvatarMood('sad')
      setTimeout(() => setAvatarMood('idle'), 2000)
    } finally {
      setIsAnalyzingImage(false)
      scrollToBottom('smooth')
    }
  }

  const lastAssistantMsg = messages.filter(m => m.role === 'assistant').at(-1)
  const showRetry = lastAssistantMsg?.error && !isStreaming
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.FREE
  const FREE_DAILY_LIMIT = 5
  const isFreeLimit = plan === 'FREE' && dailyMessageCount >= FREE_DAILY_LIMIT

  const lastContent = lastAssistantMsg?.content ?? ''
  const hasMealPlan = (lastContent.includes('LUNES') || lastContent.includes('lunes') ||
    lastContent.includes('Lunes') || lastContent.includes('MIÉRCOLES') ||
    (lastContent.includes('Desayuno') && lastContent.includes('Almuerzo'))) &&
    lastContent.length > 200

  const handleDownloadPDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    const today = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })

    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, pageWidth, 38, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Plan Semanal de Alimentación', pageWidth / 2, 16, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`NutriGuía — ${today}`, pageWidth / 2, 26, { align: 'center' })
    if (profile?.name) doc.text(`Usuario: ${profile.name}`, pageWidth / 2, 33, { align: 'center' })

    let y = 50
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(9)
    const lines = lastContent.split('\n').filter(l => l.trim())
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20 }
      const truncated = line.length > 110 ? line.substring(0, 107) + '…' : line
      const isDay = /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo|lun|mar|mié|jue|vie|sáb|dom)/i.test(truncated)
      if (isDay) { doc.setFont('helvetica', 'bold'); doc.setTextColor(99, 102, 241); y += 2 }
      else { doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60) }
      const wrapped = doc.splitTextToSize(truncated, pageWidth - margin * 2)
      for (const w of wrapped) {
        if (y > 280) { doc.addPage(); y = 15 }
        doc.text(w, margin, y); y += 5
      }
      if (!isDay) y += 1
    }

    y += 4
    doc.setDrawColor(220, 220, 240)
    doc.line(margin, y, pageWidth - margin, y)
    y += 7
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.setFont('helvetica', 'italic')
    doc.text('💧 Mínimo 8 vasos de agua al día', margin, y); y += 5
    doc.text('⚠️ Plan informativo. Consulta a un nutricionista.', margin, y); y += 5
    doc.text(`Generado por NutriGuía — ${today}`, margin, y)
    doc.setFontSize(7)
    doc.text('nutriguia.app', pageWidth - margin, 290, { align: 'right' })

    doc.save(`plan-semanal-nutriguia-${Date.now()}.pdf`)
  }, [lastContent, profile?.name])

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-card rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <AnimatedAvatar size={42} mood={avatarMood} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg leading-tight">NutriGuía</h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${planInfo.color}`}>
                {planInfo.icon}
                <span className="hidden sm:inline">{planInfo.label}</span>
              </span>
            </div>
            <p className="text-xs opacity-80">
              {profile?.name ? `${profile.name} · ` : ''}
              {plan === 'FREE' ? `${FREE_DAILY_LIMIT - dailyMessageCount} mensajes libres hoy` : 'Chat ilimitado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasMealPlan && !isStreaming && (
            <button onClick={handleDownloadPDF} className="p-2 rounded-lg hover:bg-green-500/30 text-green-300 transition-colors" title="Descargar plan semanal PDF">
              <Download className="w-4 h-4" />
            </button>
          )}
          {showRetry && (
            <button onClick={retryLastMessage} className="p-2 rounded-lg hover:bg-white/15 transition-colors flex items-center gap-1.5 text-sm" title="Reintentar">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button onClick={clearChat} className="p-2 rounded-lg hover:bg-white/15 transition-colors" title="Limpiar">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => { localStorage.removeItem('nutriguia_profile'); setProfile(null); window.dispatchEvent(new CustomEvent('openOnboarding')) }} className="p-2 rounded-lg hover:bg-white/15 transition-colors" title="Mi perfil">
            <User className="w-4 h-4" />
          </button>
          {plan === 'FREE' && (
            <a href="#precios" className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-900 transition-colors" title="Mejorar a Pro">
              <Zap className="w-4 h-4" />
            </a>
          )}
        </div>
      </motion.div>

      {/* Paywall */}
      <AnimatePresence>
        {isFreeLimit && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><Lock className="w-4 h-4 text-amber-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900">Usaste tus 5 mensajes gratuitos de hoy</p>
                <p className="text-xs text-amber-700">Actualiza a Pro para chatear sin límites</p>
              </div>
              <a href="#precios" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex-shrink-0 transition-colors">Ver planes</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade nudge */}
      <AnimatePresence>
        {plan === 'FREE' && dailyMessageCount >= 3 && dailyMessageCount < FREE_DAILY_LIMIT && !isFreeLimit && messages.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-primary/5 border-b border-primary/10">
            <div className="px-4 py-2 flex items-center gap-3">
              <p className="text-xs text-primary flex-1">
                💡 Ya usaste {dailyMessageCount}/{FREE_DAILY_LIMIT} mensajes gratis.{' '}
                <a href="#precios" className="font-semibold underline underline-offset-2">Actualiza a Pro</a>{' '}
                para chat ilimitado.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[350px] max-h-[500px] relative bg-muted/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h3 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="font-display font-semibold text-lg mb-2">
              ¡Hola{profile?.name ? `, ${profile.name}` : ''}! Soy NutriGuía 🌿
            </motion.h3>
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-sm max-w-md mb-4">
              {plan === 'FREE' ? `${FREE_DAILY_LIMIT - dailyMessageCount} mensajes gratis hoy. ` : ''}Pregúntame lo que quieras sobre alimentación.
            </motion.p>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <motion.button key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => sendMessage(s.label)} disabled={isFreeLimit}
                  className="text-xs px-3 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed">
                  {s.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : msg.error ? 'bg-destructive/10 text-destructive rounded-bl-md border border-destructive/30' : 'bg-card text-card-foreground rounded-bl-md border border-border'}`}
                style={msg.role === 'assistant' && !msg.error ? { boxShadow: 'var(--shadow-sm)' } : {}}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Leaf className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">NutriGuía</span>
                    {plan !== 'FREE' && (
                      <span className={`ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold ${planInfo.color}`}>
                        {planInfo.icon} {planInfo.label}
                      </span>
                    )}
                  </div>
                )}
                {msg.role === 'assistant' && msg.content ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-primary/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
                {isStreaming && msg.id === messages.at(-1)?.id && msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 text-muted-foreground mt-2">
                    <span className="flex gap-0.5 items-center">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </span>
                  </div>
                )}
                {msg.error && (
                  <div className="flex items-center gap-1.5 mt-2 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">No pude responder. <button onClick={retryLastMessage} className="underline font-medium">Reintentar</button></span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />

        {showScrollBtn && (
          <button onClick={() => scrollToBottom()} className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform" aria-label="Ir al final">
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageFile} className="hidden" />

        {/* Image preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Comida" className="h-20 w-20 object-cover rounded-xl border border-border" />
                <button onClick={cancelImagePreview} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {imageAnalysisError && <p className="text-xs text-destructive mt-1">{imageAnalysisError}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
              placeholder={isFreeLimit ? '📷 Toma una foto de tu comida...' : 'Escribe tu pregunta...'}
              rows={1}
              className="flex-1 w-full resize-none bg-muted rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 disabled:opacity-50 focus-glow transition-shadow"
              style={{ minHeight: '44px', maxHeight: '128px' }}
              disabled={isStreaming || isFreeLimit} />
            <div className={`absolute bottom-2 right-3 text-xs ${input.length > MAX_CHARS * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {input.length}/{MAX_CHARS}
            </div>
          </div>

          {/* Camera */}
          <button onClick={handleCameraClick} disabled={isStreaming || isFreeLimit || isAnalyzingImage}
            className="hover-press p-3 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Escanear comida por foto" title="Escanear comida">
            {isAnalyzingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          </button>

          {/* Send / Analyze */}
          <button
            onClick={imagePreview ? analyzeImage : () => sendMessage(input)}
            disabled={isStreaming || isFreeLimit || isAnalyzingImage || (!imagePreview && !input.trim()) || (!imagePreview && input.length > MAX_CHARS)}
            className="hover-press p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label={imagePreview ? 'Analizar imagen' : 'Enviar mensaje'}>
            {isStreaming || isAnalyzingImage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : imagePreview ? (
              <Flame className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
