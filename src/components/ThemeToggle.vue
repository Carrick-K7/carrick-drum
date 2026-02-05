<template>
  <button
    class="theme-toggle"
    :class="`theme-${themeStore.currentTheme}`"
    :title="`当前主题: ${themeStore.themeLabel} (点击切换)`"
    @click="themeStore.cycleTheme"
  >
    <span class="theme-icon">{{ themeIcon }}</span>
    <span class="theme-label">{{ themeStore.themeLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/useThemeStore'

const themeStore = useThemeStore()

const themeIcon = computed(() => {
  const icons: Record<string, string> = {
    dark: '🌙',
    light: '☀️',
    cyberpunk: '⚡'
  }
  return icons[themeStore.currentTheme]
})
</script>

<style scoped>
@import "tailwindcss";
.theme-toggle {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg 
         border transition-all duration-200 text-sm font-medium;
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.theme-toggle:hover {
  @apply shadow-lg;
  border-color: rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}

.theme-dark {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(233, 69, 96, 0.3);
}

.theme-dark:hover {
  border-color: rgba(233, 69, 96, 0.6);
  box-shadow: 0 4px 15px rgba(233, 69, 96, 0.2);
}

.theme-light {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
  color: #4b5563;
}

.theme-light:hover {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.theme-cyberpunk {
  background: rgba(10, 10, 15, 0.9);
  border-color: rgba(0, 255, 159, 0.4);
  color: #00ff9f;
}

.theme-cyberpunk:hover {
  border-color: rgba(255, 0, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 159, 0.4), 0 0 40px rgba(255, 0, 255, 0.2);
}

.theme-icon {
  @apply text-lg;
}

.theme-label {
  @apply hidden sm:inline;
}
</style>
