'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WeightEntry {
  date: string       // YYYY-MM-DD
  weight: number     // kg
  bmi: number | null
  note?: string
}

interface WeightHistoryState {
  entries: WeightEntry[]

  addEntry: (weight: number, bmi?: number | null, note?: string) => void
  removeEntry: (date: string) => void
  getChartData: () => Array<{ date: string; label: string; weight: number; bmi: number | null }>
  getLatestWeight: () => number | null
  getWeightDelta: () => { delta: number; days: number } | null
}

export const useWeightHistoryStore = create<WeightHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (weight, bmi = null, note) => {
        const today = new Date().toISOString().split('T')[0]
        set(state => {
          const existing = state.entries.findIndex(e => e.date === today)
          if (existing >= 0) {
            // Update today's entry
            const updated = [...state.entries]
            updated[existing] = { date: today, weight, bmi, note }
            return { entries: updated }
          }
          return {
            entries: [
              ...state.entries,
              { date: today, weight, bmi, note },
            ].sort((a, b) => a.date.localeCompare(b.date)),
          }
        })
      },

      removeEntry: (date) => {
        set(state => ({ entries: state.entries.filter(e => e.date !== date) }))
      },

      getChartData: () => {
        const { entries } = get()
        return entries.map(e => {
          const d = new Date(e.date + 'T12:00:00')
          const label = d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
          return { date: e.date, label, weight: e.weight, bmi: e.bmi }
        })
      },

      getLatestWeight: () => {
        const { entries } = get()
        if (entries.length === 0) return null
        return entries[entries.length - 1].weight
      },

      getWeightDelta: () => {
        const { entries } = get()
        if (entries.length < 2) return null
        const last = entries[entries.length - 1]
        const first = entries[0]
        const days = entries.length
        return {
          delta: Number((last.weight - first.weight).toFixed(1)),
          days,
        }
      },
    }),
    { name: 'nutriWeightHistory' }
  )
)
