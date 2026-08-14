'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import HeroSection from './components/hero-section'
import ChatWidget from './components/chat-widget'
import TopicsSection from './components/topics-section'
import HealthMetrics from './components/health-metrics'
import OnboardingModal from './components/onboarding-modal'
import PricingSection from './components/pricing-section'
import LoginModal from './components/login-modal'
import SiteHeader from './components/site-header'
import SiteFooter from './components/site-footer'
import StreakWidget from './components/streak-widget'
import { useUserStore } from './store/useUserStore'
import type { UserProfile } from './components/onboarding-modal'
import type { User } from './components/login-modal'
import { useSupabaseSync } from '@/lib/supabase/useSupabaseSync'

export default function Home() {
  // Sincronizar con Supabase cuando está configurado (no-op si no hay cuenta)
  useSupabaseSync()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | undefined>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const onboardingDoneRef = useRef(false)

  // Hydrate Zustand store from localStorage on mount
  const { setUser: setStoreUser, setMetrics, setAvatarStyle, activatePlan } = useUserStore()

  useEffect(() => {
    // Verificar sesión existente
    const savedUser = localStorage.getItem('nutriguia_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        // Hydrate Zustand store
        if (parsed.id) {
          setStoreUser({ id: parsed.id, name: parsed.name || '', email: parsed.email, provider: parsed.provider })
          if (parsed.weight && parsed.height && parsed.age) {
            setMetrics(parsed.weight, parsed.height, parsed.age)
          }
          if (parsed.avatarStyle) {
            setAvatarStyle(parsed.avatarStyle)
          }
          if (parsed.plan && parsed.plan !== 'FREE') {
            activatePlan(parsed.plan)
          }
        }
      } catch {}
    }

    const hasProfile = !!localStorage.getItem('nutriguia_profile')
    const hasSeenOnboarding = !!localStorage.getItem('nutriguia_onboarding_seen')

    // Solo mostrar onboarding si nunca se ha visto
    if (!hasSeenOnboarding && !onboardingDoneRef.current) {
      onboardingDoneRef.current = true
      setTimeout(() => setShowOnboarding(true), 500)
    } else if (hasProfile) {
      try { setProfile(JSON.parse(localStorage.getItem('nutriguia_profile')!)) } catch {}
    }
  }, [setStoreUser, setMetrics, setAvatarStyle, activatePlan])

  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail
      setChatPrompt(prompt)
    }
    window.addEventListener('nutriguia-chat-prompt', handler)
    return () => window.removeEventListener('nutriguia-chat-prompt', handler)
  }, [])

  useEffect(() => {
    const handler = () => setShowOnboarding(true)
    window.addEventListener('openOnboarding', handler)
    return () => window.removeEventListener('openOnboarding', handler)
  }, [])

  const handleOnboardingComplete = useCallback((completedProfile: UserProfile) => {
    setProfile(completedProfile)
    setShowOnboarding(false)
    localStorage.setItem('nutriguia_onboarding_seen', 'true')
  }, [])

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser)
    setShowLogin(false)
    // Después de login, verificar si necesita onboarding
    const hasProfile = !!localStorage.getItem('nutriguia_profile')
    const hasSeenOnboarding = !!localStorage.getItem('nutriguia_onboarding_seen')
    if (!hasProfile && !hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 300)
    } else if (hasProfile) {
      try { setProfile(JSON.parse(localStorage.getItem('nutriguia_profile')!)) } catch {}
    }
  }, [])

  const handleGuest = useCallback(() => {
    setShowLogin(false)
    // Mostrar onboarding para invitados también
    const hasProfile = !!localStorage.getItem('nutriguia_profile')
    const hasSeenOnboarding = !!localStorage.getItem('nutriguia_onboarding_seen')
    if (!hasProfile && !hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 300)
    }
  }, [])

  const handleProfileUpdate = useCallback((updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }, [])

  return (
    <main className="min-h-screen">
      <SiteHeader user={user} />
      <HeroSection />

      <section id="chat" className="py-16 md:py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Conversa con NutriGuía
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {profile
                ? `${profile.name}, tus consejos se personalizan según tu perfil.`
                : 'Pregunta lo que quieras — es gratis.'}
            </p>
          </div>

          {/* CTA de precios inline */}
          <div className="text-center mb-4">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline underline-offset-2"
            >
              ⭐ Ver planes Pro y VIP — chat ilimitado, planes semanales y más
            </a>
          </div>

          <ChatWidget
            key={chatPrompt}
            initialPrompt={chatPrompt}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </section>

      {/* Streak widget */}
      <section className="py-8 bg-card/50">
        <div className="max-w-5xl mx-auto px-4">
          <StreakWidget />
        </div>
      </section>

      <div id="temas">
        <TopicsSection />
      </div>

      <HealthMetrics />

      {/* Plans section */}
      <PricingSection />

      <SiteFooter />

      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {showLogin && (
        <LoginModal onLogin={handleLogin} onGuest={handleGuest} />
      )}
    </main>
  )
}
