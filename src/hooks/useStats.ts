import { useState, useEffect, useCallback } from 'react'

export interface Stats {
  todayWords: number
  todayCorrect: number
  totalDays: number
  totalWords: number
  bestStreak: number
  lastDate: string
}

const STORAGE_KEY = 'spelling-game-stats'

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    todayWords: 0,
    todayCorrect: 0,
    totalDays: 0,
    totalWords: 0,
    bestStreak: 0,
    lastDate: '',
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(loadStats)

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  const recordWord = useCallback((correct: boolean, currentStreak: number) => {
    setStats(prev => {
      const today = getTodayStr()
      const isNewDay = prev.lastDate !== today
      const todayWords = isNewDay ? 1 : prev.todayWords + 1
      const todayCorrect = isNewDay ? (correct ? 1 : 0) : prev.todayCorrect + (correct ? 1 : 0)
      const totalDays = isNewDay ? prev.totalDays + 1 : prev.totalDays

      return {
        todayWords,
        todayCorrect,
        totalDays,
        totalWords: prev.totalWords + 1,
        bestStreak: Math.max(prev.bestStreak, currentStreak),
        lastDate: today,
      }
    })
  }, [])

  const resetStats = useCallback(() => {
    const fresh: Stats = {
      todayWords: 0,
      todayCorrect: 0,
      totalDays: 0,
      totalWords: 0,
      bestStreak: 0,
      lastDate: '',
    }
    setStats(fresh)
  }, [])

  return { stats, recordWord, resetStats }
}
