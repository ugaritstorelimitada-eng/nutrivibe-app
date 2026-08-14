import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlanType = 'FREE' | 'PRO' | 'ASESORADO'

export interface UserState {
  userId: string | null
  userName: string | null
  userEmail: string | null
  provider: string | null
  isLoggedIn: boolean
  weight: number
  height: number
  age: number
  gender: 'male' | 'female' | 'other'
  avatarGlbUrl: string | null
  avatarStyle: {
    skinTone: string
    hairStyle: number
    hairColor: string
    topStyle: number
    topColor: string
    bottomColor: string
    shoeColor: string
    accessory: number
  }
  plan: PlanType
  planUpdatedAt: string | null
  dailyMessageCount: number
  lastMessageDate: string | null

  setUser: (user: { id: string; name: string; email?: string; provider?: string }) => void
  logout: () => void
  setMetrics: (weight: number, height: number, age: number) => void
  setGender: (gender: 'male' | 'female' | 'other') => void
  setAvatarUrl: (url: string | null) => void
  setAvatarStyle: (style: Partial<UserState['avatarStyle']>) => void
  setPlan: (plan: PlanType) => void
  activatePlan: (plan: PlanType) => void
  incrementMessageCount: () => void
  resetDailyCount: () => void
  getBmi: () => number
  getBmr: () => number
  getCalorieNeeds: () => number
  canSendMessage: () => boolean
  getPlanLabel: () => { name: string; color: string; badge: string }
}

const FREE_MESSAGE_LIMIT = 5

const DEFAULT_AVATAR_STYLE = {
  skinTone: '#d4a574',
  hairStyle: 1,
  hairColor: '#1f2937',
  topStyle: 0,
  topColor: '#6366f1',
  bottomColor: '#1f2937',
  shoeColor: '#1f2937',
  accessory: 0,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      userName: null,
      userEmail: null,
      provider: null,
      isLoggedIn: false,
      weight: 70,
      height: 170,
      age: 30,
      gender: 'other',
      avatarGlbUrl: null,
      avatarStyle: { ...DEFAULT_AVATAR_STYLE },
      plan: 'FREE',
      planUpdatedAt: null,
      dailyMessageCount: 0,
      lastMessageDate: null,

      setUser: (user) => {
        set({
          userId: user.id,
          userName: user.name,
          userEmail: user.email ?? null,
          provider: user.provider ?? null,
          isLoggedIn: true,
        })
        try {
          const existing = localStorage.getItem('nutriguia_user')
          const existingData = existing ? JSON.parse(existing) : {}
          localStorage.setItem('nutriguia_user', JSON.stringify({
            ...existingData,
            id: user.id,
            name: user.name,
            email: user.email,
            provider: user.provider,
            plan: get().plan,
            planUpdatedAt: get().planUpdatedAt,
            weight: get().weight,
            height: get().height,
            age: get().age,
            avatarStyle: get().avatarStyle,
            avatarGlbUrl: get().avatarGlbUrl,
          }))
        } catch {}
      },

      logout: () => {
        set({
          userId: null,
          userName: null,
          userEmail: null,
          provider: null,
          isLoggedIn: false,
          plan: 'FREE',
          planUpdatedAt: null,
          dailyMessageCount: 0,
          lastMessageDate: null,
        })
        localStorage.removeItem('nutriguia_user')
        // Also clear Zustand persist
        try { localStorage.removeItem('nutriUser') } catch {}
      },

      setMetrics: (weight, height, age) => {
        set({ weight, height, age })
        try {
          localStorage.setItem('nutriguia_body_metrics', JSON.stringify({
            weight, height, age, gender: get().gender,
          }))
        } catch {}
      },

      setGender: (gender) => set({ gender }),

      setAvatarUrl: (url) => set({ avatarGlbUrl: url }),

      setAvatarStyle: (style) =>
        set((state) => {
          const newStyle = { ...state.avatarStyle, ...style }
          try {
            localStorage.setItem('nutriguia_avatar_style', JSON.stringify(newStyle))
          } catch {}
          return { avatarStyle: newStyle }
        }),

      setPlan: (plan) => set({ plan }),

      activatePlan: (plan) => {
        set({ plan, planUpdatedAt: new Date().toISOString() })
        try {
          const user = localStorage.getItem('nutriguia_user')
          if (user) {
            const parsed = JSON.parse(user)
            parsed.plan = plan
            parsed.planUpdatedAt = new Date().toISOString()
            localStorage.setItem('nutriguia_user', JSON.stringify(parsed))
          }
        } catch {}
      },

      incrementMessageCount: () => {
        const today = new Date().toDateString()
        const { lastMessageDate, dailyMessageCount } = get()
        if (lastMessageDate !== today) {
          set({ dailyMessageCount: 1, lastMessageDate: today })
        } else {
          set({ dailyMessageCount: dailyMessageCount + 1 })
        }
      },

      resetDailyCount: () => set({ dailyMessageCount: 0, lastMessageDate: null }),

      getBmi: () => {
        const { weight, height } = get()
        const hM = height / 100
        return Number((weight / (hM * hM)).toFixed(1))
      },

      getBmr: () => {
        const { weight, height, age, gender } = get()
        if (gender === 'male') return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age)
        if (gender === 'female') return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.33 * age)
        return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age)
      },

      getCalorieNeeds: () => Math.round(get().getBmr() * 1.55),

      canSendMessage: () => {
        const { plan, dailyMessageCount, lastMessageDate } = get()
        if (plan !== 'FREE') return true
        const today = new Date().toDateString()
        if (lastMessageDate !== today) return true
        return dailyMessageCount < FREE_MESSAGE_LIMIT
      },

      getPlanLabel: () => {
        const { plan } = get()
        switch (plan) {
          case 'PRO': return { name: 'Pro', color: '#8b5cf6', badge: '⭐ PRO' }
          case 'ASESORADO': return { name: 'Asesorado', color: '#f59e0b', badge: '👑 ASESORADO' }
          default: return { name: 'Gratis', color: '#6b7280', badge: 'LIBRE' }
        }
      },
    }),
    {
      name: 'nutriUser',
      partialize: (state) => ({
        dailyMessageCount: state.dailyMessageCount,
        lastMessageDate: state.lastMessageDate,
        plan: state.plan,
        planUpdatedAt: state.planUpdatedAt,
        weight: state.weight,
        height: state.height,
        age: state.age,
        gender: state.gender,
        avatarStyle: state.avatarStyle,
      }),
    }
  )
)
