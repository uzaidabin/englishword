import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Stats } from '@/hooks/useStats'

interface StatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: Stats
  currentStreak: number
}

export function StatsDialog({ open, onOpenChange, stats, currentStreak }: StatsDialogProps) {
  const accuracy = stats.todayWords > 0
    ? Math.round((stats.todayCorrect / stats.todayWords) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>学习统计</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">今日已学</span>
            <Badge variant="secondary">{stats.todayWords} 词</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">今日正确率</span>
              <span className="font-medium">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.totalWords}</p>
              <p className="text-xs text-muted-foreground">累计单词</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.totalDays}</p>
              <p className="text-xs text-muted-foreground">学习天数</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.bestStreak}</p>
              <p className="text-xs text-muted-foreground">最高连胜</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">当前连胜</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
