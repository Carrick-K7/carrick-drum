<template>
  <div class="score-share">
    <button 
      class="btn-share"
      :class="{ 'is-sharing': isSharing }"
      @click="openShareModal"
    >
      <span class="share-icon">📤</span>
      <span>分享成绩</span>
    </button>
    
    <!-- 分享弹窗 -->
    <div v-if="showModal" class="share-modal" @click.self="closeModal">
      <div class="share-content">
        <div class="share-header">
          <h3>🎉 分享我的成绩</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        
        <!-- 成绩卡片预览 -->
        <div ref="cardRef" class="share-card">
          <div class="card-header">
            <span class="card-game">🥁 Vue Drum Kit</span>
            <span class="card-date">{{ formatDate(record.timestamp) }}</span>
          </div>
          
          <div class="card-song">
            {{ record.songName }}
          </div>
          
          <div class="card-grade">
            <span class="grade-letter" :class="`grade-${record.grade.toLowerCase()}`">
              {{ record.grade }}
            </span>
          </div>
          
          <div class="card-stats">
            <div class="card-stat">
              <span class="stat-value">{{ record.totalScore }}</span>
              <span class="stat-name">得分</span>
            </div>
            
            <div class="card-stat">
              <span class="stat-value">{{ formatAccuracy(record.accuracy) }}</span>
              <span class="stat-name">准确率</span>
            </div>
            
            <div class="card-stat">
              <span class="stat-value">{{ record.maxCombo }}</span>
              <span class="stat-name">连击</span>
            </div>
          </div>
          
          <div class="card-hits">
            <span class="hit-p">P: {{ record.perfectCount }}</span>
            <span class="hit-g">G: {{ record.goodCount }}</span>
            <span class="hit-m">M: {{ record.missCount }}</span>
          </div>
          
          <div class="card-footer">
            🎵 来挑战我吧！
          </div>
        </div>
        
        <!-- 分享选项 -->
        <div class="share-options">
          <button 
            class="share-btn copy-text"
            :disabled="isCopying"
            @click="copyAsText"
          >
            <span class="btn-icon">📋</span>
            <span>{{ copyTextLabel }}</span>
          </button>
          
          <button 
            class="share-btn copy-image"
            :disabled="isGenerating"
            @click="copyAsImage"
          >
            <span class="btn-icon">🖼️</span>
            <span>{{ copyImageLabel }}</span>
          </button>
          
          <button 
            v-if="canShareNative"
            class="share-btn native"
            @click="shareNative"
          >
            <span class="btn-icon">📱</span>
            <span>系统分享</span>
          </button>
        </div>
        
        <div class="share-hint">
          💡 提示：复制图片可以保存成绩单，分享到社交媒体！
        </div>
      </div>
    </div>
    
    <!-- 提示消息 -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScoreRecord } from '../stores/useScoringStore'

interface Props {
  record: ScoreRecord
}

const props = defineProps<Props>()

// 状态
const showModal = ref(false)
const isSharing = ref(false)
const isCopying = ref(false)
const isGenerating = ref(false)
const copyTextLabel = ref('复制文字')
const copyImageLabel = ref('复制图片')
const cardRef = ref<HTMLDivElement | null>(null)

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 检查是否支持原生分享
const canShareNative = computed(() => {
  return navigator.share !== undefined
})

// 方法
function openShareModal() {
  showModal.value = true
  copyTextLabel.value = '复制文字'
  copyImageLabel.value = '复制图片'
}

function closeModal() {
  showModal.value = false
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

function formatAccuracy(accuracy: number): string {
  return `${(accuracy * 100).toFixed(1)}%`
}

// 复制为文字
async function copyAsText() {
  isCopying.value = true
  
  const text = generateShareText()
  
  try {
    await navigator.clipboard.writeText(text)
    copyTextLabel.value = '✓ 已复制'
    showToastMessage('文字已复制到剪贴板！', 'success')
    
    setTimeout(() => {
      copyTextLabel.value = '复制文字'
    }, 2000)
  } catch (err) {
    showToastMessage('复制失败，请手动复制', 'error')
  } finally {
    isCopying.value = false
  }
}

// 生成分享文字
function generateShareText(): string {
  const r = props.record
  return `🥁 我在 Vue Drum Kit 完成了《${r.songName}》！

评级: ${r.grade}
得分: ${r.totalScore}
准确率: ${formatAccuracy(r.accuracy)}
连击: ${r.maxCombo}

Perfect: ${r.perfectCount} | Good: ${r.goodCount} | Miss: ${r.missCount}

来挑战我吧！🎵`
}

// 复制为图片（使用 Canvas）
async function copyAsImage() {
  isGenerating.value = true
  
  try {
    // 动态导入 html-to-image
    const { toPng } = await import('html-to-image')
    
    if (!cardRef.value) {
      throw new Error('Card element not found')
    }
    
    const dataUrl = await toPng(cardRef.value, {
      quality: 0.95,
      pixelRatio: 2,
    })
    
    // 复制到剪贴板
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    
    copyImageLabel.value = '✓ 已复制'
    showToastMessage('图片已复制到剪贴板！', 'success')
    
    setTimeout(() => {
      copyImageLabel.value = '复制图片'
    }, 2000)
  } catch (err) {
    console.error('Failed to generate image:', err)
    showToastMessage('图片生成失败', 'error')
  } finally {
    isGenerating.value = false
  }
}

// 原生分享
async function shareNative() {
  const text = generateShareText()
  
  try {
    await navigator.share({
      title: '我的鼓手成绩',
      text: text,
    })
    showToastMessage('分享成功！', 'success')
  } catch (err) {
    // 用户取消分享不显示错误
    if ((err as Error).name !== 'AbortError') {
      showToastMessage('分享失败', 'error')
    }
  }
}

// 显示提示
function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
@reference "../style.css";

.score-share {
  @apply inline-block;
}

.btn-share {
  @apply px-4 py-2 rounded-lg text-sm font-medium
         bg-gradient-to-r from-blue-500 to-cyan-500 text-white
         hover:from-blue-600 hover:to-cyan-600
         transition-all flex items-center gap-2;
}

.btn-share.is-sharing {
  @apply opacity-70 cursor-not-allowed;
}

.share-icon {
  @apply text-lg;
}

/* 弹窗 */
.share-modal {
  @apply fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4;
  backdrop-filter: blur(4px);
}

.share-content {
  @apply bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.share-header {
  @apply flex items-center justify-between p-4 border-b border-slate-700;
}

.share-header h3 {
  @apply text-lg font-bold;
}

.btn-close {
  @apply w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 
         flex items-center justify-center transition-all;
}

/* 成绩卡片 */
.share-card {
  @apply m-4 p-6 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800
         border border-slate-600;
}

.card-header {
  @apply flex justify-between items-center text-xs text-slate-400 mb-4;
}

.card-game {
  @apply font-medium;
}

.card-song {
  @apply text-xl font-bold text-center mb-4;
}

.card-grade {
  @apply text-center mb-6;
}

.grade-letter {
  @apply text-6xl font-black;
}

.grade-s { @apply text-yellow-400; }
.grade-a { @apply text-green-400; }
.grade-b { @apply text-blue-400; }
.grade-c { @apply text-orange-400; }
.grade-d { @apply text-red-400; }

.card-stats {
  @apply grid grid-cols-3 gap-4 mb-4;
}

.card-stat {
  @apply text-center;
}

.card-stat .stat-value {
  @apply text-2xl font-bold block;
}

.card-stat .stat-name {
  @apply text-xs text-slate-400;
}

.card-hits {
  @apply flex justify-center gap-4 text-sm py-3 border-t border-slate-600;
}

.hit-p { @apply text-green-400; }
.hit-g { @apply text-blue-400; }
.hit-m { @apply text-red-400; }

.card-footer {
  @apply text-center text-sm text-slate-400 mt-4;
}

/* 分享选项 */
.share-options {
  @apply grid grid-cols-3 gap-3 p-4;
}

.share-btn {
  @apply flex flex-col items-center gap-2 p-3 rounded-xl
         bg-slate-700 hover:bg-slate-600 transition-all text-sm;
}

.share-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.share-btn.copy-text {
  @apply hover:bg-blue-500/20 hover:text-blue-400;
}

.share-btn.copy-image {
  @apply hover:bg-green-500/20 hover:text-green-400;
}

.share-btn.native {
  @apply hover:bg-purple-500/20 hover:text-purple-400;
}

.btn-icon {
  @apply text-2xl;
}

.share-hint {
  @apply text-center text-xs text-slate-500 p-4 pt-0;
}

/* Toast */
.toast {
  @apply fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full
         text-sm font-medium z-50 animate-bounce;
}

.toast.success {
  @apply bg-green-500 text-white;
}

.toast.error {
  @apply bg-red-500 text-white;
}

/* 主题适配 */
:global(.theme-light) .share-content,
:global(.theme-light) .share-card {
  @apply bg-white border-slate-200;
}

:global(.theme-light) .share-header {
  @apply border-slate-200;
}

:global(.theme-light) .share-card {
  @apply from-slate-100 to-white;
}

:global(.theme-light) .share-btn {
  @apply bg-slate-100 hover:bg-slate-200;
}

:global(.theme-cyberpunk) .share-content {
  @apply bg-slate-900 border border-cyan-500/30;
}

:global(.theme-cyberpunk) .share-card {
  @apply from-slate-800 to-slate-900 border-cyan-500/30;
}

:global(.theme-cyberpunk) .share-btn {
  @apply bg-slate-800 border border-cyan-500/30
         hover:bg-cyan-500/20 hover:text-cyan-400;
}
</style>
