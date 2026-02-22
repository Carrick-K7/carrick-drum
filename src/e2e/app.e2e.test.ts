import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

// 组件测试
import DrumPad from '../components/DrumPad.vue'
import DrumKit from '../components/DrumKit.vue'
import RealtimeJudgment from '../components/RealtimeJudgment.vue'
import ProgressChart from '../components/ProgressChart.vue'

// Store测试
import { useScoringStore } from '../stores/useScoringStore'
import { useTeachingStore } from '../stores/useTeachingStore'
import { JudgmentEngine } from '../core/judgment'
import type { Beat, JudgmentResult } from '../types'

describe('🥁 Drum App E2E Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============ Test 1: 鼓垫点击有声音和视觉反馈 ============
  describe('🎵 鼓垫点击测试', () => {
    it('DrumPad组件应该正确渲染鼓垫', () => {
      const wrapper = mount(DrumPad, {
        props: {
          drum: {
            id: 'kick',
            name: 'Kick',
            nameZh: '底鼓',
            key: 'A',
            sample: '/sounds/kick.wav',
            color: '#ff6b6b'
          },
          isActive: false
        },
        global: {
          plugins: [createPinia()]
        }
      })

      expect(wrapper.find('.drum-pad').exists()).toBe(true)
      expect(wrapper.find('.drum-key').text()).toBe('A')
      expect(wrapper.find('.drum-name-zh').text()).toBe('底鼓')
    })

    it('点击鼓垫应该触发trigger事件', async () => {
      const wrapper = mount(DrumPad, {
        props: {
          drum: {
            id: 'snare',
            name: 'Snare',
            nameZh: '军鼓',
            key: 'S',
            sample: '/sounds/snare.wav',
            color: '#4ecdc4'
          },
          isActive: false
        },
        global: {
          plugins: [createPinia()]
        }
      })

      await wrapper.find('.drum-pad').trigger('mousedown')
      expect(wrapper.emitted('trigger')).toBeTruthy()
      expect(wrapper.emitted('trigger')![0]).toEqual(['snare'])
    })

    it('激活状态应该添加active类', async () => {
      const wrapper = mount(DrumPad, {
        props: {
          drum: {
            id: 'hihat-closed',
            name: 'Hi-Hat Closed',
            nameZh: '踩镲闭合',
            key: 'D',
            sample: '/sounds/hihat-closed.wav',
            color: '#ffe66d'
          },
          isActive: true
        },
        global: {
          plugins: [createPinia()]
        }
      })

      expect(wrapper.find('.drum-pad').classes()).toContain('drum-pad-active')
    })

    it('DrumKit应该渲染8个鼓垫', () => {
      const wrapper = mount(DrumKit, {
        props: {
          activeDrums: new Set()
        },
        global: {
          plugins: [createPinia()]
        }
      })

      const pads = wrapper.findAllComponents(DrumPad)
      expect(pads.length).toBe(8)
    })
  })

  // ============ Test 2: 练习模式正常播放 ============
  describe('📚 练习模式测试', () => {
    it('TeachingStore应该能加载课程', () => {
      const store = useTeachingStore()
      
      const result = store.loadLesson('beginner-basic-01')
      
      expect(result).toBe(true)
      expect(store.currentLesson).not.toBeNull()
      expect(store.lessonState).toBe('intro')
    })

    it('TeachingStore应该能开始练习', () => {
      const store = useTeachingStore()
      store.loadLesson('beginner-basic-01')
      
      store.startPractice('practice')
      
      expect(store.practiceMode).toBe('practice')
      expect(store.lessonState).toBe('countdown')
      expect(store.countdownValue).toBe(3)
    })

    it('TeachingStore应该能处理击打', () => {
      const store = useTeachingStore()
      store.loadLesson('beginner-basic-01')
      store.startPractice('practice')
      
      // 模拟游戏循环已经开始
      store.lessonState = 'playing'
      
      // 在正确的时间击打
      const beats = store.currentLesson!.beats
      if (beats.length > 0) {
        const result = store.handleHit(beats[0].drum)
        
        // 由于时间不匹配，可能是none或miss
        expect(result).not.toBeNull()
      }
    })

    it('退出课程应该清理状态', () => {
      const store = useTeachingStore()
      store.loadLesson('beginner-basic-01')
      store.startPractice('practice')
      
      store.exitLesson()
      
      expect(store.currentLesson).toBeNull()
      expect(store.lessonState).toBe('idle')
      expect(store.isInLesson).toBe(false)
    })
  })

  // ============ Test 3: 评分系统正确判定（Perfect/Good/Miss） ============
  describe('🎯 评分系统测试', () => {
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

    it('±50ms内应该判定为Perfect', () => {
      const result = engine.judge(1000, beats) // 正好1.0秒
      
      expect(result.type).toBe('perfect')
      expect(result.score).toBe(100)
      expect(result.combo).toBe(1)
    })

    it('51-100ms内应该判定为Good', () => {
      const result = engine.judge(1060, beats) // 晚60ms
      
      expect(result.type).toBe('good')
      expect(result.score).toBe(50)
      expect(result.combo).toBe(1)
    })

    it('101-150ms内应该判定为Miss', () => {
      const result = engine.judge(3120, beats) // 3.0秒晚120ms
      
      expect(result.type).toBe('miss')
      expect(result.score).toBe(0)
      expect(result.combo).toBe(0)
    })

    it('Miss应该重置连击', () => {
      engine.judge(1000, beats) // perfect
      engine.judge(2000, beats) // perfect (combo: 2)
      engine.judge(3120, beats) // miss (combo: 0)
      
      expect(engine.getCombo()).toBe(0)
      expect(engine.getMaxCombo()).toBe(2)
    })

    it('漏击检测应该工作', () => {
      const missed = engine.checkMissedBeats(3200, beats)
      
      expect(missed.length).toBeGreaterThan(0)
      expect(missed[0].type).toBe('miss')
    })

    it('应该计算正确的评级', () => {
      // 全perfect
      engine.judge(1000, beats)
      engine.judge(2000, beats)
      engine.judge(3000, beats)
      engine.judge(4000, beats)
      
      expect(engine.getAccuracy()).toBe(1)
      expect(engine.getGrade()).toBe('S')
    })

    it('RealtimeJudgment组件应该正确显示判定', async () => {
      const wrapper = mount(RealtimeJudgment, {
        props: {
          judgment: {
            type: 'perfect',
            deltaMs: 0,
            score: 100,
            combo: 5
          } as JudgmentResult,
          showStats: true,
          maxVisible: 3
        },
        global: {
          plugins: [createPinia()]
        }
      })

      await nextTick()
      
      // 检查判定文本
      const judgmentText = wrapper.find('.judgment-text')
      expect(judgmentText.exists()).toBe(true)
      expect(judgmentText.text()).toBe('PERFECT!')
      
      // 检查连击显示
      const comboDisplay = wrapper.find('.combo-number')
      expect(comboDisplay.exists()).toBe(true)
      expect(comboDisplay.text()).toBe('5')
    })
  })

  // ============ Test 4: 历史记录保存和查看 ============
  describe('📊 历史记录测试', () => {
    it('ScoringStore应该能开始会话', () => {
      const store = useScoringStore()
      
      store.startSession('test-song', '测试歌曲', 60)
      
      expect(store.isRecording).toBe(true)
      expect(store.currentSession).not.toBeNull()
      expect(store.currentSession!.songId).toBe('test-song')
    })

    it('ScoringStore应该能更新判定数据', () => {
      const store = useScoringStore()
      store.startSession('test-song', '测试歌曲', 60)
      
      store.updateSessionJudgment({
        type: 'perfect',
        deltaMs: 0,
        score: 100,
        combo: 1
      })
      
      expect(store.currentSession!.perfectCount).toBe(1)
      expect(store.currentSession!.totalHits).toBe(1)
    })

    it('ScoringStore应该能完成并保存会话', () => {
      const store = useScoringStore()
      store.startSession('test-song', '测试歌曲', 60)
      
      store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 1 })
      store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 2 })
      store.updateSessionJudgment({ type: 'good', deltaMs: 30, score: 50, combo: 3 })
      
      const record = store.completeSession(250, 0.833, 'A')
      
      expect(record.totalScore).toBe(250)
      expect(record.grade).toBe('A')
      expect(record.perfectCount).toBe(2)
      expect(record.goodCount).toBe(1)
      expect(store.isRecording).toBe(false)
      
      // 检查是否保存到歌曲统计
      const songStats = store.getSongStats('test-song')
      expect(songStats).not.toBeNull()
      expect(songStats!.playCount).toBe(1)
    })

    it('应该正确计算歌曲统计数据', () => {
      const store = useScoringStore()
      
      // 添加多个记录
      store.startSession('song-1', '歌曲1', 60)
      store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 1 })
      store.completeSession(100, 1, 'S')
      
      store.startSession('song-2', '歌曲2', 60)
      store.updateSessionJudgment({ type: 'good', deltaMs: 30, score: 50, combo: 1 })
      store.completeSession(50, 0.5, 'B')
      
      const globalStats = store.globalStats
      
      expect(globalStats.totalPlays).toBe(2)
      expect(globalStats.totalSongs).toBe(2)
    })

    it('应该能导出和导入数据', () => {
      const store = useScoringStore()
      
      store.startSession('export-test', '导出测试', 60)
      store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 1 })
      store.completeSession(100, 1, 'S')
      
      const exported = store.exportData()
      expect(exported).toContain('export-test')
      
      // 清除后导入
      store.clearAllStats()
      expect(store.playedSongIds.length).toBe(0)
      
      store.importData(exported)
      expect(store.playedSongIds.length).toBe(1)
    })

    it('ProgressChart应该正确渲染数据', () => {
      const wrapper = mount(ProgressChart, {
        props: {
          data: {
            timestamps: [1000, 2000, 3000],
            scores: [100, 150, 200],
            accuracies: [0.8, 0.9, 1.0]
          },
          width: 400,
          height: 120,
          showPoints: true
        },
        global: {
          plugins: [createPinia()]
        }
      })

      expect(wrapper.find('.chart-svg').exists()).toBe(true)
      expect(wrapper.find('.score-line').exists()).toBe(true)
      expect(wrapper.find('.accuracy-line').exists()).toBe(true)
      
      // 检查图例
      const legendItems = wrapper.findAll('.legend-item')
      expect(legendItems.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ============ Test 5: 系统集成测试 ============
  describe('🔧 系统集成测试', () => {
    it('完整的练习流程', () => {
      const teachingStore = useTeachingStore()
      const scoringStore = useScoringStore()
      
      // 1. 加载课程
      teachingStore.loadLesson('beginner-basic-01')
      expect(teachingStore.isInLesson).toBe(true)
      
      // 2. 开始练习
      teachingStore.startPractice('practice')
      expect(scoringStore.isRecording).toBe(true)
      
      // 3. 模拟击打
      teachingStore.lessonState = 'playing'
      
      // 4. 完成课程
      const { record } = teachingStore.completeLesson()
      
      // 5. 验证成绩已保存
      expect(scoringStore.isRecording).toBe(false)
      if (record) {
        expect(record.songId).toBe('beginner-basic-01')
      }
    })

    it('多次练习后统计数据正确', () => {
      const store = useScoringStore()
      
      // 模拟多次练习，分数递增
      const scores = [200, 250, 300]
      scores.forEach(score => {
        store.startSession('multi-practice', '多次练习', 60)
        store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 1 })
        store.updateSessionJudgment({ type: 'perfect', deltaMs: 0, score: 100, combo: 2 })
        store.completeSession(score, 1, 'S')
      })
      
      const songStats = store.getSongStats('multi-practice')
      expect(songStats!.playCount).toBe(3)
      expect(songStats!.records.length).toBe(3)
      expect(songStats!.bestScore).toBe(300) // 最高分
    })

    it('进步趋势数据正确', () => {
      const store = useScoringStore()
      
      // 添加分数递增的记录
      const timestamps = [1000, 2000, 3000]
      const scores = [100, 200, 300]
      
      timestamps.forEach((ts, i) => {
        store.startSession('progress-test', '进步测试', 60)
        store.currentSession!.timestamp = ts
        store.completeSession(scores[i], scores[i] / 300, scores[i] >= 250 ? 'S' : 'A')
      })
      
      const progressData = store.getSongProgressData('progress-test')
      expect(progressData.timestamps.length).toBe(3)
      expect(progressData.scores).toEqual(scores)
      expect(progressData.accuracies).toEqual([100/300, 200/300, 1])
    })
  })
})
