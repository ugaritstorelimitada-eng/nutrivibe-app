'use client'

import { Leaf, Stethoscope, LogOut, Zap, Crown, Star } from 'lucide-react'
import type { User as LoginUser } from './login-modal'
import { useState, useEffect } from 'react'
import { useUserStore } from '../store/useUserStore'

interface SiteHeaderProps {
  user?: LoginUser | null
}

const PLAN_BADGES: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  FREE: { icon: <Star className="w-3 h-3" />, label: 'Libre', color: 'text-gray-600', bg: 'bg-gray-100' },
  PRO: { icon: <Zap className="w-3 h-3" />, label: 'Pro', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ASESORADO: { icon: <Crown className="w-3 h-3" />, label: 'Asesorado', color: 'text-amber-600', bg: 'bg-amber-100' },
}

export default function SiteHeader({ user }: SiteHeaderProps) {
  const [localUser, setLocalUser] = useState<LoginUser | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const plan = useUserStore(s => s.plan)

  useEffect(() => {
    const saved = localStorage.getItem('nutriguia_user')
    if (saved) {
      try { setLocalUser(JSON.parse(saved)) } catch {}
    }
  }, [user])

  const handleLogout = () => {
    const logout = useUserStore.getState().logout
    localStorage.removeItem('nutriguia_user')
    localStorage.removeItem('nutriguia_profile')
    localStorage.removeItem('nutriguia_onboarding_seen')
    localStorage.removeItem('nutriguia_messages_used')
    localStorage.removeItem('nutriguia_messages_date')
    logout()
    window.location.reload()
  }

  const displayUser = user || localUser

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg">NutriGuía</span>
        </div>
        <nav className="flex items-center gap-1">
          <a href="#chat" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Chat
          </a>
          <a href="#temas" className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Temas
          </a>
          {displayUser && displayUser.provider !== 'guest' && (
            <a
              href="/nutricionista"
              target="_blank"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
              title="Panel para nutricionistas"
            >
              <Stethoscope className="w-4 h-4" />
              <span className="hidden sm:inline">Panel Pro</span>
            </a>
          )}

          {/* User avatar */}
          {displayUser && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors flex items-center justify-center"
                title={displayUser.name}
              >
                {displayUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `<span class="text-xs font-bold text-primary">${displayUser.name.charAt(0).toUpperCase()}</span>`
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">{displayUser.name.charAt(0).toUpperCase()}</span>
                )}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border p-1 z-50">
                  <div className="px-3 py-2 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {displayUser.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                          {displayUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{displayUser.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${PLAN_BADGES[plan].bg} ${PLAN_BADGES[plan].color}`}>
                          {PLAN_BADGES[plan].icon}
                          {PLAN_BADGES[plan].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {plan === 'FREE' && (
                    <a
                      href="#precios"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg mx-1 mb-1 font-semibold"
                    >
                      <Zap className="w-4 h-4" />
                      Actualizar a Pro
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
