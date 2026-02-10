<template>
  <div class="lesson-panel">
    <!-- 课程介绍 -->
    <div v-if="teachingStore.lessonState === 'intro'" class="lesson-intro">
      <div class="intro-header">
        <span class="lesson-badge">第 {{ lesson?.lessonInfo?.lessonNumber }} 课</span>
        <h2 class="lesson-title">{{ lesson?.title }}</h2>
        <p class="lesson-desc">{{ lesson?.description }}</p>
      </div>
      
      <div v-if="lesson?.lessonInfo" class="intro-content">
        <div class="info-section">
          <h3>🎯 学习目标</h3>
          <p>{{ lesson.lessonInfo.objective }}</p>
        </div>
        
        <div class="info-section">
          <h3>💡 练习提示</h3>
          <ul>
            <li v-for="(tip, index) in lesson.lessonInfo.tips" :key="index">
              {{ tip }}
            </li>
          </ul>
        </div>
        
        <div class="info-section">
          <h3>🥁 使用鼓组</h3>
          <div class="drum-list">
            <span 
              v-for="drum in targetDrums" 
              :key="drum.id"
              class="drum-tag"
              :style="{ backgroundColor: drum.color + '20', borderColor: drum.color }"
            >
              {{ drum.nameZh }}
            </span>
          </div>
        </div>
        
        <!-- 历史成绩概览 -->
        <div v-if="songStats" class="info-section history-preview">
          <h3>📊 历史最佳</h3>
          <div class="history-preview-stats">
            <div class="preview-item">
              <span class="preview-value" :class="`grade-${songStats.bestGrade.toLowerCase()}`">
                {{ songStats.bestGrade }}
              </span>
              <span class="preview-label">最佳评级</span>
            </div>
            <div class="preview-item">
              <span class="preview-value">{{ songStats.bestScore }}</span>
              <span class="preview-label">最高分</span>
            </div>
            <div class="preview-item">
              <span class="preview-value">{{ formatAccuracy(songStats.bestAccuracy) }}</span>
              <span class="preview-label">最高准确率</span>
            </div>
            <div class="preview-item">
              <span class="preview-value">{{ songStats.playCount }}</span>
              <span class="preview-label">练习次数</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="intro-actions">
        <button class="btn-start" @click="startPractice('practice')">
          ▶️ 开始练习
        </button>
        <button class="btn-demo" @click="startPractice('perform')">
          👀 观看演示
        </button>
      </div>
    </div>
    
    <!-- 倒计时 -->
    <div v-else-if="teachingStore.lessonState === 'countdown'" class="countdown">
      <div class="countdown-number">
        {{ teachingStore.countdownValue }}
      </div>
      <p class="countdown-text">准备开始...</p>
    </div>
    
    <!-- 练习中 -->
    <div v-else-if="teachingStore.lessonState === 'playing' || teachingStore.lessonState === 'paused'" class="lesson-playing">
      <!-- 顶部统计 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ stats.score }}</span>
          <span class="stat-label">得分</span>
        </div>
        
        <div class="stat-item">
          <span class="stat-value" :class="{ 'combo-active': stats.combo > 1 }">
            {{ stats.combo }}
          </span>
          <span class="stat-label">连击</span>
        </div>
        
        <div class="stat-item">
          <span class="stat-value">{{ accuracyText }}</span>
          <span class="stat-label">准确率</span>
        </div>
        
        <div class="stat-item">
          <span class="stat-value grade">{{ stats.grade }}</span>
          <span class="stat-label">评级</span>
        </div>
      </div>
      
      <!-- 实时判定反馈 -->
      <RealtimeJudgment
        :judgment="lastJudgment"
        :show-stats="true"
      />
      
      <!-- 节拍引导 -->
      <BeatGuide
        :beats="lesson?.beats || []"
        :current-time="teachingStore.currentTime"
        :duration="lesson?.duration || 0"
        :progress="teachingStore.progress"
      />
      
      <!-- 控制按钮 -->
      <div class="play-controls">
        <button class="btn-control" @click="teachingStore.togglePause()">
          {{ teachingStore.lessonState === 'paused' ? '▶️ 继续' : '⏸️ 暂停' }}
        </button>
        
        <button class="btn-control" @click="teachingStore.restartLesson()">
          🔄 重新开始
        </button>
        
        <button class="btn-control btn-exit" @click="teachingStore.exitLesson()">
          ⏹️ 退出
        </button>
      </div>
    </div>
    
    <!-- 完成界面 -->
    <div v-else-if="teachingStore.lessonState === 'completed'" class="lesson-complete">
      <div class="complete-header">
        <div class="complete-icon">🎉</div>
        <h2>课程完成！</h2>
        <p v-if="isNewRecord" class="new-record-badge">🏆 新纪录！</p>
      </div>
      
      <div class="complete-stats">
        <div class="grade-display">
          <span class="grade-letter" :class="`grade-${stats.grade.toLowerCase()}`">
            {{ stats.grade }}
          </span>
        </div>
        
        <div class="stat-grid">
          <div class="stat-box">
            <span class="stat-box-value">{{ stats.score }}</span>
            <span class="stat-box-label">总分</span>
          </div>
          
          <div class="stat-box">
            <span class="stat-box-value">{{ accuracyText }}</span>
            <span class="stat-box-label">准确率</span>
          </div>
          
          <div class="stat-box">
            <span class="stat-box-value">{{ stats.maxCombo }}</span>
            <span class="stat-box-label">最大连击</span>
          </div>
          
          <div class="stat-box">
            <div class="hit-stats">
              <span class="hit-perfect">{{ stats.perfectCount }} Perfect</span>
              <span class="hit-good">{{ stats.goodCount }} Good</span>
              <span class="hit-miss">{{ stats.missCount }} Miss</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 历史成绩对比 -->
      <div v-if="songStats" class="history-comparison">
        <h4 class="comparison-title">📈 与历史成绩对比</h4>
        
        <div class="comparison-grid">
          <div class="comparison-item" :class="{ 'is-better': isBetter('score') }">
            <span class="comparison-label">得分</span>
            <span class="comparison-current">{{ stats.score }}</span>
            <span class="comparison-best">最佳: {{ songStats.bestScore }}</span>
          </div>
          
          <div class="comparison-item" :class="{ 'is-better': isBetter('accuracy') }">
            <span class="comparison-label">准确率</span>
            <span class="comparison-current">{{ accuracyText }}</span>
            <span class="comparison-best">最佳: {{ formatAccuracy(songStats.bestAccuracy) }}</span>
          </div>
          
          <div class="comparison-item" :class="{ 'is-better': isBetter('combo') }">
            <span class="comparison-label">连击</span>
            <span class="comparison-current">{{ stats.maxCombo }}</span>
            <span class="comparison-best">最佳: {{ songStats.bestMaxCombo }}</span>
          </div>
        </div>
        
        <!-- 进步曲线 -->
        <div v-if="songStats.records.length > 1" class="progress-chart-section">
          <h5 class="chart-title">进步趋势</h5>
          <ProgressChart 
            :data="progressData"
            :height="100"
          />
        </div>
      </div>
      
      <div class="complete-actions">
        <button class="btn-start" @click="teachingStore.restartLesson()">
          🔄 再练一次
        </button>
        
        <button class="btn-demo" @click="teachingStore.exitLesson()">
          📚 返回课程列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useTeachingStore } from '../stores/useTeachingStore'
import { useDrumKitStore } from '../stores/useDrumKitStore'
import { useScoringStore } from '../stores/useScoringStore'
import RealtimeJudgment from './RealtimeJudgment.vue'
import BeatGuide from './BeatGuide.vue'
import ProgressChart from './ProgressChart.vue'
import ScoreShare from './ScoreShare.vue'
import type { Drum } from '../types'

const teachingStore = useTeachingStore()
const drumKitStore = useDrumKitStore()
const scoringStore = useScoringStore()

const lesson = computed(() => teachingStore.currentLesson)
const stats = computed(() => teachingStore.stats)
const lastJudgment = computed(() => teachingStore.lastJudgment)

// 保存最近完成的记录用于分享
const lastCompletedRecord = ref<ReturnType<typeof scoringStore.completeSession> | null>(null)

const accuracyText = computed(() => {
  return `${(stats.value.accuracy * 100).toFixed(1)}%`
})

// 获取歌曲统计
const songStats = computed(() => {
  if (!lesson.value) return null
  return scoringStore.getSongStats(lesson.value.id)
})

// 进度数据
const progressData = computed(() => {
  if (!lesson.value) return { timestamps: [], scores: [], accuracies: [] }
  return scoringStore.getSongProgressData(lesson.value.id)
})

// 是否新纪录
const isNewRecord = computed(() => {
  if (!songStats.value) return true
  return stats.value.score >= songStats.value.bestScore && songStats.value.playCount > 1
})

// 获取目标鼓的信息
const targetDrums = computed(() => {
  if (!lesson.value?.lessonInfo) return []
  
  return lesson.value.lessonInfo.targetDrums
    .map(id => drumKitStore.currentDrums.find((d: Drum) => d.id === id))
    .filter(Boolean) as Drum[]
})

function startPractice(mode: 'practice' | 'perform') {
  teachingStore.startPractice(mode)
}

function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`
}

function isBetter(metric: 'score' | 'accuracy' | 'combo'): boolean {
  if (!songStats.value) return true
  
  switch (metric) {
    case 'score':
      return stats.value.score >= songStats.value.bestScore
    case 'accuracy':
      return stats.value.accuracy >= songStats.value.bestAccuracy
    case 'combo':
      return stats.value.maxCombo >= songStats.value.bestMaxCombo
    default:
      return false
  }
}

// 监听课程完成
const previousLessonState = ref(teachingStore.lessonState)
watch(() => teachingStore.lessonState, async (newState, oldState) => {
  if (oldState === 'playing' && newState === 'completed') {
    // 课程完成，等待成绩保存
    await nextTick()
    // 从存储中获取最新记录
    if (lesson.value) {
      const songStats = scoringStore.getSongStats(lesson.value.id)
      if (songStats && songStats.records.length > 0) {
        lastCompletedRecord.value = songStats.records[songStats.records.length - 1]
      }
    }
    console.log('Lesson completed, score saved')
  }
  previousLessonState.value = newState
})

// 监听课程加载
watch(() => lesson.value, (newLesson) => {
  if (newLesson) {
    console.log(`Loaded lesson: ${newLesson.title}`)
  }
})
</script>

<style scoped>
@reference "../style.css";
.lesson-panel {
  @apply w-full max-w-3xl mx-auto p-4;
}

/* 课程介绍 */
.lesson-intro {
  @apply bg-slate-800/50 rounded-2xl p-6 border border-slate-700;
}

.intro-header {
  @apply text-center mb-6;
}

.lesson-badge {
  @apply inline-block px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm mb-2;
}

.lesson-title {
  @apply text-2xl font-bold mb-2;
}

.lesson-desc {
  @apply text-slate-400;
}

.intro-content {
  @apply space-y-4 mb-6;
}

.info-section {
  @apply bg-slate-900/50 rounded-xl p-4;
}

.info-section h3 {
  @apply text-sm font-bold text-slate-300 mb-2;
}

.info-section p {
  @apply text-slate-400;
}

.info-section ul {
  @apply space-y-1;
}

.info-section li {
  @apply text-slate-400 text-sm pl-4 relative;
}

.info-section li::before {
  content: '•';
  @apply absolute left-0 text-pink-500;
}

.drum-list {
  @apply flex flex-wrap gap-2;
}

.drum-tag {
  @apply px-3 py-1 rounded-full text-sm border;
}

/* 历史预览 */
.history-preview {
  @apply border border-yellow-500/30 bg-yellow-500/5;
}

.history-preview-stats {
  @apply grid grid-cols-4 gap-2;
}

.preview-item {
  @apply text-center;
}

.preview-value {
  @apply text-lg font-bold block;
}

.preview-value.grade-s { @apply text-yellow-400; }
.preview-value.grade-a { @apply text-green-400; }
.preview-value.grade-b { @apply text-blue-400; }
.preview-value.grade-c { @apply text-orange-400; }
.preview-value.grade-d { @apply text-red-400; }

.preview-label {
  @apply text-xs text-slate-500;
}

.intro-actions {
  @apply flex gap-4 justify-center;
}

.btn-start {
  @apply px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl font-medium;
  @apply hover:from-pink-600 hover:to-violet-600 transition-all;
}

.btn-demo {
  @apply px-6 py-3 bg-slate-700 rounded-xl font-medium;
  @apply hover:bg-slate-600 transition-all;
}

/* 倒计时 */
.countdown {
  @apply flex flex-col items-center justify-center py-20;
}

.countdown-number {
  @apply text-8xl font-black text-pink-500;
  animation: countdown-pulse 1s ease-out;
}

.countdown-text {
  @apply text-slate-400 mt-4;
}

/* 练习中 */
.lesson-playing {
  @apply space-y-6;
}

.stats-bar {
  @apply flex justify-around bg-slate-800/50 rounded-xl p-4;
}

.stat-item {
  @apply flex flex-col items-center;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-value.combo-active {
  @apply text-pink-500;
  animation: combo-pulse 0.5s ease-out;
}

.stat-value.grade {
  @apply text-yellow-500;
}

.stat-label {
  @apply text-xs text-slate-400 mt-1;
}

.play-controls {
  @apply flex justify-center gap-4;
}

.btn-control {
  @apply px-4 py-2 bg-slate-700 rounded-lg text-sm;
  @apply hover:bg-slate-600 transition-all;
}

.btn-control.btn-exit {
  @apply bg-red-500/20 text-red-400 hover:bg-red-500/30;
}

/* 完成界面 */
.lesson-complete {
  @apply text-center py-8;
}

.complete-header {
  @apply mb-8;
}

.complete-icon {
  @apply text-6xl mb-4;
  animation: bounce 1s ease-out infinite;
}

.new-record-badge {
  @apply inline-block px-4 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm mt-2;
  animation: pulse 1s ease-out infinite;
}

.complete-stats {
  @apply mb-8;
}

.grade-display {
  @apply mb-6;
}

.grade-letter {
  @apply text-8xl font-black;
}

.grade-s { @apply text-yellow-400; }
.grade-a { @apply text-green-400; }
.grade-b { @apply text-blue-400; }
.grade-c { @apply text-orange-400; }
.grade-d { @apply text-red-400; }

.stat-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.stat-box {
  @apply bg-slate-800/50 rounded-xl p-4 flex flex-col items-center;
}

.stat-box-value {
  @apply text-xl font-bold;
}

.stat-box-label {
  @apply text-xs text-slate-400 mt-1;
}

.hit-stats {
  @apply flex flex-col text-sm gap-1;
}

.hit-perfect { @apply text-green-400; }
.hit-good { @apply text-blue-400; }
.hit-miss { @apply text-red-400; }

/* 历史对比 */
.history-comparison {
  @apply bg-slate-800/30 rounded-xl p-4 mb-6;
}

.comparison-title {
  @apply text-sm font-semibold text-slate-300 mb-3;
}

.comparison-grid {
  @apply grid grid-cols-3 gap-3 mb-4;
}

.comparison-item {
  @apply bg-slate-800/50 rounded-lg p-3 text-center;
}

.comparison-item.is-better {
  @apply bg-green-500/10 border border-green-500/30;
}

.comparison-label {
  @apply text-xs text-slate-500 block mb-1;
}

.comparison-current {
  @apply text-lg font-bold block;
}

.comparison-best {
  @apply text-xs text-slate-500;
}

.progress-chart-section {
  @apply mt-4;
}

.chart-title {
  @apply text-xs text-slate-500 mb-2;
}

.complete-actions {
  @apply flex justify-center gap-4;
}

/* 动画 */
@keyframes countdown-pulse {
  0% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes combo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 主题适配 */
:global(.theme-light) .lesson-intro,
:global(.theme-light) .info-section,
:global(.theme-light) .stats-bar,
:global(.theme-light) .stat-box,
:global(.theme-light) .comparison-item,
:global(.theme-light) .history-comparison {
  @apply bg-slate-100 border-slate-200;
}

:global(.theme-cyberpunk) .lesson-intro,
:global(.theme-cyberpunk) .stats-bar,
:global(.theme-cyberpunk) .stat-box,
:global(.theme-cyberpunk) .history-comparison {
  @apply bg-slate-900/80 border-cyan-500/30;
}

:global(.theme-cyberpunk) .countdown-number,
:global(.theme-cyberpunk) .lesson-badge {
  @apply text-cyan-400;
}

:global(.theme-cyberpunk) .new-record-badge {
  @apply bg-cyan-500/20 text-cyan-400;
}

:global(.theme-cyberpunk) .history-preview {
  @apply border-cyan-500/30 bg-cyan-500/5;
}
</style>
