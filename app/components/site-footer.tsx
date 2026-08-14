'use client'

import { Leaf, Heart } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="py-10 bg-muted/40 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="font-display font-bold">NutriGuía</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Cada pequeño cambio en tu alimentación es un gran paso hacia una vida más saludable. 🌿
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4 max-w-lg mx-auto">
          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Aviso importante</p>
          <p className="text-xs text-amber-700">
            NutriGuía ofrece orientación general de nutrición, pero <strong>no reemplaza</strong> la evaluación de un profesional de salud. Ante cualquier duda médica, consulta a tu nutricionista o médico.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1 mt-4">
          Hecho con <Heart className="w-3 h-3 text-red-400 inline" /> para tu bienestar
        </p>
      </div>
    </footer>
  )
}
