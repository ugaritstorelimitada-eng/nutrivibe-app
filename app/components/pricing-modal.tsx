'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Crown, Star, ArrowRight } from 'lucide-react'

interface PricingModalProps {
  onClose: () => void
  trigger?: 'paywall' | 'upgrade_cta' | 'menu'
  dailyMessagesUsed?: number
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: '$0',
    period: 'para siempre',
    color: 'bg-gray-50 border-gray-200',
    badge: null,
    cta: 'Continuar gratis',
    ctaStyle: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    features: [
      '💬 5 consultas de chat por día',
      '⚖️ Calculadora de IMC',
      '🔥 Calculadora de calorías',
      '💧 Tracker de hidratación',
      '📖 Temas y consejos de nutrición',
    ],
    missing: [
      'Chat ilimitado',
      'Planes semanales en PDF',
      'Perfil personalizado con alergias',
      'Historial guardado',
      'Revisión por nutricionista',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.990',
    period: '/mes',
    color: 'bg-primary/5 border-primary/30',
    badge: { label: 'Mejor valor', emoji: '⭐' },
    cta: 'Comenzar con Pro',
    ctaStyle: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    features: [
      '💬 Chat ilimitado con IA',
      '🧬 Perfil personalizado (alergias, metas)',
      '📋 Generador de planes semanales',
      '📄 Exportar menú a PDF',
      '🕐 Historial de conversaciones',
      '💧 Tracker de hidratación avanzada',
      '⚡ Acceso a recetas premium',
    ],
    missing: [],
    highlighted: true,
  },
  {
    id: 'vip',
    name: 'Asesorado',
    price: '$14.990',
    period: '/mes',
    color: 'bg-amber-50 border-amber-200',
    badge: { label: 'Supervisado', emoji: '👑' },
    cta: 'Comenzar con Asesorado',
    ctaStyle: 'bg-amber-500 hover:bg-amber-600 text-white',
    features: [
      '✨ Todo lo de Pro',
      '👩‍⚕️ Revisión mensual por nutricionista (24-48h)',
      '📊 Revisión de exámenes de laboratorio',
      '📝 Plan ajustado según tu evolución',
      '💬 Chat prioritario con respuesta en 12h',
      '🔬 Subir PDF de exámenes (respuesta en texto)',
      '🎯 Ajustes personalizados según tu peso y metas',
    ],
    missing: [],
  },
]

export default function PricingModal({ onClose, trigger = 'upgrade_cta', dailyMessagesUsed = 0 }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      onClose()
      return
    }

    setLoadingPlan(planId)

    // Simular checkout (en prod: Stripe Checkout)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Guardar en localStorage como "suscripción activa" (en prod: webhook de Stripe)
    const subscription = {
      plan: planId,
      startedAt: new Date().toISOString(),
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
    localStorage.setItem('nutriguia_subscription', JSON.stringify(subscription))
    localStorage.setItem('nutriguia_messages_used', '0')

    setLoadingPlan(null)
    onClose()
    window.location.reload()
  }

  const getTitle = () => {
    if (trigger === 'paywall') {
      return dailyMessagesUsed >= 5
        ? '💬 Llegaste al límite diario'
        : '🔓 Desbloquea más conversaciones'
    }
    return 'Elige tu plan de NutriGuía'
  }

  const getSubtitle = () => {
    if (trigger === 'paywall') {
      return dailyMessagesUsed >= 5
        ? 'Has usado tus 5 consultas gratuitas de hoy. Actualiza tu plan para chatear sin límites.'
        : 'Accede a funciones premium para una asesoría más completa.'
    }
    return 'Precios imbatibles. Cancela cuando quieras.'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{getTitle()}</h2>
              <p className="text-muted-foreground text-sm mt-1">{getSubtitle()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const monthlyPrice = plan.id === 'free' ? 0 : plan.id === 'pro'
                ? (billingCycle === 'annual' ? 3990 : 4990)
                : (billingCycle === 'annual' ? 11990 : 14990)

              const displayPrice = plan.id === 'free'
                ? '$0'
                : `$${monthlyPrice.toLocaleString('es-CL')}`

              const period = plan.id === 'free'
                ? 'para siempre'
                : billingCycle === 'annual' ? '/mes (anual)' : plan.period

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col ${
                    plan.highlighted
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
                      : 'border-gray-200'
                  } ${plan.color}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        plan.id === 'pro' ? 'bg-primary text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {plan.badge.emoji} {plan.badge.label}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-1">
                      <span className="text-3xl font-extrabold">{displayPrice}</span>
                      <span className="text-sm text-muted-foreground ml-1">{period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 flex-1 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.missing.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${plan.ctaStyle} disabled:opacity-60`}
                  >
                    {loadingPlan === plan.id ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>4.9/5 valoración usuarios</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span>7 días de garantía</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Activa al instante</span>
            </div>
          </div>

          {/* FAQ teaser */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Preguntas?{' '}
              <button className="text-primary font-medium underline underline-offset-2">
                Escríbenos
              </button>
              {' '}— respondemos en menos de 24h
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
