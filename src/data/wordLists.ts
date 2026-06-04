import { words } from './words'
import { zhongkaoWords } from './zhongkaoWords'
import type { Word } from './words'

export interface WordList {
  id: string
  title: string
  description: string
  words: Word[]
  groups?: { value: string; label: string }[]
  groupFn?: (word: Word, value: string) => boolean
}

export const wordLists: WordList[] = [
  {
    id: 'textbook',
    title: '初中课本词汇',
    description: '七年级至八年级课本单词',
    words: words,
  },
  {
    id: 'zhongkao',
    title: '中考英语词汇表',
    description: '中考考纲词汇 1766 词',
    words: zhongkaoWords,
  },
]
