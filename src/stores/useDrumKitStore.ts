import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type DrumKit = 'rock' | 'electronic'

export interface DrumKitConfig {
  id: DrumKit
  name: string
  nameZh: string
  description: string
}

export const DRUM_KITS: DrumKitConfig[] = [
  {
    id: 'rock',
    name: 'Rock',
    nameZh: '摇滚',
    description: '经典摇滚鼓组，厚重有力'
  },
  {
    id: 'electronic',
    name: 'Electronic',
    nameZh: '电子',
    description: '合成器鼓组，现代电子音色'
  }
]

// Electronic drum sample mappings (using Web Audio API synthesis)
export const ELECTRONIC_DRUMS = {
  kick: { freq: 150, decay: 0.5, type: 'sine' as const },
  snare: { freq: 800, noise: true, decay: 0.2 },
  'hihat-closed': { freq: 8000, noise: true, decay: 0.05 },
  'hihat-open': { freq: 6000, noise: true, decay: 0.3 },
  crash: { freq: 5000, noise: true, decay: 1.5 },
  'tom-low': { freq: 100, decay: 0.4, type: 'sine' as const },
  'tom-mid': { freq: 200, decay: 0.35, type: 'sine' as const },
  'tom-high': { freq: 300, decay: 0.3, type: 'sine' as const }
}

export const useDrumKitStore = defineStore('drumKit', () => {
  const currentKit = ref<DrumKit>('rock')
  const isLoading = ref(false)
  
  // Load saved kit preference
  const loadKitPreference = () => {
    try {
      const saved = localStorage.getItem('drum-kit') as DrumKit
      if (saved && DRUM_KITS.find(k => k.id === saved)) {
        currentKit.value = saved
      }
    } catch (err) {
      console.error('Failed to load drum kit preference:', err)
    }
  }
  
  // Set current drum kit
  const setDrumKit = async (kit: DrumKit) => {
    if (currentKit.value === kit) return
    
    isLoading.value = true
    currentKit.value = kit
    localStorage.setItem('drum-kit', kit)
    
    // Simulate loading delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300))
    isLoading.value = false
  }
  
  // Get sample URL for a drum
  const getSampleUrl = (drumId: string): string | null => {
    if (currentKit.value === 'rock') {
      return `/samples/rock/${drumId}.mp3`
    }
    // Electronic kit uses synthesis, no samples
    return null
  }
  
  // Check if current kit is electronic
  const isElectronic = computed(() => currentKit.value === 'electronic')
  
  // Get current kit config
  const currentKitConfig = computed(() => 
    DRUM_KITS.find(k => k.id === currentKit.value) || DRUM_KITS[0]
  )
  
  // Initialize
  loadKitPreference()
  
  return {
    currentKit,
    currentKitConfig,
    isLoading,
    isElectronic,
    setDrumKit,
    getSampleUrl
  }
})
