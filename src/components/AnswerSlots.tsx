import type { Feedback } from '@/lib/game'
import { cn } from '@/lib/utils'

interface AnswerSlotsProps {
  wordLength: number
  selectedLetters: (number | null)[]
  scrambled: string[]
  feedback: Feedback[] | null
  onSlotClick: (index: number) => void
  disabled: boolean
}

export function AnswerSlots({
  wordLength,
  selectedLetters,
  scrambled,
  feedback,
  onSlotClick,
  disabled,
}: AnswerSlotsProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
      {Array.from({ length: wordLength }, (_, i) => {
        const poolIdx = selectedLetters[i]
        const letter = poolIdx !== null ? scrambled[poolIdx] : ''
        const fb = feedback?.[i]

        return (
          <button
            key={i}
            onClick={() => !disabled && letter && onSlotClick(i)}
            disabled={disabled || !letter}
            className={cn(
              'w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
              'rounded-lg border-2 text-lg sm:text-xl lg:text-2xl font-bold',
              'flex items-center justify-center',
              'transition-all duration-200',
              'uppercase',
              letter && !fb && 'border-primary/50 bg-primary/5 text-foreground animate-pop-in',
              !letter && 'border-muted-foreground/20 bg-muted/30',
              fb === 'correct' && 'bg-correct text-white border-correct',
              fb === 'present' && 'bg-present text-white border-present',
              fb === 'absent' && 'bg-absent text-white border-absent',
              letter && !disabled && !fb && 'cursor-pointer hover:border-primary',
            )}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
