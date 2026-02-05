import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RhythmMap, Beat } from '../data/rhythm-maps'
import { RHYTHM_MAPS, getRhythmMapById } from '../data/rhythm-maps'

export type PlayState = 'stopped' | 'playing' | 'paused'
export type PlayMode = 'auto' | 'manual'

export interface AccompanimentSong {
  id: string
  title: string
  titleEn: string
  bpm: number
  duration: number
  style: 'rock' | 'pop' | 'electronic'
  description: string
}

export const useAccompanimentStore = defineStore('accompaniment', () => {
  // ========== State ==========
  const songs = ref<AccompanimentSong[]>(
    RHYTHM_MAPS.map(map => ({
      id: map.id,
      title: map.title,
      titleEn: map.titleEn,
      bpm: map.bpm,
      duration: map.duration,
      style: map.style,
      description: map.description
    }))
  )
  
  const currentSongId = ref<string | null>(null)
  const playState = ref<PlayState>('stopped')
  const playMode = ref<PlayMode>('manual')
  const currentTime = ref(0) // 当前播放时间（秒）
  const progress = ref(0) // 播放进度 (0-100)
  
  // 自动演奏相关
  const nextBeatIndex = ref(0)
  const activeDrums = ref<Set<string>>(new Set())
  
  // ========== Getters ==========
  const currentSong = computed<AccompanimentSong | null>(() => {
    if (!currentSongId.value) return null
    return songs.value.find(s => s.id === currentSongId.value) || null
  })
  
  const currentRhythmMap = computed<RhythmMap | null>(() => {
    if (!currentSongId.value) return null
    return getRhythmMapById(currentSongId.value) || null
  })
  
  const isPlaying = computed(() => playState.value === 'playing')
  const isPaused = computed(() => playState.value === 'paused')
  const isStopped = computed(() => playState.value === 'stopped')
  const isAutoMode = computed(() => playMode.value === 'auto')
  
  // 格式化显示时间
  const formattedTime = computed(() => {
    const mins = Math.floor(currentTime.value / 60)
    const secs = Math.floor(currentTime.value % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })
  
  const formattedDuration = computed(() => {
    const duration = currentSong.value?.duration || 0
    const mins = Math.floor(duration / 60)
    const secs = Math.floor(duration % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })
  
  // 获取当前时间应该触发的鼓点
  const getBeatsAtTime = (time: number, windowMs: number = 50): Beat[] => {
    const rhythmMap = currentRhythmMap.value
    if (!rhythmMap) return []
    
    const windowSec = windowMs / 1000
    return rhythmMap.beats.filter(beat => {
      const diff = Math.abs(beat.time - time)
      return diff <= windowSec
    })
  }
  
  // ========== Actions ==========
  
  // 选择歌曲
  const selectSong = (songId: string) => {
    if (currentSongId.value === songId) return
    
    // 如果正在播放，先停止
    if (playState.value !== 'stopped') {
      stop()
    }
    
    currentSongId.value = songId
    currentTime.value = 0
    progress.value = 0
    nextBeatIndex.value = 0
  }
  
  // 播放
  const play = () => {
    if (!currentSongId.value) {
      // 如果没有选择歌曲，默认选择第一首
      if (songs.value.length > 0) {
        selectSong(songs.value[0].id)
      } else {
        return
      }
    }
    
    playState.value = 'playing'
  }
  
  // 暂停
  const pause = () => {
    if (playState.value === 'playing') {
      playState.value = 'paused'
    }
  }
  
  // 停止
  const stop = () => {
    playState.value = 'stopped'
    currentTime.value = 0
    progress.value = 0
    nextBeatIndex.value = 0
    activeDrums.value.clear()
  }
  
  // 切换播放/暂停
  const togglePlay = () => {
    if (playState.value === 'playing') {
      pause()
    } else {
      play()
    }
  }
  
  // 切换模式
  const setMode = (mode: PlayMode) => {
    playMode.value = mode
  }
  
  const toggleMode = () => {
    playMode.value = playMode.value === 'auto' ? 'manual' : 'auto'
  }
  
  // 更新播放进度
  const updateTime = (deltaTime: number) => {
    if (playState.value !== 'playing') return
    
    const song = currentSong.value
    if (!song) return
    
    currentTime.value += deltaTime
    
    // 检查是否结束
    if (currentTime.value >= song.duration) {
      stop()
      return
    }
    
    // 更新进度百分比
    progress.value = (currentTime.value / song.duration) * 100
  }
  
  // 设置进度（拖动进度条）
  const seekTo = (percentage: number) => {
    const song = currentSong.value
    if (!song) return
    
    progress.value = Math.max(0, Math.min(100, percentage))
    currentTime.value = (progress.value / 100) * song.duration
    
    // 重置下一个鼓点索引
    const rhythmMap = currentRhythmMap.value
    if (rhythmMap) {
      nextBeatIndex.value = rhythmMap.beats.findIndex(b => b.time >= currentTime.value)
      if (nextBeatIndex.value < 0) {
        nextBeatIndex.value = rhythmMap.beats.length
      }
    }
  }
  
  // 设置高亮鼓件
  const setDrumActive = (drumId: string, active: boolean) => {
    if (active) {
      activeDrums.value.add(drumId)
    } else {
      activeDrums.value.delete(drumId)
    }
  }
  
  // 获取当前应该触发的鼓点（用于自动模式）
  const getNextTriggerBeats = (currentTimeSec: number, lookaheadMs: number = 100): Beat[] => {
    const rhythmMap = currentRhythmMap.value
    if (!rhythmMap || nextBeatIndex.value >= rhythmMap.beats.length) return []
    
    const lookaheadSec = lookaheadMs / 1000
    const beats: Beat[] = []
    
    while (nextBeatIndex.value < rhythmMap.beats.length) {
      const beat = rhythmMap.beats[nextBeatIndex.value]
      if (beat.time <= currentTimeSec + lookaheadSec) {
        beats.push(beat)
        nextBeatIndex.value++
      } else {
        break
      }
    }
    
    return beats
  }
  
  // 重置鼓点索引
  const resetBeatIndex = () => {
    const rhythmMap = currentRhythmMap.value
    if (rhythmMap) {
      nextBeatIndex.value = rhythmMap.beats.findIndex(b => b.time >= currentTime.value)
      if (nextBeatIndex.value < 0) {
        nextBeatIndex.value = 0
      }
    }
  }
  
  // ========== Persistence ==========
  const savePreference = () => {
    try {
      localStorage.setItem('accompaniment-preferences', JSON.stringify({
        currentSongId: currentSongId.value,
        playMode: playMode.value
      }))
    } catch (err) {
      console.error('Failed to save accompaniment preferences:', err)
    }
  }
  
  const loadPreference = () => {
    try {
      const saved = localStorage.getItem('accompaniment-preferences')
      if (saved) {
        const prefs = JSON.parse(saved)
        if (prefs.currentSongId) {
          currentSongId.value = prefs.currentSongId
        }
        if (prefs.playMode) {
          playMode.value = prefs.playMode
        }
      }
    } catch (err) {
      console.error('Failed to load accompaniment preferences:', err)
    }
  }
  
  // 监听变化保存偏好
  watch([currentSongId, playMode], savePreference, { deep: true })
  
  // 初始化
  loadPreference()
  
  return {
    // State
    songs,
    currentSongId,
    playState,
    playMode,
    currentTime,
    progress,
    activeDrums,
    
    // Getters
    currentSong,
    currentRhythmMap,
    isPlaying,
    isPaused,
    isStopped,
    isAutoMode,
    formattedTime,
    formattedDuration,
    getBeatsAtTime,
    
    // Actions
    selectSong,
    play,
    pause,
    stop,
    togglePlay,
    setMode,
    toggleMode,
    updateTime,
    seekTo,
    setDrumActive,
    getNextTriggerBeats,
    resetBeatIndex
  }
})
