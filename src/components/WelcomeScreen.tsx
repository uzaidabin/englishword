import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw } from 'lucide-react'
import { wordLists } from '@/data/wordLists'
import type { Word } from '@/data/words'

interface WelcomeScreenProps {
  onStart: (words: Word[], listId?: string) => void
  hasSavedGame: boolean
  onReset: () => void
}

export function WelcomeScreen({ onStart, hasSavedGame, onReset }: WelcomeScreenProps) {
  const [selectedList, setSelectedList] = useState<string | null>(null)

  const handleListSelect = (listId: string) => {
    setSelectedList(listId)
  }

  const handleStart = () => {
    if (!selectedList) return
    const list = wordLists.find(l => l.id === selectedList)
    if (!list) return
    onStart(list.words, list.id)
  }

  const handleReset = () => {
    if (window.confirm('确定要重置所有游戏进度和统计数据吗？此操作不可撤销。')) {
      onReset()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-foreground">
            拼字游戏
          </h1>
          <p className="text-muted-foreground text-center text-sm">
            看中文释义，拼出正确的英文单词。提交后会有 Wordle 式颜色提示帮助你学习。
          </p>

          <div className="w-full space-y-3">
            <p className="text-sm font-medium text-foreground">选择题库：</p>
            <div className="space-y-2">
              {wordLists.map(list => (
                <Button
                  key={list.id}
                  variant={selectedList === list.id ? 'default' : 'outline'}
                  size="lg"
                  className="w-full justify-start"
                  onClick={() => handleListSelect(list.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{list.title}</div>
                    <div className="text-xs opacity-70 font-normal">{list.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-base"
            disabled={!selectedList}
            onClick={handleStart}
          >
            开始游戏
          </Button>

          {hasSavedGame && (
            <p className="text-xs text-green-500 text-center">检测到上次游戏进度，已自动恢复</p>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>绿色 = 字母位置正确</p>
            <p>黄色 = 字母存在但位置错误</p>
            <p>灰色 = 字母不存在</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            重置进度
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
