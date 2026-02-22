export interface Drum {
  id: string
  name: string
  nameZh: string
  key: string
  sample: string
  color: string
}

export interface DrumState {
  isLoaded: boolean
  isPlaying: boolean
  error: string | null
}

export interface AudioContextState {
  context: AudioContext | null
  buffers: Map<string, AudioBuffer>
  isInitialized: boolean
}

// Accompaniment types
export interface Beat {
  time: number // Time in seconds
  drum: string // Drum ID
  label?: string // Beat label (1, 2, 3, 4, etc.)
  isEnd?: boolean // Is this the last beat?
}

export interface RhythmMap {
  id: string
  title: string
  titleEn: string
  bpm: number
  duration: number // Duration in seconds
  beats: Beat[]
  style: 'rock' | 'pop' | 'electronic'
  description: string
  difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  lessonInfo?: LessonInfo
}

// Lesson types
export interface LessonInfo {
  lessonNumber: number
  objective: string
  tips: string[]
  targetDrums: string[]
  prerequisites?: string[] // IDs of prerequisite lessons
}

// Judgment types
export type JudgmentType = 'perfect' | 'good' | 'miss' | 'none'

export interface JudgmentResult {
  type: JudgmentType
  deltaMs: number
  beat?: Beat
  score: number
  combo: number
}

// Practice session types
export interface PracticeSession {
  lessonId: string
  startTime: number
  endTime?: number
  judgments: JudgmentResult[]
  finalScore: number
  accuracy: number
  maxCombo: number
  grade: string
}

// Re-export MP3 import types
export * from './mp3-import'
