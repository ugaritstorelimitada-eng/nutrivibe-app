'use client'

import { useState, useEffect, useRef } from 'react'
import { Leaf, Stethoscope, LogOut, Zap, Crown, Star, ChevronDown, User, UserCircle, BarChart, MessageSquare, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User as LoginUser } from './login-modal'
import { useUserStore } from '../store/useUserStore'
import GoogleSignIn from './google-signin'
import { signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase/client'

interface SiteHeaderProps {
  user?: LoginUser | null
  onShowLogin?: () => void
}

const PLAN_BADGES: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  FREE: { icon: <Star className="w-3 h-3" />, label: 'Plan Libre', color: 'text-gray-600', bg: 'bg-gray-100' },
  PRO: { icon: <Zap className="w-3 h-3" />, label: 'Plan Pro', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ASESORADO: { icon: <Crown className="w-3 h-3" />, label: 'Plan VIP', color: 'text-amber-600', bg: 'bg-amber-100' },
}

// ─── Login dropdown (no user) ────────────────────────────────────────────────
function LoginDropdown({ onClose }: { onClose: () => void }) {
  const [showGoogle, setShowGoogle] = useState(false)
  const onLogin = () => { onClose() }

  return (
    <>
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Iniciar sesión</p>
      </div>

      {showGoogle ? (
        <div className="p-3">
          <GoogleSignIn
            onSuccess={(u) => {
              onLogin()
              window.location.reload()
            }}
            onError={(err) => console.error(err)}
          />
          <button onClick={() => setShowGoogle(false)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
            ← Volver
          </button>
        </div>
      ) : (
        <div className="p-1">
          <button
            onClick={async () => {
              if (isSupabaseConfigured) {
                try {
                  await signInWithGoogle()
                } catch (err) {
                  console.error('Supabase sign in error:', err)
                  setShowGoogle(true)
                }
              } else {
                setShowGoogle(true)
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Continuar con Google</p>
              <p className="text-xs text-gray-400">Rápido y seguro</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose()
              // TODO: Apple Sign-In
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
                <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Continuar con Apple</p>
              <p className="text-xs text-gray-400">Privacidad garantizada</p>
            </div>
          </button>

          <div className="h-px bg-gray-100 my-1" />

          <button
            onClick={() => {
              const guestUser: LoginUser = {
                id: 'guest_' + Math.random().toString(36).slice(2, 9),
                name: 'Invitado',
                email: '',
                avatar: '',
                provider: 'guest',
              }
              localStorage.setItem('nutriguia_user', JSON.stringify(guestUser))
              onClose()
              window.location.reload()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
          >
            <UserCircle className="w-5 h-5 text-gray-400" />
            <div className="text-left">
              <p className="font-medium text-gray-700">Usar como invitado</p>
              <p className="text-xs text-gray-400">Sin registro, rápido</p>
            </div>
          </button>

          <button
            onClick={() => {
              setShowGoogle(true)
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-primary">Crear cuenta</p>
              <p className="text-xs text-gray-400">Perfil + historial + Pro</p>
            </div>
          </button>
        </div>
      )}
    </>
  )
}

// ─── User dropdown (logged in) ────────────────────────────────────────────────
function UserDropdown({ displayUser, plan, onClose }: {
  displayUser: LoginUser
  plan: string
  onClose: () => void
}) {
  const handleLogout = () => {
    const logout = useUserStore.getState().logout
    localStorage.removeItem('nutriguia_user')
    localStorage.removeItem('nutriguia_profile')
    localStorage.removeItem('nutriguia_onboarding_seen')
    localStorage.removeItem('nutriguia_messages_used')
    localStorage.removeItem('nutriguia_messages_date')
    logout()
    onClose()
    window.location.reload()
  }

  const firstName = displayUser.name.split(' ')[0]

  return (
    <div className="p-1">
      {/* User info header */}
      <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
            {displayUser.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">{firstName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayUser.name}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_BADGES[plan]?.bg ?? 'bg-gray-100'} ${PLAN_BADGES[plan]?.color ?? 'text-gray-600'}`}>
              {PLAN_BADGES[plan]?.icon}
              {PLAN_BADGES[plan]?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={() => { window.dispatchEvent(new CustomEvent('openOnboarding')); onClose() }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors text-left"
      >
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">Mi perfil</span>
      </button>

      <button
        onClick={() => { document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' }); onClose() }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors text-left"
      >
        <BarChart className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">Mi progreso</span>
      </button>

      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors text-left"
      >
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">Historial de chat</span>
        <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Próx.</span>
      </button>

      {plan === 'FREE' && (
        <>
          <div className="h-px bg-gray-100 my-1" />
          <a
            href="#precios"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg mx-1 mb-1 font-semibold"
          >
            <Zap className="w-4 h-4" />
            <span>Mejorar a Pro</span>
          </a>
        </>
      )}

      {plan === 'ASESORADO' && (
        <a
          href="/nutricionista"
          target="_blank"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-amber-50 rounded-lg transition-colors text-left text-amber-700"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Panel del nutricionista</span>
          <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
        </a>
      )}

      <div className="h-px bg-gray-100 my-1" />

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}

// ─── Main header ───────────────────────────────────────────────────────────────
export default function SiteHeader({ user }: SiteHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [localUser, setLocalUser] = useState<LoginUser | null>(null)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const plan = useUserStore(s => s.plan)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const saved = localStorage.getItem('nutriguia_user')
    if (saved) {
      try { setLocalUser(JSON.parse(saved)) } catch {}
    }
  }, [user])

  // Close on outside click
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const displayUser = user || localUser

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg">NutriGuía</span>
        </div>

        {/* Nav + Account */}
        <div className="flex items-center gap-1">
          <a href="#chat" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Chat
          </a>
          <a href="#temas" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Temas
          </a>

          {/* Account button */}
          <div className="relative ml-1" ref={menuRef}>
            {displayUser && mounted ? (
              // Logged in — avatar + name + chevron
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {displayUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">
                      {displayUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden sm:inline">
                  {displayUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>
            ) : mounted ? (
              // Not logged in
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            ) : null}

            {/* Dropdown */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                >
                  {displayUser && mounted
                    ? <UserDropdown displayUser={displayUser} plan={plan} onClose={() => setShowMenu(false)} />
                    : mounted
                    ? <LoginDropdown onClose={() => setShowMenu(false)} />
                    : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
