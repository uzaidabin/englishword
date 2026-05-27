import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { words } from '@/data/words'

const GRADES = [
  { value: '7A', label: '七年级上册' },
  { value: '7B', label: '七年级下册' },
  { value: '8A', label: '八年级上册' },
  { value: '8B', label: '八年级下册' },
]

interface WelcomeScreenProps {
  onStart: (allWords: Word[], grades: string[]) => void
}

import type { Word } from '@/data/words'

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (grade: string) => {
    setSelected(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    )
  }

  const selectAll = () => setSelected([])

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
            <p className="text-sm font-medium text-foreground">选择册别：</p>
            <div className="grid grid-cols-2 gap-2">
              {GRADES.map(g => (
                <Button
                  key={g.value}
                  variant={selected.includes(g.value) ? 'default' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => toggle(g.value)}
                >
                  {g.label}
                </Button>
              ))}
            </div>
            <Button
              variant={selected.length === 0 ? 'default' : 'outline'}
              size="sm"
              className="w-full"
              onClick={selectAll}
            >
              {selected.length === 0 ? '已选: 全部' : '选择全部'}
            </Button>
          </div>

          <Button
            size="lg"
            className="w-full text-base"
            onClick={() => onStart(words, selected)}
          >
            开始游戏
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>绿色 = 字母位置正确</p>
            <p>黄色 = 字母存在但位置错误</p>
            <p>灰色 = 字母不存在</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
