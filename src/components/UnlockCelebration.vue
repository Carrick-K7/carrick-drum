<template>
  <Teleport to="body">
    <Transition name="celebration-fade">
      <div
        v-if="modelValue"
        class="unlock-celebration-overlay"
        @click.self="close"
      >
        <!-- 背景特效 -->
        <div class="celebration-bg">
          <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)">✨</div>
        </div>

        <div class="unlock-celebration">
          <!-- 解锁图标 -->
          <div class="celebration-icon">
            <div class="icon-ring"></div>
            <span class="icon-emoji">🎉</span>
          </div>

          <!-- 标题 -->
          <h2 class="celebration-title">🎊 恭喜解锁新课程! 🎊</h2>

          <!-- 解锁的课程列表 -->
          <div class="unlocked-lessons">
            <div
              v-for="event in events"
              :key="event.lessonId"
              class="unlocked-lesson-card"
            >
              <span class="lesson-unlock-icon">🔓</span>
              <span class="lesson-unlock-name">{{ event.lessonName }}</span>
            </div>
          </div>

          <!-- 激励语 -->
          <p class="celebration-message">{{ getEncouragementMessage() }}</p>

          <!-- 按钮 -->
          <div class="celebration-actions">
            <button v-if="events.length === 1" class="btn-primary" @click="startLesson"> 立即开始 </button>
            <button class="btn-secondary" @click="close"> 继续探索 </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeachingStore } from '../stores/useTeachingStore'
import { useProgressStore } from '../stores/useProgressStore'
import type { UnlockEvent } from '../data/unlockRules'

interface Props {
  modelValue: boolean
  events: UnlockEvent[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const teachingStore = useTeachingStore()
const progressStore = useProgressStore()

const firstUnlockedLessonId = computed(() => {
  return props.events[0]?.lessonId
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function startLesson() {
  const lessonId = firstUnlockedLessonId.value
  if (lessonId) {
    teachingStore.loadLesson(lessonId)
    // 清除新解锁标记
    progressStore.markNewlyUnlockedAsSeen(lessonId)
  }
  close()
}

function getEncouragementMessage(): string {
  const messages = [
    '太棒了!你的鼓技又精进了!',
    '继续加油，下一个挑战等着你!',
    '解锁成功!准备好接受新的挑战了吗?',
    '进步神速!保持这个节奏!',
    '你的努力得到了回报!',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

function getParticleStyle(n: number): Record<string, string> {
  const angle = (n / 20) * 360
  const distance = 150 + Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 1 + Math.random() * 0.5

  return {
    left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * distance}px)`,
    top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * distance}px)`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}
</script>

<style scoped>
.unlock-celebration-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black/70 backdrop-blur-sm;
}

.celebration-bg {
  @apply absolute inset-0 overflow-hidden pointer-events-none;
}

.particle {
  @apply absolute text-2xl opacity-0;
  animation: particle-float 1.5s ease-out forwards;
}

@keyframes particle-float {
  0% {
    @apply opacity-100 scale-0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    @apply opacity-100;
  }
  100% {
    @apply opacity-0 scale-1.5;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

.unlock-celebration {
  @apply bg-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 relative;
  @apply border border-slate-700 shadow-2xl;
  @apply text-center;
  animation: celebration-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes celebration-pop {
  0% {
    @apply opacity-0 scale-50;
  }
  100% {
    @apply opacity-100 scale-100;
  }
}

.celebration-icon {
  @apply relative w-24 h-24 mx-auto mb-6;
}

.icon-ring {
  @apply absolute inset-0 rounded-full;
  @apply border-4 border-yellow-400/50;
  animation: ring-pulse 2s ease-out infinite;
}

@keyframes ring-pulse {
  0% {
    @apply scale-100 opacity-100;
  }
  100% {
    @apply scale-150 opacity-0;
  }
}

.icon-emoji {
  @apply absolute inset-0 flex items-center justify-center;
  @apply text-5xl;
  animation: icon-bounce 1s ease-in-out infinite;
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.celebration-title {
  @apply text-2xl font-bold mb-4 text-transparent bg-clip-text;
  @apply bg-gradient-to-r from-yellow-400 via-pink-500 to-violet-500;
}

.unlocked-lessons {
  @apply space-y-2 mb-6;
}

.unlocked-lesson-card {
  @apply flex items-center gap-3 p-3 rounded-xl;
  @apply bg-gradient-to-r from-yellow-500/20 to-pink-500/20;
  @apply border border-yellow-500/30;
  animation: card-slide-in 0.5s ease-out;
}

@keyframes card-slide-in {
  0% {
    @apply opacity-0 translate-x-4;
  }
  100% {
    @apply opacity-100 translate-x-0;
  }
}

.lesson-unlock-icon {
  @apply text-2xl;
}

.lesson-unlock-name {
  @apply font-medium text-slate-200;
}

.celebration-message {
  @apply text-slate-400 mb-6;
}

.celebration-actions {
  @apply flex flex-col gap-3;
}

.btn-primary {
  @apply w-full py-3 rounded-xl font-medium;
  @apply bg-gradient-to-r from-yellow-500 to-pink-500;
  @apply hover:from-yellow-600 hover:to-pink-600;
  @apply transition-all;
  @apply animate-pulse;
}

.btn-secondary {
  @apply w-full py-3 rounded-xl font-medium;
  @apply bg-slate-700 text-slate-300;
  @apply hover:bg-slate-600;
  @apply transition-all;
}

/* 动画 */
.celebration-fade-enter-active,
.celebration-fade-leave-active {
  @apply transition-all duration-500;
}

.celebration-fade-enter-from,
.celebration-fade-leave-to {
  @apply opacity-0;
}

.celebration-fade-enter-from .unlock-celebration,
.celebration-fade-leave-to .unlock-celebration {
  @apply scale-75;
}

/* 主题适配 */
:global(.theme-light) .unlock-celebration {
  @apply bg-white border-slate-200;
}

:global(.theme-light) .btn-secondary {
  @apply bg-slate-200 text-slate-700 hover:bg-slate-300;
}

:global(.theme-light) .lesson-unlock-name {
  @apply text-slate-700;
}

:global(.theme-cyberpunk) .unlock-celebration {
  @apply bg-slate-900/95 border-cyan-500/50;
  box-shadow: 0 0 40px rgba(6, 182, 212, 0.4);
}

:global(.theme-cyberpunk) .unlocked-lesson-card {
  @apply border-cyan-500/50;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}
</style>
