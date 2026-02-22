import { ref } from 'vue'
import type { 
  DrumPoint, 
  AnalysisProgress, 
  OnsetDetectionOptions
} from '../types/mp3-import'
import { DRUM_FREQUENCY_RANGES } from '../types/mp3-import'

const DEFAULT_OPTIONS: OnsetDetectionOptions = {
  threshold: 0.15,      // Energy increase threshold
  minInterval: 0.1,     // Minimum 100ms between onsets
  windowSize: 1024,     // FFT window size
}

export function useAudioAnalyzer() {
  const progress = ref<AnalysisProgress>({
    stage: 'idle',
    progress: 0,
    message: '等待上传...'
  })

  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Decode MP3 file to AudioBuffer
   */
  const decodeAudio = async (
    file: File, 
    ctx: AudioContext
  ): Promise<AudioBuffer> => {
    progress.value = {
      stage: 'decoding',
      progress: 10,
      message: '正在解码音频...'
    }

    const arrayBuffer = await file.arrayBuffer()
    
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      progress.value.progress = 30
      return audioBuffer
    } catch (err) {
      throw new Error(`音频解码失败: ${(err as Error).message}`)
    }
  }

  /**
   * Detect onsets using energy-based algorithm
   * Simple but effective onset detection based on energy flux
   */
  const detectOnsets = (
    audioBuffer: AudioBuffer,
    options: Partial<OnsetDetectionOptions> = {}
  ): { time: number; strength: number; frequency: number }[] => {
    progress.value = {
      stage: 'detecting',
      progress: 60,
      message: '正在识别鼓点...'
    }

    const opts = { ...DEFAULT_OPTIONS, ...options }
    const sampleRate = audioBuffer.sampleRate
    const channelData = audioBuffer.getChannelData(0)
    
    // Analysis parameters
    const hopSize = 512 // ~11.6ms at 44.1kHz
    const frameSize = 1024
    const frames = Math.floor((channelData.length - frameSize) / hopSize)
    
    // Calculate energy for each frame
    const energies: number[] = []
    for (let i = 0; i < frames; i++) {
      const start = i * hopSize
      let sum = 0
      for (let j = 0; j < frameSize; j++) {
        const sample = channelData[start + j]
        sum += sample * sample
      }
      energies.push(sum / frameSize)
    }
    
    // Calculate energy difference (flux)
    const flux: number[] = [0]
    for (let i = 1; i < energies.length; i++) {
      const diff = energies[i] - energies[i - 1]
      flux.push(Math.max(0, diff)) // Only positive changes
    }
    
    // Normalize flux
    const maxFlux = Math.max(...flux)
    const normalizedFlux = flux.map(f => f / maxFlux)
    
    // Find peaks above threshold
    const onsets: { time: number; strength: number; frequency: number }[] = []
    const minFrameInterval = Math.floor(opts.minInterval * sampleRate / hopSize)
    
    for (let i = 2; i < normalizedFlux.length - 2; i++) {
      const current = normalizedFlux[i]
      
      // Check if it's a peak
      if (current > opts.threshold &&
          current > normalizedFlux[i - 1] &&
          current > normalizedFlux[i - 2] &&
          current > normalizedFlux[i + 1] &&
          current > normalizedFlux[i + 2]) {
        
        // Check minimum interval
        const lastOnset = onsets[onsets.length - 1]
        if (!lastOnset || (i - Math.floor(lastOnset.time * sampleRate / hopSize)) >= minFrameInterval) {
          const time = i * hopSize / sampleRate
          
          // Get dominant frequency for this onset using FFT
          const start = i * hopSize
          const freq = estimateDominantFrequency(channelData, start, frameSize, sampleRate)
          
          onsets.push({
            time,
            strength: current,
            frequency: freq
          })
        }
      }
      
      // Update progress
      if (i % 1000 === 0) {
        progress.value.progress = 60 + Math.floor((i / frames) * 30)
      }
    }
    
    return onsets
  }

  /**
   * Estimate dominant frequency using simple zero-crossing
   * Good enough for drum classification
   */
  const estimateDominantFrequency = (
    data: Float32Array,
    start: number,
    length: number,
    sampleRate: number
  ): number => {
    let crossings = 0
    let prevSample = data[start]
    
    for (let i = 1; i < length; i++) {
      const sample = data[start + i]
      if ((prevSample < 0 && sample >= 0) || (prevSample >= 0 && sample < 0)) {
        crossings++
      }
      prevSample = sample
    }
    
    return (crossings * sampleRate) / (2 * length)
  }

  /**
   * Map frequency to drum type
   */
  const mapFrequencyToDrum = (frequency: number): string => {
    for (const range of DRUM_FREQUENCY_RANGES) {
      if (frequency >= range.minFreq && frequency < range.maxFreq) {
        return range.drumType
      }
    }
    return 'snare' // Default
  }

  /**
   * Detect BPM from onset times
   * Uses autocorrelation to find the beat period
   */
  const detectBPM = (onsetTimes: number[]): number => {
    if (onsetTimes.length < 4) {
      // Not enough onsets, default to 120
      return 120
    }

    // Calculate inter-onset intervals
    const intervals: number[] = []
    for (let i = 1; i < onsetTimes.length; i++) {
      intervals.push(onsetTimes[i] - onsetTimes[i - 1])
    }

    // Find most common interval (histogram)
    const intervalBuckets: Map<number, number> = new Map()
    const bucketSize = 0.05 // 50ms buckets

    for (const interval of intervals) {
      const bucket = Math.round(interval / bucketSize) * bucketSize
      intervalBuckets.set(bucket, (intervalBuckets.get(bucket) || 0) + 1)
    }

    // Find peak in histogram
    let maxCount = 0
    let bestInterval = 0.5 // Default to 500ms (120 BPM)

    for (const [interval, count] of intervalBuckets) {
      if (count > maxCount && interval > 0.2 && interval < 1.5) {
        maxCount = count
        bestInterval = interval
      }
    }

    // Convert interval to BPM
    const bpm = Math.round(60 / bestInterval)
    
    // Clamp to reasonable range
    return Math.max(60, Math.min(200, bpm))
  }

  /**
   * Main analysis function
   */
  const analyze = async (
    file: File,
    audioContext: AudioContext
  ): Promise<{ 
    drumPoints: DrumPoint[]; 
    bpm: number; 
    duration: number;
    audioBuffer: AudioBuffer 
  }> => {
    isAnalyzing.value = true
    error.value = null

    try {
      // Decode audio
      const audioBuffer = await decodeAudio(file, audioContext)
      const duration = audioBuffer.duration

      // Detect onsets
      const onsets = detectOnsets(audioBuffer)

      // Convert onsets to drum points with drum type mapping
      const drumPoints: DrumPoint[] = onsets.map(onset => ({
        time: onset.time,
        strength: onset.strength,
        frequency: onset.frequency,
        autoDrum: mapFrequencyToDrum(onset.frequency),
        confirmed: false
      }))

      // Detect BPM
      const onsetTimes = onsets.map(o => o.time)
      const bpm = detectBPM(onsetTimes)

      progress.value = {
        stage: 'complete',
        progress: 100,
        message: `分析完成！识别到 ${drumPoints.length} 个鼓点，BPM: ${bpm}`
      }

      return {
        drumPoints,
        bpm,
        duration,
        audioBuffer
      }
    } catch (err) {
      error.value = (err as Error).message
      progress.value = {
        stage: 'error',
        progress: 0,
        message: `分析失败: ${(err as Error).message}`
      }
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }

  const reset = () => {
    progress.value = {
      stage: 'idle',
      progress: 0,
      message: '等待上传...'
    }
    error.value = null
    isAnalyzing.value = false
  }

  return {
    progress,
    isAnalyzing,
    error,
    analyze,
    reset,
    detectBPM,
    mapFrequencyToDrum
  }
}
