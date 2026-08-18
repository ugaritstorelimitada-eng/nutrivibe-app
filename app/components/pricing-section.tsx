'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Zap, Crown, Star, Shield } from 'lucide-react'
import { useUserStore, type PlanType } from '../store/useUserStore'
import MercadoPagoCheckout from './mercadopago-checkout'

interface PlanConfig {
  id: PlanType
  name: string
  price: number
  priceLabel: string
  period: string
  description: string
  color: string
  gradient: string
  badge: string
  features: { text: string; included: boolean }[]
  popular?: boolean
}

const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Libre',
    price: 0,
    priceLabel: '$0',
    period: 'para siempre',
    description: 'Ideal para comenzar tu camino nutricional con IA.',
    color: '#6b7280',
    gradient: 'from-gray-400 to-gray-500',
    badge: 'LIBRE',
    features: [
      { text: '5 mensajes de IA por día', included: true },
      { text: 'Avatar básico personalizable', included: true },
      { text: 'Cálculo de IMC y calorías', included: true },
      { text: 'Recomendaciones generales', included: true },
      { text: 'Mensajes ilimitados de IA', included: false },
      { text: 'Generación de planes PDF', included: false },
      { text: 'Historial ilimitado', included: false },
      { text: 'Acceso a nutricionista', included: false },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 4990,
    priceLabel: '$4.990',
    period: 'por mes',
    description: 'Potencia tu alimentación con IA ilimitada y herramientas avanzadas.',
    color: '#8b5cf6',
    gradient: 'from-indigo-500 to-violet-600',
    badge: '⭐ PRO',
    popular: true,
    features: [
      { text: 'Mensajes de IA ilimitados', included: true },
      { text: 'Avatar Pro con accesorios', included: true },
      { text: 'Cálculo de IMC y calorías', included: true },
      { text: 'Recomendaciones personalizadas', included: true },
      { text: 'Generación de planes PDF', included: true },
      { text: 'Historial de conversación ilimitado', included: true },
      { text: 'Escáner de alimentos por foto', included: false },
      { text: 'Consultas con nutricionista', included: false },
    ],
  },
  {
    id: 'ASESORADO',
    name: 'Asesorado',
    price: 14990,
    priceLabel: '$14.990',
    period: 'por mes',
    description: 'El plan completo con acceso directo a nutricionistas certificados.',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    badge: '👑 ASESORADO',
    features: [
      { text: 'Mensajes de IA ilimitados', included: true },
      { text: 'Avatar premium con ropa exclusiva', included: true },
      { text: 'Cálculo de IMC y calorías', included: true },
      { text: 'Recomendaciones del nutricionista', included: true },
      { text: 'Generación de planes PDF', included: true },
      { text: 'Historial de conversación ilimitado', included: true },
      { text: 'Escáner de alimentos por foto', included: true },
      { text: 'Consultas con nutricionista', included: true },
    ],
  },
]

function PaymentModal({
  plan,
  onClose,
}: {
  plan: PlanConfig
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{plan.badge}</span>
              <h3 className="text-xl font-bold mt-2">Activar {plan.name}</h3>
              <p className="text-white/80 text-sm mt-1">{plan.description}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
          </div>
        </div>

        {/* Checkout content */}
        <div className="p-6">
          <MercadoPagoCheckout
            plan={{
              id: plan.id,
              name: plan.name,
              price: plan.price,
              priceLabel: plan.priceLabel,
              period: plan.period,
              color: plan.color,
              badge: plan.badge,
            }}
            onSuccess={() => {
              setTimeout(onClose, 2500)
            }}
            onClose={onClose}
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <p className="text-[10px] text-center text-muted-foreground/70">
            Al activar, aceptas los Términos de Servicio. Puedes cancelar en cualquier momento desde tu cuenta.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PlanCard({ plan, isCurrentPlan }: { plan: PlanConfig; isCurrentPlan: boolean }) {
  const [showModal, setShowModal] = useState(false)
  const currentPlan = useUserStore(s => s.plan)

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        className={`relative bg-white rounded-3xl border-2 transition-all ${
          plan.popular
            ? 'border-indigo-300 shadow-xl shadow-indigo-100/50'
            : 'border-gray-100 shadow-sm hover:shadow-md'
        }`}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            ⭐ Más popular
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-5">
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
              style={{
                background: `${plan.color}15`,
                color: plan.color,
              }}
            >
              {plan.badge}
            </span>
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold" style={{ color: plan.color }}>
                {plan.priceLabel}
              </span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
          </div>

          {/* Features */}
          <div className="space-y-2.5 mb-6">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {feature.included ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isCurrentPlan ? (
            <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
              Plan activo ✓
            </div>
          ) : plan.id === 'FREE' ? (
            <button className="hover-press w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
              Plan actual
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className={`hover-press w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 bg-gradient-to-r ${plan.gradient}`}
            >
              Activar {plan.name}
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <PaymentModal plan={plan} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  )
}

export default function PricingSection() {
  const currentPlan = useUserStore(s => s.plan)

  return (
    <section id="precios" className="py-16 bg-gradient-to-b from-indigo-50/30 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            Planes simples y transparentes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Elige tu plan nutricional
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sin letra pequeña. Cancela cuando quieras. Paga de forma segura con Mercado Pago.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PlanCard plan={plan} isCurrentPlan={currentPlan === plan.id} />
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Pago 100% seguro
          </span>
          <span>·</span>
          <span>Cancela cuando quieras</span>
          <span>·</span>
          <span>Mercado Pago / Stripe</span>
          <span>·</span>
          <span>Soporte en Chile</span>
        </motion.div>
      </div>
    </section>
  )
}
