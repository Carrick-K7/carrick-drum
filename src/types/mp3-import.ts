// MP3 Import types

export interface DrumPoint {
  time: number      // Time in seconds
  strength: number  // Energy strength 0-1
  frequency: number // Dominant frequency
  autoDrum: string  // Auto-assigned drum: kick/snare/hihat
  confirmed: boolean // User confirmed
}

export interface MP3ImportResult {
  id: string
  fileName: string
  duration: number
  bpm: number
  drumPoints: DrumPoint[]
  audioBuffer: AudioBuffer | null
  createdAt: number
}

export interface AnalysisProgress {
  stage: 'idle' | 'decoding' | 'analyzing' | 'detecting' | 'complete' | 'error'
  progress: number // 0-100
  message: string
}

export interface OnsetDetectionOptions {
  threshold: number      // Energy threshold for onset detection
  minInterval: number    // Minimum time between onsets (seconds)
  windowSize: number     // Analysis window size in samples
}

export interface FrequencyRange {
  name: string
  minFreq: number
  maxFreq: number
  drumType: string
}

// Frequency ranges for drum mapping
export const DRUM_FREQUENCY_RANGES: FrequencyRange[] = [
  { name: 'low', minFreq: 20, maxFreq: 150, drumType: 'kick' },      // Kick drum: low frequency
  { name: 'mid', minFreq: 150, maxFreq: 800, drumType: 'snare' },    // Snare: mid frequency
  { name: 'high', minFreq: 800, maxFreq: 5000, drumType: 'hihat-closed' }, // Hi-hat: high frequency
]
