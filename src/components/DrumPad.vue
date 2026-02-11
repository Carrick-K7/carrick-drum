<template>
  <button
    ref="padRef"
    class="drum-pad relative w-full aspect-square rounded-xl border-2 transition-all duration-75 select-none touch-manipulation overflow-hidden"
    :class="{ 
      'drum-pad-active': isActive,
      'drum-pad-hit': isHit,
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
    <!-- 背景光效 -->
    <div 
      class="pad-glow" 
      :class="{ 'glow-active': isActive || isHit }"
      :style="glowStyle"
    />
    
    <!-- 内容区域 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
      <span class="drum-key" :style="keyStyle">{{ drum.key }}</span>
      <span class="drum-name-zh truncate w-full text-center">{{ drum.nameZh }}</span>
      <span class="drum-name-en truncate w-full text-center">{{ drum.name }}</span>
    </div>
    
    <!-- 击中反馈光环 -->
    <div
      v-if="showHitRing && !settingsStore.reduceAnimations"
      class="hit-ring"
      :style="hitRingStyle"
    />
    
    <!-- 波纹效果 -->
    <div
      v-if="showRipple && !settingsStore.reduceAnimations"
      class="ripple-effect"
      :style="rippleStyle"
    />
    
    <!-- 连击标记 -->
    <div v-if="combo >= 5" class="combo-badge" :class="{ 'combo-high': combo >= 10 }">
      ×{{ combo }}
    </div>
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
  combo?: number
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  combo: 0
})

const emit = defineEmits<{
  trigger: [drumId: string]
}>()

const themeStore = useThemeStore()
const settingsStore = useSettingsStore()

const padRef = ref<HTMLButtonElement>()
const isPressed = ref(false)
const isHit = ref(false)
const showRipple = ref(false)
const showHitRing = ref(false)

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
  
  // 击中时的增强阴影
  const activeShadow = isHit.value
    ? `0 0 50px ${color}90, inset 0 0 30px ${color}40, 0 0 100px ${color}30`
    : `0 0 30px ${color}80, inset 0 0 20px ${color}30`
  
  const normalShadow = theme === 'cyberpunk'
    ? `0 0 15px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`
    : `0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
  
  // 击中时的缩放动画
  const transform = isHit.value 
    ? 'scale(0.92)'
    : (isActive ? 'scale(0.95)' : 'scale(1)')
  
  return {
    backgroundColor: bgColor,
    borderColor: isActive || isHit.value ? color : borderColor,
    borderWidth: isHit.value ? '3px' : '2px',
    boxShadow: isActive || isHit.value ? activeShadow : normalShadow,
    transform,
    transition: settingsStore.reduceAnimations ? 'none' : 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
  }
})

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at center, ${props.drum.color}30 0%, transparent 70%)`,
  opacity: isHit.value ? 1 : 0,
  transform: isHit.value ? 'scale(1.2)' : 'scale(0.8)'
}))

const keyStyle = computed(() => ({
  color: isHit.value ? props.drum.color : undefined,
  textShadow: isHit.value ? `0 0 10px ${props.drum.color}` : undefined
}))

const rippleStyle = computed(() => ({
  background: `radial-gradient(circle, ${props.drum.color}60 0%, transparent 70%)`,
  animation: settingsStore.reduceAnimations ? 'none' : 'ripple-expand 0.4s ease-out forwards'
}))

const hitRingStyle = computed(() => ({
  borderColor: props.drum.color,
  animation: settingsStore.reduceAnimations ? 'none' : 'hit-ring-expand 0.5s ease-out forwards'
}))

const triggerDrum = () => {
  emit('trigger', props.drum.id)
  
  // 触发击中效果
  isHit.value = true
  showHitRing.value = true
  showRipple.value = true
  
  // 清除击中效果
  setTimeout(() => {
    isHit.value = false
  }, settingsStore.reduceAnimations ? 50 : 150)
  
  setTimeout(() => {
    showHitRing.value = false
  }, settingsStore.reduceAnimations ? 50 : 500)
  
  setTimeout(() => {
    showRipple.value = false
  }, settingsStore.reduceAnimations ? 50 : 400)
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
  will-change: transform, box-shadow;
}

.drum-pad:active {
  transform: scale(0.95);
}

/* 背景光效 */
.pad-glow {
  @apply absolute inset-0 rounded-xl pointer-events-none transition-all duration-150;
  opacity: 0;
}

.pad-glow.glow-active {
  opacity: 1;
}

/* 击中反馈光环 */
.hit-ring {
  @apply absolute inset-0 rounded-xl pointer-events-none;
  border: 3px solid;
  opacity: 0;
}

/* 文字样式 */
.drum-key {
  @apply text-xl sm:text-2xl font-bold mb-1 transition-all duration-100;
}

.drum-name-zh {
  @apply text-xs sm:text-sm font-medium opacity-80 transition-colors duration-100;
}

.drum-name-en {
  @apply text-[10px] sm:text-xs opacity-60 transition-colors duration-100;
}

/* 波纹效果 */
.ripple-effect {
  @apply absolute inset-0 rounded-xl pointer-events-none;
}

/* 连击标记 */
.combo-badge {
  @apply absolute top-1 right-1 px-1.5 py-0.5 text-xs font-bold rounded-full;
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-white;
  @apply animate-bounce;
  z-index: 20;
}

.combo-badge.combo-high {
  @apply from-pink-500 to-purple-500;
  animation: combo-pulse 0.5s ease-out infinite;
}

/* 动画定义 */
@keyframes ripple-expand {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes hit-ring-expand {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes combo-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 主题适配 */
:global(.theme-light) .drum-name-zh,
:global(.theme-light) .drum-name-en {
  color: #475569;
}

:global(.theme-light) .drum-pad-active .drum-key,
:global(.theme-light) .drum-pad-hit .drum-key {
  text-shadow: 0 0 10px currentColor;
}

:global(.theme-cyberpunk) .drum-name-zh,
:global(.theme-cyberpunk) .drum-name-en {
  color: #00b8a9;
}

:global(.theme-cyberpunk) .drum-pad {
  border-width: 1px;
}

:global(.theme-cyberpunk) .drum-pad-active,
:global(.theme-cyberpunk) .drum-pad-hit {
  box-shadow: 0 0 30px currentColor, inset 0 0 20px currentColor;
}

/* 减少动画 */
.drum-pad.reduce-animations,
.drum-pad.reduce-animations * {
  animation: none !important;
  transition-duration: 50ms !important;
}
</style>
