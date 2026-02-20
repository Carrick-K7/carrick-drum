<template>
  <div class="todo-card" :class="{ 'is-completed': todo.status === 'completed' }">
    <div class="todo-header">
      <div class="todo-status-icon" :class="`status-${todo.status}`">
        <span v-if="todo.status === 'active'">⭕</span>
        <span v-else>✅</span>
      </div>
      <h3 class="todo-title">{{ todo.title }}</h3>
    </div>
    
    <div class="todo-meta">
      <span class="todo-date">
        📅 {{ formatDate(todo.createdAt) }}
      </span>
      <span class="todo-status-badge" :class="`badge-${todo.status}`">
        {{ todo.status === 'active' ? '进行中' : '已完成' }}
      </span>
    </div>
    
    <p v-if="todo.description" class="todo-description">
      {{ todo.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '../../types/todo'

interface Props {
  todo: Todo
}

defineProps<Props>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
@reference "../../style.css";

.todo-card {
  @apply bg-slate-800/50 rounded-xl p-4 transition-all duration-200;
  @apply border border-transparent;
}

.todo-card:hover {
  @apply bg-slate-800/80 border-slate-700;
}

.todo-card.is-completed {
  @apply opacity-60;
}

.todo-card.is-completed:hover {
  @apply opacity-80;
}

.todo-header {
  @apply flex items-center gap-3 mb-2;
}

.todo-status-icon {
  @apply text-xl flex-shrink-0;
}

.todo-status-icon.status-active {
  @apply text-pink-400;
}

.todo-status-icon.status-completed {
  @apply text-green-400;
}

.todo-title {
  @apply text-base font-semibold text-slate-200;
  @apply line-clamp-2;
}

.todo-card.is-completed .todo-title {
  @apply text-slate-400 line-through;
}

.todo-meta {
  @apply flex items-center justify-between mb-2;
}

.todo-date {
  @apply text-xs text-slate-500;
}

.todo-status-badge {
  @apply text-xs px-2 py-0.5 rounded-full font-medium;
}

.badge-active {
  @apply bg-pink-500/20 text-pink-400;
}

.badge-completed {
  @apply bg-green-500/20 text-green-400;
}

.todo-description {
  @apply text-sm text-slate-400 line-clamp-2;
}

/* 主题适配 */
:global(.theme-light) .todo-card {
  @apply bg-slate-100;
}

:global(.theme-light) .todo-card:hover {
  @apply bg-slate-200 border-slate-300;
}

:global(.theme-light) .todo-title {
  @apply text-slate-800;
}

:global(.theme-light) .todo-card.is-completed .todo-title {
  @apply text-slate-500;
}

:global(.theme-cyberpunk) .todo-card {
  @apply bg-slate-900/50 border-cyan-500/20;
}

:global(.theme-cyberpunk) .todo-card:hover {
  @apply border-cyan-500/40;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
}

:global(.theme-cyberpunk) .todo-status-icon.status-active {
  @apply text-cyan-400;
}

:global(.theme-cyberpunk) .badge-active {
  @apply bg-cyan-500/20 text-cyan-400;
}
</style>
