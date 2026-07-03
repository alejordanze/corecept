export type CodeLanguage = 'javascript' | 'typescript'

export interface ExerciseBlock {
  title?: string
  language: CodeLanguage
  code: string
  hint?: string
}

export interface Concept {
  slug: string
  title: string
  summary: string
  explanation: string
  keyPoints?: string[]
  useCases?: string[]
  commonMistakes?: string[]
  tryIt?: string[]
  exercise?: ExerciseBlock
  references?: { label: string; url: string }[]
}
