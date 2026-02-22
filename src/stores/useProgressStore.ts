import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RhythmMap } from '../types'
import {
  type LessonProgress,
  type Rating,
  type UnlockEvent,
  checkUnlockStatus,
} from '../data/unlockRules'
import { LESSON_MAPS } from '../data/lessons'
import { useScoringStore } from './useScoringStore'

export const useProgressStore = defineStore('progress', () => {
  // ============ State ============
  /** 每首课程的进度记录 */
  const lessonProgress = ref<Record<string, LessonProgress>>({})

  /** 新解锁的课程列表（用于显示解锁动画） */
  const newlyUnlockedLessons = ref<string[]>([])

  /** 最后检查解锁状态的时间戳 */
  const lastUnlockCheck = ref<number>(0)

  // ============ Getters ============

  /** 获取特定课程的进度 */
  const getLessonProgress = computed(() => (lessonId: string): LessonProgress => {
    return lessonProgress.value[lessonId] || createEmptyProgress(lessonId)
  })

  /** 获取所有已解锁的课程ID */
  const unlockedLessonIds = computed(() => {
    return Object.values(lessonProgress.value)
      .filter(p => p.isUnlocked)
      .map(p => p.lessonId)
  })

  /** 获取所有已完成的课程ID */
  const completedLessonIds = computed(() => {
    return Object.values(lessonProgress.value)
      .filter(p => p.isCompleted)
      .map(p => p.lessonId)
  })

  /** 检查课程是否已解锁 */
  const isLessonUnlocked = computed(() => (lessonId: string): boolean => {
    const progress = lessonProgress.value[lessonId]
    if (progress?.isUnlocked) return true

    // 实时计算解锁状态
    return checkUnlockStatus(lessonId, lessonProgress.value)
  })

  /** 检查课程是否已完成 */
  const isLessonCompleted = computed(() => (lessonId: string): boolean => {
    return lessonProgress.value[lessonId]?.isCompleted || false
  })

  /** 获取课程的最佳评级 */
  const getLessonBestRating = computed(() => (lessonId: string): Rating | null => {
    return lessonProgress.value[lessonId]?.bestRating || null
  })

  /** 获取课程的最佳分数 */
  const getLessonBestScore = computed(() => (lessonId: string): number => {
    return lessonProgress.value[lessonId]?.bestScore || 0
  })

  /** 获取下一首待解锁的课程 */
  const nextUnlockableLesson = computed((): RhythmMap | null => {
    for (const lesson of LESSON_MAPS) {
      if (!isLessonUnlocked.value(lesson.id)) {
        return lesson
      }
    }
    return null
  })

  /** 计算总体进度百分比 */
  const overallProgress = computed(() => {
    const total = LESSON_MAPS.length
    const completed = completedLessonIds.value.length
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })

  /** 获取解锁链状态（用于可视化显示） */
  const unlockChainStatus = computed(() => {
    return LESSON_MAPS.map((lesson, index) => {
      const progress = lessonProgress.value[lesson.id]
      const isUnlocked = isLessonUnlocked.value(lesson.id)
      const isNewlyUnlocked = newlyUnlockedLessons.value.includes(lesson.id)

      return {
        lesson,
        index: index + 1,
        isUnlocked,
        isCompleted: progress?.isCompleted || false,
        bestRating: progress?.bestRating || null,
        isNewlyUnlocked,
      }
    })
  })

  // ============ Actions ============

  /**
   * 创建空的进度记录
   */
  function createEmptyProgress(lessonId: string): LessonProgress {
    return {
      lessonId,
      isUnlocked: false,
      isCompleted: false,
      bestRating: null,
      bestScore: 0,
      bestAccuracy: 0,
      completedAt: null,
      playCount: 0,
    }
  }

  /**
   * 从评分存储同步进度
   */
  function syncFromScoringStore() {
    const scoringStore = useScoringStore()

    for (const [songId, stats] of Object.entries(scoringStore.songStats)) {
      if (!lessonProgress.value[songId]) {
        lessonProgress.value[songId] = createEmptyProgress(songId)
      }

      const progress = lessonProgress.value[songId]
      progress.isCompleted = true
      progress.bestRating = stats.bestGrade as Rating
      progress.bestScore = stats.bestScore
      progress.bestAccuracy = stats.bestAccuracy
      progress.playCount = stats.playCount
      progress.completedAt = stats.lastPlayed
    }

    // 重新计算所有解锁状态
    recalculateAllUnlockStatuses()
  }

  /**
   * 重新计算所有课程的解锁状态
   */
  function recalculateAllUnlockStatuses() {
    let hasNewUnlocks = false

    for (const lesson of LESSON_MAPS) {
      const wasUnlocked = lessonProgress.value[lesson.id]?.isUnlocked || false
      const shouldBeUnlocked = checkUnlockStatus(lesson.id, lessonProgress.value)

      if (!wasUnlocked && shouldBeUnlocked) {
        // 新解锁的课程
        if (!lessonProgress.value[lesson.id]) {
          lessonProgress.value[lesson.id] = createEmptyProgress(lesson.id)
        }
        lessonProgress.value[lesson.id].isUnlocked = true
        newlyUnlockedLessons.value.push(lesson.id)
        hasNewUnlocks = true
      }
    }

    if (hasNewUnlocks) {
      lastUnlockCheck.value = Date.now()
      persistProgress()
    }
  }

  /**
   * 更新课程完成记录
   */
  function updateLessonCompletion(
    lessonId: string,
    rating: Rating,
    score: number,
    accuracy: number
  ): UnlockEvent[] {
    if (!lessonProgress.value[lessonId]) {
      lessonProgress.value[lessonId] = createEmptyProgress(lessonId)
    }

    const progress = lessonProgress.value[lessonId]
    progress.isCompleted = true
    progress.playCount++
    progress.completedAt = Date.now()

    // 更新最佳成绩
    if (score > progress.bestScore) {
      progress.bestScore = score
    }
    if (accuracy > progress.bestAccuracy) {
      progress.bestAccuracy = accuracy
    }

    // 更新最佳评级
    const ratingOrder = ['D', 'C', 'B', 'A', 'S']
    const currentIdx = ratingOrder.indexOf(progress.bestRating || 'D')
    const newIdx = ratingOrder.indexOf(rating)
    if (newIdx > currentIdx) {
      progress.bestRating = rating
    }

    // 检查解锁新课程
    const unlockEvents = checkForNewUnlocks()

    persistProgress()
    return unlockEvents
  }

  /**
   * 检查是否有新课程解锁
   */
  function checkForNewUnlocks(): UnlockEvent[] {
    const events: UnlockEvent[] = []

    for (const lesson of LESSON_MAPS) {
      const wasUnlocked = lessonProgress.value[lesson.id]?.isUnlocked || false
      const shouldBeUnlocked = checkUnlockStatus(lesson.id, lessonProgress.value)

      if (!wasUnlocked && shouldBeUnlocked) {
        if (!lessonProgress.value[lesson.id]) {
          lessonProgress.value[lesson.id] = createEmptyProgress(lesson.id)
        }
        lessonProgress.value[lesson.id].isUnlocked = true
        newlyUnlockedLessons.value.push(lesson.id)

        events.push({
          lessonId: lesson.id,
          lessonName: lesson.title,
          unlockedAt: Date.now(),
        })
      }
    }

    if (events.length > 0) {
      lastUnlockCheck.value = Date.now()
    }

    return events
  }

  /**
   * 标记新课程为已查看（清除newlyUnlocked状态）
   */
  function markNewlyUnlockedAsSeen(lessonId?: string) {
    if (lessonId) {
      const index = newlyUnlockedLessons.value.indexOf(lessonId)
      if (index > -1) {
        newlyUnlockedLessons.value.splice(index, 1)
      }
    } else {
      newlyUnlockedLessons.value = []
    }
  }

  /**
   * 强制解锁某课程（调试用）
   */
  function forceUnlockLesson(lessonId: string) {
    if (!lessonProgress.value[lessonId]) {
      lessonProgress.value[lessonId] = createEmptyProgress(lessonId)
    }
    lessonProgress.value[lessonId].isUnlocked = true
    persistProgress()
  }

  /**
   * 重置所有进度
   */
  function resetAllProgress() {
    lessonProgress.value = {}
    newlyUnlockedLessons.value = []
    localStorage.removeItem('drum-app-lesson-progress')
  }

  /**
   * 保存进度到本地存储
   */
  function persistProgress() {
    try {
      const data = {
        progress: lessonProgress.value,
        lastUnlockCheck: lastUnlockCheck.value,
      }
      localStorage.setItem('drum-app-lesson-progress', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to persist progress:', err)
    }
  }

  /**
   * 从本地存储加载进度
   */
  function loadProgress() {
    try {
      const saved = localStorage.getItem('drum-app-lesson-progress')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.progress) {
          lessonProgress.value = parsed.progress
        }
        if (parsed.lastUnlockCheck) {
          lastUnlockCheck.value = parsed.lastUnlockCheck
        }
      }
    } catch (err) {
      console.error('Failed to load progress:', err)
    }

    // 首次加载时与评分存储同步并计算解锁状态
    syncFromScoringStore()
  }

  /**
   * 导出进度数据
   */
  function exportProgress(): string {
    return JSON.stringify({
      progress: lessonProgress.value,
      newlyUnlocked: newlyUnlockedLessons.value,
      exportTime: Date.now(),
    }, null, 2)
  }

  /**
   * 导入进度数据
   */
  function importProgress(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      if (parsed.progress) {
        lessonProgress.value = parsed.progress
        persistProgress()
        recalculateAllUnlockStatuses()
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to import progress:', err)
      return false
    }
  }

  // ============ Initialization ============
  // 加载保存的进度
  loadProgress()

  return {
    // State
    lessonProgress,
    newlyUnlockedLessons,
    lastUnlockCheck,

    // Getters
    getLessonProgress,
    unlockedLessonIds,
    completedLessonIds,
    isLessonUnlocked,
    isLessonCompleted,
    getLessonBestRating,
    getLessonBestScore,
    nextUnlockableLesson,
    overallProgress,
    unlockChainStatus,

    // Actions
    syncFromScoringStore,
    recalculateAllUnlockStatuses,
    updateLessonCompletion,
    checkForNewUnlocks,
    markNewlyUnlockedAsSeen,
    forceUnlockLesson,
    resetAllProgress,
    persistProgress,
    loadProgress,
    exportProgress,
    importProgress,
  }
})
