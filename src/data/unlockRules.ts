import type { RhythmMap } from '../types'
import { LESSON_MAPS } from './lessons'

/** 评级顺序（从低到高） */
export const RATING_ORDER = ['D', 'C', 'B', 'A', 'S'] as const

/** 评级类型 */
export type Rating = typeof RATING_ORDER[number]

/** 解锁规则 */
export interface UnlockRule {
  /** 课程ID */
  lessonId: string
  /** 前置课程要求 */
  requiredLessons: Array<{
    lessonId: string
    /** 最低评级要求（null表示完成即可） */
    minRating: Rating | null
  }>
}

/** 难度评级要求配置 */
export interface DifficultyRatingRequirement {
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  minRating: Rating | null
  label: string
}

/** 各难度级别的评级要求 */
export const DIFFICULTY_REQUIREMENTS: DifficultyRatingRequirement[] = [
  { difficulty: 'beginner', minRating: null, label: '无要求' },
  { difficulty: 'elementary', minRating: 'C', label: '≥C级' },
  { difficulty: 'intermediate', minRating: 'B', label: '≥B级' },
  { difficulty: 'advanced', minRating: 'A', label: '≥A级' },
]

/**
 * 获取难度的评级要求
 */
export function getDifficultyRequirement(difficulty: string): DifficultyRatingRequirement {
  return DIFFICULTY_REQUIREMENTS.find(r => r.difficulty === difficulty) || DIFFICULTY_REQUIREMENTS[0]
}

/**
 * 比较两个评级
 * @returns true if rating1 >= rating2
 */
export function compareRating(rating1: Rating | null, rating2: Rating | null): boolean {
  if (!rating2) return true // 无要求，任何评级都满足
  if (!rating1) return false // 有要求但无评级，不满足

  const idx1 = RATING_ORDER.indexOf(rating1)
  const idx2 = RATING_ORDER.indexOf(rating2)
  return idx1 >= idx2
}

/**
 * 判断评级是否满足要求
 */
export function meetsRatingRequirement(
  achievedRating: Rating | null,
  requiredRating: Rating | null
): boolean {
  return compareRating(achievedRating, requiredRating)
}

/**
 * 生成课程的解锁规则（基于线性解锁和难度评级要求）
 */
export function generateUnlockRules(): UnlockRule[] {
  const rules: UnlockRule[] = []

  for (let i = 0; i < LESSON_MAPS.length; i++) {
    const lesson = LESSON_MAPS[i]
    const rule: UnlockRule = {
      lessonId: lesson.id,
      requiredLessons: [],
    }

    // 第一首默认解锁
    if (i > 0) {
      const prevLesson = LESSON_MAPS[i - 1]
      const requirement = getDifficultyRequirement(lesson.difficulty || 'beginner')

      rule.requiredLessons.push({
        lessonId: prevLesson.id,
        minRating: requirement.minRating,
      })
    }

    rules.push(rule)
  }

  return rules
}

/** 解锁规则表 */
export const UNLOCK_RULES: UnlockRule[] = generateUnlockRules()

/**
 * 获取课程的解锁规则
 */
export function getUnlockRule(lessonId: string): UnlockRule | undefined {
  return UNLOCK_RULES.find(r => r.lessonId === lessonId)
}

/**
 * 课程进度记录
 */
export interface LessonProgress {
  lessonId: string
  isUnlocked: boolean
  isCompleted: boolean
  bestRating: Rating | null
  bestScore: number
  bestAccuracy: number
  completedAt: number | null
  playCount: number
}

/**
 * 解锁事件
 */
export interface UnlockEvent {
  lessonId: string
  lessonName: string
  unlockedAt: number
}

/**
 * 检查课程是否满足解锁条件
 */
export function checkUnlockStatus(
  lessonId: string,
  progress: Record<string, LessonProgress>
): boolean {
  const rule = getUnlockRule(lessonId)

  // 没有规则或无前置要求，默认解锁
  if (!rule || rule.requiredLessons.length === 0) {
    return true
  }

  // 检查所有前置要求
  return rule.requiredLessons.every(req => {
    const reqProgress = progress[req.lessonId]

    // 前置课程未完成
    if (!reqProgress?.isCompleted) return false

    // 检查评级要求
    return meetsRatingRequirement(reqProgress.bestRating, req.minRating)
  })
}

/**
 * 获取解锁条件的描述文本
 */
export function getUnlockConditionText(lessonId: string): string {
  const rule = getUnlockRule(lessonId)
  if (!rule || rule.requiredLessons.length === 0) {
    return '默认解锁'
  }

  const req = rule.requiredLessons[0]
  const prevLesson = LESSON_MAPS.find(l => l.id === req.lessonId)

  if (!prevLesson) return '完成前置课程'

  if (req.minRating) {
    return `完成「${prevLesson.title}」且评级≥${req.minRating}`
  }
  return `完成「${prevLesson.title}」`
}

/**
 * 获取课程在序列中的位置
 */
export function getLessonIndex(lessonId: string): number {
  return LESSON_MAPS.findIndex(l => l.id === lessonId)
}

/**
 * 检查课程是否是第一首
 */
export function isFirstLesson(lessonId: string): boolean {
  return getLessonIndex(lessonId) === 0
}

/**
 * 获取前一课程
 */
export function getPreviousLesson(lessonId: string): RhythmMap | undefined {
  const index = getLessonIndex(lessonId)
  if (index <= 0) return undefined
  return LESSON_MAPS[index - 1]
}
