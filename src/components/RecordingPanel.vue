<template>
  <div class="recording-panel bg-slate-800/80 backdrop-blur rounded-xl p-4 w-full max-w-2xl mx-auto">
    <!-- 录音控制区 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <span class="text-lg">🎙️</span>
        <span>录音</span>
        <span 
          v-if="recordingStore.isRecording" 
          class="recording-indicator"
        >
          REC
        </span>
      </h3>
      
      <div class="flex items-center gap-2">
        <!-- 录音按钮 -->
        <button
          v-if="!recordingStore.isRecording && !recordingStore.isPlaying"
          class="btn-record"
          @click="startRecording"
        >
          <span class="w-3 h-3 rounded-full bg-red-500" />
          开始录音
        </button>
        
        <button
          v-if="recordingStore.isRecording"
          class="btn-stop"
          @click="stopRecording"
        >
          <span class="w-3 h-3 bg-slate-800" />
          停止
        </button>
        
        <button
          v-if="recordingStore.isPlaying"
          class="btn-stop"
          @click="stopPlayback"
        >
          ⏹ 停止播放
        </button>
      </div>
    </div>
    
    <!-- 播放进度条 -->
    <div v-if="recordingStore.isPlaying" class="mb-4">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${recordingStore.playbackProgress * 100}%` }"
        />
      </div>
      <p class="text-xs text-slate-400 text-center mt-1">播放中...</p>
    </div>
    
    <!-- 录音列表 -->
    <div v-if="recordingStore.recordings.length > 0" class="recordings-list">
      <div class="text-xs text-slate-400 mb-2">
        共 {{ recordingStore.recordingCount }} 条录音
      </div>
      
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="recording in recordingStore.recordings"
          :key="recording.id"
          class="recording-item"
          :class="{ 'playing': recordingStore.currentRecording?.id === recording.id }"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- 播放按钮 -->
            <button
              class="btn-play"
              :disabled="recordingStore.isRecording"
              @click="playRecording(recording)"
            >
              {{ recordingStore.currentRecording?.id === recording.id ? '⏸' : '▶' }}
            </button>
            
            <!-- 录音信息 -->
            <div class="flex-1 min-w-0">
              <input
                v-if="editingId === recording.id"
                v-model="editingName"
                class="name-input"
                @blur="saveRename(recording.id)"
                @keyup.enter="saveRename(recording.id)"
                @keyup.esc="cancelRename"
              >
              <span
                v-else
                class="name-display"
                @dblclick="startRename(recording)"
              >
                {{ recording.name }}
              </span>
              <div class="text-xs text-slate-400">
                {{ formatDuration(recording.duration) }} • 
                {{ recording.events.length }} 个音符 •
                {{ formatDate(recording.createdAt) }}
              </div>
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <button
            class="btn-delete"
            @click="deleteRecording(recording.id)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="text-center py-6 text-slate-500 text-sm">
      <p>暂无录音</p>
      <p class="text-xs mt-1">点击上方按钮开始录制你的演奏</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRecordingStore, type Recording } from '../stores/useRecordingStore'

const props = defineProps<{
  onTrigger: (drumId: string) => void
}>()

const recordingStore = useRecordingStore()

// Rename state
const editingId = ref<string | null>(null)
const editingName = ref('')

// Start recording
const startRecording = () => {
  recordingStore.startRecording()
}

// Stop recording
const stopRecording = () => {
  recordingStore.stopRecording()
}

// Play recording
const playRecording = (recording: Recording) => {
  if (recordingStore.currentRecording?.id === recording.id && recordingStore.isPlaying) {
    recordingStore.stopPlayback()
  } else {
    recordingStore.playRecording(recording, props.onTrigger)
  }
}

// Stop playback
const stopPlayback = () => {
  recordingStore.stopPlayback()
}

// Delete recording
const deleteRecording = (id: string) => {
  if (confirm('确定要删除这条录音吗？')) {
    recordingStore.deleteRecording(id)
  }
}

// Start rename
const startRename = (recording: Recording) => {
  editingId.value = recording.id
  editingName.value = recording.name
}

// Save rename
const saveRename = (id: string) => {
  if (editingName.value.trim()) {
    recordingStore.renameRecording(id, editingName.value.trim())
  }
  editingId.value = null
}

// Cancel rename
const cancelRename = () => {
  editingId.value = null
}

// Format duration
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Record event when drum is triggered (called from parent)
const recordEvent = (drumId: string) => {
  recordingStore.recordEvent(drumId)
}

// Expose recordEvent to parent
defineExpose({ recordEvent })
</script>

<style scoped>
@import "tailwindcss";
.recording-indicator {
  @apply px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded animate-pulse;
}

.btn-record {
  @apply flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 
         text-red-400 rounded-lg transition-all text-sm font-medium;
}

.btn-record:hover {
  @apply shadow-lg shadow-red-500/20;
}

.btn-stop {
  @apply flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 
         text-slate-200 rounded-lg transition-all text-sm font-medium;
}

.progress-bar {
  @apply h-1.5 bg-slate-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-100;
}

.recordings-list {
  @apply border-t border-slate-700/50 pt-4;
}

.recording-item {
  @apply flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 
         hover:bg-slate-700/50 transition-colors;
}

.recording-item.playing {
  @apply bg-pink-500/20 border border-pink-500/30;
}

.btn-play {
  @apply w-8 h-8 flex items-center justify-center rounded-full 
         bg-slate-600 hover:bg-slate-500 text-white transition-colors text-xs;
}

.btn-play:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.name-input {
  @apply w-full px-2 py-1 bg-slate-600 rounded text-sm text-white 
         outline-none focus:ring-2 focus:ring-pink-500;
}

.name-display {
  @apply text-sm font-medium text-slate-200 cursor-pointer hover:text-white;
}

.btn-delete {
  @apply px-2 py-1 text-slate-400 hover:text-red-400 transition-colors;
}

/* Scrollbar styling */
.recordings-list::-webkit-scrollbar {
  @apply w-1.5;
}

.recordings-list::-webkit-scrollbar-track {
  @apply bg-slate-800 rounded;
}

.recordings-list::-webkit-scrollbar-thumb {
  @apply bg-slate-600 rounded;
}

.recordings-list::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-500;
}
</style>
