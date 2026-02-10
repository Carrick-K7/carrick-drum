<template>
  <div class="score-history-page">
    <div class="page-header">
      <h2>🏆 成绩中心</h2>
      <div class="header-actions">
        <button class="btn-export" @click="exportData">
          💾 导出数据
        </button>
        <button class="btn-clear" @click="showClearConfirm = true">
          🗑️ 清除全部
        </button>
      </div>
    </div>
    
    <!-- 总体统计 -->
    <div class="global-stats-section">
      <div class="stats-grid">
        <div class="stat-card-large">
          <div class="stat-icon">🎵</div>
          <div class="stat-content">
            <span class="stat-value">{{ globalStats.totalSongs }}</span>
            <span class="stat-label">已学曲目</span>
          </div>
        </div>
        
        <div class="stat-card-large">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-value">{{ globalStats.totalPlays }}</span>
            <span class="stat-label">总练习次数</span>
          </div>
        </div>
        
        <div class="stat-card-large">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatAccuracy(globalStats.averageAccuracy) }}</span>
            <span class="stat-label">平均准确率</span>
          </div>
        </div>
        
        <div class="stat-card-large">
          <div class="stat-icon">🏅</div>
          <div class="stat-content">
            <span class="stat-value grade">{{ globalStats.bestGrade }}</span>
            <span class="stat-label">最佳评级</span>
          </div>
        </div>
        
        <div class="stat-card-large">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatPlayTime(globalStats.totalPlayTime) }}</span>
            <span class="stat-label">总练习时长</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 歌曲列表 -->
    <div v-if="hasRecords" class="songs-section">
      <h3>📚 曲目成绩</h3>
      
      <div class="songs-list">
        <div 
          v-for="stats in sortedSongStats" 
          :key="stats.songId"
          class="song-card"
          :class="{ 'is-expanded': expandedSong === stats.songId }"
        >
          <div class="song-header" @click="toggleExpand(stats.songId)">
            <div class="song-info">
              <span class="song-name">{{ stats.songName }}</span>
              <span class="song-meta">{{ stats.playCount }} 次练习</span>
            </div>
            
            <div class="song-badges">
              <span class="badge-grade" :class="`grade-${stats.bestGrade.toLowerCase()}`">
                {{ stats.bestGrade }}
              </span>
              <span class="badge-score">{{ stats.bestScore }}</span>
            </div>
            
            <span class="expand-icon">{{ expandedSong === stats.songId ? '▼' : '▶' }}</span>
          </div>
          
          <!-- 展开详情 -->
          <div v-if="expandedSong === stats.songId" class="song-details">
            <div class="detail-stats">
              <div class="detail-item">
                <span class="detail-label">最佳得分</span>
                <span class="detail-value">{{ stats.bestScore }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">最高准确率</span>
                <span class="detail-value">{{ formatAccuracy(stats.bestAccuracy) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">最高连击</span>
                <span class="detail-value">{{ stats.bestMaxCombo }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">首次练习</span>
                <span class="detail-value">{{ formatDate(stats.firstPlayed) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">最近练习</span>
                <span class="detail-value">{{ formatDate(stats.lastPlayed) }}</span>
              </div>
            </div>
            
            <!-- 进步曲线 -->
            <div v-if="stats.records.length > 1" class="detail-chart">
              <h4>进步趋势</h4>
              <ProgressChart 
                :data="getProgressData(stats.songId)"
                :height="120"
              />
            </div>
            
            <!-- 最近记录 -->
            <div class="detail-records">
              <h4>最近尝试</h4>
              <div class="records-table">
                <div 
                  v-for="record in stats.records.slice().reverse().slice(0, 5)" 
                  :key="record.id"
                  class="record-row"
                >
                  <span class="record-grade" :class="`grade-${record.grade.toLowerCase()}`">
                    {{ record.grade }}
                  </span>
                  <span class="record-score">{{ record.totalScore }}</span>
                  <span class="record-accuracy">{{ formatAccuracy(record.accuracy) }}</span>
                  <span class="record-hits">
                    {{ record.perfectCount }}P {{ record.goodCount }}G {{ record.missCount }}M
                  </span>
                  <span class="record-date">{{ formatDate(record.timestamp) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-actions">
              <button class="btn-clear-song" @click="clearSong(stats.songId)">
                清除此曲目记录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 无记录提示 -->
    <div v-else class="no-records">
      <div class="no-records-icon">🥁</div>
      <p class="no-records-title">还没有成绩记录</p>
      <p class="no-records-hint">完成课程后将在这里看到你的进步轨迹！</p>
      <button class="btn-start" @click="goToLessons">
        📚 前往课程
      </button>
    </div>
    
    <!-- 清除确认弹窗 -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal-content">
        <h4>⚠️ 确认清除</h4>
        <p>确定要清除所有成绩记录吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showClearConfirm = false">取消</button>
          <button class="btn-confirm" @click="clearAll">确定清除</button>
        </div>
      </div>
    </div>
    
    <!-- Toast -->
    <div v-if="toast.visible" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScoringStore } from '../stores/useScoringStore'
import ProgressChart from './ProgressChart.vue'

const scoringStore = useScoringStore()

// 状态
const expandedSong = ref<string | null>(null)
const showClearConfirm = ref(false)
const toast = ref({ visible: false, message: '', type: 'success' })

// 计算属性
const hasRecords = computed(() => scoringStore.playedSongIds.length > 0)
const globalStats = computed(() => scoringStore.globalStats)

const sortedSongStats = computed(() => {
  return Object.values(scoringStore.songStats).sort((a, b) => {
    // 按最近练习时间排序
    return b.lastPlayed - a.lastPlayed
  })
})

// 方法
function toggleExpand(songId: string) {
  expandedSong.value = expandedSong.value === songId ? null : songId
}

function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}小时${mins}分`
  }
  return `${mins}分钟`
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getProgressData(songId: string) {
  return scoringStore.getSongProgressData(songId)
}

function clearSong(songId: string) {
  scoringStore.clearSongStats(songId)
  if (expandedSong.value === songId) {
    expandedSong.value = null
  }
  showToast('已清除曲目记录', 'success')
}

function clearAll() {
  scoringStore.clearAllStats()
  showClearConfirm.value = false
  expandedSong.value = null
  showToast('已清除所有记录', 'success')
}

function exportData() {
  const data = scoringStore.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `drum-scores-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
  showToast('数据已导出', 'success')
}

function goToLessons() {
  // 发出事件让父组件处理导航
  emit('navigate', 'lessons')
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { visible: true, message, type }
  setTimeout(() => {
    toast.value.visible = false
  }, 3000)
}

const emit = defineEmits<{
  (e: 'navigate', destination: string): void
}>()
</script>

<style scoped>
@reference "../style.css";

.score-history-page {
  @apply w-full max-w-4xl mx-auto p-4;
}

/* 页面头部 */
.page-header {
  @apply flex items-center justify-between mb-6;
}

.page-header h2 {
  @apply text-2xl font-bold;
}

.header-actions {
  @apply flex gap-2;
}

.btn-export {
  @apply px-4 py-2 rounded-lg text-sm bg-blue-500/20 text-blue-400
         hover:bg-blue-500/30 transition-all;
}

.btn-clear {
  @apply px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400
         hover:bg-red-500/30 transition-all;
}

/* 总体统计 */
.global-stats-section {
  @apply mb-8;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-5 gap-4;
}

.stat-card-large {
  @apply bg-slate-800/50 rounded-xl p-4 flex items-center gap-3;
}

.stat-icon {
  @apply text-3xl;
}

.stat-content {
  @apply flex flex-col;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-value.grade {
  @apply text-yellow-400;
}

.stat-label {
  @apply text-xs text-slate-400;
}

/* 歌曲列表 */
.songs-section h3 {
  @apply text-lg font-semibold mb-4;
}

.songs-list {
  @apply space-y-3;
}

.song-card {
  @apply bg-slate-800/50 rounded-xl overflow-hidden transition-all;
}

.song-card.is-expanded {
  @apply bg-slate-800;
}

.song-header {
  @apply p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/80;
}

.song-info {
  @apply flex-1;
}

.song-name {
  @apply font-medium block;
}

.song-meta {
  @apply text-xs text-slate-400;
}

.song-badges {
  @apply flex items-center gap-2;
}

.badge-grade {
  @apply w-8 h-8 rounded-lg font-bold flex items-center justify-center text-sm;
  @apply bg-slate-700;
}

.badge-score {
  @apply text-sm font-medium text-slate-300;
}

.expand-icon {
  @apply text-xs text-slate-400;
}

/* 详情 */
.song-details {
  @apply p-4 pt-0 border-t border-slate-700;
}

.detail-stats {
  @apply grid grid-cols-2 md:grid-cols-5 gap-3 my-4;
}

.detail-item {
  @apply text-center;
}

.detail-label {
  @apply text-xs text-slate-400 block mb-1;
}

.detail-value {
  @apply font-medium;
}

.detail-chart {
  @apply my-4;
}

.detail-chart h4 {
  @apply text-sm font-medium text-slate-400 mb-2;
}

.detail-records {
  @apply my-4;
}

.detail-records h4 {
  @apply text-sm font-medium text-slate-400 mb-2;
}

.records-table {
  @apply space-y-2;
}

.record-row {
  @apply flex items-center gap-4 text-sm py-2 px-3 rounded-lg bg-slate-800/50;
}

.record-grade {
  @apply w-7 h-7 rounded font-bold flex items-center justify-center text-xs;
  @apply bg-slate-700;
}

.record-score {
  @apply font-medium w-16;
}

.record-accuracy {
  @apply text-slate-400 w-16;
}

.record-hits {
  @apply text-xs text-slate-500 flex-1;
}

.record-date {
  @apply text-xs text-slate-500;
}

.detail-actions {
  @apply flex justify-end;
}

.btn-clear-song {
  @apply px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400
         hover:bg-red-500/30 transition-all;
}

/* 评级颜色 */
.grade-s { @apply text-yellow-400; }
.grade-a { @apply text-green-400; }
.grade-b { @apply text-blue-400; }
.grade-c { @apply text-orange-400; }
.grade-d { @apply text-red-400; }

/* 无记录 */
.no-records {
  @apply text-center py-16;
}

.no-records-icon {
  @apply text-6xl mb-4;
}

.no-records-title {
  @apply text-lg text-slate-300 mb-2;
}

.no-records-hint {
  @apply text-sm text-slate-500 mb-6;
}

.btn-start {
  @apply px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl font-medium
         hover:from-pink-600 hover:to-violet-600 transition-all;
}

/* 弹窗 */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-slate-800 rounded-xl p-6 max-w-sm w-full text-center;
}

.modal-content h4 {
  @apply text-lg font-bold mb-2;
}

.modal-content p {
  @apply text-slate-400 mb-4;
}

.modal-actions {
  @apply flex gap-3 justify-center;
}

.btn-cancel {
  @apply px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-all;
}

.btn-confirm {
  @apply px-4 py-2 rounded-lg bg-red-500/20 text-red-400
         hover:bg-red-500/30 transition-all;
}

/* Toast */
.toast {
  @apply fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full
         text-sm font-medium z-50;
}

.toast.success {
  @apply bg-green-500 text-white;
}

.toast.error {
  @apply bg-red-500 text-white;
}

/* 主题适配 */
:global(.theme-light) .stat-card-large,
:global(.theme-light) .song-card {
  @apply bg-slate-100;
}

:global(.theme-light) .song-details,
:global(.theme-light) .record-row {
  @apply bg-slate-100/50;
}

:global(.theme-cyberpunk) .stat-card-large,
:global(.theme-cyberpunk) .song-card {
  @apply bg-slate-900/50 border border-cyan-500/20;
}

:global(.theme-cyberpunk) .badge-grade,
:global(.theme-cyberpunk) .record-grade {
  @apply bg-cyan-500/20 text-cyan-400;
}
</style>
