'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, UserCircle } from 'lucide-react'
import GoogleSignIn from './google-signin'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  provider: 'google' | 'apple' | 'guest'
}

interface LoginModalProps {
  onLogin: (user: User) => void
  onGuest: () => void
}

export default function LoginModal({ onLogin, onGuest }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleGuest = () => {
    const id = 'guest_' + Math.random().toString(36).slice(2, 9)
    const user: User = {
      id,
      name: 'Invitado',
      email: '',
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${id}&backgroundColor=d1d4f9,b6e3f4,ffdfbf`,
      provider: 'guest',
    }
    localStorage.setItem('nutriguia_user', JSON.stringify(user))
    onGuest()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 pt-8 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-white text-2xl font-bold mb-1">NutriVibe</h1>
          <p className="text-white/70 text-sm">Tu asistente inteligente de nutrición y bienestar</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <p className="text-center text-muted-foreground text-sm mb-4">
            Crea tu cuenta gratis para guardar tu perfil y acceder a funciones Pro
          </p>

          <GoogleSignIn
            onSuccess={(user) => onLogin({
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              provider: 'google',
            })}
            onError={(err) => setError(err)}
            onGuest={handleGuest}
          />

          {error && (
            <p className="text-red-500 text-xs text-center mt-2">{error}</p>
          )}

          <p className="text-center text-muted-foreground text-xs mt-4">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="underline hover:text-primary">Términos</a> y{' '}
            <a href="#" className="underline hover:text-primary">Privacidad</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export type { User }
