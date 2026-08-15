'use client'

import { Heart } from 'lucide-react'

export default function SiteFooter() {
  return (
    <footer className="py-10 bg-muted/40 border-t border-border">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {/* Mini logo isotipo */}
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M16 2C16 2 8 6 8 14C8 17.866 11.134 21 15 21C15 21 11 22 9 26C14.5 25 18 21 18 16C18 11 21 8 21 8C21 8 24 11 24 16C24 21 20 26 16 28C16 28 17 24 15 21C18.866 21 22 17.866 22 14C22 8 16 2 16 2Z" fill="url(#footerLogoGrad)"/>
            <circle cx="16" cy="14" r="4" fill="white" fillOpacity="0.9"/>
            <circle cx="16" cy="14" r="2" fill="url(#footerLogoGrad)"/>
          </svg>
          <span className="font-display font-bold">NutriVibe</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Tu asistente inteligente de nutrición, entrenamiento y hábitos saludables. 🌿
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4 max-w-lg mx-auto">
          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Aviso importante</p>
          <p className="text-xs text-amber-700">
            NutriVibe ofrece orientación general de nutrición y bienestar, pero <strong>no reemplaza</strong> la evaluación de un profesional de salud. Ante cualquier duda médica, consulta a tu nutricionista o médico.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1 mt-4">
          Hecho con <Heart className="w-3 h-3 text-red-400 inline" /> para tu bienestar
        </p>
      </div>
    </footer>
  )
}
