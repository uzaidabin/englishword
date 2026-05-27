import { useState, useEffect } from 'react'
import { MeaningDisplay } from './MeaningDisplay'
import { AnswerSlots } from './AnswerSlots'
import { LetterPool } from './LetterPool'
import { ActionBar } from './ActionBar'
import { CoinEffect } from './CoinEffect'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3 } from 'lucide-react'
import { LEVELS } from '@/lib/game'
import { useSpeech } from '@/hooks/useSpeech'
import type { GameState } from '@/hooks/useGameState'

interface GameScreenProps {
  state: GameState
  onSelectLetter: (idx: number) => void
  onDeselectLetter: (idx: number) => void
  onClear: () => void
  onSubmit: () => void
  onNextWord: () => void
  onHint: () => void
  onStatsOpen: () => void
  onRecordWord: (correct: boolean, streak: number) => void
}

export function GameScreen({
  state,
  onSelectLetter,
  onDeselectLetter,
  onClear,
  onSubmit,
  onNextWord,
  onHint,
  onStatsOpen,
  onRecordWord,
}: GameScreenProps) {
  const { speak } = useSpeech()
  const [showResult, setShowResult] = useState(false)
  const [showCoins, setShowCoins] = useState(false)

  const { currentWord, scrambled, selectedLetters, feedback, feedbackCorrect, phase } = state

  // When feedback phase starts, speak and record
  useEffect(() => {
    if (phase === 'feedback' && feedback) {
      setShowResult(true)
      if (feedbackCorrect) {
        setShowCoins(true)
      }
      if (currentWord) {
        speak(currentWord.word)
        onRecordWord(feedbackCorrect === true, feedbackCorrect === true ? state.streak + 1 : 0)
      }
    }
  }, [phase, feedback])

  if (!currentWord) return null

  const config = LEVELS[Math.min(state.currentLevel - 1, LEVELS.length - 1)]
  const progress = ((state.currentWordIndex + 1) / state.words.length) * 100
  const isAllFilled = !selectedLetters.includes(null)
  const isFeedback = phase === 'feedback'

  return (
    <div className="flex flex-col min-h-screen">
      <CoinEffect active={showCoins} />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{config.name}</Badge>
          <span className="text-sm text-muted-foreground">
            分数: <span className="font-bold text-foreground">{state.score}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            连胜: <span className="font-bold text-foreground">{state.streak}</span>
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onStatsOpen}>
          <BarChart3 className="size-5" />
        </Button>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 p-4 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>第 {state.currentWordIndex + 1} 题 / 共 {state.words.length} 题</span>
            <span>第 {state.currentLevel} 关</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Meaning */}
        <MeaningDisplay
          meaning={currentWord.meaning}
          onSpeak={() => speak(currentWord.word)}
        />

        {/* Answer slots */}
        <AnswerSlots
          wordLength={currentWord.word.length}
          selectedLetters={selectedLetters}
          scrambled={scrambled}
          feedback={feedback}
          onSlotClick={onDeselectLetter}
          disabled={isFeedback}
        />

        {/* Letter pool */}
        <LetterPool
          scrambled={scrambled}
          selectedLetters={selectedLetters}
          onLetterClick={onSelectLetter}
          disabled={isFeedback}
        />

        {/* Result message */}
        {isFeedback && showResult && (
          <div className="animate-slide-up text-center space-y-2">
            {feedbackCorrect ? (
              <p className="text-lg font-bold text-correct">回答正确!</p>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-bold text-destructive">答错了</p>
                <p className="text-muted-foreground">
                  正确答案: <span className="font-bold text-foreground uppercase">{currentWord.word}</span>
                </p>
              </div>
            )}
            <Button onClick={() => { setShowCoins(false); onNextWord() }} size="lg">
              {state.currentWordIndex + 1 >= state.words.length ? '查看结果' : '下一题'}
            </Button>
          </div>
        )}

        {/* Action bar (hidden during feedback) */}
        {!isFeedback && (
          <ActionBar
            onClear={onClear}
            onSubmit={onSubmit}
            onHint={onHint}
            hintsUsed={state.hintsUsed}
            maxHints={state.maxHints}
            canSubmit={isAllFilled}
          />
        )}
      </div>
    </div>
  )
}
