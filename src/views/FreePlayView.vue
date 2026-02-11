<template>
  <main class="freeplay-mode">
    <!-- Accompaniment Panel (Left side on large screens) -->
    <div v-if="showAccompaniment" class="accompaniment-panel">
      <SongSelector />
      <PlaybackControls />
    </div>
    
    <!-- Drum Kit (Center) -->
    <div class="drum-kit-container">
      <DrumKit
        :active-drums="combinedActiveDrums"
        :drum-combos="drumCombos"
        @trigger="handleDrumTrigger"
      />
      
      <KeyboardHint v-if="settingsStore.showKeyboardHints" />
      
      <!-- Recording Panel -->
      <RecordingPanel
        ref="recordingPanelRef"
        :on-trigger="handleDrumTrigger"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import DrumKit from '../components/DrumKit.vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import RecordingPanel from '../components/RecordingPanel.vue'
import SongSelector from '../components/SongSelector.vue'
import PlaybackControls from '../components/PlaybackControls.vue'
import { useAudio } from '../composables/useAudio'
import { useKeyboard } from '../composables/useKeyboard'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAccompanimentStore } from '../stores/useAccompanimentStore'

const { playDrum } = useAudio()
const settingsStore = useSettingsStore()
const accompanimentStore = useAccompanimentStore()

const activeDrums = ref<Set<string>>(new Set())
const drumCombos = ref<Record<string, number>>({})
const recordingPanelRef = ref<InstanceType<typeof RecordingPanel>>()
const showAccompaniment = ref(false)

// Load accompaniment panel preference
try {
  const saved = localStorage.getItem('show-accompaniment')
  if (saved) {
    showAccompaniment.value = saved === 'true'
  }
} catch (err) {
  console.error('Failed to load accompaniment preference:', err)
}

// Combine manual active drums with accompaniment active drums
const combinedActiveDrums = computed(() => {
  const combined = new Set(activeDrums.value)
  accompanimentStore.activeDrums.forEach(drum => combined.add(drum))
  return combined
})

// Handle drum trigger
const handleDrumTrigger = (drumId: string) => {
  const played = playDrum(drumId)
  
  if (played) {
    activeDrums.value.add(drumId)
    setTimeout(() => {
      activeDrums.value.delete(drumId)
    }, settingsStore.reduceAnimations ? 50 : 100)
    
    drumCombos.value[drumId] = (drumCombos.value[drumId] || 0) + 1
    
    setTimeout(() => {
      drumCombos.value[drumId] = Math.max(0, (drumCombos.value[drumId] || 0) - 1)
      if (drumCombos.value[drumId] === 0) {
        delete drumCombos.value[drumId]
      }
    }, 1000)
    
    // Record event
    recordingPanelRef.value?.recordEvent(drumId)
  }
}

// Auto-play loop
let animationFrameId: number | null = null
let lastTime = 0

const autoPlayLoop = (timestamp: number) => {
  if (!accompanimentStore.isPlaying) {
    lastTime = 0
    return
  }
  
  if (lastTime === 0) {
    lastTime = timestamp
  }
  
  const deltaTime = (timestamp - lastTime) / 1000
  lastTime = timestamp
  
  accompanimentStore.updateTime(deltaTime)
  
  if (accompanimentStore.isAutoMode) {
    const beats = accompanimentStore.getNextTriggerBeats(accompanimentStore.currentTime, 50)
    
    beats.forEach(beat => {
      handleDrumTrigger(beat.drum)
      accompanimentStore.setDrumActive(beat.drum, true)
      setTimeout(() => {
        accompanimentStore.setDrumActive(beat.drum, false)
      }, settingsStore.reduceAnimations ? 50 : 150)
    })
  }
  
  if (accompanimentStore.isPlaying) {
    animationFrameId = requestAnimationFrame(autoPlayLoop)
  }
}

watch(() => accompanimentStore.isPlaying, (isPlaying) => {
  if (isPlaying) {
    lastTime = 0
    accompanimentStore.resetBeatIndex()
    animationFrameId = requestAnimationFrame(autoPlayLoop)
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    lastTime = 0
  }
})

// Keyboard support
useKeyboard((drumId) => {
  handleDrumTrigger(drumId)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  accompanimentStore.cleanup()
})
</script>

<style scoped>
.freeplay-mode {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  gap: 1.5rem;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .freeplay-mode {
    flex-direction: row;
  }
}

.accompaniment-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .accompaniment-panel {
    width: 20rem;
  }
}

.drum-kit-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}
</style>
