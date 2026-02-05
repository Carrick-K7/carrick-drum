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
}
