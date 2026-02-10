<template>
  <div class="min-h-screen flex flex-col" :class="`theme-${themeStore.currentTheme}`">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          🥁 Vue Drum Kit
        </h1>
        <p class="app-subtitle">Web Audio API 驱动的架子鼓</p>
      </div>
      
      <!-- Header controls -->
      <div class="header-controls">
        <button
          class="btn-mode"
          :class="{ 'btn-mode-active': currentMode === 'teaching' }"
          @click="switchMode('teaching')"
        >
          📚 教学模式
        </button>
        
        <button
          class="btn-mode"
          :class="{ 'btn-mode-active': currentMode === 'free' }"
          @click="switchMode('free')"
        >
          🎵 自由演奏
        </button>
        
        <DrumKitSelector />
        <ThemeToggle />
        <button class="btn-settings" @click="settingsStore.openSettings">
          ⚙️
        </button>
      </div>
    </header>

    <!-- Loading state -->
    <div
      v-if="!isInitialized"
      class="flex-1 flex flex-col items-center justify-center p-8"
    >
      <div
        v-if="loadError"
        class="text-red-400 text-center"
      >
        <p>{{ loadError }}</p>
        <button
          class="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          @click="retryInit"
        >
          重试
        </button>
      </div>
      
      <div
        v-else
        class="text-center"
      >
        <div class="loading-spinner" />
        <p class="text-slate-400">加载音频采样... {{ loadedCount }}/{{ totalSamples }}</p>
        
        <!-- Start button -->
        <button
          v-if="loadedCount > 0 || drumKitStore.isElectronic"
          class="btn-start"
          @click="startAudio"
        >
          点击开始演奏
        </button>
      </div>
    </div>

    <!-- Main interface -->
    <template v-else>
      <!-- 教学模式 -->
      <main v-if="currentMode === 'teaching'" class="teaching-mode">
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
              @trigger="handleDrumTrigger"
            />
            
            <KeyboardHint v-if="settingsStore.showKeyboardHints" />
          </div>
        </div>
      </main>
      
      <!-- 自由演奏模式 -->
      <main v-else class="flex-1 flex flex-col lg:flex-row items-start justify-center p-4 gap-6">
        <!-- Accompaniment Panel (Left side on large screens) -->
        <div v-if="showAccompaniment" class="accompaniment-panel">
          <SongSelector />
          <PlaybackControls />
        </div>
        
        <!-- Drum Kit (Center) -->
        <div class="drum-kit-container">
          <DrumKit
            :active-drums="combinedActiveDrums"
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

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <span class="status-indicator" :class="audioContextState">
            {{ audioContextState === 'running' ? '● 音频就绪' : '● 音频暂停' }}
          </span>
          
          <span v-if="currentMode === 'teaching' && teachingStore.isInLesson" class="mode-badge mode-teaching">
            📚 教学中
          </span>
          
          <span v-if="accompanimentStore.isPlaying" class="mode-badge mode-playing">
            ▶ 伴奏中
          </span>
          
          <span v-if="accompanimentStore.isAutoMode" class="mode-badge mode-auto">
            🤖 自动
          </span>
          
          <span v-if="drumKitStore.currentKitConfig" class="kit-badge">
            {{ drumKitStore.currentKitConfig.nameZh }}
          </span>
        </div>
      </footer>
    </template>
    
    <!-- Settings Panel -->
    <SettingsPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import DrumKit from './components/DrumKit.vue'
import KeyboardHint from './components/KeyboardHint.vue'
import RecordingPanel from './components/RecordingPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import DrumKitSelector from './components/DrumKitSelector.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import SongSelector from './components/SongSelector.vue'
import PlaybackControls from './components/PlaybackControls.vue'
import LessonSelector from './components/LessonSelector.vue'
import LessonPanel from './components/LessonPanel.vue'
import { useAudio } from './composables/useAudio'
import { useKeyboard } from './composables/useKeyboard'
import { useThemeStore } from './stores/useThemeStore'
import { useDrumKitStore } from './stores/useDrumKitStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useAccompanimentStore } from './stores/useAccompanimentStore'
import { useTeachingStore } from './stores/useTeachingStore'

type AppMode = 'teaching' | 'free'

const {
  state: audioState,
  isLoading,
  loadError,
  loadedCount,
  totalSamples,
  initAudio,
  playDrum,
  unlockAudio
} = useAudio()

const themeStore = useThemeStore()
const drumKitStore = useDrumKitStore()
const settingsStore = useSettingsStore()
const accompanimentStore = useAccompanimentStore()
const teachingStore = useTeachingStore()

const isInitialized = computed(() => audioState.value.isInitialized)
const audioContextState = computed(() => audioState.value.context?.state || 'suspended')

const currentMode = ref<AppMode>('teaching') // 默认进入教学模式
const activeDrums = ref<Set<string>>(new Set())
const recordingPanelRef = ref<InstanceType<typeof RecordingPanel>>()
const showAccompaniment = ref(false)

// Animation frame for auto-play
let animationFrameId: number | null = null
let lastTime = 0

// Combine manual active drums with accompaniment active drums and teaching active drums
const combinedActiveDrums = computed(() => {
  const combined = new Set(activeDrums.value)
  accompanimentStore.activeDrums.forEach(drum => combined.add(drum))
  teachingStore.activeDrums.forEach(drum => combined.add(drum))
  return combined
})

// 切换模式
const switchMode = (mode: AppMode) => {
  currentMode.value = mode
  
  // 退出教学模式时清理
  if (mode === 'free' && teachingStore.isInLesson) {
    teachingStore.exitLesson()
  }
  
  localStorage.setItem('drum-app-mode', mode)
}

// 加载模式偏好
try {
  const savedMode = localStorage.getItem('drum-app-mode')
  if (savedMode && (savedMode === 'teaching' || savedMode === 'free')) {
    currentMode.value = savedMode
  }
} catch (err) {
  console.error('Failed to load mode preference:', err)
}

// Toggle accompaniment panel
const toggleAccompaniment = () => {
  showAccompaniment.value = !showAccompaniment.value
  localStorage.setItem('show-accompaniment', showAccompaniment.value.toString())
}

// Load accompaniment panel preference
try {
  const saved = localStorage.getItem('show-accompaniment')
  if (saved) {
    showAccompaniment.value = saved === 'true'
  }
} catch (err) {
  console.error('Failed to load accompaniment preference:', err)
}

// Handle drum trigger (manual, auto, or teaching)
const handleDrumTrigger = (drumId: string) => {
  // Play audio
  const played = playDrum(drumId)
  
  if (played) {
    // Visual feedback
    activeDrums.value.add(drumId)
    setTimeout(() => {
      activeDrums.value.delete(drumId)
    }, settingsStore.reduceAnimations ? 50 : 100)
    
    // Teaching mode: handle judgment
    if (currentMode.value === 'teaching' && teachingStore.isInLesson) {
      teachingStore.handleHit(drumId)
    }
    
    // Free mode: record event if recording
    if (currentMode.value === 'free') {
      recordingPanelRef.value?.recordEvent(drumId)
    }
  }
}

// Auto-play loop using requestAnimationFrame
const autoPlayLoop = (timestamp: number) => {
  if (!accompanimentStore.isPlaying) {
    lastTime = 0
    return
  }
  
  if (lastTime === 0) {
    lastTime = timestamp
  }
  
  const deltaTime = (timestamp - lastTime) / 1000 // Convert to seconds
  lastTime = timestamp
  
  // Update time
  accompanimentStore.updateTime(deltaTime)
  
  // Check for beats to trigger in auto mode
  if (accompanimentStore.isAutoMode) {
    const beats = accompanimentStore.getNextTriggerBeats(accompanimentStore.currentTime, 50)
    
    beats.forEach(beat => {
      // Trigger drum
      handleDrumTrigger(beat.drum)
      
      // Highlight drum
      accompanimentStore.setDrumActive(beat.drum, true)
      setTimeout(() => {
        accompanimentStore.setDrumActive(beat.drum, false)
      }, settingsStore.reduceAnimations ? 50 : 150)
    })
  }
  
  // Continue loop if still playing
  if (accompanimentStore.isPlaying) {
    animationFrameId = requestAnimationFrame(autoPlayLoop)
  }
}

// Start/stop auto-play loop
watch(() => accompanimentStore.isPlaying, (isPlaying) => {
  if (isPlaying) {
    // Resume audio context if needed
    if (audioState.value.context?.state === 'suspended') {
      audioState.value.context.resume()
    }
    
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

// Start audio (needs user interaction)
const startAudio = async () => {
  await unlockAudio()
}

const retryInit = () => {
  loadError.value = null
  initAudio()
}

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  teachingStore.cleanup()
})

// Auto-init on mount
onMounted(() => {
  initAudio()
})
</script>

<style scoped>
@import "tailwindcss";

.app-header {
  @apply p-4 flex items-center justify-between gap-4;
  flex-direction: column;
}

@media (min-width: 640px) {
  .app-header {
    flex-direction: row;
  }
}

.header-content {
  @apply text-center;
}

@media (min-width: 640px) {
  .header-content {
    text-align: left;
  }
}

.app-title {
  @apply font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent;
  font-size: 1.5rem;
}

@media (min-width: 640px) {
  .app-title {
    font-size: 1.875rem;
  }
}

@media (min-width: 768px) {
  .app-title {
    font-size: 2.25rem;
  }
}

.app-subtitle {
  @apply text-slate-400 mt-1 text-sm;
}

.header-controls {
  @apply flex items-center gap-2 flex-wrap justify-center;
}

.btn-settings {
  @apply w-9 h-9 flex items-center justify-center rounded-lg
         bg-slate-700/50 hover:bg-slate-700 text-slate-300 
         hover:text-white transition-all text-lg;
}

.btn-mode {
  @apply px-3 py-2 rounded-lg text-sm font-medium
         bg-slate-700/50 hover:bg-slate-700 text-slate-300
         hover:text-white transition-all flex items-center gap-1;
}

.btn-mode-active {
  @apply bg-pink-500/20 text-pink-400 border border-pink-500/50;
}

.loading-spinner {
  @apply w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4;
}

.btn-start {
  @apply mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-violet-500 
         hover:from-pink-600 hover:to-violet-600 text-white font-medium 
         rounded-xl transition-all transform hover:scale-105 shadow-lg;
  box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.25);
}

/* Teaching mode layout */
.teaching-mode {
  @apply flex-1 p-4;
}

.teaching-layout {
  @apply flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto;
}

.teaching-sidebar {
  @apply w-full lg:w-80 flex-shrink-0;
}

.teaching-main {
  @apply flex-1 min-w-0;
}

.teaching-drumkit {
  @apply w-full lg:w-auto flex-shrink-0 flex flex-col items-center;
}

/* Free play layout */
main:not(.teaching-mode) {
  @apply w-full max-w-7xl mx-auto;
}

.accompaniment-panel {
  @apply w-full lg:w-80 flex flex-col gap-4;
}

.drum-kit-container {
  @apply flex-1 flex flex-col items-center justify-center gap-6;
}

.app-footer {
  @apply p-4 text-center;
}

.footer-content {
  @apply flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap;
}

.status-indicator {
  @apply flex items-center gap-1;
}

.status-indicator.running {
  @apply text-green-500;
}

.status-indicator.suspended {
  @apply text-yellow-500;
}

.kit-badge {
  @apply px-2 py-0.5 rounded-full bg-slate-700 text-slate-300;
}

.mode-badge {
  @apply px-2 py-0.5 rounded-full text-xs font-medium;
}

.mode-teaching {
  @apply bg-blue-500/20 text-blue-400;
}

.mode-playing {
  @apply bg-pink-500/20 text-pink-400;
}

.mode-auto {
  @apply bg-purple-500/20 text-purple-400;
}

/* Theme-specific styles */
.theme-light .app-title {
  background-image: linear-gradient(to right, #6366f1, #3b82f6);
}

.theme-light .btn-start {
  background-image: linear-gradient(to right, #6366f1, #3b82f6);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.25);
}

.theme-light .btn-mode-active {
  @apply bg-blue-500/20 text-blue-500 border-blue-500/50;
}

.theme-light .kit-badge {
  @apply bg-slate-200 text-slate-600;
}

.theme-cyberpunk .app-title {
  background-image: linear-gradient(to right, #22d3ee, #ec4899, #facc15);
}

.theme-cyberpunk .btn-start {
  background-image: linear-gradient(to right, #06b6d4, #ec4899, #eab308);
  box-shadow: 0 10px 30px -10px rgba(0, 255, 159, 0.5);
}

.theme-cyberpunk .loading-spinner {
  @apply border-cyan-500/30 border-t-cyan-400;
}

.theme-cyberpunk .btn-mode {
  @apply bg-slate-800/50 text-cyan-400 border border-cyan-500/30;
}

.theme-cyberpunk .btn-mode-active {
  @apply bg-cyan-500/20 text-cyan-300 border-cyan-500/60;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}

.theme-cyberpunk .mode-teaching {
  @apply bg-cyan-500/20 text-cyan-400;
}

.theme-cyberpunk .mode-playing {
  @apply bg-pink-500/20 text-pink-400;
}

.theme-cyberpunk .mode-auto {
  @apply bg-pink-500/20 text-pink-400;
}

.theme-cyberpunk .kit-badge {
  @apply bg-slate-800 text-cyan-400;
}
</style>
