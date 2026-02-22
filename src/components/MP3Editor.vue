<template>
  <div class="mp3-editor" v-if="importResult">
    <!-- Header -->
    <div class="editor-header">
      <div class="file-info">
        <h3 class="file-name">{{ importResult.fileName }}</h3>
        <div class="file-meta">
          <span class="meta-item">
            <span class="meta-label">时长:</span>
            {{ formatDuration(importResult.duration) }}
          </span>
          <span class="meta-item">
            <span class="meta-label">BPM:</span>
            {{ importResult.bpm }}
          </span>
          <span class="meta-item">
            <span class="meta-label">鼓点:</span>
            {{ importResult.drumPoints.length }} 个
          </span>
        </div>
      </div>
      <div class="editor-actions">
        <button class="btn btn-secondary" @click="resetView">
          重置视图
        </button>
        <button class="btn btn-primary" @click="saveAsLesson">
          保存为课程
        </button>
      </div>
    </div>

    <!-- Audio Player -->
    <div class="audio-player">
      <audio
        ref="audioRef"
        :src="audioUrl"
        @timeupdate="onTimeUpdate"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="onAudioEnded"
      />
      <div class="player-controls">
        <button class="play-btn" @click="togglePlay">
          <span v-if="isPlaying">⏸</span>
          <span v-else>▶</span>
        </button>
        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(importResult.duration) }}
        </div>
      </div>
      <div class="progress-bar" @click="seekTo">
        <div class="progress-fill" :style="{ width: `${(currentTime / importResult.duration) * 100}%` }" />
        <div class="progress-handle" :style="{ left: `${(currentTime / importResult.duration) * 100}%` }" />
      </div>
    </div>

    <!-- Drum Points Timeline -->
    <div class="timeline-container">
      <div class="timeline-header">
        <h4>鼓点时间轴</h4>
        <div class="legend">
          <span class="legend-item kick">
            <span class="dot" /> 底鼓 (Kick)
          </span>
          <span class="legend-item snare">
            <span class="dot" /> 军鼓 (Snare)
          </span>
          <span class="legend-item hihat">
            <span class="dot" /> 踩镲 (Hi-hat)
          </span>
        </div>
      </div>
      
      <div 
        ref="timelineRef"
        class="timeline"
        @mousedown="onTimelineMouseDown"
      >
        <!-- Time markers -->
        <div class="time-markers">
          <div
            v-for="marker in timeMarkers"
            :key="marker.time"
            class="time-marker"
            :style="{ left: `${(marker.time / importResult.duration) * 100}%` }"
          >
            <span class="marker-line" />
            <span class="marker-label">{{ formatTime(marker.time) }}</span>
          </div>
        </div>

        <!-- Drum points -->
        <div
          v-for="(point, index) in importResult.drumPoints"
          :key="index"
          class="drum-point"
          :class="[
            point.autoDrum,
            { active: selectedPointIndex === index, passed: point.time < currentTime }
          ]"
          :style="{ left: `${(point.time / importResult.duration) * 100}%` }"
          :title="`${formatTime(point.time)} - ${getDrumName(point.autoDrum)}`"
          @mousedown.stop="onPointMouseDown($event, index)"
          @click.stop="selectPoint(index)"
        >
          <span class="point-marker" />
        </div>

        <!-- Playhead -->
        <div class="playhead" :style="{ left: `${(currentTime / importResult.duration) * 100}%` }" />
      </div>
    </div>

    <!-- Point Editor -->
    <div v-if="selectedPoint" class="point-editor">
      <h4>编辑鼓点</h4>
      <div class="editor-form">
        <div class="form-row">
          <label>时间:</label>
          <input
            type="number"
            v-model.number="selectedPoint.time"
            step="0.01"
            min="0"
            :max="importResult.duration"
            @change="updatePointTime"
          />
          <span>秒</span>
        </div>
        <div class="form-row">
          <label>鼓类型:</label>
          <select v-model="selectedPoint.autoDrum" @change="updatePointDrum">
            <option value="kick">底鼓 (Kick)</option>
            <option value="snare">军鼓 (Snare)</option>
            <option value="hihat-closed">闭镲 (Hi-hat Closed)</option>
            <option value="hihat-open">开镲 (Hi-hat Open)</option>
            <option value="crash">碎音镲 (Crash)</option>
          </select>
        </div>
        <div class="form-row">
          <label>强度:</label>
          <span class="strength-value">{{ (selectedPoint.strength * 100).toFixed(0) }}%</span>
        </div>
        <div class="form-actions">
          <button class="btn btn-danger" @click="deleteSelectedPoint">
            删除
          </button>
          <button class="btn btn-secondary" @click="confirmPoint">
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="statistics">
      <h4>统计信息</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ kickCount }}</span>
          <span class="stat-label">底鼓</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ snareCount }}</span>
          <span class="stat-label">军鼓</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ hihatCount }}</span>
          <span class="stat-label">踩镲</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ otherCount }}</span>
          <span class="stat-label">其他</span>
        </div>
      </div>
    </div>

    <!-- Save Dialog -->
    <div v-if="showSaveDialog" class="dialog-overlay" @click="showSaveDialog = false">
      <div class="dialog" @click.stop>
        <h3>保存为自定义课程</h3>
        <div class="form-group">
          <label>课程名称:</label>
          <input v-model="lessonTitle" type="text" placeholder="输入课程名称" />
        </div>
        <div class="form-group">
          <label>难度:</label>
          <select v-model="lessonDifficulty">
            <option value="beginner">入门</option>
            <option value="elementary">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">进阶</option>
          </select>
        </div>
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="showSaveDialog = false">
            取消
          </button>
          <button class="btn btn-primary" @click="confirmSave">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMP3ImportStore } from '../stores/useMP3ImportStore'

const props = defineProps<{
  importId: string
  audioUrl?: string
}>()

const emit = defineEmits<{
  saved: [lessonId: string]
}>()

const store = useMP3ImportStore()

// Refs
const audioRef = ref<HTMLAudioElement>()
const timelineRef = ref<HTMLElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const selectedPointIndex = ref<number | null>(null)
const showSaveDialog = ref(false)
const lessonTitle = ref('')
const lessonDifficulty = ref<'beginner' | 'elementary' | 'intermediate' | 'advanced'>('beginner')

// Computed
const importResult = computed(() => {
  return store.imports.find(i => i.id === props.importId) || null
})

const selectedPoint = computed(() => {
  if (selectedPointIndex.value === null || !importResult.value) return null
  return importResult.value.drumPoints[selectedPointIndex.value]
})

const timeMarkers = computed(() => {
  if (!importResult.value) return []
  const markers = []
  const step = Math.ceil(importResult.value.duration / 10)
  for (let i = 0; i <= importResult.value.duration; i += step) {
    markers.push({ time: i })
  }
  return markers
})

const kickCount = computed(() => 
  importResult.value?.drumPoints.filter(p => p.autoDrum === 'kick').length || 0
)
const snareCount = computed(() => 
  importResult.value?.drumPoints.filter(p => p.autoDrum === 'snare').length || 0
)
const hihatCount = computed(() => 
  importResult.value?.drumPoints.filter(p => p.autoDrum.includes('hihat')).length || 0
)
const otherCount = computed(() => 
  importResult.value?.drumPoints.filter(p => 
    !['kick', 'snare'].includes(p.autoDrum) && !p.autoDrum.includes('hihat')
  ).length || 0
)

// Watch for import changes
watch(() => props.importId, (newId) => {
  if (newId) {
    store.setCurrentImport(newId)
    selectedPointIndex.value = null
    currentTime.value = 0
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.pause()
    }
  }
})

// Methods
const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
}

const seekTo = (e: MouseEvent) => {
  if (!audioRef.value || !importResult.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const newTime = percent * importResult.value.duration
  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

const selectPoint = (index: number) => {
  selectedPointIndex.value = index
}

const onPointMouseDown = (e: MouseEvent, index: number) => {
  e.preventDefault()
  selectedPointIndex.value = index
  
  const startX = e.clientX
  const startTime = importResult.value!.drumPoints[index].time
  const timelineWidth = timelineRef.value?.clientWidth || 1
  const duration = importResult.value!.duration

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaPercent = deltaX / timelineWidth
    const newTime = Math.max(0, Math.min(duration, startTime + deltaPercent * duration))
    
    store.moveDrumPoint(index, newTime)
    
    // Sync with audio if playing
    if (audioRef.value && isPlaying.value) {
      audioRef.value.currentTime = newTime
    }
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const onTimelineMouseDown = (e: MouseEvent) => {
  // Click on empty timeline to set playhead
  if ((e.target as HTMLElement).classList.contains('timeline')) {
    seekTo(e)
  }
}

const updatePointTime = () => {
  if (selectedPointIndex.value !== null && selectedPoint.value) {
    store.moveDrumPoint(selectedPointIndex.value, selectedPoint.value.time)
  }
}

const updatePointDrum = () => {
  if (selectedPointIndex.value !== null && selectedPoint.value) {
    store.updateDrumPoint(selectedPointIndex.value, { autoDrum: selectedPoint.value.autoDrum })
  }
}

const deleteSelectedPoint = () => {
  if (selectedPointIndex.value !== null) {
    store.deleteDrumPoint(selectedPointIndex.value)
    selectedPointIndex.value = null
  }
}

const confirmPoint = () => {
  if (selectedPointIndex.value !== null) {
    store.updateDrumPoint(selectedPointIndex.value, { confirmed: true })
  }
}

const resetView = () => {
  currentTime.value = 0
  selectedPointIndex.value = null
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    audioRef.value.pause()
  }
}

const saveAsLesson = () => {
  if (!importResult.value) return
  lessonTitle.value = importResult.value.fileName.replace(/\.mp3$/i, '')
  showSaveDialog.value = true
}

const confirmSave = () => {
  if (!importResult.value || !lessonTitle.value) return
  
  const lessonId = `mp3-import-${importResult.value.id}`
  
  // Create lesson data
  const lessonData = {
    id: lessonId,
    title: lessonTitle.value,
    titleEn: lessonTitle.value,
    bpm: importResult.value.bpm,
    duration: importResult.value.duration,
    style: 'pop' as const,
    description: `从 MP3 导入: ${importResult.value.fileName}`,
    difficulty: lessonDifficulty.value,
    beats: importResult.value.drumPoints.map(point => ({
      time: point.time,
      drum: point.autoDrum,
      label: ''
    }))
  }
  
  // Save to localStorage
  const lessons = JSON.parse(localStorage.getItem('custom-lessons') || '[]')
  const existingIndex = lessons.findIndex((l: any) => l.id === lessonId)
  if (existingIndex >= 0) {
    lessons[existingIndex] = lessonData
  } else {
    lessons.push(lessonData)
  }
  localStorage.setItem('custom-lessons', JSON.stringify(lessons))
  
  showSaveDialog.value = false
  emit('saved', lessonId)
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getDrumName = (drumId: string): string => {
  const names: Record<string, string> = {
    'kick': '底鼓',
    'snare': '军鼓',
    'hihat-closed': '闭镲',
    'hihat-open': '开镲',
    'crash': '碎音镲',
    'tom-high': '高音桶鼓',
    'tom-mid': '中音桶鼓',
    'tom-low': '低音桶鼓'
  }
  return names[drumId] || drumId
}

// Cleanup
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style scoped>
.mp3-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.file-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.file-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: #6b7280;
}

.meta-label {
  color: #9ca3af;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #fef2f2;
  color: #ef4444;
}

.btn-danger:hover {
  background: #fee2e2;
}

/* Audio Player */
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.play-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.time-display {
  font-size: 14px;
  font-family: monospace;
  color: #374151;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Timeline */
.timeline-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item.kick .dot { background: #ef4444; }
.legend-item.snare .dot { background: #3b82f6; }
.legend-item.hihat .dot { background: #10b981; }

.timeline {
  position: relative;
  height: 100px;
  background: #ffffff;
  cursor: crosshair;
}

.time-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.time-marker {
  position: absolute;
  top: 0;
  height: 100%;
}

.marker-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: #e5e7eb;
}

.marker-label {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 10px;
  color: #9ca3af;
}

.drum-point {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 10;
}

.drum-point:active {
  cursor: grabbing;
}

.point-marker {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.drum-point:hover .point-marker,
.drum-point.active .point-marker {
  transform: scale(1.3);
}

.drum-point.kick .point-marker { background: #ef4444; }
.drum-point.snare .point-marker { background: #3b82f6; }
.drum-point.hihat-closed .point-marker,
.drum-point.hihat-open .point-marker { background: #10b981; }
.drum-point.crash .point-marker { background: #f59e0b; }

.drum-point.passed .point-marker {
  opacity: 0.5;
}

.playhead {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  background: #111827;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 20;
}

.playhead::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #111827;
}

/* Point Editor */
.point-editor {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.point-editor h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row label {
  width: 80px;
  font-size: 13px;
  color: #6b7280;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.strength-value {
  font-size: 13px;
  color: #374151;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* Statistics */
.statistics {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.statistics h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
}

.dialog h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
</style>
