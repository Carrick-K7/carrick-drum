<template>
  <div class="realtime-judgment">
    <!-- 判定文字浮动显示 -->
    <transition-group name="judgment-float" tag="div" class="judgment-container">
      <div
        v-for="item in visibleJudgments"
        :key="item.id"
        class="judgment-item"
        :class="`judgment-${item.type}`"
        :style="getItemStyle(item)"
      >
        <!-- 判定类型 -->
        <div class="judgment-type">
          <span class="judgment-text">{{ getJudgmentText(item.type) }}</span>
          <span v-if="item.combo > 1" class="combo-badge" :class="{ 'combo-high': item.combo >= 10 }">
            {{ item.combo }} Combo!
          </span>
        </div>
        
        <!-- 时间误差 -->
        <div v-if="item.deltaMs !== 0 && showDelta" class="delta-indicator">
          <div class="delta-bar">
            <div class="delta-center"></div>
            <div 
              class="delta-marker"
              :style="{ left: `${getDeltaPosition(item.deltaMs)}%` }"
            ></div>
          </div>
          <span class="delta-text" :class="getDeltaClass(item.deltaMs)">
            {{ formatDelta(item.deltaMs) }}
          </span>
        </div>
        
        <!-- 得分显示 -->
        <div v-if="showScore" class="judgment-score">
          +{{ item.score }}
        </div>
      </div>
    </transition-group>
    
    <!-- 当前连击显示 -->
    <div v-if="currentCombo > 1" class="combo-display"
      :class="{ 'combo-high': currentCombo >= 10, 'combo-mega': currentCombo >= 20, 'combo-ultra': currentCombo >= 50 }"
    >
      <div class="combo-number">{{ currentCombo }}</div>
      <div class="combo-label">COMBO</div>
      
      <!-- 连击粒子效果 -->
      <div v-if="currentCombo >= 10 && !settingsStore.reduceAnimations" class="combo-particles">
        <span v-for="i in 8" :key="i" class="particle" :class="`p${i}`">{{ i % 2 === 0 ? '✦' : '✨' }}</span>
      </div>
      
      <!-- 连击火焰效果 -->
      <div v-if="currentCombo >= 20 && !settingsStore.reduceAnimations" class="combo-fire">
        <div class="fire-base"></div>
      </div>
    </div>
    
    <!-- 判定统计条 -->
    <div v-if="showStats" class="judgment-stats">
      <div class="stat-bar">
        <div 
          class="stat-segment perfect"
          :style="{ width: `${getStatPercent('perfect')}%` }"
        ></div>
        <div 
          class="stat-segment good"
          :style="{ width: `${getStatPercent('good')}%` }"
        ></div>
        <div 
          class="stat-segment miss"
          :style="{ width: `${getStatPercent('miss')}%` }"
        ></div>
      </div>
      
      <div class="stat-labels">
        <span class="stat-label perfect">
          <span class="stat-dot"></span>
          Perfect {{ judgmentCounts.perfect }}
        </span>
        <span class="stat-label good">
          <span class="stat-dot"></span>
          Good {{ judgmentCounts.good }}
        </span>
        <span class="stat-label miss">
          <span class="stat-dot"></span>
          Miss {{ judgmentCounts.miss }}
        </span>
      </div>
      
      <!-- 总统计 -->
      <div class="total-stats">
        <span class="total-accuracy">准确率: {{ formatAccuracy() }}</span>
        <span class="total-score">总分: {{ totalScore }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { JudgmentType, JudgmentResult } from '../types'
import { useSettingsStore } from '../stores/useSettingsStore'

interface Props {
  /** 最新的判定结果 */
  judgment?: JudgmentResult | null
  /** 是否显示统计条 */
  showStats?: boolean
  /** 是否显示误差条 */
  showDelta?: boolean
  /** 是否显示得分 */
  showScore?: boolean
  /** 最大同时显示的判定数量 */
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  judgment: null,
  showStats: true,
  showDelta: true,
  showScore: true,
  maxVisible: 3,
})

const settingsStore = useSettingsStore()

// 可见的判定队列
interface VisibleJudgment extends JudgmentResult {
  id: string
  timestamp: number
  position: number
}

const visibleJudgments = ref<VisibleJudgment[]>([])
const judgmentHistory = ref<JudgmentResult[]>([])
const currentCombo = ref(0)
const totalScore = ref(0)

// 统计
const judgmentCounts = computed(() => {
  const counts = { perfect: 0, good: 0, miss: 0, none: 0 }
  judgmentHistory.value.forEach(j => {
    counts[j.type]++
  })
  return counts
})

const totalJudgments = computed(() => 
  judgmentCounts.value.perfect + judgmentCounts.value.good + judgmentCounts.value.miss
)

// 监听新的判定
watch(() => props.judgment, (newJudgment) => {
  if (!newJudgment || newJudgment.type === 'none') return
  
  // 添加到历史
  judgmentHistory.value.push(newJudgment)
  
  // 更新连击
  currentCombo.value = newJudgment.combo
  
  // 更新总分
  totalScore.value += newJudgment.score
  
  // 添加到可见队列
  const visibleJudgment: VisibleJudgment = {
    ...newJudgment,
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    position: Math.random() * 40 - 20, // 随机水平偏移
  }
  
  visibleJudgments.value.push(visibleJudgment)
  
  // 限制数量
  if (visibleJudgments.value.length > props.maxVisible) {
    visibleJudgments.value.shift()
  }
  
  // 自动移除
  setTimeout(() => {
    const index = visibleJudgments.value.findIndex(j => j.id === visibleJudgment.id)
    if (index > -1) {
      visibleJudgments.value.splice(index, 1)
    }
  }, settingsStore.reduceAnimations ? 400 : 1000)
}, { immediate: true })

// 方法
function getJudgmentText(type: JudgmentType): string {
  const texts: Record<JudgmentType, string> = {
    perfect: 'PERFECT!',
    good: 'GOOD',
    miss: 'MISS',
    none: '',
  }
  return texts[type]
}

function getItemStyle(item: VisibleJudgment) {
  const age = Date.now() - item.timestamp
  const duration = settingsStore.reduceAnimations ? 400 : 1000
  const progress = Math.min(1, age / duration)
  
  const opacity = Math.max(0, 1 - progress)
  const translateY = -progress * 50
  const scale = 1 - progress * 0.2
  
  return {
    transform: `translateX(${item.position}px) translateY(${translateY}px) scale(${scale})`,
    opacity,
    transition: 'none'
  }
}

function formatDelta(deltaMs: number): string {
  const sign = deltaMs > 0 ? '+' : ''
  return `${sign}${deltaMs.toFixed(0)}ms`
}

function getDeltaClass(deltaMs: number): string {
  if (deltaMs < -30) return 'early'
  if (deltaMs > 30) return 'late'
  return 'perfect'
}

function getDeltaPosition(deltaMs: number): number {
  // 将 -100ms 到 +100ms 映射到 0% 到 100%
  const clamped = Math.max(-100, Math.min(100, deltaMs))
  return 50 + (clamped / 100) * 50
}

function getStatPercent(type: 'perfect' | 'good' | 'miss'): number {
  if (totalJudgments.value === 0) return 0
  return (judgmentCounts.value[type] / totalJudgments.value) * 100
}

function formatAccuracy(): string {
  if (totalJudgments.value === 0) return '0.0%'
  const accuracy = (judgmentCounts.value.perfect + judgmentCounts.value.good * 0.5) / totalJudgments.value
  return `${(accuracy * 100).toFixed(1)}%`
}

// 重置统计
function reset() {
  visibleJudgments.value = []
  judgmentHistory.value = []
  currentCombo.value = 0
  totalScore.value = 0
}

// 暴露方法
defineExpose({ reset })
</script>

<style scoped>
@import "tailwindcss";

.realtime-judgment {
  @apply flex flex-col items-center;
}

.judgment-container {
  @apply relative h-28 w-full flex flex-col items-center justify-end;
  perspective: 500px;
}

.judgment-item {
  @apply absolute flex flex-col items-center;
  will-change: transform, opacity;
}

.judgment-type {
  @apply flex items-center gap-2;
}

.judgment-text {
  @apply text-3xl sm:text-4xl font-black;
  text-shadow: 0 0 20px currentColor;
  animation: judgment-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.judgment-perfect .judgment-text {
  @apply text-green-400;
  animation: perfect-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.judgment-good .judgment-text {
  @apply text-blue-400;
  animation: good-pop 0.3s ease-out;
}

.judgment-miss .judgment-text {
  @apply text-red-400;
  animation: miss-shake 0.5s ease-out;
}

.combo-badge {
  @apply px-2 py-0.5 rounded-full text-xs font-bold;
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-white;
  animation: badge-pop 0.3s ease-out;
}

.combo-badge.combo-high {
  @apply from-pink-500 to-purple-500;
  animation: badge-pulse 0.5s ease-out infinite;
}

/* 得分显示 */
.judgment-score {
  @apply text-lg font-bold text-white mt-1;
  text-shadow: 0 0 10px currentColor;
  animation: score-float 0.5s ease-out;
}

/* 时间误差指示器 */
.delta-indicator {
  @apply flex flex-col items-center mt-1;
}

.delta-bar {
  @apply relative w-24 h-1.5 bg-slate-700/50 rounded-full overflow-hidden;
}

.delta-center {
  @apply absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400/50;
  transform: translateX(-50%);
}

.delta-marker {
  @apply absolute top-0 bottom-0 w-2 rounded-full;
  transform: translateX(-50%);
  transition: left 0.1s ease-out;
  background: currentColor;
}

.delta-text {
  @apply text-xs mt-1 font-mono;
}

.delta-text.early {
  @apply text-blue-400;
}

.delta-text.late {
  @apply text-orange-400;
}

.delta-text.perfect {
  @apply text-green-400;
}

/* 连击显示 */
.combo-display {
  @apply flex flex-col items-center mt-2 relative;
  animation: combo-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.combo-number {
  @apply text-5xl sm:text-6xl font-black;
  background: linear-gradient(to bottom, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.combo-high .combo-number {
  @apply text-6xl sm:text-7xl;
  background: linear-gradient(to bottom, #f472b6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
}

.combo-mega .combo-number {
  @apply text-7xl sm:text-8xl;
  background: linear-gradient(to bottom, #a78bfa, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  animation: mega-pulse 0.5s ease-out infinite;
}

.combo-ultra .combo-number {
  @apply text-8xl sm:text-9xl;
  background: linear-gradient(45deg, #fbbf24, #f472b6, #a78bfa, #22d3ee);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ultra-gradient 2s ease infinite, ultra-shake 0.5s ease-out;
}

.combo-label {
  @apply text-sm text-slate-400 tracking-widest;
}

.combo-high .combo-label,
.combo-mega .combo-label {
  @apply text-pink-400;
}

.combo-ultra .combo-label {
  @apply text-purple-400 font-bold;
  animation: ultra-glow 1s ease infinite;
}

/* 连击粒子 */
.combo-particles {
  @apply absolute inset-0 pointer-events-none;
}

.particle {
  @apply absolute text-yellow-400 text-lg opacity-0;
  animation: particle-float 1s ease-out forwards;
}

.particle.p1 { top: 0; left: 20%; animation-delay: 0s; }
.particle.p2 { top: 10%; right: 20%; animation-delay: 0.1s; }
.particle.p3 { top: 30%; left: 10%; animation-delay: 0.2s; }
.particle.p4 { top: 30%; right: 10%; animation-delay: 0.3s; }
.particle.p5 { bottom: 20%; left: 25%; animation-delay: 0.4s; }
.particle.p6 { bottom: 20%; right: 25%; animation-delay: 0.5s; }
.particle.p7 { top: 50%; left: 5%; animation-delay: 0.6s; }
.particle.p8 { top: 50%; right: 5%; animation-delay: 0.7s; }

/* 连击火焰效果 */
.combo-fire {
  @apply absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 pointer-events-none;
}

.fire-base {
  @apply absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full;
  background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.6) 0%, transparent 70%);
  animation: fire-flicker 0.5s ease-in-out infinite;
}

/* 判定统计 */
.judgment-stats {
  @apply w-full max-w-xs mt-4;
}

.stat-bar {
  @apply flex h-2 rounded-full overflow-hidden bg-slate-700/50;
}

.stat-segment {
  @apply h-full transition-all duration-300;
}

.stat-segment.perfect {
  @apply bg-green-500;
}

.stat-segment.good {
  @apply bg-blue-500;
}

.stat-segment.miss {
  @apply bg-red-500;
}

.stat-labels {
  @apply flex justify-between mt-2 text-xs;
}

.stat-label {
  @apply flex items-center gap-1 text-slate-400;
}

.stat-label.perfect { @apply text-green-400; }
.stat-label.good { @apply text-blue-400; }
.stat-label.miss { @apply text-red-400; }

.stat-dot {
  @apply w-2 h-2 rounded-full;
}

.stat-label.perfect .stat-dot { @apply bg-green-500; }
.stat-label.good .stat-dot { @apply bg-blue-500; }
.stat-label.miss .stat-dot { @apply bg-red-500; }

/* 总统计 */
.total-stats {
  @apply flex justify-between mt-2 pt-2 border-t border-slate-700/50 text-xs;
}

.total-accuracy {
  @apply text-slate-400;
}

.total-score {
  @apply text-pink-400 font-medium;
}

/* 动画定义 */
@keyframes judgment-pop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes perfect-pop {
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

@keyframes good-pop {
  0% { transform: scale(0.8) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes miss-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-8px) rotate(-2deg); }
  20% { transform: translateX(8px) rotate(2deg); }
  30% { transform: translateX(-6px) rotate(-1deg); }
  40% { transform: translateX(6px) rotate(1deg); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

@keyframes combo-appear {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes mega-pulse {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.3); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes ultra-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes ultra-shake {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.05) rotate(-1deg); }
  75% { transform: scale(1.05) rotate(1deg); }
}

@keyframes ultra-glow {
  0%, 100% { text-shadow: 0 0 10px currentColor; }
  50% { text-shadow: 0 0 30px currentColor, 0 0 60px currentColor; }
}

@keyframes badge-pop {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes score-float {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-20px); opacity: 0; }
}

@keyframes particle-float {
  0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.5) rotate(360deg); opacity: 0; }
}

@keyframes fire-flicker {
  0%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0.8; }
  50% { transform: translateX(-50%) scaleY(1.2); opacity: 1; }
}

/* 过渡动画 */
.judgment-float-enter-active,
.judgment-float-leave-active {
  transition: all 0.3s ease;
}

.judgment-float-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}

.judgment-float-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* 主题适配 */
:global(.theme-light) .delta-bar {
  @apply bg-slate-200;
}

:global(.theme-light) .stat-bar {
  @apply bg-slate-200;
}

:global(.theme-cyberpunk) .judgment-perfect .judgment-text {
  @apply text-cyan-400;
  text-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
}

:global(.theme-cyberpunk) .judgment-good .judgment-text {
  @apply text-pink-400;
  text-shadow: 0 0 20px rgba(244, 114, 182, 0.8);
}

:global(.theme-cyberpunk) .judgment-miss .judgment-text {
  @apply text-red-400;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.8);
}

:global(.theme-cyberpunk) .combo-number {
  text-shadow: 0 0 40px rgba(251, 191, 36, 0.5);
}

:global(.theme-cyberpunk) .combo-high .combo-number {
  text-shadow: 0 0 40px rgba(244, 114, 182, 0.5);
}

:global(.theme-cyberpunk) .stat-bar {
  @apply bg-slate-800;
}
</style>
