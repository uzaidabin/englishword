import { useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { useStats } from '@/hooks/useStats'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { GameScreen } from '@/components/GameScreen'
import { StatsDialog } from '@/components/StatsDialog'
import { LevelComplete } from '@/components/LevelComplete'
import type { Word } from '@/data/words'

function App() {
  const { state, startGame, selectLetter, deselectLetter, clearAll, submitAnswer, nextWord, nextLevel, useHint, goHome, resetGame, hasSavedGame } = useGameState()
  const { stats, recordWord, resetStats } = useStats()
  const [statsOpen, setStatsOpen] = useState(false)

  const handleStart = (words: Word[], listId?: string) => {
    startGame(words, listId)
  }

  const handleReset = () => {
    resetGame()
    resetStats()
  }

  return (
    <>
      {state.phase === 'welcome' && (
        <WelcomeScreen onStart={handleStart} hasSavedGame={hasSavedGame} onReset={handleReset} />
      )}

      {(state.phase === 'playing' || state.phase === 'feedback') && (
        <GameScreen
          state={state}
          onSelectLetter={selectLetter}
          onDeselectLetter={deselectLetter}
          onClear={clearAll}
          onSubmit={submitAnswer}
          onNextWord={nextWord}
          onHint={useHint}
          onStatsOpen={() => setStatsOpen(true)}
          onRecordWord={recordWord}
        />
      )}

      {state.phase === 'levelComplete' && (
        <LevelComplete
          score={state.score}
          streak={state.streak}
          currentLevel={state.currentLevel}
          onNextLevel={() => nextLevel()}
          onHome={goHome}
        />
      )}

      <StatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        stats={stats}
        currentStreak={state.streak}
      />
    </>
  )
}

export default App
