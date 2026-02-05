<template>
  <div class="playback-controls">
    <!-- 模式切换 -->
    <div class="mode-section">
      <span class="mode-label">模式</span>
      <button
        class="mode-toggle"
        :class="{ 'mode-auto': accompanimentStore.isAutoMode }"
        @click="accompanimentStore.toggleMode()"
      >
        <span class="mode-option" :class="{ active: !accompanimentStore.isAutoMode }">
          🎮 手动
        </span>
        <span class="mode-option" :class="{ active: accompanimentStore.isAutoMode }">
          🤖 自动
        </span>
        <div class="mode-indicator" :class="{ 'indicator-right': accompanimentStore.isAutoMode }" />
      </button>
    </div>

    <!-- 播放控制 -->
    <div class="controls-section">
      <button
        class="control-btn btn-stop"
        :disabled="accompanimentStore.isStopped"
        @click="accompanimentStore.stop()"
      >
        ⏹
      </button>
      
      <button
        class="control-btn btn-play"
        :class="{ 'btn-pause': accompanimentStore.isPlaying }"
        @click="togglePlay"
      >
        {{ accompanimentStore.isPlaying ? '⏸' : '▶' }}
      </button>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="time-display">
        <span class="time-current">{{ accompanimentStore.formattedTime }}</span>
        <span class="time-separator">/</span>
        <span class="time-total">{{ accompanimentStore.formattedDuration }}</span>
      </div>
      
      <div class="progress-bar-container">
        <input
          type="range"
          class="progress-bar"
          min="0"
          max="100"
          step="0.1"
          :value="accompanimentStore.progress"
          :disabled="!accompanimentStore.currentSong"
          @input="handleSeek"
        />
        <div 
          class="progress-fill" 
          :style="{ width: `${accompanimentStore.progress}%` }" 
        />
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div v-if="accompanimentStore.currentSong" class="song-info-mini">
      <span class="song-badge" :class="`badge-${accompanimentStore.currentSong.style}`">
        {{ getStyleLabel(accompanimentStore.currentSong.style) }}
      </span>
      <span class="song-name">{{ accompanimentStore.currentSong.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccompanimentStore } from '../stores/useAccompanimentStore'

const accompanimentStore = useAccompanimentStore()

const togglePlay = () => {
  accompanimentStore.togglePlay()
}

const handleSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  const percentage = parseFloat(target.value)
  accompanimentStore.seekTo(percentage)
}

const getStyleLabel = (style: string) => {
  const labels: Record<string, string> = {
    rock: '摇滚',
    pop: '流行',
    electronic: '电子'
  }
  return labels[style] || style
}
</script>

<style scoped>
@import "tailwindcss";

.playback-controls {
  @apply bg-slate-800/50 rounded-xl p-4 border border-slate-700/50
         flex flex-col gap-4;
}

/* 模式切换 */
.mode-section {
  @apply flex items-center justify-between gap-3;
}

.mode-label {
  @apply text-sm text-slate-400 font-medium;
}

.mode-toggle {
  @apply relative flex items-center p-1 rounded-full
         bg-slate-700/50 border border-slate-600/50
         transition-colors duration-200;
  min-width: 140px;
}

.mode-toggle:hover {
  @apply border-slate-500/50;
}

.mode-option {
  @apply relative z-10 flex-1 py-1.5 px-2 text-xs font-medium
         text-center rounded-full transition-colors duration-200
         text-slate-400;
}

.mode-option.active {
  @apply text-white;
}

.mode-indicator {
  @apply absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)]
         rounded-full bg-pink-500 transition-all duration-300;
}

.mode-indicator.indicator-right {
  @apply left-[calc(50%+4px)];
}

/* 控制按钮 */
.controls-section {
  @apply flex items-center justify-center gap-4;
}

.control-btn {
  @apply w-12 h-12 rounded-full flex items-center justify-center
         text-xl transition-all duration-150
         disabled:opacity-30 disabled:cursor-not-allowed;
}

.btn-stop {
  @apply bg-slate-700/50 hover:bg-slate-700 text-slate-300;
}

.btn-play {
  @apply w-14 h-14 text-2xl
         bg-gradient-to-r from-pink-500 to-violet-500
         hover:from-pink-600 hover:to-violet-600
         text-white shadow-lg;
  box-shadow: 0 10px 20px -5px rgba(236, 72, 153, 0.4);
}

.btn-play:active {
  @apply scale-95;
}

.btn-pause {
  @apply from-amber-500 to-orange-500
         hover:from-amber-600 hover:to-orange-600;
  box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
}

/* 进度条 */
.progress-section {
  @apply flex flex-col gap-2;
}

.time-display {
  @apply flex items-center justify-center gap-1 text-xs text-slate-400 font-mono;
}

.time-current {
  @apply text-slate-200;
}

.progress-bar-container {
  @apply relative h-6 flex items-center;
}

.progress-bar {
  @apply absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10;
}

.progress-bar::-webkit-slider-thumb {
  @apply w-4 h-4 rounded-full bg-white cursor-pointer;
  -webkit-appearance: none;
  appearance: none;
}

.progress-bar::-moz-range-thumb {
  @apply w-4 h-4 rounded-full bg-white cursor-pointer border-0;
}

/* 自定义进度条轨道 */
.progress-bar-container::before {
  content: '';
  @apply absolute inset-y-0 left-0 right-0 rounded-full bg-slate-700/50;
  height: 6px;
  top: 50%;
  transform: translateY(-50%);
}

.progress-fill {
  @apply absolute left-0 h-[6px] rounded-full bg-gradient-to-r from-pink-500 to-violet-500 pointer-events-none;
  top: 50%;
  transform: translateY(-50%);
  transition: width 0.1s linear;
}

/* 歌曲信息 */
.song-info-mini {
  @apply flex items-center justify-center gap-2 text-sm;
}

.song-badge {
  @apply px-2 py-0.5 rounded text-xs font-medium;
}

.badge-rock {
  @apply bg-red-500/20 text-red-400;
}

.badge-pop {
  @apply bg-blue-500/20 text-blue-400;
}

.badge-electronic {
  @apply bg-purple-500/20 text-purple-400;
}

.song-name {
  @apply text-slate-300 truncate max-w-[200px];
}

/* Light theme */
:global(.theme-light) .playback-controls {
  @apply bg-slate-100 border-slate-200;
}

:global(.theme-light) .mode-toggle {
  @apply bg-slate-200 border-slate-300;
}

:global(.theme-light) .mode-indicator {
  @apply bg-blue-500;
}

:global(.theme-light) .btn-stop {
  @apply bg-slate-200 text-slate-600 hover:bg-slate-300;
}

:global(.theme-light) .btn-play {
  @apply from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600;
  box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
}

:global(.theme-light) .btn-pause {
  @apply from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500;
}

:global(.theme-light) .progress-bar-container::before {
  @apply bg-slate-200;
}

:global(.theme-light) .progress-fill {
  @apply from-blue-500 to-indigo-500;
}

:global(.theme-light) .time-current {
  @apply text-slate-700;
}

:global(.theme-light) .song-name {
  @apply text-slate-600;
}

/* Cyberpunk theme */
:global(.theme-cyberpunk) .playback-controls {
  @apply bg-slate-900/80 border-cyan-500/30;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
}

:global(.theme-cyberpunk) .mode-toggle {
  @apply bg-slate-800/50 border-cyan-500/30;
}

:global(.theme-cyberpunk) .mode-indicator {
  @apply bg-cyan-500;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

:global(.theme-cyberpunk) .btn-stop {
  @apply bg-slate-800 text-cyan-400 hover:bg-slate-700;
}

:global(.theme-cyberpunk) .btn-play {
  @apply from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400;
  box-shadow: 0 10px 20px -5px rgba(6, 182, 212, 0.5);
}

:global(.theme-cyberpunk) .btn-pause {
  @apply from-yellow-400 to-orange-500;
}

:global(.theme-cyberpunk) .progress-fill {
  @apply from-cyan-400 to-pink-400;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

:global(.theme-cyberpunk) .time-current {
  @apply text-cyan-100;
}

:global(.theme-cyberpunk) .song-name {
  @apply text-cyan-200;
}
</style>
