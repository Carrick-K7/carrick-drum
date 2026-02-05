<template>
  <button
    ref="padRef"
    class="drum-pad relative w-full aspect-square rounded-xl border-2 transition-all duration-75 select-none touch-manipulation"
    :class="{ 
      'drum-pad-active': isActive,
      'reduce-animations': settingsStore.reduceAnimations
    }"
    :style="padStyle"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart.prevent="handleTouchStart"
    @touchend.prevent="handleTouchEnd"
    @touchcancel.prevent="handleTouchEnd"
  >
    <div class="absolute inset-0 flex flex-col items-center justify-center p-2">
      <span class="drum-key" :style="{ color: drum.color }">{{ drum.key }}</span>
      <span class="drum-name-zh truncate w-full text-center">{{ drum.nameZh }}</span>
      <span class="drum-name-en truncate w-full text-center">{{ drum.name }}</span>
    </div>
    
    <!-- Ripple effect -->
    <div
      v-if="showRipple && !settingsStore.reduceAnimations"
      class="ripple-effect"
      :style="rippleStyle"
    />
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Drum } from '../types'
import { useThemeStore } from '../stores/useThemeStore'
import { useSettingsStore } from '../stores/useSettingsStore'

interface Props {
  drum: Drum
  isActive?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  trigger: [drumId: string]
}>()

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const padRef = ref<HTMLButtonElement>()
const isPressed = ref(false)
const showRipple = ref(false)

const padStyle = computed(() => {
  const theme = themeStore.currentTheme
  const isActive = isPressed.value || props.isActive
  const color = props.drum.color
  
  let bgColor = 'rgba(22, 33, 62, 0.9)'
  let borderColor = `${color}40`
  
  if (theme === 'light') {
    bgColor = 'rgba(255, 255, 255, 0.95)'
    borderColor = `${color}30`
  } else if (theme === 'cyberpunk') {
    bgColor = 'rgba(10, 15, 25, 0.95)'
    borderColor = `${color}50`
  }
  
  const activeShadow = `0 0 30px ${color}80, inset 0 0 20px ${color}30`
  const normalShadow = theme === 'cyberpunk'
    ? `0 0 15px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`
    : `0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
  
  return {
    backgroundColor: bgColor,
    borderColor: isActive ? color : borderColor,
    boxShadow: isActive ? activeShadow : normalShadow,
    transform: isActive ? 'scale(0.95)' : 'scale(1)'
  }
})

const rippleStyle = computed(() => ({
  background: `radial-gradient(circle, ${props.drum.color}40 0%, transparent 70%)`,
  animation: settingsStore.reduceAnimations ? 'none' : 'ripple 0.3s ease-out'
}))

const triggerDrum = () => {
  emit('trigger', props.drum.id)
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, settingsStore.reduceAnimations ? 50 : 300)
}

const handleMouseDown = () => {
  isPressed.value = true
  triggerDrum()
}

const handleMouseUp = () => {
  isPressed.value = false
}

const handleTouchStart = () => {
  isPressed.value = true
  triggerDrum()
}

const handleTouchEnd = () => {
  isPressed.value = false
}
</script>

<style scoped>
@import "tailwindcss";
.drum-pad {
  backdrop-filter: blur(10px);
  touch-action: manipulation;
}

.drum-pad:active {
  transform: scale(0.95);
}

.drum-key {
  @apply text-xl sm:text-2xl font-bold mb-1;
}

.drum-name-zh {
  @apply text-xs sm:text-sm font-medium opacity-80;
}

.drum-name-en {
  @apply text-[10px] sm:text-xs opacity-60;
}

.ripple-effect {
  @apply absolute inset-0 rounded-xl pointer-events-none;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Theme-specific text colors */
:global(.theme-light) .drum-name-zh,
:global(.theme-light) .drum-name-en {
  color: #475569;
}

:global(.theme-cyberpunk) .drum-name-zh,
:global(.theme-cyberpunk) .drum-name-en {
  color: #00b8a9;
}

/* Reduced animations */
.drum-pad.reduce-animations,
.drum-pad.reduce-animations * {
  animation: none !important;
  transition-duration: 50ms !important;
}
</style>
