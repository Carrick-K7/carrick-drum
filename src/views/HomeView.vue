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
        <router-link
          to="/teaching"
          class="btn-mode"
          :class="{ 'btn-mode-active': $route.path === '/teaching' }"
        >
          📚 教学模式
        </router-link>
        
        <router-link
          to="/practice"
          class="btn-mode"
          :class="{ 'btn-mode-active': $route.path === '/practice' }"
        >
          🎯 练习模式
        </router-link>
        
        <router-link
          to="/free"
          class="btn-mode"
          :class="{ 'btn-mode-active': $route.path === '/free' }"
        >
          🎵 自由演奏
        </router-link>
        
        <router-link
          to="/scores"
          class="btn-mode"
          :class="{ 'btn-mode-active': $route.path === '/scores' }"
        >
          🏆 成绩中心
        </router-link>
        
        <router-link
          to="/todo"
          class="btn-mode"
          :class="{ 'btn-mode-active': $route.path === '/todo' }"
        >
          📝 待办
        </router-link>
        
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

    <!-- Main content with router view -->
    <template v-else>
      <router-view />
    </template>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <span class="status-indicator" :class="audioContextState">
          {{ audioContextState === 'running' ? '● 音频就绪' : '● 音频暂停' }}
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
    
    <!-- Settings Panel -->
    <SettingsPanel />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import DrumKitSelector from '../components/DrumKitSelector.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import { useAudio } from '../composables/useAudio'
import { useThemeStore } from '../stores/useThemeStore'
import { useDrumKitStore } from '../stores/useDrumKitStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAccompanimentStore } from '../stores/useAccompanimentStore'

const {
  state: audioState,
  loadError,
  loadedCount,
  totalSamples,
  initAudio,
  unlockAudio
} = useAudio()

const themeStore = useThemeStore()
const drumKitStore = useDrumKitStore()
const settingsStore = useSettingsStore()
const accompanimentStore = useAccompanimentStore()

const isInitialized = computed(() => audioState.value.isInitialized)
const audioContextState = computed(() => audioState.value.context?.state || 'suspended')

const startAudio = async () => {
  await unlockAudio()
}

const retryInit = () => {
  loadError.value = null
  initAudio()
}

onMounted(() => {
  initAudio()
})

onUnmounted(() => {
  accompanimentStore.cleanup()
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.p-8 {
  padding: 2rem;
}

.text-center {
  text-align: center;
}

.text-red-400 {
  color: #f87171;
}

.mt-4 {
  margin-top: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.bg-red-500\/20 {
  background-color: rgba(239, 68, 68, 0.2);
}

.hover\:bg-red-500\/30:hover {
  background-color: rgba(239, 68, 68, 0.3);
}

.rounded-lg {
  border-radius: 0.5rem;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
}

.app-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-direction: column;
}

@media (min-width: 640px) {
  .app-header {
    flex-direction: row;
  }
}

.header-content {
  text-align: center;
}

@media (min-width: 640px) {
  .header-content {
    text-align: left;
  }
}

.app-title {
  font-weight: 700;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  color: #94a3b8;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-settings {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background-color: rgba(51, 65, 85, 0.5);
  color: #cbd5e1;
  font-size: 1.125rem;
  border: none;
  cursor: pointer;
}

.btn-settings:hover {
  background-color: rgb(51, 65, 85);
  color: white;
}

.btn-mode {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: rgba(51, 65, 85, 0.5);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.btn-mode:hover {
  background-color: rgb(51, 65, 85);
  color: white;
}

.btn-mode-active {
  background-color: rgba(236, 72, 153, 0.2);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.5);
}

.loading-spinner {
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(236, 72, 153, 0.3);
  border-top-color: #ec4899;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-start {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(to right, #ec4899, #8b5cf6);
  color: white;
  font-weight: 500;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
  box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.25);
}

.btn-start:hover {
  background: linear-gradient(to right, #db2777, #7c3aed);
  transform: scale(1.05);
}

.text-slate-400 {
  color: #94a3b8;
}

.app-footer {
  padding: 1rem;
  text-align: center;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-indicator.running {
  color: #22c55e;
}

.status-indicator.suspended {
  color: #eab308;
}

.kit-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: rgb(51, 65, 85);
  color: #cbd5e1;
  font-size: 0.75rem;
}

.mode-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.mode-playing {
  background-color: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.mode-auto {
  background-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

/* Theme-specific styles */
.theme-light .app-title {
  background: linear-gradient(to right, #6366f1, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-light .btn-start {
  background: linear-gradient(to right, #6366f1, #3b82f6);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.25);
}

.theme-light .btn-mode-active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.5);
}

.theme-light .kit-badge {
  background-color: #e2e8f0;
  color: #475569;
}

.theme-cyberpunk .app-title {
  background: linear-gradient(to right, #22d3ee, #ec4899, #facc15);
  -webkit-background-clip: text;
  background-clip: text;
}

.theme-cyberpunk .btn-start {
  background: linear-gradient(to right, #06b6d4, #ec4899, #eab308);
  box-shadow: 0 10px 30px -10px rgba(0, 255, 159, 0.5);
}

.theme-cyberpunk .loading-spinner {
  border-color: rgba(6, 182, 212, 0.3);
  border-top-color: #22d3ee;
}

.theme-cyberpunk .btn-mode {
  background-color: rgba(30, 41, 59, 0.5);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.theme-cyberpunk .btn-mode-active {
  background-color: rgba(6, 182, 212, 0.2);
  color: #67e8f9;
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}

.theme-cyberpunk .kit-badge {
  background-color: rgb(30, 41, 59);
  color: #22d3ee;
}
</style>
