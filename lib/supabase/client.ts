/**
 * NutriGuía — Supabase Client
 *
 * Usa supabase-js v2 con persist session en localStorage.
 * El usuario se autentica con Google OAuth de Supabase Auth.
 *
 * Setup:
 * 1. Crea proyecto en supabase.com
 * 2. Ejecuta lib/supabase/schema.sql
 * 3. Habilita Google OAuth en Authentication → Providers → Google
 * 4. Agrega env vars en Vercel:
 *    NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Cliente con sesión persistente en localStorage (para Google OAuth)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: 'nutriguia-supabase-session',
          autoRefreshToken: true,
        },
      })
    : null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// ─── Tipo de perfil ─────────────────────────────────────────────────────────
export interface SupabaseUserProfile {
  id: string
  email: string | null
  name: string | null
  provider: string | null
  weight: number
  height: number
  age: number
  gender: string
  primary_goal: string | null
  allergies: string[]
  restrictions: string[]
  cooking_level: string | null
  budget: string | null
  goals: string[]
  daily_calories: number | null
  daily_water: number
  avatar_style: Record<string, unknown>
  plan: 'FREE' | 'PRO' | 'ASESORADO'
  plan_updated_at: string | null
  daily_message_count: number
  last_message_date: string | null
  created_at: string
}

export interface SupabaseStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  freezes_available: number
  freezes_used_this_week: number
  last_freeze_week: number
  history: Record<string, 'active' | 'freeze'>
  total_check_ins: number
  hydration_today: number
  last_hydration_date: string | null
}

export interface SupabaseWeightEntry {
  id: string
  user_id: string
  weight: number
  bmi: number | null
  recorded_at: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Iniciar sesión con Google via Supabase Auth */
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase no configurado')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

/** Cerrar sesión */
export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

// ─── Perfil ─────────────────────────────────────────────────────────────────

/** Obtener perfil del usuario logueado */
export async function getProfile(userId: string): Promise<SupabaseUserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as SupabaseUserProfile
}

/** Actualizar perfil */
export async function upsertProfile(
  userId: string,
  profile: Partial<SupabaseUserProfile>
): Promise<void> {
  if (!supabase) return
  await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
}

/** Actualizar contador de mensajes (incrementa +1) */
export async function incrementMessageCount(userId: string): Promise<void> {
  if (!supabase) return
  const today = new Date().toISOString().split('T')[0]
  // Upsert atómico: si today != last_message_date → reset a 1, si no → +1
  await supabase.rpc('increment_message_count', { user_uuid: userId })
}

/** Activar plan */
export async function activatePlan(
  userId: string,
  plan: 'PRO' | 'ASESORADO'
): Promise<void> {
  if (!supabase) return
  await supabase
    .from('user_profiles')
    .update({
      plan,
      plan_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}

// ─── Rachas ─────────────────────────────────────────────────────────────────

/** Obtener streak del usuario */
export async function getStreak(userId: string): Promise<SupabaseStreak | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as unknown as SupabaseStreak
}

/** Guardar streak */
export async function upsertStreak(
  userId: string,
  streak: Partial<SupabaseStreak>
): Promise<void> {
  if (!supabase) return
  await supabase
    .from('streaks')
    .upsert({ user_id: userId, ...streak, updated_at: new Date().toISOString() })
}

// ─── Peso ───────────────────────────────────────────────────────────────────

/** Obtener historial de peso */
export async function getWeightHistory(
  userId: string
): Promise<SupabaseWeightEntry[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true })
  return (data ?? []) as SupabaseWeightEntry[]
}

/** Agregar entrada de peso */
export async function addWeightEntry(
  userId: string,
  weight: number,
  bmi?: number
): Promise<void> {
  if (!supabase) return
  await supabase.from('weight_history').insert({
    user_id: userId,
    weight,
    bmi: bmi ?? null,
  })
}

/** Eliminar entrada de peso */
export async function deleteWeightEntry(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('weight_history').delete().eq('id', id)
}
