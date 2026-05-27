import { Button } from '@/components/ui/button'

interface ActionBarProps {
  onClear: () => void
  onSubmit: () => void
  onHint: () => void
  hintsUsed: number
  maxHints: number
  canSubmit: boolean
}

export function ActionBar({
  onClear,
  onSubmit,
  onHint,
  hintsUsed,
  maxHints,
  canSubmit,
}: ActionBarProps) {
  const hintsLeft = maxHints - hintsUsed

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <Button
        variant="outline"
        onClick={onClear}
        disabled={!canSubmit}
      >
        清除
      </Button>
      <Button
        variant="default"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="min-w-20"
      >
        提交
      </Button>
      <Button
        variant="secondary"
        onClick={onHint}
        disabled={hintsLeft <= 0}
      >
        提示 ({hintsLeft})
      </Button>
    </div>
  )
}
