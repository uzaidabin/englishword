import { useState, useCallback, useEffect, useRef } from 'react'
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

const PROGRESS_KEY = 'spelling-game-progress'

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
  allWords: Word[]
  scrambled: string[]
  currentWord: Word | null
  hintsUsed: number
  maxHints: number
  startTime: number
  selectedListId: string | null
}

interface SavedProgress {
  score: number
  streak: number
  bestStreak: number
  currentLevel: number
  currentWordIndex: number
  selectedLetters: (number | null)[]
  feedback: Feedback[] | null
  feedbackCorrect: boolean | null
  words: Word[]
  allWords: Word[]
  scrambled: string[]
  currentWord: Word | null
  hintsUsed: number
  maxHints: number
  startTime: number
  selectedListId: string | null
  phase: Phase
}

function saveProgress(state: GameState) {
  if (state.phase === 'welcome') return
  try {
    const toSave: SavedProgress = {
      score: state.score,
      streak: state.streak,
      bestStreak: state.bestStreak,
      currentLevel: state.currentLevel,
      currentWordIndex: state.currentWordIndex,
      selectedLetters: state.selectedLetters,
      feedback: state.feedback,
      feedbackCorrect: state.feedbackCorrect,
      words: state.words,
      allWords: state.allWords,
      scrambled: state.scrambled,
      currentWord: state.currentWord,
      hintsUsed: state.hintsUsed,
      maxHints: state.maxHints,
      startTime: state.startTime,
      selectedListId: state.selectedListId,
      phase: state.phase,
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(toSave))
  } catch { /* ignore */ }
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function clearProgress() {
  localStorage.removeItem(PROGRESS_KEY)
}

function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)]
}

function createInitialState(): GameState {
  const saved = loadProgress()
  if (saved && saved.phase !== 'welcome' && saved.currentWord) {
    return {
      phase: saved.phase,
      score: saved.score,
      streak: saved.streak,
      bestStreak: saved.bestStreak,
      currentLevel: saved.currentLevel,
      currentWordIndex: saved.currentWordIndex,
      selectedLetters: saved.selectedLetters,
      feedback: saved.feedback,
      feedbackCorrect: saved.feedbackCorrect,
      words: saved.words,
      allWords: saved.allWords,
      scrambled: saved.scrambled,
      currentWord: saved.currentWord,
      hintsUsed: saved.hintsUsed,
      maxHints: saved.maxHints,
      startTime: saved.startTime,
      selectedListId: saved.selectedListId,
    }
  }
  return {
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
    allWords: [],
    scrambled: [],
    currentWord: null,
    hintsUsed: 0,
    maxHints: 3,
    startTime: 0,
    selectedListId: null,
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    saveProgress(state)
  }, [state])

  const hasSavedGame = state.phase !== 'welcome'


  const startGame = useCallback((wordPool: Word[], listId?: string) => {
    const config = getLevelConfig(1)
    const words = getWordsForLevel(wordPool, config)

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
      allWords: wordPool,
      scrambled,
      currentWord: word,
      hintsUsed: 0,
      maxHints: config.maxHints,
      startTime: Date.now(),
      selectedListId: listId ?? null,
    })
  }, [])

  const selectLetter = useCallback((poolIndex: number) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev

      const emptyIdx = prev.selectedLetters.indexOf(null)
      if (emptyIdx === -1) return prev

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

  const nextLevel = useCallback(() => {
    setState(prev => {
      const newLevel = prev.currentLevel + 1
      const config = getLevelConfig(newLevel)
      const words = getWordsForLevel(prev.allWords, config)

      if (words.length === 0) {
        const fallbackConfig = getLevelConfig(prev.currentLevel)
        const fallbackWords = getWordsForLevel(prev.allWords, fallbackConfig)
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

      for (let i = 0; i < target.length; i++) {
        const currentPoolIdx = newSelected[i]
        const currentLetter = currentPoolIdx !== null ? prev.scrambled[currentPoolIdx] : ''
        if (currentLetter !== target[i]) {
          for (let j = 0; j < prev.scrambled.length; j++) {
            if (prev.scrambled[j] === target[i] && !newSelected.includes(j)) {
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

  const resetGame = useCallback(() => {
    clearProgress()
    setState({
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
      allWords: [],
      scrambled: [],
      currentWord: null,
      hintsUsed: 0,
      maxHints: 3,
      startTime: 0,
      selectedListId: null,
    })
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
    resetGame,
    hasSavedGame,
  }
}
