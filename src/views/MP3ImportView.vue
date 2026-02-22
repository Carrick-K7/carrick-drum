<template>
  <div class="mp3-import-view">
    <div class="view-header">
      <h1>🎵 MP3 导入</h1>
      <p class="subtitle">上传 MP3 文件，自动识别鼓点节奏，生成可练习的鼓点谱</p>
    </div>

    <div class="view-content">
      <!-- Upload Section -->
      <MP3Uploader
        @import-success="onImportSuccess"
        @import-error="onImportError"
      />

      <!-- Editor Section -->
      <MP3Editor
        v-if="currentImportId"
        :import-id="currentImportId"
        :audio-url="currentAudioUrl"
        @saved="onLessonSaved"
      />

      <!-- Empty State -->
      <div v-else-if="store.imports.length === 0" class="empty-state">
        <div class="empty-icon">🥁</div>
        <p>还没有导入的 MP3 文件</p>
        <p class="empty-hint">上传你的第一首歌曲开始练习吧！</p>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import MP3Uploader from '../components/MP3Uploader.vue'
import MP3Editor from '../components/MP3Editor.vue'
import { useMP3ImportStore } from '../stores/useMP3ImportStore'
import { useMP3Import } from '../composables/useMP3Import'

const store = useMP3ImportStore()

const currentImportId = ref<string | null>(null)
const currentAudioUrl = ref<string | undefined>(undefined)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const onImportSuccess = (importId: string) => {
  currentImportId.value = importId
  
  // Create audio URL for the current import
  // Note: We need to store the file somewhere accessible, 
  // for now we'll use a placeholder approach
  const importItem = store.imports.find(i => i.id === importId)
  if (importItem) {
    showToast(`成功导入: ${importItem.fileName}`, 'success')
  }
}

const onImportError = (error: string) => {
  showToast(error, 'error')
}

const onLessonSaved = (lessonId: string) => {
  showToast('课程保存成功！现在可以去练习了', 'success')
  
  // Navigate to practice view after a delay
  setTimeout(() => {
    window.location.hash = `#/practice?lesson=${lessonId}`
  }, 1500)
}

// Cleanup
onUnmounted(() => {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  
  // Revoke any object URLs
  if (currentAudioUrl.value) {
    URL.revokeObjectURL(currentAudioUrl.value)
  }
})
</script>

<style scoped>
.mp3-import-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.view-header {
  text-align: center;
  margin-bottom: 32px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
