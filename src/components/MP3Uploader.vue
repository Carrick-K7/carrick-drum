<template>
  <div class="mp3-uploader">
    <!-- Drag and Drop Zone -->
    <div
      ref="dropZoneRef"
      class="drop-zone"
      :class="{
        'is-dragging': isDragging,
        'has-error': !!error
      }"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".mp3,audio/mpeg,audio/mp3"
        class="hidden"
        @change="onFileSelect"
      />
      
      <div v-if="!isAnalyzing" class="upload-content">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="upload-title">拖拽 MP3 文件到此处</p>
        <p class="upload-subtitle">或点击选择文件</p>
        <p class="upload-hint">支持格式: MP3 | 最大 20MB</p>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
      
      <!-- Analysis Progress -->
      <div v-else class="analysis-progress">
        <div class="progress-ring">
          <svg viewBox="0 0 36 36">
            <path
              class="progress-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-ring-circle"
              :stroke-dasharray="`${progress.progress}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="progress-text">{{ progress.progress }}%</div>
        </div>
        <p class="progress-message">{{ progress.message }}</p>
      </div>
    </div>

    <!-- Import History -->
    <div v-if="store.imports.length > 0" class="import-history">
      <h3 class="history-title">导入历史</h3>
      <div class="history-list">
        <div
          v-for="item in store.imports"
          :key="item.id"
          class="history-item"
          :class="{ active: store.currentImport?.id === item.id }"
          @click="selectImport(item.id)"
        >
          <div class="item-info">
            <span class="item-name">{{ item.fileName }}</span>
            <span class="item-meta">
              {{ formatDuration(item.duration) }} | {{ item.bpm }} BPM | {{ item.drumPoints.length }} 鼓点
            </span>
          </div>
          <button
            class="delete-btn"
            @click.stop="deleteImport(item.id)"
            title="删除"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMP3Import } from '../composables/useMP3Import'
import { useMP3ImportStore } from '../stores/useMP3ImportStore'

const emit = defineEmits<{
  importSuccess: [importId: string]
  importError: [error: string]
}>()

const { importMP3, progress, isAnalyzing, error, reset } = useMP3Import()
const store = useMP3ImportStore()

const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)

const onDragEnter = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = async (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await handleFile(files[0])
  }
}

const onFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    await handleFile(files[0])
    target.value = '' // Reset input
  }
}

const handleFile = async (file: File) => {
  try {
    reset()
    const result = await importMP3(file)
    emit('importSuccess', result.id)
  } catch (err) {
    emit('importError', (err as Error).message)
  }
}

const triggerFileInput = () => {
  if (!isAnalyzing.value) {
    fileInputRef.value?.click()
  }
}

const selectImport = (id: string) => {
  store.setCurrentImport(id)
  emit('importSuccess', id)
}

const deleteImport = (id: string) => {
  store.removeImport(id)
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mp3-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.drop-zone:hover:not(.is-analyzing) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-zone.is-dragging {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.drop-zone.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 8px;
}

.drop-zone:hover .upload-icon {
  color: #3b82f6;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0;
}

.error-message {
  font-size: 14px;
  color: #ef4444;
  margin: 8px 0 0;
}

.hidden {
  display: none;
}

/* Progress */
.analysis-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}

.progress-ring-circle {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.progress-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Import History */
.import-history {
  margin-top: 24px;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.history-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 12px;
  color: #6b7280;
}

.delete-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
</style>
