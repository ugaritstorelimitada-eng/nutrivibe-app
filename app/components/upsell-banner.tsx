'use client'

import { motion } from 'framer-motion'
import { Crown, Lock, Zap } from 'lucide-react'
import { useUserStore } from '../store/useUserStore'

export default function UpsellBanner({ feature }: { feature: string }) {
  const plan = useUserStore(s => s.plan)
  const planLabel = useUserStore(s => s.getPlanLabel)

  if (plan !== 'FREE') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4"
    >
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-0.5">
              {feature} es exclusivo para Pro
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Actualiza tu plan para mensajes ilimitados y funciones avanzadas.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="#precios"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow hover:shadow-lg transition-shadow"
              >
                <Zap className="w-3.5 h-3.5" />
                Ver planes desde $4.990
              </a>
              <span className="text-[10px] text-muted-foreground">Cancela cuando quieras</span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-amber-200/30" />
        <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-orange-200/20" />
      </div>
    </motion.div>
  )
}
