# Drum App Phase 5: 教学模式 - Tech Spec V2

> **PTT Version**: 2.0  
> **Last Updated**: 2026-02-08  
> **Status**: Ready for Development

---

## 1. Tech Stack (技术栈)

### 1.1 Core Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Vue 3 | ^3.4 | 响应式UI框架 |
| Language | TypeScript | ^5.3 | 类型安全 |
| State | Pinia | ^2.1 | 状态管理 |
| Styling | Tailwind CSS | ^3.4 | 原子化CSS |
| Build | Vite | ^5.0 | 构建工具 |

### 1.2 Testing Stack (测试技术栈)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Test Runner | Vitest | ^1.0 | 单元/集成测试 |
| Component Test | @vue/test-utils | ^2.4 | Vue组件测试 |
| Mock | vi (built-in) | - | Mock/Spy |
| Coverage | v8 | - | 测试覆盖率 |

### 1.3 Audio Stack
| Category | Technology | Purpose |
|----------|------------|---------|
| Audio API | Web Audio API | 音频合成与播放 |
| Time Source | AudioContext.currentTime | 高精度计时 |

---

## 2. Data Schema (数据模型)

### 2.1 Core Types

```typescript
// types/teaching.ts

// ========== 练习曲数据 ==========

export interface TeachingSong {
  id: string
  order: number
  title: string
  titleEn: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  baseBpm: number
  speeds: {
    slow: number    // 0.75x
    normal: number  // 1.0x
    fast: number    // 1.25x
  }
  description: string
  unlockRequirement?: {
    prevSongId?: string
    minGrade?: Grade
    avgGradeOfLevel?: Grade
  }
  rhythmMapId: string
  totalBeats: number
  duration: number  // seconds
}

export interface TeachingRhythmMap {
  id: string
  beats: TeachingBeat[]
}

export interface TeachingBeat {
  time: number      // 时间点(秒)
  drumId: string    // 鼓件ID
  type: 'note' | 'rest'
  displayTime?: number  // 视觉提示开始时间(提前量)
}

// ========== 游戏状态 ==========

export type TeachingPhase = 
  | 'select' 
  | 'prepare' 
  | 'countdown' 
  | 'playing' 
  | 'paused' 
  | 'result'

export type HitJudgment = 'perfect' | 'good' | 'miss' | 'none'
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | '-'

export interface PracticeSession {
  songId: string
  speedLevel: 'slow' | 'normal' | 'fast'
  startTime: number
  endTime?: number
  currentTime: number
  currentBeatIndex: number
  stats: PracticeStats
  judgments: JudgmentRecord[]
}

export interface PracticeStats {
  totalBeats: number
  perfectCount: number
  goodCount: number
  missCount: number
  maxCombo: number
  currentCombo: number
  accuracy: number  // 0-100
  score: number
}

export interface JudgmentRecord {
  beatIndex: number
  drumId: string
  expectedTime: number
  actualTime: number | null
  judgment: HitJudgment
  timeDiff: number  // ms
}

// ========== 进度存储 ==========

export interface SongProgress {
  songId: string
  unlocked: boolean
  bestGrade: Grade
  bestAccuracy: number
  maxCombo: number
  speedProgress: {
    slow: SpeedProgress
    normal: SpeedProgress
    fast: SpeedProgress
  }
  playCount: number
  lastPlayedAt: number
}

export interface SpeedProgress {
  completed: boolean
  bestGrade: Grade
  bestAccuracy: number
  unlocked: boolean
}

export interface UserTeachingProgress {
  version: number
  updatedAt: number
  songs: Record<string, SongProgress>
  totalPlayTime: number
  totalSessions: number
}
```

### 2.2 Constants

```typescript
// constants/teaching.ts

export const JUDGMENT_WINDOWS = {
  perfect: 50,   // ±50ms
  good: 100,     // ±100ms
  miss: 150      // >±150ms
} as const

export const COMBO_MULTIPLIERS = {
  0: 1.0,
  10: 1.1,
  30: 1.2,
  50: 1.5,
  100: 2.0
} as const

export const GRADE_THRESHOLDS = {
  S: 95,
  A: 85,
  B: 70,
  C: 50,
  D: 0
} as const

export const COUNTDOWN_SECONDS = 3
export const PREVIEW_ADVANCE_MS = 500
export const NEAREST_BEAT_WINDOW_MS = 200
```

---

## 3. Project Structure (项目结构)

```
src/
├── components/
│   └── teaching/
│       ├── SongList.vue           # 练习曲列表
│       ├── SongCard.vue           # 练习曲卡片
│       ├── PracticeView.vue       # 演奏主界面
│       ├── CountdownOverlay.vue   # 倒计时遮罩
│       ├── MetronomeDisplay.vue   # 节拍器显示
│       ├── TeachingDrumKit.vue    # 教学模式鼓组
│       ├── ScorePanel.vue         # 实时评分面板
│       ├── ComboDisplay.vue       # Combo显示
│       ├── ResultModal.vue        # 结算弹窗
│       └── JudgmentPopup.vue      # 判定飘字
├── composables/
│   ├── useJudgment.ts             # 判定逻辑 (核心)
│   ├── useTimingEngine.ts         # 计时引擎
│   ├── useVisualScheduler.ts      # 视觉调度
│   └── useTeachingEngine.ts       # 教学引擎整合
├── stores/
│   ├── useTeachingStore.ts        # 教学状态管理
│   └── useProgressStore.ts        # 进度存储管理
├── data/
│   ├── teaching-songs.ts          # 练习曲元数据
│   └── rhythms/
│       ├── song-01.ts             # 曲目01节奏数据
│       ├── song-02.ts             # 曲目02节奏数据
│       └── ...
├── types/
│   └── teaching.ts                # 类型定义
├── constants/
│   └── teaching.ts                # 常量定义
└── __tests__/                     # 测试目录
    ├── unit/
    │   ├── useJudgment.spec.ts    # 判定系统测试
    │   └── useProgressStore.spec.ts # 进度存储测试
    └── integration/
        └── teaching-flow.spec.ts  # 完整流程测试
```

---

## 4. Development Workflow (开发工作流)

### 4.1 DDD (Document-Driven Development)

```
┌─────────────────────────────────────────────────────────┐
│  DDD Flow: 文档优先，代码跟随                            │
├─────────────────────────────────────────────────────────┤
│  1. 更新 Product Spec → 明确验收标准                     │
│  2. 更新 Tech Spec → 明确技术方案                        │
│  3. 更新 Task Spec → 拆解TDD任务                         │
│  4. 编写测试 → 基于验收标准                              │
│  5. 编写实现 → 使测试通过                                │
│  6. 重构 → 保持代码质量                                  │
└─────────────────────────────────────────────────────────┘
```

**规则**:
- 每次代码变更前，先检查相关文档是否需要更新
- 新功能必须有对应的验收标准(AC)才能开发
- 技术方案变更必须同步到 Tech Spec

### 4.2 TDD (Test-Driven Development)

```
┌─────────────────────────────────────────────────────────┐
│  TDD Cycle: Red → Green → Refactor                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│   │   RED   │───→│  GREEN  │───→│ REFACTOR│───┐         │
│   │ 写失败测试 │    │ 写实现代码 │    │  重构优化  │    │         │
│   └─────────┘    └─────────┘    └─────────┘    │         │
│        ↑────────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**规则**:
1. **Red**: 先写一个失败的测试，明确期望行为
2. **Green**: 编写最简单的代码让测试通过
3. **Refactor**: 重构代码，保持测试通过

### 4.3 Testing Strategy (测试策略)

#### 4.3.1 测试金字塔
```
         /\
        /  \     E2E Tests (少量)
       /____\        ↓
      /      \   Integration (中等)
     /________\      ↓
    /          \  Unit Tests (大量)
   /____________\
```

#### 4.3.2 必测场景清单

**useJudgment (判定系统)**
| Test Case | Input | Expected |
|-----------|-------|----------|
| perfect_hit | diff=40ms | 'perfect' |
| perfect_boundary | diff=50ms | 'perfect' |
| good_hit | diff=75ms | 'good' |
| good_boundary | diff=100ms | 'good' |
| miss_hit | diff=120ms | 'miss' |
| miss_boundary | diff=150ms | 'miss' |
| out_of_window | diff=200ms | 'none' |
| early_hit | diff=-200ms | 'none' |
| calculate_accuracy | P=8,G=2,M=0,Total=10 | 87% |
| calculate_grade_S | accuracy=95 | 'S' |
| calculate_grade_A | accuracy=85 | 'A' |
| combo_multiplier_10 | combo=15 | 1.1 |
| combo_multiplier_50 | combo=75 | 1.5 |

**useProgressStore (进度存储)**
| Test Case | Input | Expected |
|-----------|-------|----------|
| first_song_unlocked | songId='song-01' | true |
| locked_song | songId='song-02', no progress | false |
| unlock_by_grade | song-01=C级 | song-02解锁 |
| unlock_speed_normal | slow=C级 | normal解锁 |
| update_best_grade | 新结果A级>旧结果B级 | 更新为A级 |
| keep_best_grade | 新结果B级<旧结果A级 | 保持A级 |

#### 4.3.3 测试配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
})
```

---

## 5. Core Algorithm Design (核心算法)

### 5.1 判定算法

```typescript
// composables/useJudgment.ts
// 测试驱动实现，见 __tests__/unit/useJudgment.spec.ts

export function useJudgment() {
  /**
   * 计算敲击判定
   * @param actualTime - 实际敲击时间(ms)
   * @param expectedTime - 期望敲击时间(ms)
   * @returns HitJudgment
   * 
   * 测试用例覆盖:
   * - perfect: |diff| ≤ 50
   * - good: 50 < |diff| ≤ 100
   * - miss: 100 < |diff| ≤ 150
   * - none: |diff| > 150
   */
  function judgeHit(actualTime: number, expectedTime: number): HitJudgment {
    const diff = Math.abs(actualTime - expectedTime)
    
    if (diff <= JUDGMENT_WINDOWS.perfect) return 'perfect'
    if (diff <= JUDGMENT_WINDOWS.good) return 'good'
    if (diff <= JUDGMENT_WINDOWS.miss) return 'miss'
    return 'none'
  }
  
  /**
   * 查找最近的期望音符
   * @param currentTime - 当前时间
   * @param beats - 所有音符列表
   * @param windowMs - 搜索窗口(默认200ms)
   */
  function findNearestBeat(
    currentTime: number, 
    beats: TimedBeat[], 
    windowMs: number = 200
  ): TimedBeat | null {
    const windowSec = windowMs / 1000
    let nearest: TimedBeat | null = null
    let minDiff = Infinity
    
    for (const beat of beats) {
      const diff = Math.abs(beat.expectedTime - currentTime)
      if (diff <= windowSec && diff < minDiff) {
        minDiff = diff
        nearest = beat
      }
    }
    
    return nearest
  }
  
  /**
   * 计算准确率
   * Formula: (P×1.0 + G×0.7) / total × 100
   */
  function calculateAccuracy(stats: PracticeStats): number {
    const weightedHits = stats.perfectCount * 1.0 + stats.goodCount * 0.7
    return Math.round((weightedHits / stats.totalBeats) * 100)
  }
  
  /**
   * 计算最终评级
   */
  function calculateGrade(accuracy: number): Grade {
    if (accuracy >= GRADE_THRESHOLDS.S) return 'S'
    if (accuracy >= GRADE_THRESHOLDS.A) return 'A'
    if (accuracy >= GRADE_THRESHOLDS.B) return 'B'
    if (accuracy >= GRADE_THRESHOLDS.C) return 'C'
    return 'D'
  }
  
  /**
   * 获取Combo加成倍数
   */
  function getComboMultiplier(combo: number): number {
    const thresholds = Object.keys(COMBO_MULTIPLIERS)
      .map(Number)
      .sort((a, b) => b - a)
    
    for (const threshold of thresholds) {
      if (combo >= threshold) {
        return COMBO_MULTIPLIERS[threshold as keyof typeof COMBO_MULTIPLIERS]
      }
    }
    return 1.0
  }
  
  return {
    judgeHit,
    findNearestBeat,
    calculateAccuracy,
    calculateGrade,
    getComboMultiplier
  }
}
```

### 5.2 计时引擎

```typescript
// composables/useTimingEngine.ts
// 基于AudioContext的高精度计时

export function useTimingEngine() {
  const audioContext = ref<AudioContext | null>(null)
  const startTime = ref(0)
  const isRunning = ref(false)
  const pauseOffset = ref(0)
  
  const currentTime = computed(() => {
    if (!audioContext.value || !isRunning.value) return pauseOffset.value
    return audioContext.value.currentTime - startTime.value + pauseOffset.value
  })
  
  function init(ctx: AudioContext) {
    audioContext.value = ctx
  }
  
  function start() {
    if (!audioContext.value) return
    startTime.value = audioContext.value.currentTime
    isRunning.value = true
    pauseOffset.value = 0
  }
  
  function pause() {
    if (!isRunning.value) return
    pauseOffset.value = currentTime.value
    isRunning.value = false
  }
  
  function resume() {
    if (isRunning.value || !audioContext.value) return
    startTime.value = audioContext.value.currentTime
    isRunning.value = true
  }
  
  function stop() {
    isRunning.value = false
    startTime.value = 0
    pauseOffset.value = 0
  }
  
  return {
    currentTime,
    isRunning,
    init,
    start,
    pause,
    resume,
    stop
  }
}
```

---

## 6. Store Design (状态管理)

### 6.1 useTeachingStore

```typescript
// stores/useTeachingStore.ts

export const useTeachingStore = defineStore('teaching', () => {
  // State
  const phase = ref<TeachingPhase>('select')
  const selectedSongId = ref<string | null>(null)
  const selectedSpeed = ref<'slow' | 'normal' | 'fast'>('normal')
  const session = ref<PracticeSession | null>(null)
  
  // Getters
  const selectedSong = computed(() => 
    TEACHING_SONGS.find(s => s.id === selectedSongId.value)
  )
  
  const currentBpm = computed(() => {
    if (!selectedSong.value) return 0
    return selectedSong.value.speeds[selectedSpeed.value]
  })
  
  // Actions
  function selectSong(songId: string) {
    selectedSongId.value = songId
    phase.value = 'prepare'
  }
  
  function startPractice() {
    // 初始化session...
    phase.value = 'playing'
  }
  
  function recordHit(drumId: string, actualTime: number) {
    // 记录敲击，更新stats...
  }
  
  function finishPractice() {
    phase.value = 'result'
    // 保存到progressStore...
  }
  
  return {
    phase,
    selectedSongId,
    selectedSpeed,
    session,
    selectedSong,
    currentBpm,
    selectSong,
    startPractice,
    recordHit,
    finishPractice
  }
})
```

### 6.2 useProgressStore

```typescript
// stores/useProgressStore.ts

const STORAGE_KEY = 'drum-teaching-progress'

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<UserTeachingProgress>({
    version: 1,
    updatedAt: Date.now(),
    songs: {},
    totalPlayTime: 0,
    totalSessions: 0
  })
  
  // 解锁检查逻辑...
  // 数据持久化逻辑...
  
  return {
    progress,
    isSongUnlocked,
    canUnlockSpeed,
    updateSongResult
  }
})
```

---

## 7. Audio Processing (音频处理)

### 7.1 节拍器合成

```typescript
// composables/useMetronome.ts

export function useMetronome(audioContext: AudioContext) {
  const isPlaying = ref(false)
  const bpm = ref(100)
  const volume = ref(0.5)
  
  function playClick(time: number, isAccent: boolean) {
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    osc.frequency.value = isAccent ? 1000 : 800
    osc.type = 'sine'
    
    gain.gain.setValueAtTime(volume.value, time)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05)
    
    osc.connect(gain)
    gain.connect(audioContext.destination)
    
    osc.start(time)
    osc.stop(time + 0.05)
  }
  
  // scheduler...  
  
  return { isPlaying, start, stop }
}
```

---

## 8. Performance Considerations (性能考量)

| Concern | Solution | Verification |
|---------|----------|--------------|
| 渲染性能 | v-memo缓存鼓垫 | FPS监控 |
| 高频更新 | throttle(准确率, 100ms) | 性能分析 |
| 内存管理 | 练习结束清理judgments数组 | 内存快照 |
| 动画性能 | CSS transform, will-change | DevTools |

---

## 9. Dependencies (依赖清单)

### 9.1 开发依赖
```bash
# 已包含在项目中
npm install -D vitest @vue/test-utils jsdom @vitest/coverage-v8
```

### 9.2 新增运行时依赖
```bash
# 无需新增
```

---

## 10. Checklist Before Coding (编码前检查清单)

- [ ] Product Spec 中的验收标准已明确
- [ ] Tech Spec 中的数据模型已定义
- [ ] Task Spec 中的TDD任务已拆解
- [ ] 相关测试用例已设计
- [ ] 技术方案已评审通过
