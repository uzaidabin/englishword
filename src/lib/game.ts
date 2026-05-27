import type { Word } from '@/data/words'

export type Feedback = 'correct' | 'present' | 'absent'

export interface LevelConfig {
  level: number
  name: string
  minLen: number
  maxLen: number
  wordsPerLevel: number
  maxHints: number
}

export const LEVELS: LevelConfig[] = [
  { level: 1, name: '初级', minLen: 3, maxLen: 4, wordsPerLevel: 15, maxHints: 3 },
  { level: 2, name: '中级', minLen: 4, maxLen: 5, wordsPerLevel: 20, maxHints: 2 },
  { level: 3, name: '高级', minLen: 5, maxLen: 6, wordsPerLevel: 25, maxHints: 1 },
  { level: 4, name: '专家', minLen: 6, maxLen: 99, wordsPerLevel: 30, maxHints: 1 },
]

export function scrambleLetters(word: string): string[] {
  const letters = word.split('')
  // Fisher-Yates shuffle, ensure result differs from original
  for (let attempts = 0; attempts < 10; attempts++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    if (letters.join('') !== word) return letters
  }
  return letters
}

export function calculateFeedback(guess: string, target: string): Feedback[] {
  const result: Feedback[] = new Array(guess.length).fill('absent')
  const targetArr = target.split('')
  const guessArr = guess.split('')

  // Pass 1: correct positions (green)
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct'
      targetArr[i] = null!
    }
  }

  // Pass 2: present but wrong position (yellow)
  for (let i = 0; i < guessArr.length; i++) {
    if (result[i] === 'correct') continue
    const idx = targetArr.indexOf(guessArr[i])
    if (idx !== -1) {
      result[i] = 'present'
      targetArr[idx] = null!
    }
  }

  return result
}

export function calculateScore(streak: number, timeTakenMs: number, usedHint: boolean): number {
  let points = 10

  // Streak bonuses
  if (streak >= 10) points += 25
  else if (streak >= 5) points += 10
  else if (streak >= 3) points += 5

  // Time bonus
  const seconds = timeTakenMs / 1000
  if (seconds < 3) points += 3
  else if (seconds < 5) points += 1

  if (usedHint) points -= 5

  return points
}

export function getWordsByGrade(allWords: Word[], grades: string[]): Word[] {
  if (grades.length === 0) return [...allWords]
  return allWords.filter(w => grades.includes(w.grade))
}

export function getWordsForLevel(words: Word[], level: LevelConfig): Word[] {
  const filtered = words.filter(w => w.word.length >= level.minLen && w.word.length <= level.maxLen)
  return shuffleArray(filtered).slice(0, level.wordsPerLevel)
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
