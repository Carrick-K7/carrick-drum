<template>
  <div class="judgment-feedback" :class="feedbackClass">
    <!-- 判定文字 -->
    <div class="judgment-text" :style="{ color: judgmentColor }">
      {{ judgmentText }}
    </div>
    
    <!-- 误差显示 -->
    <div v-if="showDelta" class="delta-text" :class="deltaClass">
      {{ deltaText }}
    </div>
    
    <!-- 连击数 -->
    <div v-if="combo > 1" class="combo-display">
      <span class="combo-number">{{ combo }}</span>
      <span class="combo-label">Combo!</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JudgmentType } from '../types'
import { JUDGMENT_TEXTS, JUDGMENT_COLORS } from '../core/judgment'

interface Props {
  type: JudgmentType
  deltaMs?: number
  combo?: number
  showDelta?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  deltaMs: 0,
  combo: 0,
  showDelta: true,
})

const feedbackClass = computed(() => ({
  'judgment-perfect': props.type === 'perfect',
  'judgment-good': props.type === 'good',
  'judgment-miss': props.type === 'miss',
  'judgment-none': props.type === 'none',
  'has-judgment': props.type !== 'none',
}))

const judgmentText = computed(() => JUDGMENT_TEXTS[props.type])
const judgmentColor = computed(() => JUDGMENT_COLORS[props.type])

const deltaText = computed(() => {
  if (props.deltaMs === 0) return ''
  const sign = props.deltaMs > 0 ? '+' : ''
  return `${sign}${props.deltaMs.toFixed(0)}ms`
})

const deltaClass = computed(() => ({
  'delta-early': props.deltaMs < 0,
  'delta-late': props.deltaMs > 0,
}))
</script>

<style scoped>
@reference "../style.css";
.judgment-feedback {
  @apply flex flex-col items-center justify-center;
  min-height: 120px;
}

.judgment-text {
  @apply text-5xl font-black tracking-wider;
  text-shadow: 0 0 20px currentColor;
  animation: judgment-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.delta-text {
  @apply text-lg mt-1 opacity-70;
}

.delta-early {
  @apply text-blue-400;
}

.delta-late {
  @apply text-orange-400;
}

.combo-display {
  @apply flex flex-col items-center mt-2;
  animation: combo-bounce 0.4s ease-out;
}

.combo-number {
  @apply text-4xl font-bold;
  background: linear-gradient(to right, #f59e0b, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.combo-label {
  @apply text-sm text-slate-400 uppercase tracking-widest;
}

/* 判定动画 */
@keyframes judgment-pop {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes combo-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 主题适配 */
:global(.theme-light) .judgment-text {
  text-shadow: none;
}

:global(.theme-cyberpunk) .judgment-text {
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
}
</style>
