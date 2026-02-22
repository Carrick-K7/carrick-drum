import { computed, ref, watch } from 'vue'
import type { RhythmMap } from '../types'
import type { Rating, UnlockEvent } from '../data/unlockRules'
import { useProgressStore } from '../stores/useProgressStore'
import { useScoringStore } from '../stores/useScoringStore'
import { LESSON_MAPS } from '../data/lessons'
import { getUnlockConditionText, getPreviousLesson, getDifficultyRequirement } from '../data/unlockRules'

/** 解锁弹窗状态 */
export interface UnlockModalState {
  show: boolean
  lessonId: string | null
  lessonName: string
  conditionText: string
}

/** 解锁通知状态 */
export interface UnlockNotificationState {
  show: boolean
  events: UnlockEvent[]
}

/**
 * 解锁逻辑 Hook
 */
export function useUnlock() {
  const progressStore = useProgressStore()
  const scoringStore = useScoringStore()

  // ============ State ============
  /** 解锁弹窗状态 */
  const unlockModal = ref<UnlockModalState>({
    show: false,
    lessonId: null,
    lessonName: '',
    conditionText: '',
  })

  /** 解锁通知状态 */
  const unlockNotification = ref<UnlockNotificationState>({
    show: false,
    events: [],
  })

  // ============ Computed ============

  /** 是否有新解锁的课程 */
  const hasNewlyUnlockedLessons = computed(() =>
    progressStore.newlyUnlockedLessons.length > 0
  )

  /** 新解锁课程详情列表 */
  const newlyUnlockedDetails = computed(() => {
    return progressStore.newlyUnlockedLessons
      .map(id => LESSON_MAPS.find(l => l.id === id))
      .filter(Boolean) as RhythmMap[]
  })

  // ============ Methods ============

  /**
   * 检查课程是否锁定
   */
  function isLocked(lesson: RhythmMap): boolean {
    return !progressStore.isLessonUnlocked(lesson.id)
  }

  /**
   * 获取课程的锁定状态详情
   */
  function getLockStatus(lesson: RhythmMap) {
    const isUnlocked = progressStore.isLessonUnlocked(lesson.id)
    const isCompleted = progressStore.isLessonCompleted(lesson.id)
    const bestRating = progressStore.getLessonBestRating(lesson.id)
    const bestScore = progressStore.getLessonBestScore(lesson.id)
    const isNewlyUnlocked = progressStore.newlyUnlockedLessons.includes(lesson.id)

    return {
      isLocked: !isUnlocked,
      isUnlocked,
      isCompleted,
      bestRating,
      bestScore,
      isNewlyUnlocked,
    }
  }

  /**
   * 处理课程点击
   * @returns true if the lesson can be selected, false if locked
   */
  function handleLessonClick(lesson: RhythmMap): boolean {
    const status = getLockStatus(lesson)

    if (status.isLocked) {
      // 显示解锁条件弹窗
      showUnlockModal(lesson)
      return false
    }

    // 清除新解锁标记
    if (status.isNewlyUnlocked) {
      progressStore.markNewlyUnlockedAsSeen(lesson.id)
    }

    return true
  }

  /**
   * 显示解锁条件弹窗
   */
  function showUnlockModal(lesson: RhythmMap) {
    unlockModal.value = {
      show: true,
      lessonId: lesson.id,
      lessonName: lesson.title,
      conditionText: getUnlockConditionText(lesson.id),
    }
  }

  /**
   * 关闭解锁弹窗
   */
  function closeUnlockModal() {
    unlockModal.value.show = false
  }

  /**
   * 检查课程完成后的解锁情况
   * @returns 新解锁的课程事件列表
   */
  function checkUnlockAfterCompletion(
    lessonId: string,
    rating: Rating,
    score: number,
    accuracy: number
  ): UnlockEvent[] {
    // 更新进度存储
    const events = progressStore.updateLessonCompletion(lessonId, rating, score, accuracy)

    // 如果有新解锁，显示通知
    if (events.length > 0) {
      showUnlockNotification(events)
    }

    return events
  }

  /**
   * 显示解锁通知
   */
  function showUnlockNotification(events: UnlockEvent[]) {
    unlockNotification.value = {
      show: true,
      events,
    }
  }

  /**
   * 关闭解锁通知
   */
  function closeUnlockNotification() {
    unlockNotification.value.show = false
    unlockNotification.value.events = []

    // 清除所有新解锁标记
    progressStore.markNewlyUnlockedAsSeen()
  }

  /**
   * 获取下一首推荐的课程
   */
  function getRecommendedLesson(): RhythmMap | null {
    // 优先返回未完成的已解锁课程
    for (const lesson of LESSON_MAPS) {
      const status = getLockStatus(lesson)
      if (status.isUnlocked && !status.isCompleted) {
        return lesson
      }
    }

    // 所有课程都完成了
    return null
  }

  /**
   * 获取课程进度信息（用于显示）
   */
  function getLessonProgressInfo(lesson: RhythmMap) {
    const status = getLockStatus(lesson)
    const prevLesson = getPreviousLesson(lesson.id)

    let progressText = ''
    let progressPercent = 0

    if (status.isLocked) {
      if (prevLesson) {
        const prevStatus = getLockStatus(prevLesson)
        if (!prevStatus.isCompleted) {
          progressText = '前置课程未完成'
          progressPercent = 0
        } else {
          progressText = `需要评级≥${getRequiredRating(lesson.id)}`
          progressPercent = 50
        }
      } else {
        progressText = '锁定'
        progressPercent = 0
      }
    } else if (status.isCompleted) {
      progressText = `最佳: ${status.bestRating || '-'}`
      progressPercent = 100
    } else {
      progressText = '已解锁 - 待完成'
      progressPercent = 75
    }

    return {
      ...status,
      progressText,
      progressPercent,
      unlockCondition: getUnlockConditionText(lesson.id),
    }
  }

  /**
   * 获取课程所需的评级（内部辅助函数）
   */
  function getRequiredRating(lessonId: string): string {
    const lesson = LESSON_MAPS.find(l => l.id === lessonId)
    if (!lesson) return '-'
    const req = getDifficultyRequirement(lesson.difficulty || 'beginner')
    return req.minRating || '完成'
  }

  // ============ Watchers ============

  // 监听评分存储变化，自动同步进度
  watch(
    () => scoringStore.songStats,
    () => {
      progressStore.syncFromScoringStore()
    },
    { deep: true }
  )

  return {
    // State
    unlockModal,
    unlockNotification,

    // Computed
    hasNewlyUnlockedLessons,
    newlyUnlockedDetails,

    // Methods
    isLocked,
    getLockStatus,
    handleLessonClick,
    showUnlockModal,
    closeUnlockModal,
    checkUnlockAfterCompletion,
    showUnlockNotification,
    closeUnlockNotification,
    getRecommendedLesson,
    getLessonProgressInfo,
  }
}
