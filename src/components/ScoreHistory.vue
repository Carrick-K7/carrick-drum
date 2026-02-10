<template>
  <div class="score-history">
    <!-- 头部标题 -->
    <div class="history-header">
      <h3 class="history-title">
        <span class="title-icon">🏆</span>
        成绩记录
      </h3>
      <button 
        v-if="hasRecords" 
        class="btn-clear"
        @click="showClearConfirm = true"
      >
        清除记录
      </button>
    </div>
    
    <!-- 总体统计 -->
    <div v-if="hasRecords" class="global-stats">
      <div class="stat-card">
        <span class="stat-icon">🎵</span>
        <span class="stat-value">{{ globalStats.totalSongs }}</span>
        <span class="stat-label">已学曲目</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ globalStats.totalPlays }}</span>
        <span class="stat-label">总练习次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📊</span>
        <span class="stat-value">{{ formatAccuracy(globalStats.averageAccuracy) }}</span>
        <span class="stat-label">平均准确率</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🏅</span>
        <span class="stat-value grade">{{ globalStats.bestGrade }}</span>
        <span class="stat-label">最佳评级</span>
      </div>
    </div>
    
    <!-- 当前歌曲历史 -->
    <div v-if="currentSongStats" class="song-history">
      <h4 class="section-title">
        📀 {{ currentSongStats.songName }} - 历史成绩
      </h4>
      
      <div class="song-best-stats">
        <div class="best-item">
          <span class="best-label">最佳成绩</span>
          <span class="best-value score">{{ currentSongStats.bestScore }}</span>
        </div>
        <div class="best-item">
          <span class="best-label">最高准确率</span>
          <span class="best-value accuracy">{{ formatAccuracy(currentSongStats.bestAccuracy) }}</span>
        </div>
        <div class="best-item">
          <span class="best-label">最佳评级</span>
          <span class="best-value grade" :class="`grade-${currentSongStats.bestGrade.toLowerCase()}`">
            {{ currentSongStats.bestGrade }}
          </span>
        </div>
        <div class="best-item">
          <span class="best-label">游玩次数</span>
          <span class="best-value">{{ currentSongStats.playCount }}</span>
        </div>
      </div>
      
      <!-- 进步曲线 -->
      <div v-if="currentSongStats.records.length > 1" class="progress-section">
        <h5 class="subsection-title">进步趋势</h5>
        <ProgressChart 
          :data="getProgressData(currentSongId)"
          :height="120"
        />
      </div>
      
      <!-- 最近记录列表 -->
      <div class="recent-records">
        <h5 class="subsection-title">最近尝试</h5>
        <div class="records-list">
          <div 
            v-for="record in currentSongStats.records.slice().reverse().slice(0, 5)" 
            :key="record.id"
            class="record-item"
            :class="{ 'is-new': isNewRecord(record) }"
          >
            <div class="record-main">
              <span class="record-grade" :class="`grade-${record.grade.toLowerCase()}`">
                {{ record.grade }}
              </span>
              <span class="record-score">{{ record.totalScore }}</span>
              <span class="record-accuracy">{{ formatAccuracy(record.accuracy) }}</span>
            </div>
            <div class="record-detail">
              <span class="record-hits">
                {{ record.perfectCount }}P / {{ record.goodCount }}G / {{ record.missCount }}M
              </span>
              <span class="record-time">{{ formatTime(record.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 所有歌曲成绩概览 -->
    <div v-else-if="hasRecords" class="all-songs-overview">
      <h4 class="section-title">📚 所有曲目成绩</h4>
      <div class="songs-grid">
        <div 
          v-for="stats in allSongStats" 
          :key="stats.songId"
          class="song-card"
          @click="$emit('select-song', stats.songId)"
        >
          <div class="song-card-header">
            <span class="song-name">{{ stats.songName }}</span>
            <span class="song-grade" :class="`grade-${stats.bestGrade.toLowerCase()}`">
              {{ stats.bestGrade }}
            </span>
          </div>
          <div class="song-card-stats">
            <span>最高分: {{ stats.bestScore }}</span>
            <span>{{ stats.playCount }} 次练习</span>
          </div>
          <div class="song-card-accuracy">
            最佳准确率: {{ formatAccuracy(stats.bestAccuracy) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 无记录提示 -->
    <div v-else class="no-records">
      <div class="no-records-icon">🥁</div>
      <p class="no-records-text">还没有成绩记录</p>
      <p class="no-records-hint">完成课程后将在这里看到你的进步！</p>
    </div>
    
    <!-- 清除确认弹窗 -->
    <div v-if="showClearConfirm" class="confirm-modal" @click.self="showClearConfirm = false">
      <div class="confirm-content">
        <h4>⚠️ 确认清除</h4>
        <p>确定要清除所有成绩记录吗？此操作无法撤销。</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="showClearConfirm = false">取消</button>
          <button class="btn-confirm" @click="clearAll">确定清除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScoringStore } from '../stores/useScoringStore'
import ProgressChart from './ProgressChart.vue'

interface Props {
  /** 当前选中的歌曲ID，传入则显示该歌曲的历史 */
  currentSongId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select-song', songId: string): void
}>()

const scoringStore = useScoringStore()
const showClearConfirm = ref(false)
const lastViewedTime = ref(Date.now())

// 计算属性
const hasRecords = computed(() => scoringStore.playedSongIds.length > 0)
const globalStats = computed(() => scoringStore.globalStats)
const allSongStats = computed(() => Object.values(scoringStore.songStats))

const currentSongStats = computed(() => {
  if (!props.currentSongId) return null
  return scoringStore.getSongStats(props.currentSongId)
})

// 方法
function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
  }
  
  // 24小时内
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  // 7天内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  // 超过7天显示日期
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getProgressData(songId: string) {
  return scoringStore.getSongProgressData(songId)
}

function isNewRecord(record: { timestamp: number }): boolean {
  return record.timestamp > lastViewedTime.value - 60 * 1000 // 1分钟内算新记录
}

function clearAll() {
  scoringStore.clearAllStats()
  showClearConfirm.value = false
}
</script>

<style scoped>
@reference "../style.css";

.score-history {
  @apply w-full;
}

.history-header {
  @apply flex items-center justify-between mb-4;
}

.history-title {
  @apply text-lg font-bold flex items-center gap-2;
}

.title-icon {
  @apply text-2xl;
}

.btn-clear {
  @apply px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 
         hover:bg-red-500/30 transition-all;
}

/* 总体统计 */
.global-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3 mb-6;
}

.stat-card {
  @apply bg-slate-800/50 rounded-xl p-3 text-center;
}

.stat-icon {
  @apply text-2xl block mb-1;
}

.stat-value {
  @apply text-xl font-bold block;
}

.stat-value.grade {
  @apply text-yellow-400;
}

.stat-label {
  @apply text-xs text-slate-400;
}

/* 歌曲历史 */
.song-history {
  @apply space-y-4;
}

.section-title {
  @apply text-base font-semibold text-slate-200 mb-3;
}

.subsection-title {
  @apply text-sm font-medium text-slate-400 mb-2;
}

.song-best-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3 mb-4;
}

.best-item {
  @apply bg-slate-800/30 rounded-lg p-3 text-center;
}

.best-label {
  @apply text-xs text-slate-400 block mb-1;
}

.best-value {
  @apply text-lg font-bold;
}

.best-value.score {
  @apply text-pink-400;
}

.best-value.accuracy {
  @apply text-blue-400;
}

.best-value.grade {
  @apply text-2xl;
}

.grade-s { @apply text-yellow-400; }
.grade-a { @apply text-green-400; }
.grade-b { @apply text-blue-400; }
.grade-c { @apply text-orange-400; }
.grade-d { @apply text-red-400; }

/* 进步趋势 */
.progress-section {
  @apply bg-slate-800/30 rounded-xl p-4;
}

/* 最近记录 */
.recent-records {
  @apply bg-slate-800/30 rounded-xl p-4;
}

.records-list {
  @apply space-y-2;
}

.record-item {
  @apply bg-slate-800/50 rounded-lg p-3 transition-all;
}

.record-item.is-new {
  @apply bg-pink-500/10 border border-pink-500/30;
}

.record-main {
  @apply flex items-center gap-4 mb-1;
}

.record-grade {
  @apply w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm;
  @apply bg-slate-700;
}

.record-score {
  @apply text-lg font-bold flex-1;
}

.record-accuracy {
  @apply text-sm text-slate-400;
}

.record-detail {
  @apply flex items-center justify-between text-xs text-slate-500;
}

.record-hits {
  @apply flex gap-2;
}

.record-hits::v-deep span {
  @apply px-1.5 py-0.5 rounded bg-slate-700/50;
}

/* 所有歌曲概览 */
.all-songs-overview {
  @apply mt-4;
}

.songs-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.song-card {
  @apply bg-slate-800/50 rounded-xl p-4 cursor-pointer
         hover:bg-slate-800 transition-all;
}

.song-card-header {
  @apply flex items-center justify-between mb-2;
}

.song-name {
  @apply font-medium text-slate-200;
}

.song-grade {
  @apply w-7 h-7 rounded-lg font-bold flex items-center justify-center text-sm;
  @apply bg-slate-700;
}

.song-card-stats {
  @apply flex justify-between text-sm text-slate-400 mb-1;
}

.song-card-accuracy {
  @apply text-xs text-slate-500;
}

/* 无记录 */
.no-records {
  @apply text-center py-12;
}

.no-records-icon {
  @apply text-6xl mb-4;
}

.no-records-text {
  @apply text-lg text-slate-300 mb-2;
}

.no-records-hint {
  @apply text-sm text-slate-500;
}

/* 确认弹窗 */
.confirm-modal {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
}

.confirm-content {
  @apply bg-slate-800 rounded-xl p-6 max-w-sm mx-4 text-center;
}

.confirm-content h4 {
  @apply text-lg font-bold mb-2;
}

.confirm-content p {
  @apply text-slate-400 mb-4;
}

.confirm-actions {
  @apply flex gap-3 justify-center;
}

.btn-cancel {
  @apply px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all;
}

.btn-confirm {
  @apply px-4 py-2 rounded-lg bg-red-500/20 text-red-400 
         hover:bg-red-500/30 transition-all;
}

/* 主题适配 */
:global(.theme-light) .stat-card,
:global(.theme-light) .record-item,
:global(.theme-light) .song-card,
:global(.theme-light) .best-item {
  @apply bg-slate-100;
}

:global(.theme-light) .progress-section,
:global(.theme-light) .recent-records {
  @apply bg-slate-100/50;
}

:global(.theme-cyberpunk) .stat-card,
:global(.theme-cyberpunk) .record-item,
:global(.theme-cyberpunk) .song-card {
  @apply bg-slate-900/50 border border-cyan-500/20;
}
</style>
