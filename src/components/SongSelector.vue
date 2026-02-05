<template>
  <div class="song-selector">
    <h3 class="selector-title">🎵 选择伴奏</h3>
    
    <div class="songs-list">
      <button
        v-for="song in accompanimentStore.songs"
        :key="song.id"
        class="song-item"
        :class="{ 
          'song-item-active': accompanimentStore.currentSongId === song.id,
          [`style-${song.style}`]: true
        }"
        @click="selectSong(song.id)"
      >
        <div class="song-icon">
          {{ getStyleIcon(song.style) }}
        </div>
        <div class="song-info">
          <div class="song-title">{{ song.title }}</div>
          <div class="song-meta">
            <span class="song-bpm">{{ song.bpm }} BPM</span>
            <span class="song-duration">{{ formatDuration(song.duration) }}</span>
          </div>
          <div class="song-desc">{{ song.description }}</div>
        </div>
        <div class="song-status">
          <span v-if="accompanimentStore.currentSongId === song.id" class="playing-indicator">
            {{ accompanimentStore.isPlaying ? '▶' : '⏸' }}
          </span>
          <span v-else class="select-hint">选择</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccompanimentStore, type AccompanimentSong } from '../stores/useAccompanimentStore'

const accompanimentStore = useAccompanimentStore()

const selectSong = (songId: string) => {
  accompanimentStore.selectSong(songId)
}

const getStyleIcon = (style: AccompanimentSong['style']) => {
  const icons: Record<string, string> = {
    rock: '🎸',
    pop: '🎤',
    electronic: '🎹'
  }
  return icons[style] || '🎵'
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
@import "tailwindcss";

.song-selector {
  @apply bg-slate-800/50 rounded-xl p-4 border border-slate-700/50;
}

.selector-title {
  @apply text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2;
}

.songs-list {
  @apply flex flex-col gap-2;
}

.song-item {
  @apply flex items-center gap-3 p-3 rounded-lg text-left
         bg-slate-700/30 hover:bg-slate-700/50
         border border-transparent hover:border-slate-600/50
         transition-all duration-200;
}

.song-item-active {
  @apply bg-slate-700/70 border-pink-500/50;
}

.song-item-active.style-rock {
  @apply border-red-500/50;
}

.song-item-active.style-pop {
  @apply border-blue-500/50;
}

.song-item-active.style-electronic {
  @apply border-purple-500/50;
}

.song-icon {
  @apply w-10 h-10 rounded-lg bg-slate-600/50 
         flex items-center justify-center text-xl
         flex-shrink-0;
}

.song-item-active .song-icon {
  @apply bg-slate-600;
}

.song-info {
  @apply flex-1 min-w-0;
}

.song-title {
  @apply font-medium text-slate-200 text-sm truncate;
}

.song-meta {
  @apply flex items-center gap-2 text-xs text-slate-400 mt-0.5;
}

.song-bpm {
  @apply px-1.5 py-0.5 rounded bg-slate-600/30;
}

.song-duration {
  @apply text-slate-500;
}

.song-desc {
  @apply text-xs text-slate-500 mt-1 truncate;
}

.song-status {
  @apply flex-shrink-0;
}

.playing-indicator {
  @apply w-8 h-8 rounded-full bg-pink-500/20 
         flex items-center justify-center
         text-pink-400 text-xs font-bold;
}

.select-hint {
  @apply text-xs text-slate-500 px-2 py-1 rounded
         bg-slate-600/30 opacity-0
         group-hover:opacity-100 transition-opacity;
}

.song-item:hover .select-hint {
  @apply opacity-100;
}

/* Light theme */
:global(.theme-light) .song-selector {
  @apply bg-slate-100 border-slate-200;
}

:global(.theme-light) .song-item {
  @apply bg-white hover:bg-slate-50 border-slate-200/50;
}

:global(.theme-light) .song-item-active {
  @apply bg-blue-50 border-blue-300;
}

:global(.theme-light) .song-title {
  @apply text-slate-700;
}

:global(.theme-light) .song-icon {
  @apply bg-slate-200;
}

/* Cyberpunk theme */
:global(.theme-cyberpunk) .song-selector {
  @apply bg-slate-900/80 border-cyan-500/30;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
}

:global(.theme-cyberpunk) .song-item {
  @apply bg-slate-800/50 hover:bg-slate-800/70;
  border-color: rgba(6, 182, 212, 0.2);
}

:global(.theme-cyberpunk) .song-item:hover {
  border-color: rgba(6, 182, 212, 0.4);
}

:global(.theme-cyberpunk) .song-item-active {
  @apply bg-cyan-900/30;
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

:global(.theme-cyberpunk) .song-title {
  @apply text-cyan-100;
}

:global(.theme-cyberpunk) .song-bpm {
  @apply text-cyan-400 bg-cyan-900/30;
}

:global(.theme-cyberpunk) .playing-indicator {
  @apply bg-cyan-500/20 text-cyan-400;
}
</style>
