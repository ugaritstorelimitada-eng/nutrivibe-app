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
        <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
          Hecho con <Heart className="w-3 h-3 text-red-400 inline" /> para tu bienestar
        </p>
      </div>
    </footer>
  )
}
