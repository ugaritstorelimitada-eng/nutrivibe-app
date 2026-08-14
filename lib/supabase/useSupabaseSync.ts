/**
 * useSupabaseSync
 *
 * Hook que sincroniza Zustand (localStorage) ↔ Supabase cuando el usuario está logueado.
 * Si Supabase no está configurado, el app sigue funcionando con localStorage normalmente.
 *
 * Flujo:
 * 1. On mount: obtener sesión de Supabase
 * 2. Si hay sesión activa: cargar perfil/streak/peso desde Supabase → Zustand
 * 3. Escuchar cambios de auth (login/logout)
 * 4. Para writes: siempre escribir a Zustand + Supabase en paralelo
 */

'use client'

import { useEffect, useRef } from 'react'
import {
  supabase,
  isSupabaseConfigured,
  getProfile,
  getStreak,
  getWeightHistory,
  signInWithGoogle,
  signOut as supabaseSignOut,
  type SupabaseUserProfile,
} from './client'
import { useUserStore } from '@/app/store/useUserStore'
import { useStreakStore } from '@/app/store/useStreakStore'
import { useWeightHistoryStore } from '@/app/store/useWeightHistoryStore'

// ─── Hydrate Zustand from Supabase ─────────────────────────────────────────

async function syncFromSupabase(userId: string) {
  if (!isSupabaseConfigured) return

  // Perfil → useUserStore
  const profile = await getProfile(userId)
  if (profile) {
    const store = useUserStore.getState()
    store.setUser({ id: profile.id, name: profile.name ?? '', email: profile.email ?? undefined, provider: profile.provider ?? undefined })
    store.setMetrics(profile.weight, profile.height, profile.age)
    store.setGender(profile.gender as 'male' | 'female' | 'other')
    store.setAvatarStyle(profile.avatar_style as any)
    if (profile.plan !== 'FREE') {
      store.activatePlan(profile.plan)
    }
    // Restaurar contador de mensajes
    if (profile.last_message_date === new Date().toISOString().split('T')[0]) {
      useUserStore.setState({ dailyMessageCount: profile.daily_message_count, lastMessageDate: profile.last_message_date })
    }
  }

  // Streak → useStreakStore
  const streak = await getStreak(userId)
  if (streak) {
    useStreakStore.setState({
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      lastActiveDate: streak.last_active_date,
      freezesAvailable: streak.freezes_available,
      freezesUsedThisWeek: streak.freezes_used_this_week,
      lastFreezeWeek: streak.last_freeze_week,
      history: streak.history ?? {},
      totalCheckIns: streak.total_check_ins,
      hydrationToday: streak.hydration_today,
      lastHydrationDate: streak.last_hydration_date,
    })
  }

  // Peso → useWeightHistoryStore
  const weightEntries = await getWeightHistory(userId)
  if (weightEntries.length > 0) {
    useWeightHistoryStore.setState({
      entries: weightEntries.map(e => ({
        id: e.id,
        date: e.recorded_at,
        weight: e.weight,
        bmi: e.bmi ?? null,
      })),
    })
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSupabaseSync() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (session?.user) {
        await syncFromSupabase(session.user.id)

        // Guardar en localStorage también para guest/sin Supabase
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
          email: session.user.email ?? '',
          avatar: session.user.user_metadata?.avatar_url ?? '',
          provider: 'google',
        }
        localStorage.setItem('nutriguia_user', JSON.stringify(userData))
      }
    }

    init()

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncFromSupabase(session.user.id)

        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'Usuario',
          email: session.user.email ?? '',
          avatar: session.user.user_metadata?.avatar_url ?? '',
          provider: 'google',
        }
        localStorage.setItem('nutriguia_user', JSON.stringify(userData))
      }

      if (event === 'SIGNED_OUT') {
        // Limpiar localStorage de sesión pero mantener plan (para modo demo)
        localStorage.removeItem('nutriguia_user')
        localStorage.removeItem('nutriUser')
      }
    })

    return () => subscription.unsubscribe()
  }, [])
}

// ─── Auth helpers exportadas ────────────────────────────────────────────────

export { signInWithGoogle, supabaseSignOut as signOutFromSupabase }
