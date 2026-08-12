'use client'

import { useState } from 'react'
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react'
import { useUserStore, type PlanType } from '../store/useUserStore'

interface PlanConfig {
  id: PlanType
  name: string
  price: number
  priceLabel: string
  period: string
  color: string
  badge: string
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
  PRO: {
    id: 'PRO',
    name: 'Pro',
    price: 4990,
    priceLabel: '$4.990',
    period: 'por mes',
    color: '#8b5cf6',
    badge: '⭐ PRO',
  },
  ASESORADO: {
    id: 'ASESORADO',
    name: 'Asesorado',
    price: 14990,
    priceLabel: '$14.990',
    period: 'por mes',
    color: '#f59e0b',
    badge: '👑 ASESORADO',
  },
}

type CheckoutStep = 'idle' | 'loading' | 'redirect' | 'success' | 'error'

interface MercadoPagoCheckoutProps {
  plan: PlanConfig
  onSuccess?: () => void
  onClose?: () => void
}

export default function MercadoPagoCheckout({ plan, onSuccess, onClose }: MercadoPagoCheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const activatePlan = useUserStore(s => s.activatePlan)

  const handleCheckout = async () => {
    setStep('loading')
    setError(null)

    try {
      // 1. Intentar crear preferencia vía API route (funciona en Vercel)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan.id,
          userId: useUserStore.getState().userId ?? `user_${Date.now()}`,
        }),
      })

      const data = await response.json()

      if (data.initPoint) {
        // Si el API route retornó initPoint (Vercel) → redirect
        setStep('redirect')
        await new Promise(r => setTimeout(r, 800))
        window.location.href = data.initPoint
        // Después del pago, el usuario vuelve a la app
        // El webhook actualiza el plan
        setStep('success')
        activatePlan(plan.id)
        onSuccess?.()
        return
      }

      // 2. Si no hay initPoint (static export local), mostrar instrucciones
      if (!data.initPoint && !data.mock) {
        throw new Error(data.error || 'Error desconocido')
      }

      // Mock mode: simular checkout exitoso para demo
      await new Promise(r => setTimeout(r, 2000))
      activatePlan(plan.id)
      setStep('success')
      onSuccess?.()

    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Error al procesar el pago')
      setStep('error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Plan summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600">{plan.badge}</span>
            <p className="font-bold text-gray-900 mt-0.5">NutriGuía {plan.name}</p>
            <p className="text-xs text-muted-foreground">Acceso mensual · Renovación automática</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold" style={{ color: plan.color }}>
              {plan.priceLabel}
            </p>
            <p className="text-xs text-muted-foreground">/{plan.period}</p>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Método de pago
        </p>

        {/* Mercado Pago button */}
        <button
          onClick={handleCheckout}
          disabled={step === 'loading' || step === 'success'}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {step === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Conectando con Mercado Pago...
            </>
          ) : step === 'success' ? (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ¡Activado!
            </>
          ) : (
            <>
              {/* Mercado Pago logo */}
              <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-blue-700 font-black text-[9px] leading-none">MP</span>
              </div>
              Pagar con Mercado Pago
            </>
          )}
        </button>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Pago 100% seguro · Mercado Pago encripta tus datos
        </div>
      </div>

      {/* Error state */}
      {step === 'error' && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Error en el pago</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <button
              onClick={() => setStep('idle')}
              className="text-xs text-red-700 font-semibold mt-2 underline"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Configuration needed notice */}
      {step === 'idle' && (
        <p className="text-[10px] text-center text-muted-foreground/70">
          ⚠️ Para pagos reales, configura <code className="bg-gray-100 px-1 rounded">MERCADOPAGO_ACCESS_TOKEN</code> en el archivo <code className="bg-gray-100 px-1 rounded">.env</code> y haz deploy en Vercel.
        </p>
      )}

      {/* Redirect notice */}
      {step === 'redirect' && (
        <div className="flex items-center gap-2 text-xs text-blue-600 justify-center">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Abriendo Mercado Pago...
        </div>
      )}
    </div>
  )
}
