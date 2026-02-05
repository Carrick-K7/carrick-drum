import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DRUMS } from '../constants/drums'

export interface VolumeSettings {
  master: number
  drums: Record<string, number>
}

export interface Settings {
  showKeyboardHints: boolean
  reduceAnimations: boolean
  volumes: VolumeSettings
}

const defaultSettings: Settings = {
  showKeyboardHints: true,
  reduceAnimations: false,
  volumes: {
    master: 0.9,
    drums: {}
  }
}

// Initialize drum volumes
DRUMS.forEach(drum => {
  defaultSettings.volumes.drums[drum.id] = 1.0
})

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...defaultSettings })
  const isSettingsOpen = ref(false)
  
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('drum-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = {
          ...defaultSettings,
          ...parsed,
          volumes: {
            ...defaultSettings.volumes,
            ...(parsed.volumes || {}),
            drums: {
              ...defaultSettings.volumes.drums,
              ...(parsed.volumes?.drums || {})
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }
  
  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('drum-settings', JSON.stringify(settings.value))
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }
  
  // Update master volume
  const setMasterVolume = (volume: number) => {
    settings.value.volumes.master = Math.max(0, Math.min(1, volume))
    saveSettings()
  }
  
  // Update drum volume
  const setDrumVolume = (drumId: string, volume: number) => {
    settings.value.volumes.drums[drumId] = Math.max(0, Math.min(1, volume))
    saveSettings()
  }
  
  // Toggle keyboard hints
  const toggleKeyboardHints = () => {
    settings.value.showKeyboardHints = !settings.value.showKeyboardHints
    saveSettings()
  }
  
  // Toggle animations
  const toggleAnimations = () => {
    settings.value.reduceAnimations = !settings.value.reduceAnimations
    saveSettings()
  }
  
  // Open/close settings panel
  const openSettings = () => { isSettingsOpen.value = true }
  const closeSettings = () => { isSettingsOpen.value = false }
  const toggleSettings = () => { isSettingsOpen.value = !isSettingsOpen.value }
  
  // Get effective volume for a drum (master * drum)
  const getEffectiveVolume = (drumId: string): number => {
    const drumVol = settings.value.volumes.drums[drumId] ?? 1.0
    return settings.value.volumes.master * drumVol
  }
  
  // Reset to defaults
  const resetSettings = () => {
    settings.value = { ...defaultSettings }
    saveSettings()
  }
  
  // Initialize
  loadSettings()
  
  return {
    settings,
    isSettingsOpen,
    masterVolume: computed(() => settings.value.volumes.master),
    showKeyboardHints: computed(() => settings.value.showKeyboardHints),
    reduceAnimations: computed(() => settings.value.reduceAnimations),
    setMasterVolume,
    setDrumVolume,
    toggleKeyboardHints,
    toggleAnimations,
    openSettings,
    closeSettings,
    toggleSettings,
    getEffectiveVolume,
    resetSettings
  }
})
