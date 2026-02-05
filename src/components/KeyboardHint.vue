<template>
  <div class="keyboard-hint" :class="`theme-${themeStore.currentTheme}`">
    <h3 class="hint-title">键盘快捷键</h3>
    
    <div class="hints-grid">
      <div
        v-for="drum in DRUMS"
        :key="drum.id"
        class="hint-item"
      >
        <kbd :style="kbdStyle(drum.color)">{{ drum.key }}</kbd>
        <span class="hint-label">{{ drum.nameZh }}</span>
      </div>
    </div>
    
    <p class="hint-footer">点击屏幕或使用键盘 A-K 演奏</p>
  </div>
</template>

<script setup lang="ts">
import { DRUMS } from '../constants/drums'
import { useThemeStore } from '../stores/useThemeStore'

const themeStore = useThemeStore()

const kbdStyle = (color: string) => {
  const theme = themeStore.currentTheme
  
  if (theme === 'light') {
    return {
      backgroundColor: `${color}15`,
      color: color,
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
    }
  }
  
  if (theme === 'cyberpunk') {
    return {
      backgroundColor: `${color}25`,
      color: color,
      border: `1px solid ${color}40`,
      boxShadow: `0 0 10px ${color}30`
    }
  }
  
  // Dark theme (default)
  return {
    backgroundColor: `${color}20`,
    color: color,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 2px 0 rgba(0,0,0,0.2)'
  }
}
</script>

<style scoped>
@import "tailwindcss";
.keyboard-hint {
  @apply rounded-xl p-4 w-full max-w-2xl mx-auto;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
}

.hint-title {
  @apply text-sm font-medium mb-3 text-center;
  color: #cbd5e1;
}

.hints-grid {
  @apply flex flex-wrap justify-center gap-2;
}

.hint-item {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg;
  background: rgba(51, 65, 85, 0.5);
}

kbd {
  @apply px-2 py-0.5 rounded text-sm font-bold;
  font-family: 'Courier New', monospace;
}

.hint-label {
  @apply text-xs;
  color: #94a3b8;
}

.hint-footer {
  @apply text-xs text-center mt-3;
  color: #64748b;
}

/* Light theme */
.theme-light.keyboard-hint {
  background: rgba(255, 255, 255, 0.8);
}

.theme-light .hint-title {
  color: #475569;
}

.theme-light .hint-item {
  background: rgba(241, 245, 249, 0.8);
}

.theme-light .hint-label {
  color: #64748b;
}

.theme-light .hint-footer {
  color: #94a3b8;
}

/* Cyberpunk theme */
.theme-cyberpunk.keyboard-hint {
  background: rgba(10, 10, 15, 0.8);
  border: 1px solid rgba(0, 255, 159, 0.2);
}

.theme-cyberpunk .hint-title {
  color: #00ff9f;
}

.theme-cyberpunk .hint-item {
  background: rgba(0, 255, 159, 0.1);
  border: 1px solid rgba(0, 255, 159, 0.1);
}

.theme-cyberpunk .hint-label {
  color: #00b8a9;
}

.theme-cyberpunk .hint-footer {
  color: #64748b;
}
</style>
