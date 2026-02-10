<template>
  <div class="lesson-selector">
    <div class="selector-header">
      <h3>📚 课程列表</h3>
      <p class="selector-desc">选择一节课开始学习架子鼓</p>
    </div>
    
    <div class="lessons-list">
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-card"
        :class="{
          'lesson-locked': isLocked(lesson),
          'lesson-active': teachingStore.currentLesson?.id === lesson.id,
        }"
        @click="selectLesson(lesson)"
      >
        <!-- 课程编号 -->
        <div class="lesson-number">
          {{ lesson.lessonInfo?.lessonNumber || '?' }}
        </div>
        
        <!-- 课程信息 -->
        <div class="lesson-info">
          <h4 class="lesson-name">{{ lesson.title }}</h4>
          <p class="lesson-description">{{ lesson.description }}</p>
          
          <div class="lesson-meta">
            <span class="meta-item">
              🥁 {{ lesson.lessonInfo?.targetDrums.length || 0 }} 种鼓
            </span>
            
            <span class="meta-item">
              ⏱️ {{ lesson.duration }} 秒
            </span>
            
            <span class="meta-item">
              🎵 BPM {{ lesson.bpm }}
            </span>
          </div>
          
          <!-- 目标鼓预览 -->
          <div class="drum-preview">
            <span
              v-for="drumId in lesson.lessonInfo?.targetDrums.slice(0, 3)"
              :key="drumId"
              class="drum-mini"
              :title="getDrumName(drumId)"
            >
              {{ getDrumIcon(drumId) }}
            </span>
          </div>
        </div>
        
        <!-- 状态图标 -->
        <div class="lesson-status">
          <span v-if="isLocked(lesson)" class="status-icon locked">🔒</span>
          <span v-else-if="teachingStore.currentLesson?.id === lesson.id" class="status-icon active">▶️</span>
          <span v-else class="status-icon available">▶️</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeachingStore } from '../stores/useTeachingStore'
import { LESSON_MAPS } from '../data/lessons'
import type { RhythmMap } from '../types'

const teachingStore = useTeachingStore()

const lessons = computed(() => LESSON_MAPS)

// 检查课程是否锁定
function isLocked(lesson: RhythmMap): boolean {
  if (!lesson.lessonInfo?.prerequisites) return false
  // 简化：没有实际锁定逻辑，所有课程都可用
  return false
}

// 选择课程
function selectLesson(lesson: RhythmMap) {
  if (isLocked(lesson)) return
  teachingStore.loadLesson(lesson.id)
}

// 获取鼓名称
function getDrumName(drumId: string): string {
  const names: Record<string, string> = {
    'kick': '底鼓',
    'snare': '军鼓',
    'hihat-closed': '闭镲',
    'hihat-open': '开镲',
    'crash': '碎音镲',
    'ride': '叮叮镲',
    'tom-high': '高音桶鼓',
    'tom-mid': '中音桶鼓',
    'tom-low': '低音桶鼓',
  }
  return names[drumId] || drumId
}

// 获取鼓图标
function getDrumIcon(drumId: string): string {
  const icons: Record<string, string> = {
    'kick': '🥁',
    'snare': '🎯',
    'hihat-closed': '⬇️',
    'hihat-open': '⬆️',
    'crash': '💥',
    'ride': '🔔',
    'tom-high': '🎵',
    'tom-mid': '🎶',
    'tom-low': '🎼',
  }
  return icons[drumId] || '🥁'
}
</script>

<style scoped>
@reference "../style.css";

.lesson-selector {
  width: 100%;
  max-width: 28rem;
}

.selector-header {
  @apply mb-4;
}

.selector-header h3 {
  @apply text-lg font-bold;
}

.selector-desc {
  @apply text-sm text-slate-400;
}

.lessons-list {
  @apply space-y-3;
}

.lesson-card {
  @apply flex items-center gap-4 p-4 rounded-xl;
  @apply bg-slate-800/50 border border-slate-700;
  @apply cursor-pointer transition-all;
  @apply hover:bg-slate-700/50 hover:border-slate-600;
}

.lesson-card.lesson-active {
  @apply border-pink-500 bg-pink-500/10;
}

.lesson-card.lesson-locked {
  @apply opacity-50 cursor-not-allowed;
}

.lesson-number {
  @apply w-10 h-10 flex items-center justify-center;
  @apply bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg;
  @apply text-lg font-bold;
}

.lesson-info {
  @apply flex-1 min-w-0;
}

.lesson-name {
  @apply font-bold truncate;
}

.lesson-description {
  @apply text-sm text-slate-400 truncate;
}

.lesson-meta {
  @apply flex gap-3 mt-2 text-xs text-slate-500;
}

.meta-item {
  @apply flex items-center gap-1;
}

.drum-preview {
  @apply flex gap-1 mt-2;
}

.drum-mini {
  @apply w-6 h-6 flex items-center justify-center text-xs;
  @apply bg-slate-700 rounded;
}

.lesson-status {
  @apply flex-shrink-0;
}

.status-icon {
  @apply text-lg;
}

.status-icon.locked {
  @apply opacity-50;
}

.status-icon.active {
  @apply text-pink-500;
}

.status-icon.available {
  @apply opacity-0 group-hover:opacity-100;
}

/* 主题适配 */
:global(.theme-light) .lesson-card {
  @apply bg-slate-100 border-slate-200;
  @apply hover:bg-slate-200 hover:border-slate-300;
}

:global(.theme-light) .lesson-card.lesson-active {
  @apply border-blue-500 bg-blue-500/10;
}

:global(.theme-cyberpunk) .lesson-card {
  @apply bg-slate-900/80 border-cyan-500/30;
}

:global(.theme-cyberpunk) .lesson-card.lesson-active {
  @apply border-cyan-400 bg-cyan-500/10;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}
</style>
