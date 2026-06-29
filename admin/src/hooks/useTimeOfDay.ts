import { useState, useEffect } from 'react';

export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';

export function useTimeOfDay() {
  const getTime = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8)   return 'dawn';
    if (hour >= 8 && hour < 17)  return 'day';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'night';
  };

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTime());

  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  return timeOfDay;
}

export const timeThemes = {
  dawn: {
    bg: 'from-indigo-900 via-purple-800 to-orange-400',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    text: 'text-orange-100',
    subtext: 'text-orange-200/70',
    accent: 'text-orange-300',
    accentBg: 'bg-orange-400/20 border-orange-300/30',
    button: 'from-orange-500 to-pink-500',
    inputBg: 'bg-white/10 border-white/20 text-white placeholder-white/40',
    label: 'Dawn',
    emoji: '🌅',
  },
  day: {
    bg: 'from-sky-400 via-blue-400 to-cyan-300',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/40',
    text: 'text-blue-900',
    subtext: 'text-blue-800/70',
    accent: 'text-blue-700',
    accentBg: 'bg-yellow-400/20 border-yellow-400/40',
    button: 'from-blue-600 to-cyan-500',
    inputBg: 'bg-white/30 border-white/40 text-blue-900 placeholder-blue-800/50',
    label: 'Day',
    emoji: '☀️',
  },
  sunset: {
    bg: 'from-orange-900 via-red-700 to-orange-400',
    glass: 'bg-white/10 backdrop-blur-xl border border-orange-200/20',
    text: 'text-orange-50',
    subtext: 'text-orange-200/70',
    accent: 'text-yellow-300',
    accentBg: 'bg-orange-400/20 border-orange-300/30',
    button: 'from-orange-500 to-red-500',
    inputBg: 'bg-white/10 border-orange-200/20 text-orange-50 placeholder-orange-200/40',
    label: 'Sunset',
    emoji: '🌇',
  },
  night: {
    bg: 'from-slate-950 via-indigo-950 to-slate-900',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    text: 'text-slate-100',
    subtext: 'text-slate-400',
    accent: 'text-indigo-300',
    accentBg: 'bg-indigo-500/20 border-indigo-400/30',
    button: 'from-indigo-600 to-purple-600',
    inputBg: 'bg-white/5 border-white/10 text-slate-200 placeholder-slate-500',
    label: 'Night',
    emoji: '🌙',
  },
};
