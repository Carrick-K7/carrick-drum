<template>
  <div class="progress-chart" :style="{ height: `${height}px` }">
    <svg 
      :viewBox="`0 0 ${width} ${height}`" 
      class="chart-svg"
      preserveAspectRatio="none"
    >
      <!-- 背景网格 -->
      <g class="grid">
        <line 
          v-for="i in 5" 
          :key="`h-${i}`"
          :x1="0" 
          :y1="(height / 5) * i" 
          :x2="width" 
          :y2="(height / 5) * i"
          class="grid-line"
        />
      </g>
      
      <!-- 得分曲线 -->
      <path 
        v-if="scorePath"
        :d="scorePath" 
        class="score-line"
        fill="none"
      />
      
      <!-- 得分区域填充 -->
      <path 
        v-if="scoreAreaPath"
        :d="scoreAreaPath" 
        class="score-area"
      />
      
      <!-- 准确率曲线 -->
      <path 
        v-if="accuracyPath"
        :d="accuracyPath" 
        class="accuracy-line"
        fill="none"
      />
      
      <!-- 数据点 -->
      <g v-if="showPoints" class="data-points">
        <circle
          v-for="(point, i) in scorePoints"
          :key="`sp-${i}`"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="score-point"
        />
      </g>
      
      <!-- 最佳成绩标记 -->
      <g v-if="bestScorePoint">
        <circle
          :cx="bestScorePoint.x"
          :cy="bestScorePoint.y"
          r="6"
          class="best-point"
        />
      </g>
    </svg>
    
    <!-- 图例 -->
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color score"></span>
        <span class="legend-label">得分</span>
      </div>
      <div class="legend-item">
        <span class="legend-color accuracy"></span>
        <span class="legend-label">准确率</span>
      </div>
      <div v-if="bestScorePoint" class="legend-item">
        <span class="legend-color best">★</span>
        <span class="legend-label">最佳: {{ bestScoreValue }}</span>
      </div>
    </div>
    
    <!-- 悬停提示 -->
    <div v-if="tooltip.visible" 
         class="chart-tooltip"
         :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      <div class="tooltip-date">{{ tooltip.date }}</div>
      <div class="tooltip-score">得分: {{ tooltip.score }}</div>
      <div class="tooltip-accuracy">准确率: {{ tooltip.accuracy }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface ProgressData {
  timestamps: number[]
  scores: number[]
  accuracies: number[]
}

interface Props {
  data: ProgressData
  width?: number
  height?: number
  showPoints?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 120,
  showPoints: true,
})

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  date: '',
  score: 0,
  accuracy: 0,
})

// 内边距
const padding = { top: 10, right: 10, bottom: 20, left: 10 }

// 实际绘图区域
const chartWidth = computed(() => props.width - padding.left - padding.right)
const chartHeight = computed(() => props.height - padding.top - padding.bottom)

// 数据范围
const maxScore = computed(() => {
  if (props.data.scores.length === 0) return 100
  return Math.max(...props.data.scores, 100) * 1.1
})

const minScore = computed(() => {
  if (props.data.scores.length === 0) return 0
  return Math.min(...props.data.scores) * 0.9
})

// 计算坐标点
const scorePoints = computed(() => {
  const points: { x: number; y: number; score: number; accuracy: number; timestamp: number }[] = []
  
  if (props.data.scores.length < 2) return points
  
  const count = props.data.scores.length
  const xStep = chartWidth.value / (count - 1)
  
  props.data.scores.forEach((score, i) => {
    const x = padding.left + i * xStep
    const normalizedScore = (score - minScore.value) / (maxScore.value - minScore.value)
    const y = padding.top + chartHeight.value - (normalizedScore * chartHeight.value)
    
    points.push({
      x,
      y,
      score,
      accuracy: props.data.accuracies[i],
      timestamp: props.data.timestamps[i],
    })
  })
  
  return points
})

// 得分曲线路径
const scorePath = computed(() => {
  if (scorePoints.value.length < 2) return ''
  
  return scorePoints.value.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    
    // 使用贝塞尔曲线使线条更平滑
    const prev = scorePoints.value[i - 1]
    const cpx1 = prev.x + (point.x - prev.x) / 3
    const cpx2 = prev.x + (2 * (point.x - prev.x)) / 3
    
    return `${path} C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`
  }, '')
})

// 得分区域路径（用于填充）
const scoreAreaPath = computed(() => {
  if (scorePoints.value.length < 2) return ''
  
  const bottomY = padding.top + chartHeight.value
  const first = scorePoints.value[0]
  const last = scorePoints.value[scorePoints.value.length - 1]
  
  let path = `M ${first.x} ${bottomY}`
  
  scorePoints.value.forEach((point, i) => {
    if (i === 0) {
      path += ` L ${point.x} ${point.y}`
    } else {
      const prev = scorePoints.value[i - 1]
      const cpx1 = prev.x + (point.x - prev.x) / 3
      const cpx2 = prev.x + (2 * (point.x - prev.x)) / 3
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`
    }
  })
  
  path += ` L ${last.x} ${bottomY} Z`
  return path
})

// 准确率曲线路径（使用次Y轴，固定在0-1范围）
const accuracyPath = computed(() => {
  if (props.data.accuracies.length < 2) return ''
  
  const count = props.data.accuracies.length
  const xStep = chartWidth.value / (count - 1)
  
  const points: { x: number; y: number }[] = []
  
  props.data.accuracies.forEach((accuracy, i) => {
    const x = padding.left + i * xStep
    const y = padding.top + chartHeight.value - (accuracy * chartHeight.value)
    points.push({ x, y })
  })
  
  return points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`
    
    const prev = points[i - 1]
    const cpx1 = prev.x + (point.x - prev.x) / 3
    const cpx2 = prev.x + (2 * (point.x - prev.x)) / 3
    
    return `${path} C ${cpx1} ${prev.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`
  }, '')
})

// 最佳成绩点
const bestScorePoint = computed(() => {
  if (scorePoints.value.length === 0) return null
  
  let best = scorePoints.value[0]
  scorePoints.value.forEach(point => {
    if (point.score > best.score) {
      best = point
    }
  })
  
  return best
})

const bestScoreValue = computed(() => {
  return bestScorePoint.value?.score || 0
})
</script>

<style scoped>
@reference "../style.css";

.progress-chart {
  @apply w-full relative;
}

.chart-svg {
  @apply w-full h-full overflow-visible;
}

/* 网格 */
.grid-line {
  @apply stroke-slate-700/30;
  stroke-width: 1;
}

/* 得分曲线 */
.score-line {
  @apply stroke-pink-500;
  stroke-width: 2;
}

.score-area {
  @apply fill-pink-500/10;
}

/* 准确率曲线 */
.accuracy-line {
  @apply stroke-blue-500;
  stroke-width: 2;
  stroke-dasharray: 4, 4;
}

/* 数据点 */
.score-point {
  @apply fill-pink-500 stroke-slate-800;
  stroke-width: 2;
}

.best-point {
  @apply fill-yellow-400 stroke-slate-800;
  stroke-width: 2;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { r: 6; }
  50% { r: 8; }
}

/* 图例 */
.chart-legend {
  @apply flex items-center gap-4 mt-2 text-xs;
}

.legend-item {
  @apply flex items-center gap-1.5;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.legend-color.score {
  @apply bg-pink-500;
}

.legend-color.accuracy {
  @apply bg-blue-500;
}

.legend-color.best {
  @apply text-yellow-400 text-xs;
}

.legend-label {
  @apply text-slate-400;
}

/* 提示框 */
.chart-tooltip {
  @apply absolute bg-slate-800 rounded-lg p-2 text-xs pointer-events-none z-10;
  @apply border border-slate-600 shadow-lg;
  transform: translate(-50%, -100%);
  margin-top: -8px;
}

.tooltip-date {
  @apply text-slate-400 mb-1;
}

.tooltip-score {
  @apply text-pink-400 font-medium;
}

.tooltip-accuracy {
  @apply text-blue-400;
}

/* 主题适配 */
:global(.theme-light) .grid-line {
  @apply stroke-slate-200;
}

:global(.theme-light) .score-point,
:global(.theme-light) .best-point {
  @apply stroke-white;
}

:global(.theme-light) .chart-tooltip {
  @apply bg-white border-slate-200 shadow-lg;
}

:global(.theme-cyberpunk) .score-line {
  @apply stroke-cyan-400;
  filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.5));
}

:global(.theme-cyberpunk) .score-area {
  @apply fill-cyan-400/10;
}

:global(.theme-cyberpunk) .accuracy-line {
  @apply stroke-pink-400;
}

:global(.theme-cyberpunk) .score-point {
  @apply fill-cyan-400;
}

:global(.theme-cyberpunk) .best-point {
  @apply fill-yellow-400;
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
}

:global(.theme-cyberpunk) .legend-color.score {
  @apply bg-cyan-400;
}

:global(.theme-cyberpunk) .legend-color.accuracy {
  @apply bg-pink-400;
}
</style>
