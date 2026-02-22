<template>
  <Teleport to="body">
    <Transition name="modal-fade"
      >
      <div
        v-if="modelValue"
        class="unlock-modal-overlay"
        @click.self="close"
      >
        <div class="unlock-modal"
          >
          <!-- 图标 -->
          <div class="modal-icon"
            >
            <span>🔒</span>
          </div
          >

          <!-- 标题 -->
          <h3 class="modal-title"
            >课程未解锁</h3
          >

          <!-- 课程名称 -->
          <p v-if="lessonName" class="modal-lesson-name"
            >{{ lessonName }}</p
          >

          <!-- 解锁条件 -->
          <div class="modal-condition"
            >
            <p class="condition-label"
              >解锁条件:</p
            >
            <p class="condition-text"
              >{{ conditionText }}</p
            >
          </div
          >

          <!-- 按钮 -->
          <div class="modal-actions"
            >
            <button class="btn-primary" @click="goToPrerequisite"
              > 去练习前置课程 </button
            >
            <button class="btn-secondary" @click="close"
              > 知道了 </button
            >
          </div
          >
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeachingStore } from '../stores/useTeachingStore'
import { useProgressStore } from '../stores/useProgressStore'
import { getPreviousLesson } from '../data/unlockRules'

interface Props {
  modelValue: boolean
  lessonId?: string
  lessonName?: string
  conditionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  lessonId: '',
  lessonName: '',
  conditionText: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const teachingStore = useTeachingStore()
const progressStore = useProgressStore()

const prerequisiteLesson = computed(() => {
  return getPreviousLesson(props.lessonId)
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function goToPrerequisite() {
  const prevLesson = prerequisiteLesson.value
  if (prevLesson && progressStore.isLessonUnlocked(prevLesson.id)) {
    teachingStore.loadLesson(prevLesson.id)
    close()
  }
}
</script
>

<style scoped
>
.unlock-modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black/60 backdrop-blur-sm;
}

.unlock-modal {
  @apply bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4;
  @apply border border-slate-700 shadow-2xl;
  @apply text-center;
}

.modal-icon {
  @apply w-16 h-16 mx-auto mb-4 rounded-full;
  @apply bg-slate-700 flex items-center justify-center;
  @apply text-3xl;
}

.modal-title {
  @apply text-xl font-bold mb-2;
}

.modal-lesson-name {
  @apply text-slate-400 mb-4;
}

.modal-condition {
  @apply bg-slate-700/50 rounded-xl p-4 mb-6;
}

.condition-label {
  @apply text-sm text-slate-500 mb-1;
}

.condition-text {
  @apply text-lg font-medium text-pink-400;
}

.modal-actions {
  @apply flex flex-col gap-2;
}

.btn-primary {
  @apply w-full py-3 rounded-xl font-medium;
  @apply bg-gradient-to-r from-pink-500 to-violet-500;
  @apply hover:from-pink-600 hover:to-violet-600;
  @apply transition-all;
}

.btn-secondary {
  @apply w-full py-3 rounded-xl font-medium;
  @apply bg-slate-700 text-slate-300;
  @apply hover:bg-slate-600;
  @apply transition-all;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  @apply transition-all duration-300;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  @apply opacity-0;
}

.modal-fade-enter-from .unlock-modal,
.modal-fade-leave-to .unlock-modal {
  @apply scale-95;
}

/* 主题适配 */
:global(.theme-light) .unlock-modal {
  @apply bg-white border-slate-200;
}

:global(.theme-light) .modal-icon {
  @apply bg-slate-100;
}

:global(.theme-light) .modal-condition {
  @apply bg-slate-100;
}

:global(.theme-light) .btn-secondary {
  @apply bg-slate-200 text-slate-700 hover:bg-slate-300;
}
:global(.theme-cyberpunk) .unlock-modal {
  @apply bg-slate-900/95 border-cyan-500/50;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
}

:global(.theme-cyberpunk) .condition-text {
  @apply text-cyan-400;
}
</style
>
