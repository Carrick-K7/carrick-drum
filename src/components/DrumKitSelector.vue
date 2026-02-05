<template>
  <div class="drum-kit-selector">
    <button
      class="selector-button"
      :disabled="drumKitStore.isLoading"
      @click="isOpen = !isOpen"
    >
      <span class="icon">🥁</span>
      <span class="label">{{ drumKitStore.currentKitConfig.nameZh }}</span>
      <span class="arrow" :class="{ 'open': isOpen }">▼</span>
      <span v-if="drumKitStore.isLoading" class="loading-spinner" />
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          选择鼓组
        </div>
        
        <button
          v-for="kit in DRUM_KITS"
          :key="kit.id"
          class="kit-option"
          :class="{ 'active': drumKitStore.currentKit === kit.id }"
          @click="selectKit(kit.id)"
        >
          <div class="kit-info">
            <span class="kit-name">{{ kit.nameZh }}</span>
            <span class="kit-name-en">{{ kit.name }}</span>
          </div>
          <span v-if="drumKitStore.currentKit === kit.id" class="check">✓</span>
          <p class="kit-desc">{{ kit.description }}</p>
        </button>
      </div>
    </Transition>
    
    <!-- 点击外部关闭 -->
    <div v-if="isOpen" class="overlay" @click="isOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDrumKitStore, DRUM_KITS, type DrumKit } from '../stores/useDrumKitStore'

const drumKitStore = useDrumKitStore()
const isOpen = ref(false)

const selectKit = async (kit: DrumKit) => {
  if (kit === drumKitStore.currentKit) {
    isOpen.value = false
    return
  }
  
  await drumKitStore.setDrumKit(kit)
  isOpen.value = false
  
  // Reload page to apply new drum kit (simple approach)
  window.location.reload()
}
</script>

<style scoped>
@import "tailwindcss";
.drum-kit-selector {
  @apply relative;
}

.selector-button {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg 
         border transition-all duration-200 text-sm font-medium;
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.selector-button:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}

.selector-button:disabled {
  @apply opacity-70 cursor-wait;
}

.icon {
  @apply text-lg;
}

.label {
  @apply hidden sm:inline;
}

.arrow {
  @apply text-xs transition-transform duration-200;
}

.arrow.open {
  @apply rotate-180;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-slate-600 border-t-pink-500 rounded-full animate-spin;
}

.dropdown-menu {
  @apply absolute top-full right-0 mt-2 w-64 rounded-xl 
         bg-slate-800/95 backdrop-blur border border-slate-700 
         shadow-xl z-50 overflow-hidden;
}

.dropdown-header {
  @apply px-4 py-2 text-xs font-medium text-slate-400 border-b border-slate-700;
}

.kit-option {
  @apply w-full px-4 py-3 text-left transition-colors relative;
  @apply hover:bg-slate-700/50;
}

.kit-option.active {
  @apply bg-pink-500/10;
}

.kit-info {
  @apply flex items-center gap-2;
}

.kit-name {
  @apply font-medium text-slate-200;
}

.kit-name-en {
  @apply text-xs text-slate-500;
}

.kit-desc {
  @apply text-xs text-slate-400 mt-1;
}

.check {
  @apply absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 font-bold;
}

.overlay {
  @apply fixed inset-0 z-40;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  @apply transition-all duration-200;
}

.dropdown-enter-from,
.dropdown-leave-to {
  @apply opacity-0 scale-95 -translate-y-2;
}
</style>
