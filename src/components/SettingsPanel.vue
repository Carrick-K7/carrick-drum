<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="settingsStore.isSettingsOpen" class="settings-modal">
        <div class="modal-overlay" @click="settingsStore.closeSettings" />
        
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="text-lg font-bold flex items-center gap-2">
              <span>⚙️</span>
              设置
            </h2>
            <button class="btn-close" @click="settingsStore.closeSettings">
              ✕
            </button>
          </div>
          
          <!-- Content -->
          <div class="modal-body">
            <!-- 主音量 -->
            <section class="setting-section">
              <h3 class="section-title">主音量</h3>
              <div class="volume-control">
                <button class="btn-mute" @click="toggleMute">
                  {{ isMuted ? '🔇' : masterVolume > 0.5 ? '🔊' : '🔉' }}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="masterVolume"
                  class="volume-slider"
                  @input="updateMasterVolume"
                >
                <span class="volume-value">{{ Math.round(masterVolume * 100) }}%</span>
              </div>
            </section>
            
            <!-- 各鼓件音量 -->
            <section class="setting-section">
              <h3 class="section-title">鼓件音量</h3>
              <div class="drum-volumes">
                <div v-for="drum in DRUMS" :key="drum.id" class="drum-volume">
                  <label class="drum-label">{{ drum.nameZh }}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="settingsStore.settings.volumes.drums[drum.id] ?? 1"
                    class="volume-slider small"
                    @input="updateDrumVolume(drum.id, $event)"
                  >
                </div>
              </div>
            </section>
            
            <!-- 显示选项 -->
            <section class="setting-section">
              <h3 class="section-title">显示选项</h3>
              
              <label class="toggle-row">
                <span>显示键盘提示</span>
                <input
                  type="checkbox"
                  :checked="settingsStore.showKeyboardHints"
                  @change="settingsStore.toggleKeyboardHints"
                >
              </label>
              
              <label class="toggle-row">
                <span>减少动画效果</span>
                <input
                  type="checkbox"
                  :checked="settingsStore.reduceAnimations"
                  @change="settingsStore.toggleAnimations"
                >
              </label>
            </section>
          </div>
          
          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-reset" @click="resetSettings">
              恢复默认
            </button>
            <button class="btn-done" @click="settingsStore.closeSettings">
              完成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '../stores/useSettingsStore'
import { DRUMS } from '../constants/drums'

const settingsStore = useSettingsStore()

const masterVolume = computed(() => settingsStore.masterVolume)
const isMuted = computed(() => masterVolume.value === 0)

const updateMasterVolume = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  settingsStore.setMasterVolume(value)
}

const updateDrumVolume = (drumId: string, e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  settingsStore.setDrumVolume(drumId, value)
}

const toggleMute = () => {
  if (masterVolume.value > 0) {
    settingsStore.setMasterVolume(0)
  } else {
    settingsStore.setMasterVolume(0.9)
  }
}

const resetSettings = () => {
  if (confirm('确定要恢复所有设置为默认值吗？')) {
    settingsStore.resetSettings()
  }
}
</script>

<style scoped>
@import "tailwindcss";
.settings-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
}

.modal-overlay {
  @apply absolute inset-0 bg-black/60 backdrop-blur-sm;
}

.modal-content {
  @apply relative w-full max-w-md max-h-[85vh] rounded-2xl 
         bg-slate-800 border border-slate-700 shadow-2xl
         flex flex-col overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 
         border-b border-slate-700;
}

.btn-close {
  @apply w-8 h-8 flex items-center justify-center rounded-full
         text-slate-400 hover:text-white hover:bg-slate-700 transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6 space-y-6;
}

.setting-section {
  @apply space-y-3;
}

.section-title {
  @apply text-sm font-medium text-slate-400 uppercase tracking-wider;
}

.volume-control {
  @apply flex items-center gap-3;
}

.btn-mute {
  @apply w-10 h-10 flex items-center justify-center rounded-lg
         bg-slate-700 hover:bg-slate-600 transition-colors text-xl;
}

.volume-slider {
  @apply flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer;
  background-image: linear-gradient(to right, #ec4899, #8b5cf6);
  background-size: var(--volume-percent, 90%) 100%;
  background-repeat: no-repeat;
}

.volume-slider.small {
  @apply h-1.5;
}

.volume-slider::-webkit-slider-thumb {
  @apply w-5 h-5 rounded-full bg-white shadow-lg cursor-pointer appearance-none
         transition-transform hover:scale-110;
}

.volume-slider.small::-webkit-slider-thumb {
  @apply w-4 h-4;
}

.volume-slider::-moz-range-thumb {
  @apply w-5 h-5 rounded-full bg-white shadow-lg cursor-pointer border-0;
}

.volume-value {
  @apply w-12 text-right text-sm text-slate-400 tabular-nums;
}

.drum-volumes {
  @apply space-y-2;
}

.drum-volume {
  @apply flex items-center gap-3;
}

.drum-label {
  @apply w-20 text-sm text-slate-300;
}

.toggle-row {
  @apply flex items-center justify-between py-2 cursor-pointer;
}

.toggle-row span {
  @apply text-slate-300;
}

.toggle-row input[type="checkbox"] {
  @apply w-11 h-6 rounded-full bg-slate-700 appearance-none cursor-pointer
         relative transition-colors duration-200;
}

.toggle-row input[type="checkbox"]:checked {
  @apply bg-pink-500;
}

.toggle-row input[type="checkbox"]::after {
  content: '';
  @apply absolute top-1 left-1 w-4 h-4 rounded-full bg-white 
         transition-transform duration-200;
}

.toggle-row input[type="checkbox"]:checked::after {
  @apply translate-x-5;
}

.modal-footer {
  @apply flex items-center justify-between px-6 py-4 
         border-t border-slate-700 bg-slate-800/50;
}

.btn-reset {
  @apply px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors;
}

.btn-done {
  @apply px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 
         hover:from-pink-600 hover:to-violet-600 text-white 
         rounded-lg font-medium transition-all;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  @apply scale-95 opacity-0;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
  @apply w-2;
}

.modal-body::-webkit-scrollbar-track {
  @apply bg-slate-800;
}

.modal-body::-webkit-scrollbar-thumb {
  @apply bg-slate-700 rounded;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-600;
}
</style>
