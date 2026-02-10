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
          <span v-if="item.combo > 1" class="combo-badge">
            {{ item.combo }} Combo!
          </span>
        </div>
        
        <!-- 时间误差 -->
        <div v-if="item.deltaMs !== 0" class="delta-indicator">
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
      </div>
    </transition-group>
    
    <!-- 当前连击显示 -->
    <div v-if="currentCombo > 1" class="combo-display"
      :class="{ 'combo-high': currentCombo >= 10, 'combo-mega': currentCombo >= 20 }"
    >
      <div class="combo-number">{{ currentCombo }}</div>
      <div class="combo-label">COMBO</div>
      
      <!-- 连击粒子效果 -->
      <div v-if="currentCombo >= 10" class="combo-particles">
        <span v-for="i in 6" :key="i" class="particle" :class="`p${i}`">✦</span>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { JudgmentType, JudgmentResult } from '../types'

interface Props {
  /** 最新的判定结果 */
  judgment?: JudgmentResult | null
  /** 是否显示统计条 */
  showStats?: boolean
  /** 最大同时显示的判定数量 */
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  judgment: null,
  showStats: true,
  maxVisible: 3,
})

// 可见的判定队列
interface VisibleJudgment extends JudgmentResult {
  id: string
  timestamp: number
  position: number
}

const visibleJudgments = ref<VisibleJudgment[]>([])
const judgmentHistory = ref<JudgmentResult[]>([])
const currentCombo = ref(0)

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
  }, 800)
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
  const opacity = Math.max(0, 1 - (Date.now() - item.timestamp) / 800)
  const translateY = -((Date.now() - item.timestamp) / 800) * 30
  
  return {
    transform: `translateX(${item.position}px) translateY(${translateY}px)`,
    opacity,
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

// 重置统计
function reset() {
  visibleJudgments.value = []
  judgmentHistory.value = []
  currentCombo.value = 0
}

// 暴露方法
defineExpose({ reset })
</script>

<style scoped>
@reference "../style.css";

.realtime-judgment {
  @apply flex flex-col items-center;
}

.judgment-container {
  @apply relative h-24 w-full flex flex-col items-center justify-end;
}

.judgment-item {
  @apply absolute flex flex-col items-center;
  transition: all 0.1s linear;
}

.judgment-type {
  @apply flex items-center gap-2;
}

.judgment-text {
  @apply text-3xl font-black;
  text-shadow: 0 0 20px currentColor;
}

.judgment-perfect .judgment-text {
  @apply text-green-400;
  animation: perfect-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.judgment-good .judgment-text {
  @apply text-blue-400;
  animation: good-pop 0.3s ease-out;
}

.judgment-miss .judgment-text {
  @apply text-red-400;
  animation: miss-shake 0.4s ease-out;
}

.combo-badge {
  @apply px-2 py-0.5 rounded-full text-xs font-bold;
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-white;
}

/* 时间误差指示器 */
.delta-indicator {
  @apply flex flex-col items-center mt-1;
}

.delta-bar {
  @apply relative w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden;
}

.delta-center {
  @apply absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-500;
  transform: translateX(-50%);
}

.delta-marker {
  @apply absolute top-0 bottom-0 w-2 bg-white rounded-full;
  transform: translateX(-50%);
  transition: left 0.1s ease-out;
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
  @apply flex flex-col items-center mt-2;
  animation: combo-appear 0.3s ease-out;
}

.combo-number {
  @apply text-5xl font-black;
  background: linear-gradient(to bottom, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.combo-high .combo-number {
  @apply text-6xl;
  background: linear-gradient(to bottom, #f472b6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
}

.combo-mega .combo-number {
  @apply text-7xl;
  background: linear-gradient(to bottom, #a78bfa, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  animation: mega-pulse 0.5s ease-out;
}

.combo-label {
  @apply text-sm text-slate-400 tracking-widest;
}

.combo-high .combo-label,
.combo-mega .combo-label {
  @apply text-pink-400;
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

/* 判定统计 */
.judgment-stats {
  @apply w-full max-w-xs mt-4;
}

.stat-bar {
  @apply flex h-2 rounded-full overflow-hidden bg-slate-700;
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

/* 动画 */
@keyframes perfect-pop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes good-pop {
  0% { transform: scale(0.8) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes miss-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

@keyframes combo-appear {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes mega-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); filter: brightness(1.5); }
  100% { transform: scale(1); }
}

@keyframes particle-float {
  0% { transform: translateY(0) scale(0); opacity: 1; }
  100% { transform: translateY(-30px) scale(1); opacity: 0; }
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
</style>
