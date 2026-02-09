# Drum App Phase 5 V2: Task Spec

> **PTT Version**: 2.0  
> **Last Updated**: 2026-02-08  
> **Status**: Ready for Development

---

## 1. System Context

### 1.1 Current Phase
- **阶段**: Phase 5 V2 - 教学模式 + MP3识别
- **版本目标**: v1.5.0
- **预计工期**: 15-18 个工作日
- **里程碑**: 
  - M1: 教学模式核心 (第1-6天)
  - M2: 音频识别核心 (第7-12天)
  - M3: UI整合与优化 (第13-15天)
  - M4: 测试与验收 (第16-18天)

### 1.2 依赖关系
```
M1 教学模式核心
├── Task 1.1 ~ 1.3: 基础设施
├── Task 2.1 ~ 2.4: 核心逻辑
└── Task 3.1 ~ 3.4: UI组件

M2 音频识别核心
├── Task 4.1 ~ 4.4: 音频处理 (依赖 M1基础设施)
└── Task 5.1 ~ 5.3: 识别算法 (依赖 Task 4.1)

M3 UI整合
├── Task 6.1 ~ 6.4: MP3识别UI (依赖 M1+M2)
└── Task 7.1: 教学模式增强

M4 测试验收
└── Task 8.1 ~ 8.3: 全面测试
```

---

## 2. TDD Task Breakdown (TDD任务拆解)

### Milestone 1: 教学模式核心 (第1-6天)

---

#### Task 1.1: 类型定义与常量 [P0]
**预计时间**: 0.5天  
**负责人**: TBD

**TDD Steps**:
```
Step 1 (RED):
  - 无需测试，纯类型定义
  - 验证类型编译通过

Step 2 (GREEN):
  [✓] 创建 src/types/teaching.ts
      - TeachingSong, TeachingBeat, PracticeSession
      - PracticeStats, JudgmentRecord, UserTeachingProgress
  [✓] 创建 src/types/audio.ts
      - AudioDecodeResult, BPMResult, OnsetEvent
      - DrumClassification, MP3Song, MP3Library
  [✓] 创建 src/constants/teaching.ts
      - JUDGMENT_WINDOWS, COMBO_MULTIPLIERS, GRADE_THRESHOLDS
  [✓] 创建 src/constants/audio.ts
      - AUDIO_CONSTRAINTS, BPM_DETECTION, ONSET_DETECTION

Step 3 (REFACTOR):
  [ ] 添加 JSDoc 注释
  [ ] 验证所有类型可正确导入
  [ ] 运行 vue-tsc --noEmit 确保无类型错误
```

**验收标准 (AC)**:
- [ ] 所有类型可在组件中正确导入
- [ ] 类型检查通过 `vue-tsc --noEmit`
- [ ] 常量值与 Product Spec 完全一致

**测试文件**:
```typescript
// __tests__/unit/types/teaching.spec.ts
import type { TeachingSong, PracticeStats } from '@/types/teaching'

describe('Teaching Types', () => {
  it('TeachingSong类型应可赋值', () => {
    const song: TeachingSong = {
      id: 'test',
      order: 1,
      title: '测试',
      difficulty: 'beginner',
      baseBpm: 100,
      // ...
    }
    expect(song.id).toBe('test')
  })
})
```

---

#### Task 1.2: 练习曲数据 [P0]
**预计时间**: 0.5天  
**依赖**: Task 1.1

**TDD Steps**:
```
Step 1 (RED):
  [ ] 创建测试验证数据格式
      test: 检查每首歌曲有完整字段
      test: 验证时间戳按升序排列
      test: 验证相邻音符间隔 >= 100ms

Step 2 (GREEN):
  [ ] 定义 TEACHING_SONGS 数组 (10首)
      - 初级3首: 基础四分音符(60), 简单交替(65), 入门摇滚(70)
      - 中级4首: 八分音符入门(80), 底鼓变化(85), 流行节奏(90), 加入Tom(100)
      - 高级3首: 快速踩镲(110), 复杂过门(115), 大师挑战(120)
  [ ] 每首配置 speeds (slow/normal/fast)
  [ ] 配置 unlockRequirement
  [ ] 创建前3首节奏数据文件

Step 3 (REFACTOR):
  [ ] 数据验证函数
  [ ] 类型守卫检查
```

**验收标准**:
- [ ] 10首练习曲元数据完整
- [ ] 节奏数据时间戳准确
- [ ] 解锁条件配置正确

---

#### Task 1.3: Vitest测试配置 [P0]
**预计时间**: 0.5天  
**依赖**: Task 1.1

**TDD Steps**:
```
Step 1 (RED):
  [ ] 运行 npm run test 应失败(无配置)

Step 2 (GREEN):
  [ ] 安装 vitest, @vue/test-utils, jsdom, @vitest/coverage-v8
  [ ] 创建 vitest.config.ts
  [ ] 配置 coverage thresholds (lines: 80, functions: 80)
  [ ] 创建测试工具函数 (renderWithPinia等)

Step 3 (REFACTOR):
  [ ] 配置测试别名 (@/指向src)
  [ ] 设置全局mocks (AudioContext等)
```

**验收标准**:
- [ ] `npm run test` 可运行
- [ ] 基础组件测试可通过

---

#### Task 2.1: 判定系统 useJudgment [P0] ⚡ CRITICAL
**预计时间**: 1.5天  
**依赖**: Task 1.1, Task 1.3

**TDD Steps**:
```
Step 1 (RED) - 编写失败测试:
  [✓] test: judgeHit(40ms, 0ms) → 'perfect'
  [✓] test: judgeHit(50ms, 0ms) → 'perfect' (边界)
  [✓] test: judgeHit(75ms, 0ms) → 'good'
  [✓] test: judgeHit(100ms, 0ms) → 'good' (边界)
  [✓] test: judgeHit(120ms, 0ms) → 'miss'
  [✓] test: judgeHit(150ms, 0ms) → 'miss' (边界)
  [✓] test: judgeHit(200ms, 0ms) → 'none'
  [✓] test: 提前敲击(-200ms) → 'none'
  [✓] test: calculateAccuracy(P=8,G=2,M=0,Total=10) → 87%
  [✓] test: calculateAccuracy(P=10,G=0,M=0,Total=10) → 100%
  [✓] test: calculateGrade(95) → 'S'
  [✓] test: calculateGrade(85) → 'A'
  [✓] test: calculateGrade(84) → 'B'
  [✓] test: getComboMultiplier(15) → 1.1
  [✓] test: getComboMultiplier(75) → 1.5
  [✓] test: getComboMultiplier(150) → 2.0
  [✓] test: findNearestBeat 正确返回最近音符
  [✓] test: findNearestBeat 超出窗口返回null

Step 2 (GREEN) - 实现代码:
  [ ] 实现 judgeHit(actualTime, expectedTime): HitJudgment
  [ ] 实现 findNearestBeat(currentTime, beats, windowMs): TimedBeat | null
  [ ] 实现 calculateAccuracy(stats): number
  [ ] 实现 calculateGrade(accuracy): Grade
  [ ] 实现 getComboMultiplier(combo): number

Step 3 (REFACTOR) - 重构:
  [ ] 提取边界值为常量
  [ ] 优化查找算法(二分搜索)
  [ ] 添加函数JSDoc注释
  [ ] 确保测试覆盖率 >95%
```

**测试文件**: `src/__tests__/unit/composables/useJudgment.spec.ts`

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 覆盖率 >95%
- [ ] 边界值正确处理 (±1ms精度)

---

#### Task 2.2: 进度存储 useProgressStore [P0]
**预计时间**: 1天  
**依赖**: Task 1.1, Task 1.2

**TDD Steps**:
```
Step 1 (RED) - 编写失败测试:
  [✓] test: song-01 默认解锁
  [✓] test: song-02 初始状态锁定
  [✓] test: song-01达到C级后song-02解锁
  [✓] test: 中级解锁: 全部初级平均B级以上
  [✓] test: 高级解锁: 全部中级平均A级以上
  [✓] test: 慢速默认解锁
  [✓] test: 慢速C级解锁标准速度
  [✓] test: 标准B级解锁快速
  [✓] test: 新结果优于旧结果时更新
  [✓] test: 新结果差于旧结果时保持
  [✓] test: localStorage 正确持久化
  [✓] test: 数据版本迁移处理

Step 2 (GREEN) - 实现代码:
  [ ] 实现 progress state (UserTeachingProgress)
  [ ] 实现 isSongUnlocked(songId): boolean
  [ ] 实现 canUnlockSpeed(songId, speed): boolean
  [ ] 实现 loadProgress() action
  [ ] 实现 saveProgress() action
  [ ] 实现 updateSongResult(result) action
  [ ] 实现 checkUnlocks() 逻辑

Step 3 (REFACTOR) - 重构:
  [ ] 提取解锁检查逻辑为纯函数
  [ ] 优化localStorage操作(防抖)
  [ ] 添加错误处理(存储满等)
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] localStorage 数据正确读写
- [ ] 解锁逻辑与 Product Spec 完全一致

---

#### Task 2.3: 计时引擎 useTimingEngine [P0]
**预计时间**: 1天  
**依赖**: Task 1.3

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: init后currentTime为0
  [✓] test: start后currentTime递增
  [✓] test: pause后currentTime停止
  [✓] test: resume后currentTime继续
  [✓] test: stop后重置为0
  [✓] test: 多次pause/resume无漂移

Step 2 (GREEN):
  [ ] 实现基于 AudioContext 的计时
  [ ] 实现 init/start/pause/resume/stop
  [ ] 处理暂停时间补偿

Step 3 (REFACTOR):
  [ ] 提取计时逻辑为独立纯函数
  [ ] 添加精度验证测试
```

**验收标准**:
- [ ] 计时精度 <10ms
- [ ] 暂停/恢复无时间漂移

---

#### Task 2.4: 教学状态管理 useTeachingStore [P0]
**预计时间**: 1.5天  
**依赖**: Task 2.1, Task 2.2, Task 2.3

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 初始状态为'select'
  [✓] test: selectSong后phase变为'prepare'
  [✓] test: startPractice后phase变为'playing'
  [✓] test: pause后phase变为'paused'
  [✓] test: resume后phase回到'playing'
  [✓] test: recordHit更新stats
  [✓] test: recordHit触发判定
  [✓] test: finishPractice后phase变为'result'
  [✓] test: finishPractice保存到progressStore

Step 2 (GREEN):
  [ ] 实现 state (phase, selectedSongId, selectedSpeed, session)
  [ ] 实现 getters (selectedSong, currentBpm, isPlaying, stats)
  [ ] 实现 actions (selectSong, startPractice, pause, resume, stop, recordHit, finishPractice)
  [ ] 集成 useJudgment 进行判定
  [ ] 集成 useProgressStore 保存结果

Step 3 (REFACTOR):
  [ ] 拆分复杂actions
  [ ] 添加状态转换守卫
  [ ] 添加错误处理
```

**验收标准**:
- [ ] 状态流转正确 (select → prepare → countdown → playing → result)
- [ ] 与 progressStore 联动保存
- [ ] 判定系统正确集成

---

#### Task 3.1: 练习曲列表组件 [P0]
**预计时间**: 1天  
**依赖**: Task 2.2

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: SongCard渲染标题、BPM、最佳评级
  [✓] test: 锁定曲目显示锁图标
  [✓] test: 锁定曲目不可点击
  [✓] test: 解锁曲目显示可点击样式
  [✓] test: 点击解锁曲目触发selectSong
  [✓] test: SongList正确渲染网格布局
  [✓] test: 按难度分组显示

Step 2 (GREEN):
  [ ] 实现 SongCard.vue 组件
  [ ] 实现 SongList.vue 组件
  [ ] 集成 progressStore 获取解锁状态
  [ ] 处理点击事件emit

Step 3 (REFACTOR):
  [ ] 提取卡片样式为可复用class
  [ ] 添加加载状态
```

**验收标准**:
- [ ] 10首曲目正确显示
- [ ] 解锁状态与进度一致
- [ ] 点击交互正常

---

#### Task 3.2: 教学鼓组组件 [P0]
**预计时间**: 1天  
**依赖**: Task 2.4

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 渲染所有鼓件(Kick,Snare,HiHat...)
  [✓] test: 预览状态显示黄色高亮
  [✓] test: 正确敲击显示绿色反馈
  [✓] test: 错误敲击显示红色反馈
  [✓] test: 击打时触发hit事件
  [✓] test: Combo达到10/50/100显示特效

Step 2 (GREEN):
  [ ] 实现 TeachingDrumKit.vue
  [ ] 实现鼓件高亮状态管理
  [ ] 实现击打反馈动画
  [ ] 集成 TeachingStore 获取状态

Step 3 (REFACTOR):
  [ ] 使用CSS变量管理颜色
  [ ] 优化动画性能(will-change)
```

**验收标准**:
- [ ] 视觉提示提前500ms显示
- [ ] 动画流畅60fps
- [ ] 反馈及时(<50ms延迟)

---

#### Task 3.3: 评分面板组件 [P0]
**预计时间**: 0.5天  
**依赖**: Task 2.4

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: Combo数字正确显示
  [✓] test: Combo变化时动画
  [✓] test: 准确率进度条正确渲染
  [✓] test: 准确率实时更新
  [✓] test: 10/50/100 milestone显示特效

Step 2 (GREEN):
  [ ] 实现 ComboDisplay.vue
  [ ] 实现 AccuracyBar.vue
  [ ] 实现 ScorePanel.vue 整合

Step 3 (REFACTOR):
  [ ] 节流准确率更新(100ms)
```

---

#### Task 3.4: 结算界面组件 [P0]
**预计时间**: 0.5天  
**依赖**: Task 2.4

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 正确显示评级徽章(S/A/B/C/D)
  [✓] test: 显示Perfect/Good/Miss统计
  [✓] test: 显示最高Combo和准确率
  [✓] test: 新记录时显示高亮提示
  [✓] test: 点击"重试"重新开始
  [✓] test: 点击"下一首"跳转(如果解锁)
  [✓] test: 点击"返回"回到列表

Step 2 (GREEN):
  [ ] 实现 ResultModal.vue
  [ ] 实现评级徽章显示
  [ ] 实现按钮交互

Step 3 (REFACTOR):
  [ ] 提取统计卡片组件
```

---

### Milestone 2: 音频识别核心 (第7-12天)

---

#### Task 4.1: 音频解码 useAudioDecoder [P0]
**预计时间**: 1天  
**依赖**: Task 1.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 解码MP3返回AudioBuffer
  [✓] test: 解码WAV返回AudioBuffer
  [✓] test: 解码过程中触发进度回调
  [✓] test: 拒绝非音频文件
  [✓] test: 处理解码失败错误
  [✓] test: 支持取消解码

Step 2 (GREEN):
  [ ] 实现 useAudioDecoder()
  [ ] 实现 decode(file, options) 方法
  [ ] 验证文件类型
  [ ] 使用 Web Audio API decodeAudioData

Step 3 (REFACTOR):
  [ ] 使用Web Worker处理大文件
  [ ] 添加超时处理
```

**测试音频**: `src/__tests__/fixtures/audio/metronome-120bpm.mp3`

---

#### Task 4.2: BPM检测 useBPMDetector [P0]
**预计时间**: 1.5天  
**依赖**: Task 4.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 检测120BPM节拍器 (误差<1)
  [✓] test: 检测90BPM鼓点 (误差<2)
  [✓] test: 返回置信度分数
  [✓] test: 无节拍音频返回低置信度
  [✓] test: 处理双拍问题(60 vs 120)

Step 2 (GREEN):
  [ ] 实现 useBPMDetector()
  [ ] 实现 extractOnsets 辅助函数
  [ ] 实现 calculateIntervals 辅助函数
  [ ] 实现 analyzeTempo 核心算法
  [ ] 实现自相关分析

Step 3 (REFACTOR):
  [ ] 优化算法性能
  [ ] 添加备选BPM列表
```

**测试音频**: 
- `metronome-120bpm.mp3` (期望: 120±1)
- `rock-beat-90bpm.wav` (期望: 90±2)

---

#### Task 4.3: Onset检测 useOnsetDetector [P0]
**预计时间**: 1.5天  
**依赖**: Task 4.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 检测节拍器所有节拍点 (18-22个/10s)
  [✓] test: 检测间隔接近0.5s (120BPM)
  [✓] test: 灵敏度参数影响检测数量
  [✓] test: 低音量音频保持敏感度
  [✓] test: 无鼓点音频返回空或少量

Step 2 (GREEN):
  [ ] 实现 useOnsetDetector()
  [ ] 实现频谱通量计算
  [ ] 实现峰值检测
  [ ] 实现灵敏度阈值应用

Step 3 (REFACTOR):
  [ ] 优化频谱计算(使用FFT)
  [ ] 添加最小间隔过滤
```

---

#### Task 4.4: 鼓点分类 useDrumClassifier [P0]
**预计时间**: 2天  
**依赖**: Task 4.3

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 区分Kick和Snare
  [✓] test: Kick低频能量 > 高频
  [✓] test: HiHat高频能量 > 低频
  [✓] test: 返回分类置信度
  [✓] test: 高置信度标记confirmed
  [✓] test: 低置信度标记待确认

Step 2 (GREEN):
  [ ] 实现 useDrumClassifier()
  [ ] 实现 extractDrumFeatures() - 频谱特征提取
  [ ] 实现 classifyDrum() - 基于规则的分类器
  [ ] 实现 confidence scoring

Step 3 (REFACTOR):
  [ ] 优化特征提取
  [ ] 添加更多频带分析
```

---

#### Task 5.1: 音频分析整合 useAudioAnalyzer [P0]
**预计时间**: 1.5天  
**依赖**: Task 4.2, Task 4.3, Task 4.4

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 完整流程: 上传→解码→BPM→onset→分类
  [✓] test: 生成符合TeachingRhythmMap格式的结果
  [✓] test: 处理进度回调
  [✓] test: 大文件分段分析
  [✓] test: 失败时返回错误信息

Step 2 (GREEN):
  [ ] 实现 useAudioAnalyzer()
  [ ] 整合 decode + detectBPM + detectOnsets + classify
  [ ] 实现 analyze(file, options) 方法
  [ ] 实现 progress 报告

Step 3 (REFACTOR):
  [ ] 使用Web Worker处理
  [ ] 优化内存使用
```

---

#### Task 5.2: 节奏谱面生成 rhythmMapBuilder [P1]
**预计时间**: 1天  
**依赖**: Task 5.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 从分类结果生成TeachingRhythmMap
  [✓] test: 自动计算总音符数
  [✓] test: 自动计算时长
  [✓] test: 对齐到节拍网格
  [✓] test: 自动难度分级

Step 2 (GREEN):
  [ ] 实现 rhythmMapBuilder
  [ ] 实现对齐算法
  [ ] 实现难度计算
```

---

### Milestone 3: UI整合 (第13-15天)

---

#### Task 6.1: MP3上传组件 [P0]
**预计时间**: 0.5天  
**依赖**: Task 5.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 点击触发文件选择
  [✓] test: 支持拖拽上传
  [✓] test: 拒绝非音频文件
  [✓] test: 拒绝超大文件(>20MB)
  [✓] test: 显示文件信息(名称、大小)

Step 2 (GREEN):
  [ ] 实现 MP3Upload.vue
  [ ] 实现文件验证
  [ ] 实现拖拽交互
```

---

#### Task 6.2: 波形可视化组件 [P1]
**预计时间**: 1天  
**依赖**: Task 4.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 渲染音频波形
  [✓] test: 支持缩放
  [✓] test: 支持拖拽选择区域
  [✓] test: 显示选择区域时间范围

Step 2 (GREEN):
  [ ] 实现 WaveformViewer.vue
  [ ] 使用Canvas绘制波形
  [ ] 实现缩放、拖拽交互
```

---

#### Task 6.3: 分析进度组件 [P0]
**预计时间**: 0.5天  
**依赖**: Task 5.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 显示当前分析步骤
  [✓] test: 显示进度百分比
  [✓] test: 步骤完成显示✓
  [✓] test: 支持取消按钮

Step 2 (GREEN):
  [ ] 实现 AnalysisProgress.vue
```

---

#### Task 6.4: 节奏编辑组件 [P2]
**预计时间**: 1天  
**依赖**: Task 5.2, Task 6.2

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 在时间轴显示检测到的鼓点
  [✓] test: 不同鼓件用不同颜色
  [✓] test: 点击删除鼓点
  [✓] test: 点击空白处添加鼓点
  [✓] test: 支持重新识别

Step 2 (GREEN):
  [ ] 实现 RhythmEditor.vue
  [ ] 集成 WaveformViewer
  [ ] 实现编辑交互
```

---

#### Task 6.5: MP3库管理 useMP3LibraryStore [P0]
**预计时间**: 0.5天  
**依赖**: Task 5.1

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 添加MP3到库
  [✓] test: 从库中删除MP3
  [✓] test: 列出所有MP3
  [✓] test: localStorage持久化
  [✓] test: 数据版本控制

Step 2 (GREEN):
  [ ] 实现 useMP3LibraryStore
  [ ] 实现 CRUD 操作
  [ ] localStorage 持久化
```

---

#### Task 7.1: 教学模式增强 [P1]
**预计时间**: 1天  
**依赖**: M1所有任务

**TDD Steps**:
```
Step 1 (RED):
  [✓] test: 支持MP3生成的谱面练习
  [✓] test: 原唱开关
  [✓] test: 波形背景显示
  [✓] test: 节拍器音效

Step 2 (GREEN):
  [ ] 扩展 PracticeView.vue
  [ ] 集成音频播放
  [ ] 添加节拍器
```

---

### Milestone 4: 测试验收 (第16-18天)

---

#### Task 8.1: 集成测试 [P0]
**预计时间**: 1.5天  
**依赖**: M1, M2, M3

**测试场景**:
```
[✓] test: 完整教学模式流程
[✓] test: 完整MP3识别流程
[✓] test: MP3识别后练习流程
[✓] test: 解锁机制验证
[✓] test: 进度持久化验证
[✓] test: 边界条件(空音频、超大文件)
```

---

#### Task 8.2: E2E测试 [P1]
**预计时间**: 1天  
**依赖**: Task 8.1

**测试场景**:
```
[✓] test: Playwright 用户全流程
[✓] test: 多浏览器兼容性
[✓] test: 性能基准测试
```

---

#### Task 8.3: 性能优化与验收 [P0]
**预计时间**: 0.5天

**检查项**:
```
[ ] 测试覆盖率 >80%
[ ] 教学模式60fps保持
[ ] MP3分析<10s (20MB文件)
[ ] 内存无泄漏
[ ] Lighthouse性能分数>90
```

---

## 3. Test Coverage Checklist

### 单元测试目标
| Module | Test File | Coverage Target | Priority |
|--------|-----------|-----------------|----------|
| useJudgment | useJudgment.spec.ts | 95% | P0 |
| useProgressStore | useProgressStore.spec.ts | 90% | P0 |
| useTimingEngine | useTimingEngine.spec.ts | 85% | P0 |
| useTeachingStore | useTeachingStore.spec.ts | 85% | P0 |
| useAudioDecoder | useAudioDecoder.spec.ts | 90% | P0 |
| useBPMDetector | useBPMDetector.spec.ts | 85% | P0 |
| useOnsetDetector | useOnsetDetector.spec.ts | 85% | P0 |
| useDrumClassifier | useDrumClassifier.spec.ts | 80% | P0 |
| rhythmMapBuilder | rhythmMapBuilder.spec.ts | 80% | P1 |

### 集成测试目标
| Flow | Test File | Priority |
|------|-----------|----------|
| 教学模式完整流程 | teaching-flow.spec.ts | P0 |
| MP3识别完整流程 | mp3-recognition.spec.ts | P0 |
| MP3到练习流程 | mp3-to-practice.spec.ts | P0 |

---

## 4. Risk Tracking

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| 音频算法精度不足 | Medium | High | 准备fallback手动输入 | 🟡 Open |
| Web Worker兼容性 | Low | Medium | 提供降级方案 | 🟢 Mitigated |
| 大文件处理性能 | Medium | Medium | 限制分析时长 | 🟢 Mitigated |
| 低端设备性能 | Medium | Medium | 准备简化模式 | 🟡 Open |
| 节奏数据制作耗时 | High | Medium | 先完成前5首 | 🟢 Mitigated |

---

## 5. Definition of Done

### 单个任务完成标准
- [ ] 所有TDD步骤完成 (Red → Green → Refactor)
- [ ] 单元测试通过且覆盖率达标
- [ ] 代码通过 ESLint + TypeScript 检查
- [ ] 相关文档已更新

### 里程碑完成标准
- [ ] 该里程碑所有任务完成
- [ ] 集成测试通过
- [ ] 无P0级别bug
- [ ] 性能指标达标

### 整体项目完成标准
- [ ] 所有里程碑完成
- [ ] E2E测试通过
- [ ] 测试覆盖率 >80%
- [ ] Lighthouse性能分数 >90
- [ ] 文档完整更新
