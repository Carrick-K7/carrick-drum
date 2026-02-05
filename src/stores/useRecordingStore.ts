import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface RecordingEvent {
  drumId: string
  timestamp: number // 相对于录音开始的时间戳(ms)
}

export interface Recording {
  id: string
  name: string
  createdAt: number
  duration: number
  events: RecordingEvent[]
}

export const useRecordingStore = defineStore('recording', () => {
  // State
  const recordings = ref<Recording[]>([])
  const isRecording = ref(false)
  const isPlaying = ref(false)
  const currentRecording = ref<Recording | null>(null)
  const playbackProgress = ref(0)
  
  // Recording session state
  let recordingStartTime = 0
  let currentEvents: RecordingEvent[] = []
  let playbackTimeoutId: number | null = null
  
  // Load recordings from localStorage on init
  const loadRecordings = () => {
    try {
      const saved = localStorage.getItem('drum-recordings')
      if (saved) {
        recordings.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Failed to load recordings:', err)
    }
  }
  
  // Save recordings to localStorage
  const saveRecordings = () => {
    try {
      localStorage.setItem('drum-recordings', JSON.stringify(recordings.value))
    } catch (err) {
      console.error('Failed to save recordings:', err)
    }
  }
  
  // Start recording
  const startRecording = () => {
    if (isRecording.value) return
    
    isRecording.value = true
    recordingStartTime = Date.now()
    currentEvents = []
  }
  
  // Stop recording and save
  const stopRecording = () => {
    if (!isRecording.value) return
    
    isRecording.value = false
    const duration = Date.now() - recordingStartTime
    
    if (currentEvents.length > 0) {
      const recording: Recording = {
        id: Date.now().toString(),
        name: `录音 #${recordings.value.length + 1}`,
        createdAt: Date.now(),
        duration,
        events: [...currentEvents]
      }
      
      recordings.value.unshift(recording)
      saveRecordings()
    }
    
    currentEvents = []
  }
  
  // Record an event
  const recordEvent = (drumId: string) => {
    if (!isRecording.value) return
    
    const timestamp = Date.now() - recordingStartTime
    currentEvents.push({ drumId, timestamp })
  }
  
  // Delete a recording
  const deleteRecording = (id: string) => {
    recordings.value = recordings.value.filter(r => r.id !== id)
    saveRecordings()
  }
  
  // Rename a recording
  const renameRecording = (id: string, newName: string) => {
    const recording = recordings.value.find(r => r.id === id)
    if (recording) {
      recording.name = newName
      saveRecordings()
    }
  }
  
  // Play a recording
  const playRecording = async (
    recording: Recording, 
    onTrigger: (drumId: string) => void,
    onComplete?: () => void
  ) => {
    if (isPlaying.value) {
      stopPlayback()
    }
    
    isPlaying.value = true
    currentRecording.value = recording
    playbackProgress.value = 0
    
    const startTime = Date.now()
    const duration = recording.duration
    
    // Schedule all events
    recording.events.forEach(event => {
      playbackTimeoutId = window.setTimeout(() => {
        if (isPlaying.value) {
          onTrigger(event.drumId)
        }
      }, event.timestamp)
    })
    
    // Progress update interval
    const progressInterval = window.setInterval(() => {
      if (!isPlaying.value) {
        clearInterval(progressInterval)
        return
      }
      
      const elapsed = Date.now() - startTime
      playbackProgress.value = Math.min(elapsed / duration, 1)
      
      if (elapsed >= duration) {
        clearInterval(progressInterval)
        setTimeout(() => {
          stopPlayback()
          onComplete?.()
        }, 100)
      }
    }, 50)
    
    // Safety timeout
    playbackTimeoutId = window.setTimeout(() => {
      stopPlayback()
      onComplete?.()
    }, duration + 500)
  }
  
  // Stop playback
  const stopPlayback = () => {
    isPlaying.value = false
    currentRecording.value = null
    playbackProgress.value = 0
    
    if (playbackTimeoutId) {
      clearTimeout(playbackTimeoutId)
      playbackTimeoutId = null
    }
    
    // Clear all scheduled timeouts
    const highestTimeoutId = window.setTimeout(() => {}, 0)
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i)
    }
  }
  
  // Get recording count
  const recordingCount = computed(() => recordings.value.length)
  
  // Initialize
  loadRecordings()
  
  return {
    recordings,
    isRecording,
    isPlaying,
    currentRecording,
    playbackProgress,
    recordingCount,
    startRecording,
    stopRecording,
    recordEvent,
    deleteRecording,
    renameRecording,
    playRecording,
    stopPlayback
  }
})
