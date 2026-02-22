import { ref } from 'vue'
import { useAudioAnalyzer } from './useAudioAnalyzer'
import { useMP3ImportStore } from '../stores/useMP3ImportStore'
import type { MP3ImportResult } from '../types/mp3-import'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export function useMP3Import() {
  const { analyze, progress, isAnalyzing, error, reset: resetAnalyzer } = useAudioAnalyzer()
  const store = useMP3ImportStore()
  
  const audioContext = ref<AudioContext | null>(null)
  const currentFile = ref<File | null>(null)

  /**
   * Initialize audio context
   */
  const initAudioContext = async (): Promise<boolean> => {
    if (audioContext.value?.state === 'running') {
      return true
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('您的浏览器不支持 Web Audio API')
      }

      audioContext.value = new AudioContextClass()
      return true
    } catch (err) {
      throw new Error(`音频初始化失败: ${(err as Error).message}`)
    }
  }

  /**
   * Validate MP3 file
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `文件大小超过 20MB 限制 (${(file.size / 1024 / 1024).toFixed(1)}MB)` }
    }

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/mpg']
    const validExtensions = ['.mp3']
    const isValidType = validTypes.includes(file.type)
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType && !hasValidExt) {
      return { valid: false, error: '仅支持 MP3 格式文件' }
    }

    return { valid: true }
  }

  /**
   * Import MP3 file
   */
  const importMP3 = async (file: File): Promise<MP3ImportResult> => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    currentFile.value = file

    // Initialize audio context
    await initAudioContext()
    if (!audioContext.value) {
      throw new Error('音频上下文初始化失败')
    }

    // Analyze audio
    const analysis = await analyze(file, audioContext.value)

    // Create import result
    const result: MP3ImportResult = {
      id: generateId(),
      fileName: file.name,
      duration: analysis.duration,
      bpm: analysis.bpm,
      drumPoints: analysis.drumPoints,
      audioBuffer: analysis.audioBuffer,
      createdAt: Date.now()
    }

    // Save to store
    store.addImport(result)

    return result
  }

  /**
   * Reset import state
   */
  const reset = () => {
    currentFile.value = null
    resetAnalyzer()
  }

  /**
   * Generate unique ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Create object URL for audio playback
   */
  const createAudioUrl = (file: File): string => {
    return URL.createObjectURL(file)
  }

  return {
    importMP3,
    validateFile,
    reset,
    createAudioUrl,
    initAudioContext,
    progress,
    isAnalyzing,
    error,
    currentFile,
    audioContext
  }
}
