<template>
  <div class="lesson-selector">
    <div class="selector-header">
      <h3>📚 课程列表</h3>
      <p class="selector-desc">
        选择一节课开始学习架子鼓
        <span v-if="overallProgress.percentage > 0" class="progress-badge">
          进度: {{ overallProgress.completed }}/{{ overallProgress.total }} ({{ overallProgress.percentage }}%)
        </span>
      </p>
    </div>

    <!-- 解锁链状态 -->
    <div class="unlock-chain">
      <div
        v-for="(item, index) in unlockChainStatus"
        :key="item.lesson.id"
        class="chain-item"
        :class="{
          'chain-locked': !item.isUnlocked,
          'chain-completed': item.isCompleted,
          'chain-current': !item.isCompleted && item.isUnlocked,
          'chain-new': item.isNewlyUnlocked,
        }"
        :title="item.lesson.title"
        @click="selectLesson(item.lesson)"
      >
        <span class="chain-number">{{ index + 1 }}</span
        >
        <span v-if="item.isCompleted && item.bestRating" class="chain-rating"
          >{{ item.bestRating }}</span
        >
        <span v-else-if="!item.isUnlocked" class="chain-lock"
          >🔒</span
        >
      </div>
    </div>

    <div class="lessons-list">
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-card"
        :class="{
          'lesson-locked': isLocked(lesson),
          'lesson-active': teachingStore.currentLesson?.id === lesson.id,
          'lesson-completed': getLessonProgress(lesson.id).isCompleted,
          'lesson-newly-unlocked': getLessonProgress(lesson.id).isNewlyUnlocked,
        }"
        @click="selectLesson(lesson)"
      >
        <!-- 课程编号 -->
        <div
          class="lesson-number"
          :class="{ 'lesson-number-locked': isLocked(lesson) }"
        >
          {{ lesson.lessonInfo?.lessonNumber || '?' }}
        </div>

        <!-- 课程信息 -->
        <div class="lesson-info">
          <div class="lesson-header-row"
            >
            <h4 class="lesson-name"
              >{{ lesson.title }}</h4
            >
            <!-- 最佳评级徽章 -->
            <span
              v-if="getLessonProgress(lesson.id).bestRating"
              class="rating-badge"
              :class="`rating-${getLessonProgress(lesson.id).bestRating?.toLowerCase()}`"
            >
              {{ getLessonProgress(lesson.id).bestRating }}
            </span>
            <!-- 新解锁标记 -->
            <span
              v-else-if="getLessonProgress(lesson.id).isNewlyUnlocked"
              class="new-unlock-badge"
            >
              NEW!
            </span>
          </div>

          <p class="lesson-description"
            >{{ lesson.description }}</p
          >

          <div class="lesson-meta"
            >
            <span class="meta-item"
              > 🥁 {{ lesson.lessonInfo?.targetDrums.length || 0 }} 种鼓 </span
            >

            <span class="meta-item"
              > ⏱️ {{ lesson.duration }} 秒 </span
            >

            <span class="meta-item"
              > 🎵 BPM {{ lesson.bpm }} </span
            >

            <span class="meta-item difficulty-badge" :class="`difficulty-${lesson.difficulty}`"
              > {{ getDifficultyLabel(lesson.difficulty) }} </span
            >
          </div>

          <!-- 目标鼓预览 -->
          <div class="drum-preview"
            >
            <span
              v-for="drumId in lesson.lessonInfo?.targetDrums.slice(0, 3)"
              :key="drumId"
              class="drum-mini"
              :title="getDrumName(drumId)"
            >
              {{ getDrumIcon(drumId) }}
            </span>
          </div>

          <!-- 解锁条件提示（锁定状态） -->
          <p v-if="isLocked(lesson)" class="unlock-hint"
            >
            🔒 {{ getUnlockConditionText(lesson.id) }}
          </p
          >
        </div>

        <!-- 状态图标 -->
        <div class="lesson-status"
          >
          <span v-if="isLocked(lesson)" class="status-icon locked"
            >🔒</span
          >
          <span v-else-if="getLessonProgress(lesson.id).isCompleted" class="status-icon completed"
            >✅</span
          >
          <span
            v-else-if="teachingStore.currentLesson?.id === lesson.id"
            class="status-icon active"
            >▶️</span
          >
          <span v-else class="status-icon available"
            >▶️</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"
>
import { computed } from 'vue'
import { useTeachingStore } from '../stores/useTeachingStore'
import { useProgressStore } from '../stores/useProgressStore'
import { LESSON_MAPS } from '../data/lessons'
import { getUnlockConditionText } from '../data/unlockRules'
import type { RhythmMap } from '../types'

const teachingStore = useTeachingStore()
const progressStore = useProgressStore()

const lessons = computed(() => LESSON_MAPS)

// 解锁链状态
const unlockChainStatus = computed(() => progressStore.unlockChainStatus)

// 总体进度
const overallProgress = computed(() => progressStore.overallProgress)

// 获取课程进度
function getLessonProgress(lessonId: string) {
  const progress = progressStore.getLessonProgress(lessonId)
  const isNewlyUnlocked = progressStore.newlyUnlockedLessons.includes(lessonId)
  return {
    ...progress,
    isNewlyUnlocked,
  }
}

// 检查课程是否锁定
function isLocked(lesson: RhythmMap): boolean {
  return !progressStore.isLessonUnlocked(lesson.id)
}

// 选择课程
function selectLesson(lesson: RhythmMap) {
  if (isLocked(lesson)) {
    // 锁定课程，显示提示
    return
  }

  // 清除新解锁标记
  if (progressStore.newlyUnlockedLessons.includes(lesson.id)) {
    progressStore.markNewlyUnlockedAsSeen(lesson.id)
  }

  teachingStore.loadLesson(lesson.id)
}

// 获取难度标签
function getDifficultyLabel(difficulty?: string): string {
  const labels: Record<string, string> = {
    beginner: '入门',
    elementary: '初级',
    intermediate: '中级',
    advanced: '进阶',
  }
  return labels[difficulty || 'beginner'] || '入门'
}

// 获取鼓名称
function getDrumName(drumId: string): string {
  const names: Record<string, string> = {
    kick: '底鼓',
    snare: '军鼓',
    'hihat-closed': '闭镲',
    'hihat-open': '开镲',
    crash: '碎音镲',
    ride: '叮叮镲',
    'tom-high': '高音桶鼓',
    'tom-mid': '中音桶鼓',
    'tom-low': '低音桶鼓',
  }
  return names[drumId] || drumId
}

// 获取鼓图标
function getDrumIcon(drumId: string): string {
  const icons: Record<string, string> = {
    kick: '🥁',
    snare: '🎯',
    'hihat-closed': '⬇️',
    'hihat-open': '⬆️',
    crash: '💥',
    ride: '🔔',
    'tom-high': '🎵',
    'tom-mid': '🎶',
    'tom-low': '🎼',
  }
  return icons[drumId] || '🥁'
}
</script
>

<style scoped
>
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
  @apply text-sm text-slate-400 flex items-center gap-2 flex-wrap;
}

.progress-badge {
  @apply text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full;
}

/* 解锁链 */
.unlock-chain {
  @apply flex items-center gap-1 mb-4 overflow-x-auto pb-2;
  scrollbar-width: thin;
}

.chain-item {
  @apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all;
  @apply text-xs font-bold;
}

.chain-locked {
  @apply bg-slate-700 text-slate-500 cursor-not-allowed;
}

.chain-completed {
  @apply bg-green-500/20 text-green-400 border border-green-500/50;
}

.chain-current {
  @apply bg-pink-500/20 text-pink-400 border border-pink-500/50 animate-pulse;
}

.chain-new {
  @apply ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900;
}

.chain-number {
  @apply text-xs;
}

.chain-rating {
  @apply text-xs font-bold;
}

.chain-lock {
  @apply text-xs opacity-50;
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
  @apply opacity-60 cursor-not-allowed bg-slate-800/30 border-slate-800;
}

.lesson-card.lesson-completed {
  @apply border-green-500/30 bg-green-500/5;
}

.lesson-card.lesson-newly-unlocked {
  @apply ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-slate-900;
}

.lesson-number {
  @apply w-10 h-10 flex items-center justify-center;
  @apply bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg;
  @apply text-lg font-bold;
}

.lesson-number-locked {
  @apply bg-slate-700 from-slate-600 to-slate-700;
}

.lesson-info {
  @apply flex-1 min-w-0;
}

.lesson-header-row {
  @apply flex items-center gap-2;
}

.lesson-name {
  @apply font-bold truncate;
}

.rating-badge {
  @apply text-xs font-bold px-1.5 py-0.5 rounded;
}

.rating-s {
  @apply bg-yellow-500/20 text-yellow-400 border border-yellow-500/50;
}

.rating-a {
  @apply bg-green-500/20 text-green-400 border border-green-500/50;
}

.rating-b {
  @apply bg-blue-500/20 text-blue-400 border border-blue-500/50;
}

.rating-c {
  @apply bg-slate-500/20 text-slate-400 border border-slate-500/50;
}

.rating-d {
  @apply bg-red-500/20 text-red-400 border border-red-500/50;
}

.new-unlock-badge {
  @apply text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 animate-pulse;
}

.lesson-description {
  @apply text-sm text-slate-400 truncate;
}

.lesson-meta {
  @apply flex gap-2 mt-2 text-xs text-slate-500 flex-wrap;
}

.meta-item {
  @apply flex items-center gap-1;
}

.difficulty-badge {
  @apply px-1.5 py-0.5 rounded;
}

.difficulty-beginner {
  @apply bg-green-500/10 text-green-400;
}

.difficulty-elementary {
  @apply bg-blue-500/10 text-blue-400;
}

.difficulty-intermediate {
  @apply bg-orange-500/10 text-orange-400;
}

.difficulty-advanced {
  @apply bg-red-500/10 text-red-400;
}

.unlock-hint {
  @apply text-xs text-slate-500 mt-2;
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

.status-icon.completed {
  @apply text-green-500;
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

:global(.theme-light) .lesson-card.lesson-locked {
  @apply opacity-60 bg-slate-100/50 border-slate-200/50;
}

:global(.theme-light) .lesson-number-locked {
  @apply bg-slate-300 from-slate-300 to-slate-400;
}

:global(.theme-cyberpunk) .lesson-card {
  @apply bg-slate-900/80 border-cyan-500/30;
}

:global(.theme-cyberpunk) .lesson-card.lesson-active {
  @apply border-cyan-400 bg-cyan-500/10;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

:global(.theme-cyberpunk) .lesson-card.lesson-locked {
  @apply border-slate-700/50 bg-slate-900/50;
}
</style
>
