import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { JudgmentResult } from '../types'

/** 单首曲目的成绩记录 */
export interface ScoreRecord {
  /** 唯一ID */
  id: string
  /** 课程/歌曲ID */
  songId: string
  /** 课程/歌曲名称 */
  songName: string
  /** 演奏时间戳 */
  timestamp: number
  /** 总分 */
  totalScore: number
  /** 准确率 (0-1) */
  accuracy: number
  /** 评级 (S/A/B/C/D) */
  grade: string
  /** Perfect数量 */
  perfectCount: number
  /** Good数量 */
  goodCount: number
  /** Miss数量 */
  missCount: number
  /** 最大连击 */
  maxCombo: number
  /** 总击打数 */
  totalHits: number
  /** 演奏时长 (秒) */
  duration: number
}

/** 歌曲的历史成绩统计 */
export interface SongScoreStats {
  /** 歌曲ID */
  songId: string
  /** 歌曲名称 */
  songName: string
  /** 最佳成绩 */
  bestScore: number
  /** 最高准确率 */
  bestAccuracy: number
  /** 最佳评级 */
  bestGrade: string
  /** 最高连击 */
  bestMaxCombo: number
  /** 游玩次数 */
  playCount: number
  /** 首次游玩时间 */
  firstPlayed: number
  /** 最近游玩时间 */
  lastPlayed: number
  /** 所有成绩记录 */
  records: ScoreRecord[]
}

/** 评分系统存储 */
export const useScoringStore = defineStore('scoring', () => {
  // ============ State ============
  /** 所有成绩记录，按歌曲ID分组 */
  const songStats = ref<Record<string, SongScoreStats>>({})
  
  /** 当前演奏的记录（未保存） */
  const currentSession = ref<Partial<ScoreRecord> | null>(null)
  
  /** 是否正在演奏 */
  const isRecording = ref(false)

  // ============ Getters ============
  
  /** 获取特定歌曲的统计 */
  const getSongStats = computed(() => (songId: string) => {
    return songStats.value[songId] || null
  })
  
  /** 获取所有有记录的歌曲ID列表 */
  const playedSongIds = computed(() => Object.keys(songStats.value))
  
  /** 获取所有成绩记录（扁平化） */
  const allRecords = computed(() => {
    const records: ScoreRecord[] = []
    Object.values(songStats.value).forEach(stats => {
      records.push(...stats.records)
    })
    return records.sort((a, b) => b.timestamp - a.timestamp)
  })
  
  /** 获取最近的成绩 */
  const recentRecords = computed(() => (limit: number = 10) => {
    return allRecords.value.slice(0, limit)
  })
  
  /** 获取总体统计 */
  const globalStats = computed(() => {
    const songs = Object.values(songStats.value)
    if (songs.length === 0) {
      return {
        totalPlays: 0,
        totalSongs: 0,
        averageAccuracy: 0,
        bestGrade: '-',
        totalPlayTime: 0,
      }
    }
    
    const totalPlays = songs.reduce((sum, s) => sum + s.playCount, 0)
    const totalAccuracy = songs.reduce((sum, s) => {
      const avgAccuracy = s.records.reduce((a, r) => a + r.accuracy, 0) / s.records.length
      return sum + avgAccuracy
    }, 0)
    
    const allGrades = songs.flatMap(s => s.records.map(r => r.grade))
    const bestGrade = calculateBestGrade(allGrades)
    
    return {
      totalPlays,
      totalSongs: songs.length,
      averageAccuracy: totalAccuracy / songs.length,
      bestGrade,
      totalPlayTime: songs.reduce((sum, s) => sum + s.records.reduce((a, r) => a + r.duration, 0), 0),
    }
  })

  // ============ Actions ============
  
  /**
   * 开始新的演奏记录
   */
  function startSession(songId: string, songName: string, duration: number) {
    currentSession.value = {
      songId,
      songName,
      timestamp: Date.now(),
      duration,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      maxCombo: 0,
      totalHits: 0,
    }
    isRecording.value = true
  }
  
  /**
   * 更新当前会话的判定数据
   */
  function updateSessionJudgment(judgment: JudgmentResult) {
    if (!isRecording.value || !currentSession.value) return
    
    switch (judgment.type) {
      case 'perfect':
        currentSession.value.perfectCount = (currentSession.value.perfectCount || 0) + 1
        break
      case 'good':
        currentSession.value.goodCount = (currentSession.value.goodCount || 0) + 1
        break
      case 'miss':
        currentSession.value.missCount = (currentSession.value.missCount || 0) + 1
        break
    }
    
    currentSession.value.totalHits = (currentSession.value.totalHits || 0) + 1
    
    if (judgment.combo > (currentSession.value.maxCombo || 0)) {
      currentSession.value.maxCombo = judgment.combo
    }
  }
  
  /**
   * 完成当前会话并保存
   */
  function completeSession(totalScore: number, accuracy: number, grade: string): ScoreRecord {
    if (!currentSession.value) {
      throw new Error('No active session')
    }
    
    const record: ScoreRecord = {
      id: generateRecordId(),
      songId: currentSession.value.songId!,
      songName: currentSession.value.songName!,
      timestamp: currentSession.value.timestamp!,
      totalScore,
      accuracy,
      grade,
      perfectCount: currentSession.value.perfectCount || 0,
      goodCount: currentSession.value.goodCount || 0,
      missCount: currentSession.value.missCount || 0,
      maxCombo: currentSession.value.maxCombo || 0,
      totalHits: currentSession.value.totalHits || 0,
      duration: currentSession.value.duration || 0,
    }
    
    // 保存到对应歌曲的统计中
    saveRecordToSongStats(record)
    
    // 保存到本地存储
    persistStats()
    
    // 重置当前会话
    currentSession.value = null
    isRecording.value = false
    
    return record
  }
  
  /**
   * 保存记录到歌曲统计
   */
  function saveRecordToSongStats(record: ScoreRecord) {
    const { songId } = record
    
    if (!songStats.value[songId]) {
      songStats.value[songId] = {
        songId,
        songName: record.songName,
        bestScore: record.totalScore,
        bestAccuracy: record.accuracy,
        bestGrade: record.grade,
        bestMaxCombo: record.maxCombo,
        playCount: 1,
        firstPlayed: record.timestamp,
        lastPlayed: record.timestamp,
        records: [record],
      }
    } else {
      const stats = songStats.value[songId]
      stats.records.push(record)
      stats.playCount++
      stats.lastPlayed = record.timestamp
      
      // 更新最佳成绩
      if (record.totalScore > stats.bestScore) {
        stats.bestScore = record.totalScore
      }
      if (record.accuracy > stats.bestAccuracy) {
        stats.bestAccuracy = record.accuracy
      }
      if (isBetterGrade(record.grade, stats.bestGrade)) {
        stats.bestGrade = record.grade
      }
      if (record.maxCombo > stats.bestMaxCombo) {
        stats.bestMaxCombo = record.maxCombo
      }
    }
  }
  
  /**
   * 取消当前会话
   */
  function cancelSession() {
    currentSession.value = null
    isRecording.value = false
  }
  
  /**
   * 从本地存储加载统计
   */
  function loadStats() {
    try {
      const saved = localStorage.getItem('drum-app-score-stats')
      if (saved) {
        const parsed = JSON.parse(saved)
        songStats.value = parsed
      }
    } catch (err) {
      console.error('Failed to load score stats:', err)
    }
  }
  
  /**
   * 保存统计到本地存储
   */
  function persistStats() {
    try {
      localStorage.setItem('drum-app-score-stats', JSON.stringify(songStats.value))
    } catch (err) {
      console.error('Failed to persist score stats:', err)
    }
  }
  
  /**
   * 清除所有成绩记录
   */
  function clearAllStats() {
    songStats.value = {}
    localStorage.removeItem('drum-app-score-stats')
  }
  
  /**
   * 清除特定歌曲的成绩
   */
  function clearSongStats(songId: string) {
    delete songStats.value[songId]
    persistStats()
  }
  
  /**
   * 获取歌曲的进步趋势数据
   */
  function getSongProgressData(songId: string): { timestamps: number[]; scores: number[]; accuracies: number[] } {
    const stats = songStats.value[songId]
    if (!stats || stats.records.length === 0) {
      return { timestamps: [], scores: [], accuracies: [] }
    }
    
    // 按时间排序
    const sorted = [...stats.records].sort((a, b) => a.timestamp - b.timestamp)
    
    return {
      timestamps: sorted.map(r => r.timestamp),
      scores: sorted.map(r => r.totalScore),
      accuracies: sorted.map(r => r.accuracy),
    }
  }
  
  /**
   * 导出所有数据为JSON
   */
  function exportData(): string {
    return JSON.stringify(songStats.value, null, 2)
  }
  
  /**
   * 导入数据
   */
  function importData(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      songStats.value = parsed
      persistStats()
      return true
    } catch (err) {
      console.error('Failed to import data:', err)
      return false
    }
  }

  // 初始化时加载数据
  loadStats()

  return {
    // State
    songStats,
    currentSession,
    isRecording,
    
    // Getters
    getSongStats,
    playedSongIds,
    allRecords,
    recentRecords,
    globalStats,
    
    // Actions
    startSession,
    updateSessionJudgment,
    completeSession,
    cancelSession,
    loadStats,
    persistStats,
    clearAllStats,
    clearSongStats,
    getSongProgressData,
    exportData,
    importData,
  }
})

// ============ Helper Functions ============

function generateRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateBestGrade(grades: string[]): string {
  const gradeOrder = ['S', 'A', 'B', 'C', 'D']
  let bestIndex = -1
  
  for (const grade of grades) {
    const index = gradeOrder.indexOf(grade)
    if (index !== -1 && index > bestIndex) {
      bestIndex = index
    }
  }
  
  return bestIndex === -1 ? '-' : gradeOrder[bestIndex]
}

function isBetterGrade(newGrade: string, currentBest: string): boolean {
  const gradeOrder = ['S', 'A', 'B', 'C', 'D']
  const newIndex = gradeOrder.indexOf(newGrade)
  const currentIndex = gradeOrder.indexOf(currentBest)
  
  if (newIndex === -1) return false
  if (currentIndex === -1) return true
  
  return newIndex < currentIndex
}
