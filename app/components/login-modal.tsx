'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, UserCircle } from 'lucide-react'

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
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading('google')
    setError(null)

    await new Promise(r => setTimeout(r, 1200))

    const id = 'google_' + Math.random().toString(36).slice(2, 9)
    const user: User = {
      id,
      name: 'Usuario Google',
      email: 'usuario@gmail.com',
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${id}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      provider: 'google',
    }

    localStorage.setItem('nutriguia_user', JSON.stringify(user))
    setLoading(null)
    onLogin(user)
  }

  const handleAppleLogin = async () => {
    setLoading('apple')
    setError(null)

    await new Promise(r => setTimeout(r, 1200))

    const id = 'apple_' + Math.random().toString(36).slice(2, 9)
    const user: User = {
      id,
      name: 'Usuario Apple',
      email: 'usuario@icloud.com',
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${id}&backgroundColor=ffd5dc,ffdfbf,c0aede`,
      provider: 'apple',
    }

    localStorage.setItem('nutriguia_user', JSON.stringify(user))
    setLoading(null)
    onLogin(user)
  }

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
          <h1 className="text-white text-2xl font-bold mb-1">NutriGuía</h1>
          <p className="text-white/70 text-sm">Tu asistente nutricional inteligente</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <p className="text-center text-muted-foreground text-sm mb-4">
            Crea tu cuenta gratis para guardar tu perfil y acceder a funciones Pro
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-semibold text-gray-700 disabled:opacity-60"
          >
            {loading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading === 'google' ? 'Conectando...' : 'Continuar con Google'}
          </button>

          {/* Apple */}
          <button
            onClick={handleAppleLogin}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black hover:bg-gray-800 transition-all text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading === 'apple' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )}
            {loading === 'apple' ? 'Conectando...' : 'Continuar con Apple'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Guest */}
          <button
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <UserCircle className="w-5 h-5" />
            Usar como invitado
          </button>

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
