# Drum App Phase 5 V2: Tech Spec

> **PTT Version**: 2.0  
> **Last Updated**: 2026-02-08  
> **Status**: Ready for Development

---

## 1. Tech Stack

### 1.1 Core Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Vue 3 | ^3.4 | 响应式UI框架 |
| Language | TypeScript | ^5.3 | 类型安全 |
| State | Pinia | ^2.1 | 状态管理 |
| Styling | Tailwind CSS | ^3.4 | 原子化CSS |
| Build | Vite | ^5.0 | 构建工具 |

### 1.2 Testing Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Test Runner | Vitest | ^1.0 | 单元/集成测试 |
| Component Test | @vue/test-utils | ^2.4 | Vue组件测试 |
| E2E Test | Playwright | ^1.40 | 端到端测试 |
| Mock | vi (built-in) | - | Mock/Spy |
| Coverage | v8 | - | 测试覆盖率 |

### 1.3 Audio Stack
| Category | Technology | Purpose |
|----------|------------|---------|
| Audio API | Web Audio API | 音频合成、解码、分析 |
| Time Source | AudioContext.currentTime | 高精度计时 |
| Analysis | Web Audio API AnalyserNode | 频谱/波形分析 |
| Onset Detection | 自定义算法 (基于能量差) | 瞬态检测 |
| BPM Detection | 自相关算法 / 峰值检测 | 节拍检测 |

---

## 2. Audio Processing Test Plan (音频处理测试方案)

### 2.1 测试策略概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Audio Testing Pyramid                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         ┌─────────┐                                         │
│         │  E2E    │  真实MP3上传→完整识别流程              │
│         │  Tests  │  (Playwright)                           │
│        ┌┴─────────┴┐                                        │
│        │ Integration│  音频解码→分析→生成谱面               │
│        │   Tests    │  (Vitest + jsdom)                     │
│       ┌┴────────────┴┐                                      │
│       │    Unit       │  onset检测、BPM计算、分类算法        │
│       │    Tests      │  (Vitest + 预计算音频指纹)          │
│      ┌┴───────────────┴┐                                    │
│      │   Algorithm     │  纯算法测试(无浏览器依赖)           │
│      │   Validation    │  (Node.js + 测试音频文件)           │
│      └─────────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 音频测试数据集

#### 测试音频文件 (存放于 `src/__tests__/fixtures/audio/`)

| 文件名 | 描述 | 用途 | 大小 |
|--------|------|------|------|
| `metronome-120bpm.mp3` | 纯节拍器，120BPM，4/4拍 | BPM检测基准 | 100KB |
| `kick-snare-loop.wav` | 简单Kick-Snare交替 | 分类算法测试 | 50KB |
| `rock-beat-90bpm.wav` | 完整Rock Beat | 端到端测试 | 200KB |
| `complex-fill.wav` | 包含Tom Fill | 复杂节奏测试 | 150KB |
| `low-volume-drums.mp3` | 低音量鼓点 | 边界条件测试 | 180KB |
| `no-drums-music.mp3` | 无鼓点音乐 | 负向测试 | 200KB |

#### 预计算音频指纹 (存放于 `src/__tests__/fixtures/fingerprints/`)

```typescript
// 预计算期望值，用于测试断言
export const expectedFingerprints = {
  'metronome-120bpm': {
    bpm: 120,
    bpmConfidence: 0.98,
    onsets: [
      { time: 0.0, expectedType: 'unknown' },
      { time: 0.5, expectedType: 'unknown' },
      { time: 1.0, expectedType: 'unknown' },
      // ...
    ]
  },
  'kick-snare-loop': {
    bpm: 100,
    onsets: [
      { time: 0.0, expectedType: 'kick' },
      { time: 0.3, expectedType: 'snare' },
      { time: 0.6, expectedType: 'kick' },
      { time: 0.9, expectedType: 'snare' },
    ]
  }
}
```

### 2.3 核心算法测试方案

#### 2.3.1 Onset Detection Algorithm Tests

**算法**: 基于频谱通量的onset检测

```typescript
// __tests__/unit/audio/onsetDetection.spec.ts

describe('Onset Detection', () => {
  describe('detectOnsets', () => {
    it('应检测节拍器音频的所有节拍点', async () => {
      const audioBuffer = await loadTestAudio('metronome-120bpm.mp3')
      const onsets = detectOnsets(audioBuffer, { sensitivity: 0.5 })
      
      // 120BPM = 每秒2拍，10秒应约20拍
      expect(onsets.length).toBeGreaterThanOrEqual(18)
      expect(onsets.length).toBeLessThanOrEqual(22)
      
      // 检测间隔应接近0.5秒
      const intervals = getIntervals(onsets)
      const avgInterval = average(intervals)
      expect(avgInterval).toBeCloseTo(0.5, 1) // 精度0.1s
    })
    
    it('应对低音量音频保持一定敏感度', async () => {
      const audioBuffer = await loadTestAudio('low-volume-drums.mp3')
      const onsets = detectOnsets(audioBuffer, { sensitivity: 0.3 })
      
      expect(onsets.length).toBeGreaterThan(5)
    })
    
    it('应在无鼓点音频返回空数组', async () => {
      const audioBuffer = await loadTestAudio('no-drums-music.mp3')
      const onsets = detectOnsets(audioBuffer, { sensitivity: 0.5 })
      
      expect(onsets.length).toBeLessThan(3) // 允许少量误检
    })
    
    it('灵敏度参数应影响检测密度', async () => {
      const audioBuffer = await loadTestAudio('rock-beat-90bpm.wav')
      
      const highSensitivity = detectOnsets(audioBuffer, { sensitivity: 0.8 })
      const lowSensitivity = detectOnsets(audioBuffer, { sensitivity: 0.2 })
      
      expect(highSensitivity.length).toBeGreaterThan(lowSensitivity.length)
    })
  })
})
```

#### 2.3.2 BPM Detection Algorithm Tests

**算法**: 基于onset间隔的自相关分析

```typescript
// __tests__/unit/audio/bpmDetection.spec.ts

describe('BPM Detection', () => {
  describe('detectBPM', () => {
    it('应准确检测120BPM节拍器', async () => {
      const audioBuffer = await loadTestAudio('metronome-120bpm.mp3')
      const result = detectBPM(audioBuffer)
      
      expect(result.bpm).toBeCloseTo(120, 0) // 误差<1
      expect(result.confidence).toBeGreaterThan(0.9)
    })
    
    it('应准确检测90BPM Rock Beat', async () => {
      const audioBuffer = await loadTestAudio('rock-beat-90bpm.wav')
      const result = detectBPM(audioBuffer)
      
      expect(result.bpm).toBeCloseTo(90, 0)
      expect(result.confidence).toBeGreaterThan(0.8)
    })
    
    it('应对复杂Fill保持稳定检测', async () => {
      const audioBuffer = await loadTestAudio('complex-fill.wav')
      const result = detectBPM(audioBuffer)
      
      expect(result.confidence).toBeGreaterThan(0.6)
      expect(result.bpm).toBeGreaterThan(60)
      expect(result.bpm).toBeLessThan(200)
    })
    
    it('应处理双拍问题(60 vs 120)', async () => {
      const audioBuffer = await loadTestAudio('kick-snare-loop.wav')
      const result = detectBPM(audioBuffer)
      
      // 真实BPM可能是100，检测为100或200都可接受
      const isValid = result.bpm === 100 || result.bpm === 200
      expect(isValid).toBe(true)
    })
  })
  
  describe('estimateBPMFromOnsets', () => {
    it('应从onset间隔计算BPM', () => {
      const onsets = [0, 0.5, 1.0, 1.5, 2.0] // 间隔0.5s = 120BPM
      const bpm = estimateBPMFromOnsets(onsets)
      
      expect(bpm).toBe(120)
    })
    
    it('应处理不规则输入', () => {
      const onsets = [0, 0.48, 1.02, 1.51, 1.99] // 有轻微偏移
      const bpm = estimateBPMFromOnsets(onsets)
      
      expect(bpm).toBeCloseTo(120, -1) // 误差<10
    })
  })
})
```

#### 2.3.3 Drum Classification Tests

**算法**: 基于频谱特征的多层分类器

```typescript
// __tests__/unit/audio/drumClassification.spec.ts

describe('Drum Classification', () => {
  describe('classifyDrum', () => {
    it('应正确识别Kick鼓', async () => {
      const audioBuffer = await loadTestAudio('kick-snare-loop.wav')
      const onsets = [{ time: 0.0 }] // Kick位置
      
      const classifications = await classifyDrums(audioBuffer, onsets)
      
      expect(classifications[0].type).toBe('kick')
      expect(classifications[0].confidence).toBeGreaterThan(0.7)
    })
    
    it('应正确识别Snare鼓', async () => {
      const audioBuffer = await loadTestAudio('kick-snare-loop.wav')
      const onsets = [{ time: 0.3 }] // Snare位置
      
      const classifications = await classifyDrums(audioBuffer, onsets)
      
      expect(classifications[0].type).toBe('snare')
      expect(classifications[0].confidence).toBeGreaterThan(0.7)
    })
    
    it('应对高置信度结果标记为确认', async () => {
      const classifications = [
        { type: 'kick', confidence: 0.85 },
        { type: 'snare', confidence: 0.65 },
      ]
      
      const marked = markHighConfidence(classifications, 0.7)
      
      expect(marked[0].confirmed).toBe(true)
      expect(marked[1].confirmed).toBe(false)
    })
  })
  
  describe('extractDrumFeatures', () => {
    it('应提取低频能量特征用于Kick检测', async () => {
      const audioBuffer = await loadTestAudio('kick-snare-loop.wav')
      const features = extractDrumFeatures(audioBuffer, 0.0)
      
      expect(features.lowFreqEnergy).toBeGreaterThan(features.highFreqEnergy)
      expect(features.spectralCentroid).toBeLessThan(500)
    })
    
    it('应提取高频能量特征用于HiHat检测', async () => {
      // 模拟HiHat音频段
      const features = extractDrumFeatures(audioBuffer, hiHatTime)
      
      expect(features.highFreqEnergy).toBeGreaterThan(features.lowFreqEnergy)
      expect(features.spectralCentroid).toBeGreaterThan(5000)
    })
  })
})
```

### 2.4 音频处理流程集成测试

```typescript
// __tests__/integration/mp3-recognition.spec.ts

describe('MP3 Recognition Integration', () => {
  describe('完整流程', () => {
    it('应完成从MP3到练习谱的完整流程', async () => {
      // Arrange
      const mp3File = await loadTestFile('rock-beat-90bpm.wav')
      
      // Act
      const result = await recognizeMP3(mp3File, {
        startTime: 0,
        duration: 10, // 分析前10秒
        sensitivity: 0.5
      })
      
      // Assert
      expect(result.success).toBe(true)
      expect(result.bpm).toBeCloseTo(90, 0)
      expect(result.rhythmMap.beats.length).toBeGreaterThan(10)
      expect(result.rhythmMap.beats[0]).toHaveProperty('time')
      expect(result.rhythmMap.beats[0]).toHaveProperty('drumId')
      expect(result.rhythmMap.beats[0]).toHaveProperty('type')
    })
    
    it('应处理大文件分段分析', async () => {
      const largeFile = createMockLargeFile(25 * 1024 * 1024) // 25MB
      
      const result = await recognizeMP3(largeFile, {
        maxDuration: 30 // 限制只分析30秒
      })
      
      expect(result.success).toBe(true)
      expect(result.analyzedDuration).toBeLessThanOrEqual(30)
    })
    
    it('应拒绝无效文件格式', async () => {
      const invalidFile = new File(['not audio'], 'test.txt', { type: 'text/plain' })
      
      await expect(recognizeMP3(invalidFile)).rejects.toThrow('Invalid audio format')
    })
    
    it('应处理解码失败', async () => {
      const corruptedFile = createCorruptedMP3()
      
      const result = await recognizeMP3(corruptedFile)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('decode')
    })
  })
  
  describe('进度回调', () => {
    it('应在处理过程中触发进度回调', async () => {
      const progressUpdates: number[] = []
      
      await recognizeMP3(testFile, {
        onProgress: (progress) => progressUpdates.push(progress)
      })
      
      expect(progressUpdates.length).toBeGreaterThan(3)
      expect(progressUpdates[0]).toBeGreaterThanOrEqual(0)
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100)
    })
  })
})
```

---

## 3. TDD Implementation Guide (TDD实现指南)

### 3.1 TDD Workflow for Audio Features

```
┌─────────────────────────────────────────────────────────────┐
│              Audio Feature TDD Cycle                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                            │
│  │  1. RED     │  创建测试音频 + 写失败测试                │
│  │  准备测试数据│  expect(detectBPM(mockBuffer)).toBe(120)  │
│  └──────┬──────┘                                            │
│         ↓                                                    │
│  ┌─────────────┐                                            │
│  │  2. GREEN   │  实现最简算法使测试通过                   │
│  │  实现算法   │  即使只是返回硬编码值                     │
│  └──────┬──────┘                                            │
│         ↓                                                    │
│  ┌─────────────┐                                            │
│  │  3. REFACTOR│  优化算法 + 添加更多测试用例              │
│  │  完善算法   │  确保边界条件覆盖                         │
│  └──────┬──────┘                                            │
│         ↓                                                    │
│  ┌─────────────┐                                            │
│  │  4. VERIFY  │  使用真实音频验证                         │
│  │  真实数据验证│  调整阈值和参数                           │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 音频功能TDD任务清单

#### Task 1: 音频解码模块 (useAudioDecoder)

```typescript
// TDD Steps:

// Step 1 - RED (测试)
describe('useAudioDecoder', () => {
  it('应解码MP3文件为AudioBuffer', async () => {
    const mp3File = await loadTestFile('test.mp3')
    const { decode } = useAudioDecoder()
    
    const buffer = await decode(mp3File)
    
    expect(buffer).toBeDefined()
    expect(buffer.duration).toBeGreaterThan(0)
    expect(buffer.sampleRate).toBeGreaterThan(0)
    expect(buffer.numberOfChannels).toBeGreaterThan(0)
  })
  
  it('应在解码过程中报告进度', async () => {
    const mp3File = await loadTestFile('test.mp3')
    const { decode } = useAudioDecoder()
    const onProgress = vi.fn()
    
    await decode(mp3File, { onProgress })
    
    expect(onProgress).toHaveBeenCalled()
    expect(onProgress).toHaveBeenLastCalledWith(100)
  })
  
  it('应拒绝非音频文件', async () => {
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' })
    const { decode } = useAudioDecoder()
    
    await expect(decode(textFile)).rejects.toThrow('Invalid format')
  })
})

// Step 2 - GREEN (实现)
export function useAudioDecoder() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  
  async function decode(
    file: File, 
    options?: { onProgress?: (progress: number) => void }
  ): Promise<AudioBuffer> {
    // 验证文件类型
    if (!file.type.startsWith('audio/')) {
      throw new Error('Invalid format: expected audio file')
    }
    
    options?.onProgress?.(0)
    
    const arrayBuffer = await file.arrayBuffer()
    options?.onProgress?.(50)
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      options?.onProgress?.(100)
      return audioBuffer
    } catch (error) {
      throw new Error(`Decode failed: ${error}`)
    }
  }
  
  return { decode }
}

// Step 3 - REFACTOR (优化)
// - 添加取消支持
// - 添加超时处理
// - 缓存已解码的buffer
```

#### Task 2: BPM检测模块 (useBPMDetector)

```typescript
// TDD Steps:

// Step 1 - RED (测试)
describe('useBPMDetector', () => {
  it('应检测120BPM音频', async () => {
    const buffer = await loadTestAudio('metronome-120bpm.mp3')
    const { detect } = useBPMDetector()
    
    const result = await detect(buffer)
    
    expect(result.bpm).toBeCloseTo(120, 0)
    expect(result.confidence).toBeGreaterThan(0.8)
  })
  
  it('应返回置信度分数', async () => {
    const buffer = await loadTestAudio('no-drums-music.mp3')
    const { detect } = useBPMDetector()
    
    const result = await detect(buffer)
    
    expect(result.confidence).toBeLessThan(0.5)
  })
})

// Step 2 - GREEN (实现)
export function useBPMDetector() {
  async function detect(buffer: AudioBuffer): Promise<BPMResult> {
    // 提取onset
    const onsets = extractOnsets(buffer)
    
    if (onsets.length < 4) {
      return { bpm: 0, confidence: 0 }
    }
    
    // 计算间隔
    const intervals = calculateIntervals(onsets)
    
    // 自相关分析找最佳BPM
    const { bpm, confidence } = analyzeTempo(intervals)
    
    return { bpm, confidence }
  }
  
  return { detect }
}
```

#### Task 3: Onset检测模块 (useOnsetDetector)

```typescript
// TDD Steps:

// Step 1 - RED (测试)
describe('useOnsetDetector', () => {
  it('应检测节拍器的节拍点', async () => {
    const buffer = await loadTestAudio('metronome-120bpm.mp3')
    const { detect } = useOnsetDetector()
    
    const onsets = await detect(buffer, { sensitivity: 0.5 })
    
    // 10秒约20拍
    expect(onsets.length).toBeGreaterThanOrEqual(18)
    expect(onsets.length).toBeLessThanOrEqual(22)
  })
  
  it('灵敏度应影响检测结果', async () => {
    const buffer = await loadTestAudio('rock-beat-90bpm.wav')
    const { detect } = useOnsetDetector()
    
    const high = await detect(buffer, { sensitivity: 0.8 })
    const low = await detect(buffer, { sensitivity: 0.2 })
    
    expect(high.length).toBeGreaterThan(low.length)
  })
})
```

#### Task 4: 鼓点分类模块 (useDrumClassifier)

```typescript
// TDD Steps:

// Step 1 - RED (测试)
describe('useDrumClassifier', () => {
  it('应区分Kick和Snare', async () => {
    const buffer = await loadTestAudio('kick-snare-loop.wav')
    const onsetTimes = [0.0, 0.3, 0.6, 0.9] // 已知时间点
    const { classify } = useDrumClassifier()
    
    const results = await classify(buffer, onsetTimes)
    
    expect(results[0].type).toBe('kick')
    expect(results[1].type).toBe('snare')
    expect(results[2].type).toBe('kick')
    expect(results[3].type).toBe('snare')
  })
  
  it('应返回分类置信度', async () => {
    const buffer = await loadTestAudio('complex-fill.wav')
    const onsetTimes = [0.5]
    const { classify } = useDrumClassifier()
    
    const results = await classify(buffer, onsetTimes)
    
    expect(results[0].confidence).toBeGreaterThan(0)
    expect(results[0].confidence).toBeLessThanOrEqual(1)
  })
})
```

---

## 4. Project Structure

```
src/
├── components/
│   └── teaching/
│       ├── SongList.vue
│       ├── SongCard.vue
│       ├── PracticeView.vue
│       ├── CountdownOverlay.vue
│       ├── TeachingDrumKit.vue
│       ├── ScorePanel.vue
│       ├── ComboDisplay.vue
│       ├── ResultModal.vue
│       ├── JudgmentPopup.vue
│       └── mp3/
│           ├── MP3Upload.vue           # MP3上传组件
│           ├── WaveformViewer.vue      # 波形可视化
│           ├── AnalysisProgress.vue    # 分析进度
│           ├── RhythmEditor.vue        # 节奏编辑器
│           └── ClassificationReview.vue # 分类结果审查
├── composables/
│   ├── teaching/
│   │   ├── useJudgment.ts
│   │   ├── useTimingEngine.ts
│   │   └── useTeachingEngine.ts
│   └── audio/
│       ├── useAudioDecoder.ts          # 音频解码
│       ├── useBPMDetector.ts           # BPM检测
│       ├── useOnsetDetector.ts         # Onset检测
│       ├── useDrumClassifier.ts        # 鼓点分类
│       ├── useAudioAnalyzer.ts         # 音频分析整合
│       └── useWaveformRenderer.ts      # 波形渲染
├── stores/
│   ├── useTeachingStore.ts
│   ├── useProgressStore.ts
│   └── useMP3LibraryStore.ts           # MP3库管理
├── data/
│   ├── teaching-songs.ts
│   └── rhythms/
├── types/
│   ├── teaching.ts
│   └── audio.ts                        # 音频相关类型
├── constants/
│   ├── teaching.ts
│   └── audio.ts                        # 音频常量
├── utils/
│   └── audio/
│       ├── onsetDetection.ts           # onset算法
│       ├── bpmDetection.ts             # BPM算法
│       ├── drumFeatures.ts             # 特征提取
│       └── rhythmMapBuilder.ts         # 谱面生成
└── __tests__/
    ├── fixtures/
    │   ├── audio/                      # 测试音频
    │   └── fingerprints/               # 预计算指纹
    ├── unit/
    │   ├── teaching/
    │   │   ├── useJudgment.spec.ts
    │   │   └── useProgressStore.spec.ts
    │   └── audio/
    │       ├── useAudioDecoder.spec.ts
    │       ├── useBPMDetector.spec.ts
    │       ├── useOnsetDetector.spec.ts
    │       ├── useDrumClassifier.spec.ts
    │       └── algorithms/
    │           ├── onsetDetection.spec.ts
    │           ├── bpmDetection.spec.ts
    │           └── drumClassification.spec.ts
    └── integration/
        ├── teaching-flow.spec.ts
        ├── mp3-recognition.spec.ts
        └── mp3-to-practice.spec.ts
```

---

## 5. Data Schema (Extended)

### 5.1 Audio Types

```typescript
// types/audio.ts

export interface AudioDecodeResult {
  buffer: AudioBuffer
  duration: number
  sampleRate: number
  numberOfChannels: number
}

export interface BPMResult {
  bpm: number
  confidence: number
  alternativeBpms?: number[] // 备选BPM
}

export interface OnsetEvent {
  time: number        // 时间点(秒)
  strength: number    // 强度 0-1
}

export interface DrumClassification {
  time: number
  type: DrumType
  confidence: number
  confirmed: boolean  // 是否高置信度
}

export type DrumType = 'kick' | 'snare' | 'hihat' | 'crash' | 'tom' | 'other'

export interface MP3RecognitionResult {
  success: boolean
  error?: string
  bpm: number
  bpmConfidence: number
  analyzedDuration: number
  onsetCount: number
  rhythmMap: TeachingRhythmMap
  classifications: DrumClassification[]
}

export interface MP3Song {
  id: string
  title: string
  artist?: string
  fileName: string
  fileSize: number
  duration: number
  bpm: number
  createdAt: number
  rhythmMapId: string
  thumbnail?: string // 波形缩略图 data URL
}

export interface MP3Library {
  version: number
  songs: MP3Song[]
}
```

### 5.2 Audio Constants

```typescript
// constants/audio.ts

export const AUDIO_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  supportedFormats: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
  maxAnalysisDuration: 30, // 秒
  defaultSensitivity: 0.5
} as const

export const BPM_DETECTION = {
  minBPM: 60,
  maxBPM: 200,
  confidenceThreshold: 0.7
} as const

export const ONSET_DETECTION = {
  frameSize: 1024,
  hopSize: 512,
  minInterval: 0.1 // 最小间隔100ms
} as const

export const DRUM_CLASSIFICATION = {
  confidenceThreshold: 0.7,
  frequencyBands: {
    kick: { low: 20, high: 150 },
    snare: { low: 150, high: 800 },
    hihat: { low: 5000, high: 15000 }
  }
} as const
```

---

## 6. Performance Considerations

| Concern | Solution | Verification |
|---------|----------|--------------|
| 大文件解码阻塞 | Web Worker中解码 | 20MB文件解码<3s |
| 频谱分析性能 | 使用离线AudioContext | 10秒音频分析<2s |
| 波形渲染 | Canvas + 降采样 | 流畅滚动60fps |
| 内存管理 | 及时释放AudioBuffer | 无内存泄漏 |

---

## 7. Checklist Before Coding

- [ ] Product Spec 中的验收标准已明确
- [ ] 测试音频文件已准备
- [ ] 预计算指纹数据已验证
- [ ] TDD任务已拆解到Task Spec
- [ ] 音频算法边界条件已定义
