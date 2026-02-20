<template>
  <main class="todo-view">
    <div class="todo-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h2>📝 待办事项</h2>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-count active">{{ activeCount }}</span> 进行中
          </span>
          <span class="stat-divider">|</span>
          <span class="stat-item">
            <span class="stat-count completed">{{ completedCount }}</span> 已完成
          </span>
        </div>
      </div>

      <!-- 进行中待办 -->
      <section v-if="activeTodos.length > 0" class="todo-section">
        <h3 class="section-title">
          ⭕ 进行中 ({{ activeTodos.length }})
        </h3>
        <div class="todo-grid">
          <TodoCard
            v-for="todo in activeTodos"
            :key="todo.id"
            :todo="todo"
          />
        </div>
      </section>

      <!-- 空状态 -->
      <div v-else-if="!showCompleted" class="empty-state">
        <div class="empty-icon">🎉</div>
        <p class="empty-title">所有待办都已完成！</p>
        <p class="empty-hint">太棒了，继续保持！</p>
      </div>

      <!-- 已完成待办折叠区 -->
      <section v-if="completedTodos.length > 0" class="todo-section completed-section">
        <button
          class="toggle-completed-btn"
          @click="showCompleted = !showCompleted"
        >
          <span class="toggle-icon">{{ showCompleted ? '▼' : '▶' }}</span>
          <span v-if="showCompleted">隐藏已完成</span>
          <span v-else>显示已完成 ({{ completedCount }})</span>
        </button>

        <div v-show="showCompleted" class="todo-grid">
          <TodoCard
            v-for="todo in completedTodos"
            :key="todo.id"
            :todo="todo"
          />
        </div>
      </section>

      <!-- 无数据状态 -->
      <div v-if="todos.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-title">暂无待办事项</p>
        <p class="empty-hint">点击下方按钮添加你的第一个待办！</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TodoCard from '../components/todo/TodoCard.vue'
import type { Todo } from '../types/todo'

// LocalStorage key
const STORAGE_KEY = 'drum-kit-todos'

// 状态
const todos = ref<Todo[]>([])
const showCompleted = ref(false)

// 计算属性：按创建时间倒序排列
const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

// 进行中待办
const activeTodos = computed(() => {
  return sortedTodos.value.filter(todo => todo.status === 'active')
})

// 已完成待办
const completedTodos = computed(() => {
  return sortedTodos.value.filter(todo => todo.status === 'completed')
})

// 统计
const activeCount = computed(() => activeTodos.value.length)
const completedCount = computed(() => completedTodos.value.length)

// 从 LocalStorage 加载
function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      todos.value = JSON.parse(stored)
    } else {
      // 初始化示例数据
      initializeSampleData()
    }
  } catch (error) {
    console.error('Failed to load todos:', error)
    initializeSampleData()
  }
}

// 保存到 LocalStorage
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value))
  } catch (error) {
    console.error('Failed to save todos:', error)
  }
}

// 初始化示例数据
function initializeSampleData() {
  const now = new Date()
  todos.value = [
    {
      id: '1',
      title: '完成基础节奏练习',
      description: '练习基本的四分音符和八分音符节奏型，确保击打准确',
      status: 'active',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    },
    {
      id: '2',
      title: '学习新的鼓谱',
      description: '学习《小星星》完整版鼓谱，注意过渡段的踩镲节奏',
      status: 'active',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    },
    {
      id: '3',
      title: '调整鼓组音色',
      description: '根据个人喜好调整军鼓和底鼓的音量平衡',
      status: 'completed',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2天前
    },
    {
      id: '4',
      title: '练习双击技巧',
      description: '每天练习10分钟双击技巧，提高手速',
      status: 'completed',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString(), // 3天前
    },
    {
      id: '5',
      title: '录制练习视频',
      description: '录制一段自由演奏视频，用于回顾和改进',
      status: 'active',
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30分钟前
    },
  ]
  saveTodos()
}

// 监听数据变化自动保存
watch(todos, saveTodos, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
@reference "../style.css";

.todo-view {
  @apply flex-1 overflow-y-auto p-4;
}

.todo-container {
  @apply w-full max-w-4xl mx-auto;
}

/* 页面头部 */
.page-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6;
}

.page-header h2 {
  @apply text-2xl font-bold;
}

.header-stats {
  @apply flex items-center gap-3 text-sm;
}

.stat-item {
  @apply text-slate-400;
}

.stat-count {
  @apply font-bold;
}

.stat-count.active {
  @apply text-pink-400;
}

.stat-count.completed {
  @apply text-green-400;
}

.stat-divider {
  @apply text-slate-600;
}

/* 分区标题 */
.todo-section {
  @apply mb-6;
}

.section-title {
  @apply text-lg font-semibold mb-4 text-slate-300;
}

.completed-section {
  @apply border-t border-slate-700/50 pt-4;
}

/* 待办网格 */
.todo-grid {
  @apply grid gap-3;
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-3;
}

/* 折叠按钮 */
.toggle-completed-btn {
  @apply flex items-center gap-2 px-4 py-2 mb-4;
  @apply bg-slate-800/50 hover:bg-slate-800 rounded-lg;
  @apply text-sm text-slate-400 hover:text-slate-300;
  @apply transition-all duration-200;
  @apply border border-transparent hover:border-slate-700;
}

.toggle-icon {
  @apply text-xs;
}

/* 空状态 */
.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-5xl mb-4;
}

.empty-title {
  @apply text-lg font-medium text-slate-300 mb-2;
}

.empty-hint {
  @apply text-sm text-slate-500;
}

/* 主题适配 */
:global(.theme-light) .page-header h2 {
  @apply text-slate-800;
}

:global(.theme-light) .section-title {
  @apply text-slate-700;
}

:global(.theme-light) .empty-title {
  @apply text-slate-700;
}

:global(.theme-light) .completed-section {
  @apply border-slate-200;
}

:global(.theme-light) .toggle-completed-btn {
  @apply bg-slate-100 hover:bg-slate-200;
}

:global(.theme-cyberpunk) .page-header h2 {
  @apply text-cyan-400;
}

:global(.theme-cyberpunk) .section-title {
  @apply text-cyan-300;
}

:global(.theme-cyberpunk) .stat-count.active {
  @apply text-cyan-400;
}

:global(.theme-cyberpunk) .completed-section {
  @apply border-cyan-500/20;
}

:global(.theme-cyberpunk) .toggle-completed-btn {
  @apply bg-slate-900/50 border-cyan-500/20;
  @apply text-cyan-400 hover:text-cyan-300;
}

:global(.theme-cyberpunk) .toggle-completed-btn:hover {
  @apply border-cyan-500/40;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
}
</style>
