<template>
  <div class="drum-kit w-full max-w-4xl mx-auto p-4">
    <div class="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <!-- 第一行: Kick, Snare, Hi-Hat Closed, Hi-Hat Open -->
      <DrumPad
        v-for="drum in row1"
        :key="drum.id"
        :drum="drum"
        :is-active="activeDrums.has(drum.id)"
        @trigger="onTrigger"
      />
      
      <!-- 第二行: Crash, Tom Low, Tom Mid, Tom High -->
      <DrumPad
        v-for="drum in row2"
        :key="drum.id"
        :drum="drum"
        :is-active="activeDrums.has(drum.id)"
        @trigger="onTrigger"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DrumPad from './DrumPad.vue'
import { DRUMS } from '../constants/drums'

interface Props {
  activeDrums?: Set<string>
}

withDefaults(defineProps<Props>(), {
  activeDrums: () => new Set()
})

const emit = defineEmits<{
  trigger: [drumId: string]
}>()

const row1 = computed(() => DRUMS.slice(0, 4))
const row2 = computed(() => DRUMS.slice(4, 8))

const onTrigger = (drumId: string) => {
  emit('trigger', drumId)
}
</script>
