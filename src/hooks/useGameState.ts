import { useState, useCallback, useRef } from 'react'
import type { Word } from '@/data/words'
import {
  scrambleLetters,
  calculateFeedback,
  calculateScore,
  getWordsForLevel,
  LEVELS,
  type Feedback,
  type LevelConfig,
} from '@/lib/game'

export type Phase = 'welcome' | 'playing' | 'feedback' | 'levelComplete'

export interface GameState {
  phase: Phase
  score: number
  streak: number
  bestStreak: number
  currentLevel: number
  currentWordIndex: number
  selectedLetters: (number | null)[]
  feedback: Feedback[] | null
  feedbackCorrect: boolean | null
  words: Word[]
  scrambled: string[]
  currentWord: Word | null
  hintsUsed: number
  maxHints: number
  startTime: number
  selectedGrades: string[]
}

function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)]
}

export function useGameState() {
  const [state, setState] = useState<GameState>({
    phase: 'welcome',
    score: 0,
    streak: 0,
    bestStreak: 0,
    currentLevel: 1,
    currentWordIndex: 0,
    selectedLetters: [],
    feedback: null,
    feedbackCorrect: null,
    words: [],
    scrambled: [],
    currentWord: null,
    hintsUsed: 0,
    maxHints: 3,
    startTime: 0,
    selectedGrades: [],
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const startGame = useCallback((allWords: Word[], grades: string[]) => {
    const filtered = grades.length > 0 ? allWords.filter(w => grades.includes(w.grade)) : [...allWords]
    const config = getLevelConfig(1)
    const words = getWordsForLevel(filtered, config)

    if (words.length === 0) return

    const word = words[0]
    const scrambled = scrambleLetters(word.word)

    setState({
      phase: 'playing',
      score: 0,
      streak: 0,
      bestStreak: 0,
      currentLevel: 1,
      currentWordIndex: 0,
      selectedLetters: new Array(word.word.length).fill(null),
      feedback: null,
      feedbackCorrect: null,
      words,
      scrambled,
      currentWord: word,
      hintsUsed: 0,
      maxHints: config.maxHints,
      startTime: Date.now(),
      selectedGrades: grades,
    })
  }, [])

  const selectLetter = useCallback((poolIndex: number) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev

      const emptyIdx = prev.selectedLetters.indexOf(null)
      if (emptyIdx === -1) return prev

      // Check if already selected
      if (prev.selectedLetters.includes(poolIndex)) return prev

      const newSelected = [...prev.selectedLetters]
      newSelected[emptyIdx] = poolIndex

      return { ...prev, selectedLetters: newSelected }
    })
  }, [])

  const deselectLetter = useCallback((slotIndex: number) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev
      if (prev.selectedLetters[slotIndex] === null) return prev

      const newSelected = [...prev.selectedLetters]
      newSelected[slotIndex] = null

      // Compact: shift remaining left
      const compacted: (number | null)[] = newSelected.filter(x => x !== null)
      while (compacted.length < newSelected.length) {
        compacted.push(null)
      }

      return { ...prev, selectedLetters: compacted }
    })
  }, [])

  const clearAll = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.currentWord) return prev
      return {
        ...prev,
        selectedLetters: new Array(prev.currentWord.word.length).fill(null),
      }
    })
  }, [])

  const submitAnswer = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.currentWord) return prev
      if (prev.selectedLetters.includes(null)) return prev

      const guess = prev.selectedLetters
        .map(idx => (idx !== null ? prev.scrambled[idx] : ''))
        .join('')
      const target = prev.currentWord.word
      const fb = calculateFeedback(guess, target)
      const isCorrect = guess === target

      return {
        ...prev,
        phase: 'feedback' as Phase,
        feedback: fb,
        feedbackCorrect: isCorrect,
      }
    })
  }, [])

  const nextWord = useCallback(() => {
    setState(prev => {
      if (!prev.currentWord) return prev

      const isCorrect = prev.feedbackCorrect === true
      const timeTaken = Date.now() - prev.startTime
      const newStreak = isCorrect ? prev.streak + 1 : 0
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      const points = isCorrect ? calculateScore(newStreak, timeTaken, prev.hintsUsed > 0) : -2
      const newScore = Math.max(0, prev.score + points)
      const nextIdx = prev.currentWordIndex + 1
      const config = getLevelConfig(prev.currentLevel)

      // Level complete?
      if (nextIdx >= prev.words.length) {
        return {
          ...prev,
          phase: 'levelComplete' as Phase,
          score: newScore,
          streak: newStreak,
          bestStreak: newBestStreak,
        }
      }

      const word = prev.words[nextIdx]
      const scrambled = scrambleLetters(word.word)

      return {
        ...prev,
        phase: 'playing' as Phase,
        score: newScore,
        streak: newStreak,
        bestStreak: newBestStreak,
        currentWordIndex: nextIdx,
        selectedLetters: new Array(word.word.length).fill(null),
        feedback: null,
        feedbackCorrect: null,
        scrambled,
        currentWord: word,
        hintsUsed: 0,
        maxHints: config.maxHints,
        startTime: Date.now(),
      }
    })
  }, [])

  const nextLevel = useCallback((allWords: Word[]) => {
    setState(prev => {
      const newLevel = prev.currentLevel + 1
      const filtered = prev.selectedGrades.length > 0
        ? allWords.filter(w => prev.selectedGrades.includes(w.grade))
        : [...allWords]
      const config = getLevelConfig(newLevel)
      const words = getWordsForLevel(filtered, config)

      if (words.length === 0) {
        // Not enough words for next level, replay with shuffled
        const fallbackConfig = getLevelConfig(prev.currentLevel)
        const fallbackWords = getWordsForLevel(filtered, fallbackConfig)
        if (fallbackWords.length === 0) return prev

        const word = fallbackWords[0]
        return {
          ...prev,
          phase: 'playing' as Phase,
          currentLevel: prev.currentLevel,
          currentWordIndex: 0,
          selectedLetters: new Array(word.word.length).fill(null),
          feedback: null,
          feedbackCorrect: null,
          words: fallbackWords,
          scrambled: scrambleLetters(word.word),
          currentWord: word,
          hintsUsed: 0,
          maxHints: fallbackConfig.maxHints,
          startTime: Date.now(),
        }
      }

      const word = words[0]
      return {
        ...prev,
        phase: 'playing' as Phase,
        currentLevel: newLevel,
        currentWordIndex: 0,
        selectedLetters: new Array(word.word.length).fill(null),
        feedback: null,
        feedbackCorrect: null,
        words,
        scrambled: scrambleLetters(word.word),
        currentWord: word,
        hintsUsed: 0,
        maxHints: config.maxHints,
        startTime: Date.now(),
      }
    })
  }, [])

  const useHint = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing' || !prev.currentWord) return prev
      if (prev.hintsUsed >= prev.maxHints) return prev

      const target = prev.currentWord.word
      const newSelected = [...prev.selectedLetters]

      // Find first wrong or empty slot
      for (let i = 0; i < target.length; i++) {
        const currentPoolIdx = newSelected[i]
        const currentLetter = currentPoolIdx !== null ? prev.scrambled[currentPoolIdx] : ''
        if (currentLetter !== target[i]) {
          // Find the correct letter in the pool that's not already selected
          for (let j = 0; j < prev.scrambled.length; j++) {
            if (prev.scrambled[j] === target[i] && !newSelected.includes(j)) {
              // Remove the current letter at this slot (if any)
              newSelected[i] = j
              break
            }
          }
          break
        }
      }

      return {
        ...prev,
        selectedLetters: newSelected,
        hintsUsed: prev.hintsUsed + 1,
      }
    })
  }, [])

  const goHome = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'welcome' as Phase,
    }))
  }, [])

  return {
    state,
    startGame,
    selectLetter,
    deselectLetter,
    clearAll,
    submitAnswer,
    nextWord,
    nextLevel,
    useHint,
    goHome,
  }
}
