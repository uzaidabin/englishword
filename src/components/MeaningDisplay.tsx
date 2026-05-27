import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'

interface MeaningDisplayProps {
  meaning: string
  onSpeak: () => void
}

export function MeaningDisplay({ meaning, onSpeak }: MeaningDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl sm:text-3xl font-bold text-foreground">{meaning}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onSpeak}
        className="shrink-0"
        aria-label="播放发音"
      >
        <Volume2 className="size-5" />
      </Button>
    </div>
  )
}
