import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LEVELS } from '@/lib/game'

interface LevelCompleteProps {
  score: number
  streak: number
  currentLevel: number
  onNextLevel: () => void
  onHome: () => void
}

export function LevelComplete({ score, streak, currentLevel, onNextLevel, onHome }: LevelCompleteProps) {
  const isLastLevel = currentLevel >= LEVELS.length

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isLastLevel ? '全部通关!' : `${LEVELS[currentLevel - 1].name}关完成!`}
          </h2>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-foreground">{score}</p>
              <p className="text-sm text-muted-foreground">总分</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold text-foreground">{streak}</p>
              <p className="text-sm text-muted-foreground">连胜</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {!isLastLevel && (
              <Button size="lg" className="w-full" onClick={onNextLevel}>
                下一关: {LEVELS[currentLevel].name}
              </Button>
            )}
            <Button variant="outline" size="lg" className="w-full" onClick={onHome}>
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
