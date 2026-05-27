import { cn } from '@/lib/utils'

interface LetterPoolProps {
  scrambled: string[]
  selectedLetters: (number | null)[]
  onLetterClick: (poolIndex: number) => void
  disabled: boolean
}

export function LetterPool({
  scrambled,
  selectedLetters,
  onLetterClick,
  disabled,
}: LetterPoolProps) {
  const isUsed = (idx: number) => selectedLetters.includes(idx)

  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap max-w-md mx-auto">
      {scrambled.map((letter, idx) => (
        <button
          key={idx}
          onClick={() => !disabled && !isUsed(idx) && onLetterClick(idx)}
          disabled={disabled || isUsed(idx)}
          className={cn(
            'w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
            'rounded-lg border-2 text-lg sm:text-xl lg:text-2xl font-bold',
            'flex items-center justify-center',
            'transition-all duration-200',
            'uppercase',
            !isUsed(idx) && !disabled && 'border-primary/30 bg-card text-foreground cursor-pointer hover:border-primary hover:bg-primary/5',
            isUsed(idx) && 'opacity-20 pointer-events-none',
            disabled && !isUsed(idx) && 'pointer-events-none',
          )}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}
