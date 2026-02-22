import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RhythmMap, Beat, JudgmentResult } from '../types'
import { JudgmentEngine } from '../core/judgment'
import { getLessonById } from '../data/lessons'
import { useScoringStore, type ScoreRecord } from './useScoringStore'
import { useProgressStore } from './useProgressStore'
import type { UnlockEvent } from '../data/unlockRules'

export type PracticeMode = 'practice' | 'perform'
export type LessonState = 'idle' | 'intro' | 'countdown' | 'playing' | 'paused' | 'completed'

export const useTeachingStore = defineStore('teaching', () => {
  // ============ State ============
  const currentLesson = ref<RhythmMap | null>(null)
  const lessonState = ref<LessonState>('idle')
  const practiceMode = ref<PracticeMode>('practice')
  
  // 时间和播放状态
  const currentTime = ref(0) // 当前时间（毫秒）
  const isPlaying = ref(false)
  const countdownValue = ref(3)
  
  // 判定引擎
  const judgmentEngine = ref<JudgmentEngine | null>(null)
  
  // 最近的判定结果（用于显示）
  const lastJudgment = ref<JudgmentResult | null>(null)
  const judgmentHistory = ref<JudgmentResult[]>([])
  
  // 视觉提示
  const upcomingBeats = ref<Beat[]>([])
  const activeDrums = ref<Set<string>>(new Set())
  
  // 动画帧
  let animationFrameId: number | null = null
  let lastFrameTime = 0
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  // ============ Getters ============
  const isInLesson = computed(() => currentLesson.value !== null)
  const isLessonCompleted = computed(() => lessonState.value === 'completed')
  
  const progress = computed(() => {
    if (!currentLesson.value) return 0
    return Math.min(100, (currentTime.value / 1000 / currentLesson.value.duration) * 100)
  })
  
  const remainingTime = computed(() => {
    if (!currentLesson.value) return 0
    return Math.max(0, currentLesson.value.duration * 1000 - currentTime.value)
  })
  
  // 统计
  const stats = computed(() => {
    if (!judgmentEngine.value) {
      return {
        score: 0,
        combo: 0,
        maxCombo: 0,
        accuracy: 0,
        perfectCount: 0,
        goodCount: 0,
        missCount: 0,
        grade: '-',
      }
    }
    
    return {
      score: judgmentEngine.value.getTotalScore(),
      combo: judgmentEngine.value.getCombo(),
      maxCombo: judgmentEngine.value.getMaxCombo(),
      accuracy: judgmentEngine.value.getAccuracy(),
      perfectCount: judgmentEngine.value.getPerfectCount(),
      goodCount: judgmentEngine.value.getGoodCount(),
      missCount: judgmentEngine.value.getMissCount(),
      grade: judgmentEngine.value.getGrade(),
    }
  })
  
  // 下一个要击打的鼓
  const nextBeat = computed(() => {
    if (!currentLesson.value || !judgmentEngine.value) return null
    return judgmentEngine.value.getNextBeat(currentTime.value, currentLesson.value.beats)
  })
  
  // 获取接下来N个节拍用于视觉提示
  const getUpcomingBeats = (count: number = 4): Beat[] => {
    if (!currentLesson.value) return []
    
    return currentLesson.value.beats
      .filter(beat => beat.time * 1000 > currentTime.value)
      .slice(0, count)
  }

  // ============ Actions ============
  
  /**
   * 加载课程
   */
  function loadLesson(lessonId: string) {
    const lesson = getLessonById(lessonId)
    if (!lesson) {
      console.error(`Lesson not found: ${lessonId}`)
      return false
    }
    
    currentLesson.value = lesson
    lessonState.value = 'intro'
    
    // 重置状态
    resetLesson()
    
    return true
  }
  
  /**
   * 开始练习
   */
  function startPractice(mode: PracticeMode = 'practice') {
    if (!currentLesson.value) return
    
    practiceMode.value = mode
    lessonState.value = 'countdown'
    countdownValue.value = 3
    
    // 初始化判定引擎
    judgmentEngine.value = new JudgmentEngine()
    
    // 如果是练习模式，开始记录评分
    if (mode === 'practice') {
      const scoringStore = useScoringStore()
      scoringStore.startSession(
        currentLesson.value.id,
        currentLesson.value.title,
        currentLesson.value.duration
      )
    }
    
    // 倒计时
    countdownInterval = setInterval(() => {
      countdownValue.value--
      if (countdownValue.value <= 0) {
        if (countdownInterval) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
        startPlaying()
      }
    }, 1000)
  }
  
  /**
   * 开始播放
   */
  function startPlaying() {
    lessonState.value = 'playing'
    isPlaying.value = true
    lastFrameTime = performance.now()
    animationFrameId = requestAnimationFrame(gameLoop)
  }
  
  /**
   * 游戏主循环
   */
  function gameLoop(timestamp: number) {
    if (!isPlaying.value) return
    
    const deltaTime = timestamp - lastFrameTime
    lastFrameTime = timestamp
    
    // 更新当前时间
    currentTime.value += deltaTime
    
    // 检查课程是否结束
    if (currentLesson.value && currentTime.value >= currentLesson.value.duration * 1000) {
      completeLesson()
      return
    }
    
    // 更新视觉提示
    updateVisualGuides()
    
    // 检查漏击
    checkMissedBeats()
    
    // 继续循环
    if (isPlaying.value) {
      animationFrameId = requestAnimationFrame(gameLoop)
    }
  }
  
  /**
   * 更新视觉提示
   */
  function updateVisualGuides() {
    upcomingBeats.value = getUpcomingBeats(4)
  }
  
  /**
   * 检查漏击
   */
  function checkMissedBeats() {
    if (!currentLesson.value || !judgmentEngine.value) return
    
    const missedJudgments = judgmentEngine.value.checkMissedBeats(
      currentTime.value,
      currentLesson.value.beats
    )
    
    missedJudgments.forEach(judgment => {
      judgmentHistory.value.push(judgment)
      showJudgment(judgment)
      
      // 更新评分存储
      if (practiceMode.value === 'practice') {
        const scoringStore = useScoringStore()
        scoringStore.updateSessionJudgment(judgment)
      }
    })
  }
  
  /**
   * 处理用户击打
   */
  function handleHit(drumId: string): JudgmentResult | null {
    if (!currentLesson.value || !judgmentEngine.value) return null
    if (lessonState.value !== 'playing') return null
    
    // 执行判定
    const judgment = judgmentEngine.value.judge(
      currentTime.value,
      currentLesson.value.beats,
      drumId
    )
    
    // 记录判定结果
    if (judgment.type !== 'none') {
      judgmentHistory.value.push(judgment)
      lastJudgment.value = judgment
      showJudgment(judgment)
      
      // 更新评分存储
      if (practiceMode.value === 'practice') {
        const scoringStore = useScoringStore()
        scoringStore.updateSessionJudgment(judgment)
      }
    }
    
    return judgment
  }
  
  /**
   * 显示判定效果
   */
  function showJudgment(judgment: JudgmentResult) {
    lastJudgment.value = judgment
    
    // 3秒后清除判定显示
    setTimeout(() => {
      if (lastJudgment.value === judgment) {
        lastJudgment.value = null
      }
    }, 800)
  }
  
  /**
   * 暂停/继续
   */
  function togglePause() {
    if (lessonState.value === 'playing') {
      lessonState.value = 'paused'
      isPlaying.value = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    } else if (lessonState.value === 'paused') {
      startPlaying()
    }
  }
  
  /**
   * 停止练习
   */
  function stopPractice() {
    isPlaying.value = false
    lessonState.value = 'intro'
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    
    resetLesson()
  }
  
  /**
   * 完成课程
   */
  function completeLesson(): { record: ScoreRecord | null; unlockEvents: UnlockEvent[] } {
    isPlaying.value = false
    lessonState.value = 'completed'
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    
    let record: ScoreRecord | null = null
    const unlockEvents: UnlockEvent[] = []
    
    // 如果是练习模式，保存成绩
    if (practiceMode.value === 'practice' && judgmentEngine.value) {
      const scoringStore = useScoringStore()
      const progressStore = useProgressStore()
      
      record = scoringStore.completeSession(
        judgmentEngine.value.getTotalScore(),
        judgmentEngine.value.getAccuracy(),
        judgmentEngine.value.getGrade()
      )
      
      // 更新进度存储并检查解锁
      if (currentLesson.value) {
        const events = progressStore.updateLessonCompletion(
          currentLesson.value.id,
          judgmentEngine.value.getGrade() as import('../data/unlockRules').Rating,
          judgmentEngine.value.getTotalScore(),
          judgmentEngine.value.getAccuracy()
        )
        unlockEvents.push(...events)
      }
    }
    
    return { record, unlockEvents }
  }
  
  /**
   * 重置课程状态
   */
  function resetLesson() {
    currentTime.value = 0
    lastJudgment.value = null
    judgmentHistory.value = []
    upcomingBeats.value = []
    activeDrums.value.clear()
    
    if (judgmentEngine.value) {
      judgmentEngine.value.reset()
    }
    
    lastFrameTime = 0
  }
  
  /**
   * 设置鼓激活状态（视觉反馈）
   */
  function setDrumActive(drumId: string, active: boolean) {
    if (active) {
      activeDrums.value.add(drumId)
    } else {
      activeDrums.value.delete(drumId)
    }
  }
  
  /**
   * 重新开始当前课程
   */
  function restartLesson() {
    resetLesson()
    startPractice(practiceMode.value)
  }
  
  /**
   * 退出课程
   */
  function exitLesson() {
    stopPractice()
    currentLesson.value = null
    lessonState.value = 'idle'
  }

  // ============ Cleanup ============
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
  }

  return {
    // State
    currentLesson,
    lessonState,
    practiceMode,
    currentTime,
    isPlaying,
    countdownValue,
    lastJudgment,
    judgmentHistory,
    upcomingBeats,
    activeDrums,
    
    // Getters
    isInLesson,
    isLessonCompleted,
    progress,
    remainingTime,
    stats,
    nextBeat,
    
    // Actions
    loadLesson,
    startPractice,
    handleHit,
    togglePause,
    stopPractice,
    completeLesson,
    resetLesson,
    restartLesson,
    exitLesson,
    setDrumActive,
    getUpcomingBeats,
    cleanup,
  }
})
