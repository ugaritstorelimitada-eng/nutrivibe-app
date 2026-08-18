'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StreakDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
  type?: 'active' | 'freeze';
  isToday?: boolean;
  isFuture?: boolean;
}

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  freezesAvailable: number;
  freezesUsedThisWeek: number;
  lastFreezeWeek: number; // ISO week number
  history: Record<string, 'active' | 'freeze'>;
  totalCheckIns: number;
  hydrationToday: number;
  lastHydrationDate: string | null;

  // Actions
  recordActivity: (activity: 'chat' | 'weight' | 'hydration' | 'checkin') => void;
  useFreeze: () => boolean;
  resetWeeklyFreeze: () => void;
  addHydration: () => void;
  getWeekDays: () => StreakDay[];
  isTodayCompleted: () => boolean;
  getStreakData: () => {
    currentStreak: number;
    longestStreak: number;
    freezesAvailable: number;
    totalCheckIns: number;
    hydrationToday: number;
  };
}

function getToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function getWeekNumber(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getDaysInRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    dates.push(local.toISOString().split('T')[0]);
  }
  return dates;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 1,
      freezesUsedThisWeek: 0,
      lastFreezeWeek: 0,
      history: {},
      totalCheckIns: 0,
      hydrationToday: 0,
      lastHydrationDate: null,

      recordActivity: (activity) => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();

        // Already completed today
        if (state.lastActiveDate === today) return;

        // Reset weekly freeze if new week
        const currentWeek = getWeekNumber();
        if (state.lastFreezeWeek !== currentWeek) {
          get().resetWeeklyFreeze();
        }

        let newStreak = state.currentStreak;

        if (state.lastActiveDate === yesterday || state.currentStreak === 0) {
          // Consecutive day
          newStreak = state.currentStreak + 1;
        } else {
          // Streak broken, start fresh
          newStreak = 1;
        }

        const newHistory = { ...state.history };
        newHistory[today] = 'active';

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastActiveDate: today,
          history: newHistory,
          totalCheckIns: state.totalCheckIns + 1,
        });
      },

      useFreeze: () => {
        const state = get();
        const currentWeek = getWeekNumber();

        if (state.lastFreezeWeek !== currentWeek) {
          get().resetWeeklyFreeze();
        }

        if (state.freezesAvailable <= 0) return false;

        const yesterday = getYesterday();
        const newHistory = { ...state.history };

        // Freeze yesterday
        if (state.lastActiveDate !== yesterday && state.currentStreak > 0) {
          newHistory[yesterday] = 'freeze';
        }

        set({
          freezesAvailable: state.freezesAvailable - 1,
          freezesUsedThisWeek: state.freezesUsedThisWeek + 1,
          lastFreezeWeek: currentWeek,
          history: newHistory,
        });

        return true;
      },

      resetWeeklyFreeze: () => {
        const state = get();
        const currentWeek = getWeekNumber();
        if (state.lastFreezeWeek !== currentWeek) {
          set({
            freezesAvailable: 1,
            freezesUsedThisWeek: 0,
            lastFreezeWeek: currentWeek,
          });
        }
      },

      addHydration: () => {
        const state = get();
        const today = getToday();

        if (state.lastHydrationDate !== today) {
          // New day, reset hydration
          set({
            hydrationToday: 1,
            lastHydrationDate: today,
          });
        } else {
          set({ hydrationToday: state.hydrationToday + 1 });
        }

        // Hydration also counts as activity
        get().recordActivity('hydration');
      },

      getWeekDays: () => {
        const state = get();
        const days = getDaysInRange(7);
        const today = getToday();

        return days.map((date) => ({
          date,
          completed: !!state.history[date],
          type: state.history[date] || undefined,
          isToday: date === today,
          isFuture: date > today,
        }));
      },

      isTodayCompleted: () => {
        const state = get();
        const today = getToday();
        return state.lastActiveDate === today;
      },

      getStreakData: () => {
        const state = get();
        return {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          freezesAvailable: state.freezesAvailable,
          totalCheckIns: state.totalCheckIns,
          hydrationToday: state.hydrationToday,
        };
      },
    }),
    {
      name: 'nutriStreak',
    }
  )
);
