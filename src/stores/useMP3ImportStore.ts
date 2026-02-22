import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MP3ImportResult, DrumPoint } from '../types/mp3-import'

const STORAGE_KEY = 'drum-mp3-imports'

export const useMP3ImportStore = defineStore('mp3Import', () => {
  // State
  const imports = ref<MP3ImportResult[]>([])
  const currentImport = ref<MP3ImportResult | null>(null)
  const isLoading = ref(false)

  // Load imports from localStorage
  const loadImports = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        imports.value = parsed.map((item: MP3ImportResult) => ({
          ...item,
          audioBuffer: null // AudioBuffer can't be serialized
        }))
      }
    } catch (err) {
      console.error('Failed to load imports:', err)
    }
  }

  // Save imports to localStorage
  const saveImports = () => {
    try {
      // Remove audioBuffer before saving (can't serialize)
      const serializable = imports.value.map(item => ({
        ...item,
        audioBuffer: undefined
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
    } catch (err) {
      console.error('Failed to save imports:', err)
    }
  }

  // Add new import
  const addImport = (result: MP3ImportResult) => {
    imports.value.unshift(result)
    currentImport.value = result
    saveImports()
  }

  // Remove import
  const removeImport = (id: string) => {
    const index = imports.value.findIndex(item => item.id === id)
    if (index > -1) {
      imports.value.splice(index, 1)
      saveImports()
    }
    if (currentImport.value?.id === id) {
      currentImport.value = null
    }
  }

  // Set current import
  const setCurrentImport = (id: string | null) => {
    if (id === null) {
      currentImport.value = null
      return
    }
    const found = imports.value.find(item => item.id === id)
    currentImport.value = found || null
  }

  // Update drum point
  const updateDrumPoint = (pointIndex: number, updates: Partial<DrumPoint>) => {
    if (!currentImport.value) return
    
    const point = currentImport.value.drumPoints[pointIndex]
    if (point) {
      Object.assign(point, updates)
      saveImports()
    }
  }

  // Move drum point time
  const moveDrumPoint = (pointIndex: number, newTime: number) => {
    if (!currentImport.value) return
    
    const point = currentImport.value.drumPoints[pointIndex]
    if (point) {
      point.time = Math.max(0, newTime)
      point.confirmed = true
      saveImports()
    }
  }

  // Delete drum point
  const deleteDrumPoint = (pointIndex: number) => {
    if (!currentImport.value) return
    
    currentImport.value.drumPoints.splice(pointIndex, 1)
    saveImports()
  }

  // Add new drum point
  const addDrumPoint = (point: Omit<DrumPoint, 'confirmed'>) => {
    if (!currentImport.value) return
    
    currentImport.value.drumPoints.push({
      ...point,
      confirmed: true
    })
    // Sort by time
    currentImport.value.drumPoints.sort((a, b) => a.time - b.time)
    saveImports()
  }

  // Generate RhythmMap from import result
  const generateRhythmMap = (importResult: MP3ImportResult) => {
    const beats = importResult.drumPoints.map(point => ({
      time: point.time,
      drum: point.autoDrum,
      label: '',
    }))

    return {
      id: `mp3-import-${importResult.id}`,
      title: importResult.fileName,
      titleEn: importResult.fileName,
      bpm: importResult.bpm,
      duration: importResult.duration,
      style: 'pop' as const,
      description: `从 MP3 导入: ${importResult.fileName}`,
      difficulty: 'beginner' as const,
      beats
    }
  }

  // Clear all imports
  const clearAll = () => {
    imports.value = []
    currentImport.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  // Initialize
  loadImports()

  return {
    imports,
    currentImport,
    isLoading,
    addImport,
    removeImport,
    setCurrentImport,
    updateDrumPoint,
    moveDrumPoint,
    deleteDrumPoint,
    addDrumPoint,
    generateRhythmMap,
    clearAll
  }
})
