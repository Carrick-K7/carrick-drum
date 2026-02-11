<template>
  <main class="practice-mode">
    <div class="practice-layout">
      <!-- 左侧：练习课程选择器 -->
      <div v-if="!teachingStore.isInLesson" class="practice-sidebar">
        <div class="practice-intro">
          <h2>🎯 练习模式</h2>
          <p>选择练习曲目，进行击打训练</p>
        </div>
        <LessonSelector show-difficulty-filter />
      </div>
      
      <!-- 中间：练习面板 -->
      <div class="practice-main">
        <LessonPanel practice-mode />
      </div>
      
      <!-- 右侧：鼓组（在练习时显示）-->
      <div v-if="teachingStore.isInLesson" class="practice-drumkit">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Combine manual active drums with teaching active drums
const combinedActiveDrums = computed(() => {
  const combined = new Set(activeDrums.value)
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
    
    // Practice mode: handle judgment
    if (teachingStore.isInLesson) {
      teachingStore.handleHit(drumId)
    }
  }
}

// Keyboard support
useKeyboard((drumId) => {
  handleDrumTrigger(drumId)
})

onMounted(() => {
  // Auto-set practice mode when entering this route
  if (teachingStore.isInLesson) {
    teachingStore.startPractice('practice')
  }
})

onUnmounted(() => {
  teachingStore.cleanup()
})
</script>

<style scoped>
.practice-mode {
  flex: 1;
  padding: 1rem;
}

.practice-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .practice-layout {
    flex-direction: row;
  }
}

.practice-sidebar {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .practice-sidebar {
    width: 20rem;
  }
}

.practice-intro {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 0.75rem;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.practice-intro h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f472b6;
  margin-bottom: 0.5rem;
}

.practice-intro p {
  color: #94a3b8;
}

.practice-main {
  flex: 1;
  min-width: 0;
}

.practice-drumkit {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 1024px) {
  .practice-drumkit {
    width: auto;
  }
}
</style>
