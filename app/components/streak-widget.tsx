'use client';

import { useEffect, useState } from 'react';
import { useStreakStore } from '@/app/store/useStreakStore';
import { Trophy, Droplets, Snowflake } from 'lucide-react';

const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

function getDayNumber(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.getDate().toString();
}

// eslint-disable-next-line import/no-default-export
export default function StreakWidget() {
  const {
    currentStreak,
    longestStreak,
    freezesAvailable,
    hydrationToday,
    getWeekDays,
    isTodayCompleted,
    addHydration,
    useFreeze,
  } = useStreakStore();

  const [showFreezeUsed, setShowFreezeUsed] = useState(false);
  const [showHydrationToast, setShowHydrationToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const weekDays = getWeekDays();
  const todayDone = isTodayCompleted();

  const handleHydration = () => {
    addHydration();
    setShowHydrationToast(true);
    setTimeout(() => setShowHydrationToast(false), 2000);
  };

  const handleFreeze = () => {
    if (useFreeze()) {
      setShowFreezeUsed(true);
      setTimeout(() => setShowFreezeUsed(false), 3000);
    }
  };

  // Milestone badges
  const milestones = {
    3: 'Tip exclusivo',
    7: 'Ropa nueva',
    14: '+1 freeze',
    30: 'Badge Constante',
  };

  const nextMilestone = Object.keys(milestones)
    .map(Number)
    .sort((a, b) => a - b)
    .find((m) => m > currentStreak);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
        <div className="w-16 h-16 rounded-xl bg-orange-500/20 animate-pulse" />
        <div className="space-y-2">
          <div className="w-24 h-6 bg-gray-700/50 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-700/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Title */}
      <div className="text-center mb-3">
        <h3 className="font-display text-lg font-bold" style={{ background: 'linear-gradient(135deg, #10b981, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          VibeStreak 🔥
        </h3>
      </div>
      {/* Hydration toast */}
      {showHydrationToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium shadow-lg animate-bounce">
          💧 ¡+1 vaso registrado!
        </div>
      )}

      {/* Freeze used toast */}
      {showFreezeUsed && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium shadow-lg animate-bounce">
          ❄️ ¡Freeze activado! Tu racha está a salvo.
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
        {/* Fire streak */}
        <div className="flex items-center gap-3">
          <div className={`text-4xl transition-transform ${todayDone ? 'animate-pulse' : ''}`}>
            🔥
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{currentStreak}</span>
              <span className="text-sm text-orange-300">días</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Trophy className="w-3 h-3" />
              <span>Récord: {longestStreak}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-orange-500/20" />

        {/* Week calendar */}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            {weekDays.map((day, i) => (
              <div key={day.date} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-gray-500 uppercase">{getDayName(day.date)}</span>
                <div
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium
                    transition-all duration-300
                    ${day.isFuture ? 'bg-gray-800/50 text-gray-600' : ''}
                    ${day.completed && day.type === 'active' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : ''}
                    ${day.completed && day.type === 'freeze' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : ''}
                    ${!day.completed && !day.isFuture ? 'bg-gray-700/50 text-gray-500' : ''}
                    ${day.isToday && !day.completed ? 'ring-2 ring-orange-400 ring-dashed animate-pulse' : ''}
                  `}
                  title={day.date}
                >
                  {day.completed && day.type === 'active' ? '🔥' : ''}
                  {day.completed && day.type === 'freeze' ? '❄️' : ''}
                  {!day.completed && !day.isFuture ? getDayNumber(day.date) : ''}
                  {day.isFuture ? getDayNumber(day.date) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Hydration */}
          <button
            onClick={handleHydration}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-cyan-500/20 transition-colors group"
            title="Registrar vaso de agua"
          >
            <Droplets className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] text-cyan-400 font-medium">{hydrationToday}</span>
          </button>

          {/* Freeze */}
          {freezesAvailable > 0 ? (
            <button
              onClick={handleFreeze}
              className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-blue-500/20 transition-colors group"
              title="Usar freeze"
            >
              <Snowflake className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-blue-400 font-medium">{freezesAvailable}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-0.5 p-2 opacity-40" title="Sin freezes disponibles">
              <Snowflake className="w-5 h-5 text-gray-500" />
              <span className="text-[10px] text-gray-500">0</span>
            </div>
          )}
        </div>
      </div>

      {/* Next milestone hint */}
      {nextMilestone && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-400/70">
          <span>🎯</span>
          <span>
            A {nextMilestone - currentStreak} días: {milestones[nextMilestone as keyof typeof milestones]}
          </span>
        </div>
      )}
    </div>
  );
}
