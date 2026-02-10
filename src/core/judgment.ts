/**
 * 判定系统 - 判定逻辑、时间窗口计算
 * 
 * 判定等级：
 * - Perfect: ±50ms
 * - Good: ±100ms
 * - Miss: >100ms
 */

import type { Beat } from '../types'

/** 判定结果类型 */
export type JudgmentType = 'perfect' | 'good' | 'miss' | 'none'

/** 判定结果 */
export interface JudgmentResult {
  /** 判定类型 */
  type: JudgmentType
  /** 时间误差（毫秒，正数表示提前，负数表示延迟） */
  deltaMs: number
  /** 判定的节拍 */
  beat?: Beat
  /** 得分 */
  score: number
  /** 连击数 */
  combo: number
}

/** 判定配置 */
export interface JudgmentConfig {
  /** Perfect 窗口（毫秒） */
  perfectWindow: number
  /** Good 窗口（毫秒） */
  goodWindow: number
  /** Miss 窗口（毫秒） */
  missWindow: number
}

/** 默认判定配置 */
export const DEFAULT_JUDGMENT_CONFIG: JudgmentConfig = {
  perfectWindow: 50,  // ±50ms = Perfect
  goodWindow: 100,    // ±100ms = Good
  missWindow: 150,    // ±150ms = Miss
}

/** 判定得分 */
export const JUDGMENT_SCORES: Record<JudgmentType, number> = {
  perfect: 100,
  good: 50,
  miss: 0,
  none: 0,
}

/** 判定文本 */
export const JUDGMENT_TEXTS: Record<JudgmentType, string> = {
  perfect: 'Perfect!',
  good: 'Good',
  miss: 'Miss',
  none: '',
}

/** 判定颜色 */
export const JUDGMENT_COLORS: Record<JudgmentType, string> = {
  perfect: '#22c55e', // green-500
  good: '#3b82f6',    // blue-500
  miss: '#ef4444',    // red-500
  none: 'transparent',
}

/**
 * 判定引擎类
 */
export class JudgmentEngine {
  private config: JudgmentConfig
  private combo = 0
  private maxCombo = 0
  private perfectCount = 0
  private goodCount = 0
  private missCount = 0
  private totalScore = 0
  private judgedBeatTimes = new Set<number>()

  constructor(config: Partial<JudgmentConfig> = {}) {
    this.config = { ...DEFAULT_JUDGMENT_CONFIG, ...config }
  }

  /**
   * 判定用户输入
   * @param inputTime 用户输入时间（毫秒）
   * @param targetBeats 目标节拍列表
   * @param drumId 鼓ID（可选，用于过滤特定鼓）
   * @returns 判定结果
   */
  judge(inputTime: number, targetBeats: Beat[], drumId?: string): JudgmentResult {
    // 过滤特定鼓的节拍
    const beats = drumId 
      ? targetBeats.filter(b => b.drum === drumId)
      : targetBeats

    if (beats.length === 0) {
      return {
        type: 'none',
        deltaMs: 0,
        score: 0,
        combo: this.combo,
      }
    }

    // 找到最近的未判定节拍
    let nearestBeat: Beat | undefined
    let minDelta = Infinity

    for (const beat of beats) {
      const beatTimeMs = beat.time * 1000
      // 跳过已判定的节拍
      if (this.judgedBeatTimes.has(beatTimeMs)) continue

      const delta = Math.abs(inputTime - beatTimeMs)
      if (delta < minDelta) {
        minDelta = delta
        nearestBeat = beat
      }
    }

    // 没有未判定的节拍
    if (!nearestBeat) {
      return {
        type: 'none',
        deltaMs: 0,
        score: 0,
        combo: this.combo,
      }
    }

    const deltaMs = inputTime - nearestBeat.time * 1000
    const absDelta = Math.abs(deltaMs)

    // 判定逻辑
    let type: JudgmentType
    if (absDelta <= this.config.perfectWindow) {
      type = 'perfect'
      this.combo++
      this.perfectCount++
    } else if (absDelta <= this.config.goodWindow) {
      type = 'good'
      this.combo++
      this.goodCount++
    } else if (absDelta <= this.config.missWindow) {
      type = 'miss'
      this.combo = 0
      this.missCount++
    } else {
      // 距离太远，不判定
      return {
        type: 'none',
        deltaMs,
        score: 0,
        combo: this.combo,
      }
    }

    // 标记节拍为已判定
    this.judgedBeatTimes.add(nearestBeat.time * 1000)

    // 更新最大连击
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo
    }

    // 计算得分
    const score = JUDGMENT_SCORES[type]
    this.totalScore += score

    return {
      type,
      deltaMs,
      beat: nearestBeat,
      score,
      combo: this.combo,
    }
  }

  /**
   * 检查是否有漏击（Miss）的节拍
   * @param currentTime 当前时间（毫秒）
   * @param targetBeats 目标节拍列表
   * @param drumId 鼓ID（可选）
   * @returns 漏击的判定结果列表
   */
  checkMissedBeats(currentTime: number, targetBeats: Beat[], drumId?: string): JudgmentResult[] {
    const missedResults: JudgmentResult[] = []
    const beats = drumId 
      ? targetBeats.filter(b => b.drum === drumId)
      : targetBeats

    for (const beat of beats) {
      const beatTimeMs = beat.time * 1000
      
      // 跳过已判定的节拍
      if (this.judgedBeatTimes.has(beatTimeMs)) continue

      // 如果当前时间已经超过节拍时间 + miss窗口，则判定为漏击
      if (currentTime > beatTimeMs + this.config.missWindow) {
        this.judgedBeatTimes.add(beatTimeMs)
        this.combo = 0
        this.missCount++

        missedResults.push({
          type: 'miss',
          deltaMs: currentTime - beatTimeMs,
          beat,
          score: 0,
          combo: 0,
        })
      }
    }

    return missedResults
  }

  /**
   * 获取下一个应该击打的节拍
   * @param currentTime 当前时间（毫秒）
   * @param targetBeats 目标节拍列表
   * @param drumId 鼓ID（可选）
   * @returns 下一个节拍
   */
  getNextBeat(currentTime: number, targetBeats: Beat[], drumId?: string): Beat | undefined {
    const beats = drumId 
      ? targetBeats.filter(b => b.drum === drumId)
      : targetBeats

    return beats.find(beat => {
      const beatTimeMs = beat.time * 1000
      return beatTimeMs > currentTime && !this.judgedBeatTimes.has(beatTimeMs)
    })
  }

  /**
   * 重置判定状态
   */
  reset(): void {
    this.combo = 0
    this.maxCombo = 0
    this.perfectCount = 0
    this.goodCount = 0
    this.missCount = 0
    this.totalScore = 0
    this.judgedBeatTimes.clear()
  }

  // Getters
  getCombo(): number { return this.combo }
  getMaxCombo(): number { return this.maxCombo }
  getPerfectCount(): number { return this.perfectCount }
  getGoodCount(): number { return this.goodCount }
  getMissCount(): number { return this.missCount }
  getTotalScore(): number { return this.totalScore }

  /**
   * 获取准确率
   */
  getAccuracy(): number {
    const total = this.perfectCount + this.goodCount + this.missCount
    if (total === 0) return 0
    return (this.perfectCount + this.goodCount * 0.5) / total
  }

  /**
   * 获取评级
   */
  getGrade(): string {
    const accuracy = this.getAccuracy()
    if (accuracy >= 0.95) return 'S'
    if (accuracy >= 0.9) return 'A'
    if (accuracy >= 0.8) return 'B'
    if (accuracy >= 0.7) return 'C'
    return 'D'
  }
}

/**
 * 创建判定引擎实例
 */
export function createJudgmentEngine(config?: Partial<JudgmentConfig>): JudgmentEngine {
  return new JudgmentEngine(config)
}
