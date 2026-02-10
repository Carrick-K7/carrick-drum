<template>
  <div class="beat-guide">
    <!-- 时间轴 -->
    <div class="timeline">
      <!-- 当前时间标记 -->
      <div class="now-marker">
        <div class="now-label">NOW</div>
        <div class="now-line"></div>
      </div>
      
      <!-- 即将到来的节拍 -->
      <div 
        v-for="(beat, index) in visibleBeats" 
        :key="`${beat.time}-${beat.drum}-${index}`"
        class="beat-marker"
        :class="{
          'beat-kick': beat.drum === 'kick',
          'beat-snare': beat.drum === 'snare',
          'beat-hihat': beat.drum?.includes('hihat'),
          'beat-active': index === 0 && timeToBeat(beat) <= 500,
        }"
        :style="getBeatStyle(beat)"
      >
        <!-- 鼓图标 -->
        <div class="beat-icon">
          {{ getDrumIcon(beat.drum) }}
        </div>
        
        <!-- 拍号标签 -->
        <div v-if="beat.label" class="beat-label">
          {{ beat.label }}
        </div>
        
        <!-- 倒计时环 -->
        <div 
          v-if="index === 0" 
          class="countdown-ring"
          :style="getCountdownStyle(beat)"
        ></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="visibleBeats.length === 0" class="no-beats">
        🎵 准备开始...
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Beat } from '../types'

interface Props {
  beats: Beat[]
  currentTime: number // 毫秒
  duration: number // 秒
  progress: number // 0-100
  lookaheadMs?: number // 向前看多少毫秒
}

const props = withDefaults(defineProps<Props>(), {
  lookaheadMs: 2000,
})

// 可见的节拍（在lookahead窗口内）
const visibleBeats = computed(() => {
  return props.beats.filter(beat => {
    const beatTime = beat.time * 1000
    const timeUntilBeat = beatTime - props.currentTime
    return timeUntilBeat >= -200 && timeUntilBeat <= props.lookaheadMs
  }).slice(0, 6)
})

// 计算距离节拍还有多少毫秒
function timeToBeat(beat: Beat): number {
  return beat.time * 1000 - props.currentTime
}

// 获取节拍的样式（位置）
function getBeatStyle(beat: Beat) {
  const timeUntil = timeToBeat(beat)
  // 将时间映射到位置（-100px 到 300px）
  const position = Math.max(-50, Math.min(350, timeUntil / 5))
  
  return {
    transform: `translateX(${position}px)`,
    opacity: timeUntil < 0 ? 0.3 : Math.min(1, 0.3 + (2000 - timeUntil) / 2000),
  }
}

// 获取倒计时环样式
function getCountdownStyle(beat: Beat) {
  const timeUntil = timeToBeat(beat)
  const progress = Math.max(0, Math.min(1, 1 - timeUntil / 1000))
  
  return {
    background: `conic-gradient(
      from 0deg,
      currentColor ${progress * 360}deg,
      transparent ${progress * 360}deg
    )`,
  }
}

// 获取鼓的图标
function getDrumIcon(drumId: string): string {
  const icons: Record<string, string> = {
    'kick': '🥁',
    'snare': '🎯',
    'hihat-closed': '⬇️',
    'hihat-open': '⬆️',
    'crash': '💥',
    'ride': '🔔',
    'tom-high': '🎵',
    'tom-mid': '🎶',
    'tom-low': '🎼',
  }
  return icons[drumId] || '🥁'
}
</script>

<style scoped>
@reference "../style.css";
.beat-guide {
  @apply w-full max-w-2xl mx-auto;
}

.timeline {
  @apply relative h-32 flex items-center justify-center overflow-hidden;
  @apply bg-slate-800/50 rounded-2xl border border-slate-700;
}

.now-marker {
  @apply absolute left-1/2 top-0 bottom-0 flex flex-col items-center;
  transform: translateX(-50%);
}

.now-label {
  @apply text-xs font-bold text-pink-500 px-2 py-1 mt-1 rounded;
  @apply bg-pink-500/20;
}

.now-line {
  @apply w-0.5 flex-1 bg-gradient-to-b from-pink-500 to-transparent;
}

.beat-marker {
  @apply absolute flex flex-col items-center gap-1;
  @apply transition-all duration-100;
}

.beat-icon {
  @apply w-12 h-12 flex items-center justify-center text-2xl;
  @apply rounded-full bg-slate-700 border-2;
  @apply transition-transform duration-100;
}

.beat-kick .beat-icon {
  @apply border-orange-500 bg-orange-500/20;
}

.beat-snare .beat-icon {
  @apply border-blue-500 bg-blue-500/20;
}

.beat-hihat .beat-icon {
  @apply border-green-500 bg-green-500/20;
}

.beat-active .beat-icon {
  @apply scale-125;
  animation: beat-pulse 0.3s ease-out;
}

.beat-label {
  @apply text-xs font-bold text-slate-400;
}

.countdown-ring {
  @apply absolute inset-0 rounded-full;
  @apply opacity-50;
  mask: radial-gradient(transparent 60%, black 61%);
  -webkit-mask: radial-gradient(transparent 60%, black 61%);
}

.no-beats {
  @apply text-slate-500 text-lg;
}

.progress-bar {
  @apply h-2 mt-4 bg-slate-800 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-pink-500 to-violet-500;
  @apply transition-all duration-100;
}

@keyframes beat-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 20px 5px currentColor;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
  }
}

/* 主题适配 */
:global(.theme-light) .timeline {
  @apply bg-slate-100 border-slate-200;
}

:global(.theme-light) .beat-icon {
  @apply bg-white border-slate-300;
}

:global(.theme-cyberpunk) .timeline {
  @apply bg-slate-900/80 border-cyan-500/30;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
}

:global(.theme-cyberpunk) .now-line {
  @apply from-cyan-400;
}

:global(.theme-cyberpunk) .beat-icon {
  @apply bg-slate-800 border-cyan-500/50 text-cyan-400;
}
</style>
