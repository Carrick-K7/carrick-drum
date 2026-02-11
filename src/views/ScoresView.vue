<template>
  <main class="scores-mode">
    <ScoreHistoryPage @navigate="handleNavigate" />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ScoreHistoryPage from '../components/ScoreHistoryPage.vue'

const router = useRouter()

const handleNavigate = (destination: string) => {
  if (destination === 'lessons') {
    router.push('/teaching')
  }
}
</script>

<style scoped>
.scores-mode {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
</style>
