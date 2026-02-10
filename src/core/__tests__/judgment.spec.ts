import { describe, it, expect, beforeEach } from 'vitest'
import {
  JudgmentEngine,
  createJudgmentEngine,
  JUDGMENT_SCORES,
  type JudgmentConfig,
} from '../judgment'
import type { Beat } from '../../types'

describe('JudgmentEngine', () => {
  let engine: JudgmentEngine
  let beats: Beat[]

  beforeEach(() => {
    engine = new JudgmentEngine()
    beats = [
      { time: 1.0, drum: 'kick' },
      { time: 2.0, drum: 'snare' },
      { time: 3.0, drum: 'kick' },
      { time: 4.0, drum: 'snare' },
    ]
  })

  describe('基本判定逻辑', () => {
    it('应该在 ±50ms 内判定为 Perfect', () => {
      const inputTime = 1000 // 1.0秒的节拍
      const result = engine.judge(inputTime, beats)
      
      expect(result.type).toBe('perfect')
      expect(result.deltaMs).toBe(0)
      expect(result.score).toBe(JUDGMENT_SCORES.perfect)
    })

    it('应该在 51-100ms 内判定为 Good', () => {
      const inputTime = 1060 // 晚 60ms
      const result = engine.judge(inputTime, beats)
      
      expect(result.type).toBe('good')
      expect(result.deltaMs).toBe(60)
      expect(result.score).toBe(JUDGMENT_SCORES.good)
    })

    it('应该在 101-150ms 内判定为 Miss', () => {
      const inputTime = 3120 // 3.0秒 晚 120ms
      const result = engine.judge(inputTime, beats)
      
      expect(result.type).toBe('miss')
      expect(result.score).toBe(0)
    })

    it('应该在超过 150ms 时判定为 none', () => {
      const inputTime = 1200 // 距离1.0s晚 200ms，距离2.0s早800ms
      const result = engine.judge(inputTime, beats)
      
      expect(result.type).toBe('none')
      expect(result.score).toBe(0)
    })

    it('应该处理提前击打的情况', () => {
      const inputTime = 940 // 早 60ms
      const result = engine.judge(inputTime, beats)
      
      expect(result.type).toBe('good')
      expect(result.deltaMs).toBe(-60)
    })
  })

  describe('连击系统', () => {
    it('应该正确累加连击数', () => {
      engine.judge(1000, beats) // perfect
      engine.judge(2000, beats) // perfect
      engine.judge(3000, beats) // perfect
      
      expect(engine.getCombo()).toBe(3)
    })

    it('应该在 Miss 时重置连击', () => {
      engine.judge(1000, beats) // perfect (1.0s)
      engine.judge(2000, beats) // perfect (2.0s)
      engine.judge(3120, beats) // miss (3.0s 晚 120ms)
      
      expect(engine.getCombo()).toBe(0)
    })

    it('应该记录最大连击', () => {
      engine.judge(1000, beats) // perfect (1.0s)
      engine.judge(2000, beats) // perfect (2.0s)
      engine.judge(3120, beats) // miss (3.0s 晚 120ms)
      engine.judge(4000, beats) // perfect (4.0s)
      
      expect(engine.getMaxCombo()).toBe(2)
    })
  })

  describe('漏击检测', () => {
    it('应该检测漏击的节拍', () => {
      const currentTime = 1200 // 超过 1.0秒节拍 200ms
      const missed = engine.checkMissedBeats(currentTime, beats)
      
      expect(missed.length).toBe(1)
      expect(missed[0].type).toBe('miss')
      expect(missed[0].beat?.time).toBe(1.0)
    })

    it('漏击应该重置连击', () => {
      engine.judge(1000, beats) // perfect
      engine.judge(2000, beats) // perfect
      
      const currentTime = 3200 // 超过 3.0秒节拍 200ms
      engine.checkMissedBeats(currentTime, beats)
      
      expect(engine.getCombo()).toBe(0)
    })
  })

  describe('特定鼓筛选', () => {
    it('应该只判定特定鼓的节拍', () => {
      const result = engine.judge(1000, beats, 'snare')
      
      // 1.0秒是 kick，不是 snare，应该判定为 none
      expect(result.type).toBe('none')
    })

    it('应该正确判定匹配的鼓', () => {
      const result = engine.judge(2000, beats, 'snare')
      
      // 2.0秒是 snare，应该判定为 perfect
      expect(result.type).toBe('perfect')
    })
  })

  describe('分数和统计', () => {
    it('应该正确计算总分', () => {
      engine.judge(1000, beats) // perfect: 100
      engine.judge(2060, beats) // good: 50
      engine.judge(3000, beats) // perfect: 100
      
      expect(engine.getTotalScore()).toBe(250)
    })

    it('应该正确计算准确率', () => {
      engine.judge(1000, beats) // perfect
      engine.judge(2060, beats) // good
      engine.judge(3120, beats) // miss
      
      // accuracy = (1 + 0.5) / 3 = 0.5
      expect(engine.getAccuracy()).toBe(0.5)
    })

    it('应该返回正确的评级', () => {
      // 全 perfect
      engine.judge(1000, beats)
      engine.judge(2000, beats)
      engine.judge(3000, beats)
      engine.judge(4000, beats)
      
      expect(engine.getGrade()).toBe('S')
    })
  })

  describe('重置功能', () => {
    it('应该重置所有状态', () => {
      engine.judge(1000, beats)
      engine.judge(2000, beats)
      engine.reset()
      
      expect(engine.getCombo()).toBe(0)
      expect(engine.getTotalScore()).toBe(0)
      expect(engine.getPerfectCount()).toBe(0)
    })
  })

  describe('自定义配置', () => {
    it('应该使用自定义窗口配置', () => {
      const customConfig: JudgmentConfig = {
        perfectWindow: 30,
        goodWindow: 60,
        missWindow: 100,
      }
      const customEngine = new JudgmentEngine(customConfig)
      
      // 40ms 在自定义配置中是 Good，不是 Perfect
      const result = customEngine.judge(1040, beats)
      expect(result.type).toBe('good')
    })
  })

  describe('边界条件', () => {
    it('应该处理空节拍列表', () => {
      const result = engine.judge(1000, [])
      expect(result.type).toBe('none')
    })

    it('应该正确处理边界值', () => {
      // 正好 50ms - Perfect边界
      const result = engine.judge(1050, beats)
      expect(result.type).toBe('perfect')
      
      // 正好 100ms - Good边界 (和 1.0s 差 100ms)
      const result2 = engine.judge(2000, [{ time: 2.1, drum: 'kick' }])
      expect(result2.type).toBe('good')
      
      // 正好 150ms - Miss边界 (和 1.0s 差 150ms)
      const result3 = engine.judge(3150, beats)
      expect(result3.type).toBe('miss')
    })
  })
})

describe('createJudgmentEngine', () => {
  it('应该使用默认配置创建引擎', () => {
    const engine = createJudgmentEngine()
    const beats: Beat[] = [{ time: 1.0, drum: 'kick' }]
    
    const result = engine.judge(1000, beats)
    expect(result.type).toBe('perfect')
  })

  it('应该使用自定义配置创建引擎', () => {
    const engine = createJudgmentEngine({ perfectWindow: 25 })
    const beats: Beat[] = [{ time: 1.0, drum: 'kick' }]
    
    // 40ms 在 25ms 配置中是 Good
    const result = engine.judge(1040, beats)
    expect(result.type).toBe('good')
  })
})
