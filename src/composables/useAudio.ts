import { ref } from 'vue'
import type { AudioContextState } from '../types'
import { DRUMS } from '../constants/drums'
import { useDrumKitStore, ELECTRONIC_DRUMS } from '../stores/useDrumKitStore'
import { useSettingsStore } from '../stores/useSettingsStore'

const state = ref<AudioContextState>({
  context: null,
  buffers: new Map(),
  isInitialized: false
})

const isLoading = ref(false)
const loadError = ref<string | null>(null)
const loadedCount = ref(0)

// Create audio context (needs user interaction)
export function useAudio() {
  const drumKitStore = useDrumKitStore()
  const settingsStore = useSettingsStore()

  const initAudio = async (): Promise<boolean> => {
    if (state.value.isInitialized) return true
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        loadError.value = '您的浏览器不支持 Web Audio API'
        return false
      }

      state.value.context = new AudioContextClass()
      
      // Load all audio samples
      await loadAllSamples()
      
      state.value.isInitialized = true
      return true
    } catch (err) {
      loadError.value = '音频初始化失败: ' + (err as Error).message
      return false
    }
  }

  const loadAllSamples = async () => {
    // Electronic kit uses synthesis, no samples to load
    if (drumKitStore.isElectronic) {
      loadedCount.value = DRUMS.length
      return
    }

    isLoading.value = true
    loadedCount.value = 0
    
    const loadPromises = DRUMS.map(async (drum) => {
      try {
        const buffer = await loadSample(drum.sample)
        state.value.buffers.set(drum.id, buffer)
        loadedCount.value++
      } catch (err) {
        console.warn(`Failed to load sample: ${drum.sample}`, err)
      }
    })
    
    await Promise.all(loadPromises)
    isLoading.value = false
  }

  const loadSample = async (url: string): Promise<AudioBuffer> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    
    if (!state.value.context) {
      throw new Error('AudioContext not initialized')
    }
    
    return await state.value.context.decodeAudioData(arrayBuffer)
  }

  // Synthesize electronic drum sounds
  const synthesizeDrum = (drumId: string): AudioBuffer | undefined => {
    if (!state.value.context) return undefined
    
    const config = (ELECTRONIC_DRUMS as Record<string, { freq: number; decay: number; noise?: boolean; type?: OscillatorType }>)[drumId]
    if (!config) return undefined

    const sampleRate = state.value.context.sampleRate
    const duration = config.decay + 0.1
    const buffer = state.value.context.createBuffer(1, Math.floor(sampleRate * duration), sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      
      if (config.noise) {
        // Noise-based drums (snare, hihat, crash)
        const noise = Math.random() * 2 - 1
        const envelope = Math.exp(-t / config.decay)
        // High-pass filter approximation
        if (config.freq > 3000) {
          // Simple high-pass: difference between consecutive samples
          data[i] = i > 0 ? (noise - data[i - 1]) * envelope : noise * envelope
        } else {
          data[i] = noise * envelope
        }
      } else {
        // Tone-based drums (kick, toms)
        const freq = config.freq * (1 - t * 2) // Pitch drop
        const envelope = Math.exp(-t / config.decay)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope
      }
    }

    return buffer
  }

  const playDrum = (drumId: string): boolean => {
    if (!state.value.context || !state.value.isInitialized) {
      console.warn('Audio not initialized')
      return false
    }

    // Resume audio context if suspended
    if (state.value.context.state === 'suspended') {
      state.value.context.resume()
    }

    // Get effective volume
    const volume = settingsStore.getEffectiveVolume(drumId)
    if (volume <= 0) return false

    try {
      let source: AudioBufferSourceNode

      if (drumKitStore.isElectronic) {
        // Synthesize electronic drum sound
        const synthBuffer = synthesizeDrum(drumId)
        if (!synthBuffer) return false
        
        source = state.value.context.createBufferSource()
        source.buffer = synthBuffer
      } else {
        // Use pre-loaded sample
        const sampleBuffer = state.value.buffers.get(drumId)
        if (!sampleBuffer) {
          console.warn(`Sample not found: ${drumId}`)
          return false
        }
        
        source = state.value.context.createBufferSource()
        source.buffer = sampleBuffer
      }

      // Create gain node for volume control
      const gainNode = state.value.context.createGain()
      gainNode.gain.value = volume

      // Add compression for better sound
      const compressor = state.value.context.createDynamicsCompressor()
      compressor.threshold.value = -24
      compressor.knee.value = 30
      compressor.ratio.value = 12
      compressor.attack.value = 0.003
      compressor.release.value = 0.25

      source.connect(gainNode)
      gainNode.connect(compressor)
      compressor.connect(state.value.context.destination)

      // Play immediately with minimal latency
      source.start(0)
      return true
    } catch (err) {
      console.error('Playback error:', err)
      return false
    }
  }

  const unlockAudio = async () => {
    if (!state.value.context) {
      await initAudio()
    } else if (state.value.context.state === 'suspended') {
      await state.value.context.resume()
    }
  }

  return {
    state,
    isLoading,
    loadError,
    loadedCount,
    totalSamples: DRUMS.length,
    initAudio,
    playDrum,
    unlockAudio
  }
}
