<template>
  <main class="teaching-mode">
    <div class="teaching-layout">
      <!-- 左侧：课程选择器（未选择课程时显示）-->
      <div v-if="!teachingStore.isInLesson" class="teaching-sidebar">
        <LessonSelector />
      </div>
      
      <!-- 中间：课程面板 -->
      <div class="teaching-main">
        <LessonPanel />
      </div>
      
      <!-- 右侧：鼓组（在练习时显示）-->
      <div v-if="teachingStore.isInLesson" class="teaching-drumkit">
        <DrumKit
          :active-drums="combinedActiveDrums"
          :drum-combos="drumCombos"
          @trigger="handleDrumTrigger"
        />
        
        <KeyboardHint v-if="settingsStore.showKeyboardHints" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import DrumKit from '../components/DrumKit.vue'
import KeyboardHint from '../components/KeyboardHint.vue'
import LessonSelector from '../components/LessonSelector.vue'
import LessonPanel from '../components/LessonPanel.vue'
import { useAudio } from '../composables/useAudio'
import { useKeyboard } from '../composables/useKeyboard'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAccompanimentStore } from '../stores/useAccompanimentStore'
import { useTeachingStore } from '../stores/useTeachingStore'

const { playDrum } = useAudio()
const settingsStore = useSettingsStore()
const accompanimentStore = useAccompanimentStore()
const teachingStore = useTeachingStore()

const activeDrums = ref<Set<string>>(new Set())
const drumCombos = ref<Record<string, number>>({})

// Combine manual active drums with accompaniment active drums and teaching active drums
const combinedActiveDrums = computed(() => {
  const combined = new Set(activeDrums.value)
  accompanimentStore.activeDrums.forEach(drum => combined.add(drum))
  teachingStore.activeDrums.forEach(drum => combined.add(drum))
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
    
    // Teaching mode: handle judgment
    if (teachingStore.isInLesson) {
      teachingStore.handleHit(drumId)
    }
  }
}

// Keyboard support
useKeyboard((drumId) => {
  handleDrumTrigger(drumId)
})

onUnmounted(() => {
  teachingStore.cleanup()
})
</script>

<style scoped>
.teaching-mode {
  flex: 1;
  padding: 1rem;
}

.teaching-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .teaching-layout {
    flex-direction: row;
  }
}

.teaching-sidebar {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .teaching-sidebar {
    width: 20rem;
  }
}

.teaching-main {
  flex: 1;
  min-width: 0;
}

.teaching-drumkit {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 1024px) {
  .teaching-drumkit {
    width: auto;
  }
}
</style>
