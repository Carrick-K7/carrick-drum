# Drum App v1.0.0 - Task Spec

> **PTT Version**: V3  
> **Last Updated**: 2026-02-09  
> **Status**: Ready for Development  
> **Carrick Team Track (CTT) Format**

---

## Milestones

| 编号 | 目标 | 交付件 | 状态 | 截止 |
|:---:|:---|:---|:---:|:---:|
| M1 | 基础设施 | 类型定义, 常量, 练习曲数据 | ⏳ 待开发 | 待定 |
| M2 | 核心逻辑 | 判定系统, 进度存储, 计时引擎 | ⏳ 待开发 | 待定 |
| M3 | UI组件 | 练习曲列表, 教学鼓组, 评分面板 | ⏳ 待开发 | 待定 |
| M4 | 集成测试 | 完整流程测试, 性能优化 | ⏳ 待开发 | 待定 |
| M5 | 部署上线 | 生产部署, Carrick验收 | ⏳ 待开发 | 待定 |

**当前里程碑:** M1 准备开发 ⏳

---

## 1. System Context (系统上下文)

### 1.1 Current Status
- **项目**: Drum App v1.0.0
- **当前阶段**: Milestone 1 - 教学模式开发准备
- **版本目标**: v1.0.0 (含教学模式)
- **预计工期**: 10-12 个工作日
- **里程碑**: M1 (基础设施) → M2 (核心逻辑) → M3 (UI) → M4 (测试) → M5 (发布)

### 1.2 Context History
| 里程碑 | 状态 | 关键交付件 |
|:---|:---:|:---|
| 基础功能 | ✅ 已完成 | 基础音频播放, 鼓垫UI, 多鼓件支持 |
| 音频系统 | ✅ 已完成 | 音频系统集成, 自由演奏模式 |
| 教学模式 | 🔄 待启动 | 判定系统, 10首练习曲, 进度解锁, 游戏化评分 |
| 部署上线 | ⏳ 待启动 | 生产部署, 域名配置 |

### 1.3 Completed Context
- ✅ Vue 3 + TypeScript + Pinia 基础架构
- ✅ Web Audio API 音频系统
- ✅ 鼓垫组件 (DrumPad.vue)
- ✅ 基础路由和状态管理
- ✅ 自由演奏模式

---

## 2. Active Task (当前焦点任务)

### Task: 教学模式核心系统开发

**范围**: 完成教学模式的完整功能实现，包括判定系统、进度存储、UI组件  
**负责人**: TBD  
**时间**: 10-12个工作日  

---

## 3. TDD Task Breakdown (TDD任务拆解)

### 3.1 Milestone 1: 基础设施 (第1-2天)

#### Task 1.1: 类型定义 [P0]
**文档**: `src/types/teaching.ts`

**TDD Steps**:
```
Step 1 (RED): 
  - 无需测试，纯类型定义

Step 2 (GREEN):
  [ ] 创建 TeachingSong 接口
  [ ] 创建 PracticeSession 接口
  [ ] 创建 PracticeStats 接口
  [ ] 创建 JudgmentRecord 接口
  [ ] 创建 UserTeachingProgress 接口
  [ ] 导出所有类型到 index.ts

Step 3 (REFACTOR):
  [ ] 类型命名检查
  [ ] 字段注释完善
```

**验收标准**:
- [ ] 所有类型可在组件中正确导入
- [ ] 类型检查通过 `vue-tsc --noEmit`

---

#### Task 1.2: 常量定义 [P0]
**文档**: `src/constants/teaching.ts`

**TDD Steps**:
```
Step 1 (RED):
  - 无需测试，纯常量定义

Step 2 (GREEN):
  [ ] JUDGMENT_WINDOWS: perfect=50, good=100, miss=150
  [ ] COMBO_MULTIPLIERS: 0→1.0, 10→1.1, 30→1.2, 50→1.5, 100→2.0
  [ ] GRADE_THRESHOLDS: S=95, A=85, B=70, C=50, D=0
  [ ] COUNTDOWN_SECONDS = 3
  [ ] PREVIEW_ADVANCE_MS = 500

Step 3 (REFACTOR):
  [ ] 使用 as const 确保类型安全
```

**验收标准**:
- [ ] 常量值与 Product Spec 一致
- [ ] TypeScript 类型推断正确

---

#### Task 1.3: 练习曲数据 [P0]
**文档**: `src/data/teaching-songs.ts`, `src/data/rhythms/*.ts`

**TDD Steps**:
```
Step 1 (RED):
  - 创建测试验证数据格式
  - test: 检查每首歌曲有完整字段

Step 2 (GREEN):
  [ ] 定义 TEACHING_SONGS 数组 (10首)
  [ ] 初级3首: 基础四分音符(60), 简单交替(65), 入门摇滚(70)
  [ ] 中级4首: 八分音符入门(80), 底鼓变化(85), 流行节奏(90), 加入Tom(100)
  [ ] 高级3首: 快速踩镲(110), 复杂过门(115), 大师挑战(120)
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

### 3.2 Milestone 2: 核心逻辑 (第3-5天)

#### Task 2.1: 判定系统 [P0] ⚡ CRITICAL
**文档**: `src/composables/useJudgment.ts`  
**测试**: `src/__tests__/unit/useJudgment.spec.ts`

**TDD Steps**:
```
Step 1 (RED) - 编写失败测试:
  [ ] test: judgeHit(40ms, 0ms) → 'perfect'
  [ ] test: judgeHit(50ms, 0ms) → 'perfect' (边界)
  [ ] test: judgeHit(75ms, 0ms) → 'good'
  [ ] test: judgeHit(100ms, 0ms) → 'good' (边界)
  [ ] test: judgeHit(120ms, 0ms) → 'miss'
  [ ] test: judgeHit(150ms, 0ms) → 'miss' (边界)
  [ ] test: judgeHit(200ms, 0ms) → 'none'
  [ ] test: calculateAccuracy(P=8,G=2,M=0,Total=10) → 87%
  [ ] test: calculateGrade(95) → 'S'
  [ ] test: calculateGrade(85) → 'A'
  [ ] test: getComboMultiplier(15) → 1.1
  [ ] test: getComboMultiplier(75) → 1.5
  [ ] test: findNearestBeat 正确返回最近音符

Step 2 (GREEN) - 实现代码:
  [ ] 实现 judgeHit() 函数
  [ ] 实现 findNearestBeat() 函数
  [ ] 实现 calculateAccuracy() 函数
  [ ] 实现 calculateGrade() 函数
  [ ] 实现 getComboMultiplier() 函数

Step 3 (REFACTOR) - 重构:
  [ ] 提取边界值为常量
  [ ] 优化查找算法(二分搜索)
  [ ] 添加函数注释
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] 覆盖率 >90%
- [ ] 边界值正确处理

---

#### Task 2.2: 进度存储 [P0]
**文档**: `src/stores/useProgressStore.ts`  
**测试**: `src/__tests__/unit/useProgressStore.spec.ts`

**TDD Steps**:
```
Step 1 (RED) - 编写失败测试:
  [ ] test: song-01 默认解锁
  [ ] test: song-02 初始状态锁定
  [ ] test: song-01达到C级后song-02解锁
  [ ] test: 慢速默认解锁
  [ ] test: 慢速C级解锁标准速度
  [ ] test: 标准B级解锁快速
  [ ] test: 新结果优于旧结果时更新
  [ ] test: 新结果差于旧结果时保持
  [ ] test: localStorage 正确持久化

Step 2 (GREEN) - 实现代码:
  [ ] 实现 progress state
  [ ] 实现 isSongUnlocked getter
  [ ] 实现 canUnlockSpeed getter
  [ ] 实现 loadProgress action
  [ ] 实现 saveProgress action
  [ ] 实现 updateSongResult action
  [ ] 实现 checkUnlocks logic

Step 3 (REFACTOR) - 重构:
  [ ] 提取解锁检查逻辑为独立函数
  [ ] 优化localStorage操作
  [ ] 添加错误处理
```

**验收标准**:
- [ ] 所有测试用例通过
- [ ] localStorage 数据正确读写
- [ ] 解锁逻辑与 Product Spec 一致

---

#### Task 2.3: 计时引擎 [P0]
**文档**: `src/composables/useTimingEngine.ts`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: init后currentTime为0
  [ ] test: start后currentTime递增
  [ ] test: pause后currentTime停止
  [ ] test: resume后currentTime继续
  [ ] test: stop后重置为0

Step 2 (GREEN):
  [ ] 实现基于 AudioContext 的计时
  [ ] 实现 start/pause/resume/stop
  [ ] 处理暂停时间补偿

Step 3 (REFACTOR):
  [ ] 提取计时逻辑为独立函数
```

**验收标准**:
- [ ] 计时精度 <10ms
- [ ] 暂停/恢复无漂移

---

#### Task 2.4: 教学状态管理 [P0]
**文档**: `src/stores/useTeachingStore.ts`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: 初始状态为'select'
  [ ] test: selectSong后phase变为'prepare'
  [ ] test: startPractice后phase变为'playing'
  [ ] test: recordHit更新stats
  [ ] test: finishPractice后phase变为'reult'

Step 2 (GREEN):
  [ ] 实现 state (phase, selectedSongId, selectedSpeed, session)
  [ ] 实现 getters (selectedSong, currentBpm, isPlaying)
  [ ] 实现 actions (selectSong, startPractice, recordHit, etc.)
  [ ] 集成 useJudgment 进行判定

Step 3 (REFACTOR):
  [ ] 拆分复杂actions
  [ ] 添加状态转换守卫
```

**验收标准**:
- [ ] 状态流转正确
- [ ] 与 progressStore 联动

---

### 3.3 Milestone 3: UI组件 (第6-8天)

#### Task 3.1: 练习曲列表 [P0]
**文档**: `src/components/teaching/SongList.vue`, `SongCard.vue`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: 渲染所有练习曲卡片
  [ ] test: 锁定曲目显示锁图标
  [ ] test: 解锁曲目可点击
  [ ] test: 点击触发selectSong

Step 2 (GREEN):
  [ ] 实现 SongCard 组件
  [ ] 实现 SongList 网格布局
  [ ] 集成 progressStore 显示进度
  [ ] 处理点击事件

Step 3 (REFACTOR):
  [ ] 提取卡片样式为复用类
```

**验收标准**:
- [ ] 10首曲目正确显示
- [ ] 解锁状态与进度一致

---

#### Task 3.2: 教学鼓组 [P0]
**文档**: `src/components/teaching/TeachingDrumKit.vue`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: 预览状态显示黄色高亮
  [ ] test: 敲击时刻显示绿色
  [ ] test: 正确反馈显示绿色闪烁
  [ ] test: 错误反馈显示红色闪烁

Step 2 (GREEN):
  [ ] 扩展 DrumKit 组件
  [ ] 实现 preview 状态样式
  [ ] 实现 hit 状态样式
  [ ] 实现反馈动画

Step 3 (REFACTOR):
  [ ] 使用CSS变量管理颜色
  [ ] 优化动画性能
```

**验收标准**:
- [ ] 视觉提示提前500ms显示
- [ ] 动画流畅60fps

---

#### Task 3.3: 评分面板 [P0]
**文档**: `src/components/teaching/ScorePanel.vue`, `ComboDisplay.vue`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: Combo数字正确显示
  [ ] test: 准确率进度条正确
  [ ] test: 10/50/100 milestone特效

Step 2 (GREEN):
  [ ] 实现 ComboDisplay
  [ ] 实现 AccuracyBar
  [ ] 实现 ScorePanel 整合

Step 3 (REFACTOR):
  [ ] 节流准确率更新
```

**验收标准**:
- [ ] 实时更新 Combo 和准确率
- [ ] milestone 动画正常

---

#### Task 3.4: 结算界面 [P0]
**文档**: `src/components/teaching/ResultModal.vue`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: 正确显示评级徽章
  [ ] test: 显示详细统计
  [ ] test: 新记录高亮提示

Step 2 (GREEN):
  [ ] 实现评级徽章显示
  [ ] 实现统计数据展示
  [ ] 实现按钮交互

Step 3 (REFACTOR):
  [ ] 提取统计卡片组件
```

**验收标准**:
- [ ] 评级与准确率对应正确
- [ ] 统计数据完整

---

### 3.4 Milestone 4: 集成测试 (第9-10天)

#### Task 4.1: 完整流程测试 [P0]
**文档**: `src/__tests__/integration/teaching-flow.spec.ts`

**TDD Steps**:
```
Step 1 (RED):
  [ ] test: 完整练习流程 (选择→准备→演奏→结算)
  [ ] test: 暂停/恢复功能
  [ ] test: 中途退出处理
  [ ] test: 解锁机制验证

Step 2 (GREEN):
  [ ] 编写集成测试
  [ ] 修复发现的问题

Step 3 (REFACTOR):
  [ ] 优化测试性能
```

**验收标准**:
- [ ] 所有集成测试通过
- [ ] 无回归bug

---

## 4. Backlog (待办事项)

### P1 - 增强功能
- [ ] 音频节拍器合成 (useMetronome)
- [ ] 倒计时音效
- [ ] 详细结算统计
- [ ] 下一首快捷按钮

### P2 - 优化
- [ ] 低性能设备降级
- [ ] 音频延迟校准
- [ ] 后台自动暂停
- [ ] 错误边界处理

### 后续迭代
- [ ] 自定义练习模式
- [ ] 社区分享
- [ ] 排行榜系统

---

## 5. Test Coverage Checklist (测试覆盖清单)

### 5.1 单元测试
| Module | Test File | Coverage Target | Status |
|--------|-----------|-----------------|--------|
| useJudgment | useJudgment.spec.ts | 95% | ⏳ Pending |
| useProgressStore | useProgressStore.spec.ts | 90% | ⏳ Pending |
| useTimingEngine | useTimingEngine.spec.ts | 85% | ⏳ Pending |
| Constants | constants.spec.ts | 100% | ⏳ Pending |

### 5.2 集成测试
| Flow | Test File | Status |
|------|-----------|--------|
| 完整练习流程 | teaching-flow.spec.ts | ⏳ Pending |
| 解锁机制 | unlock-flow.spec.ts | ⏳ Pending |
| 状态管理 | state-management.spec.ts | ⏳ Pending |

### 5.3 组件测试
| Component | Test File | Status |
|-----------|-----------|--------|
| SongList | SongList.spec.ts | ⏳ Pending |
| PracticeView | PracticeView.spec.ts | ⏳ Pending |
| ResultModal | ResultModal.spec.ts | ⏳ Pending |

---

## 6. Definition of Done (完成定义)

一个任务完成需要满足:
- [ ] 所有TDD步骤完成 (Red → Green → Refactor)
- [ ] 单元测试通过且覆盖率达标
- [ ] 代码通过 ESLint + TypeScript 检查
- [ ] 手动测试验证功能正常
- [ ] 相关文档已更新

一个里程碑完成需要满足:
- [ ] 该里程碑所有任务完成
- [ ] 集成测试通过
- [ ] 无P0/P1级别bug
- [ ] 性能指标达标

---

## 7. Risk Tracking (风险跟踪)

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| 音频时间精度不足 | Medium | High | 使用AudioContext time | 🟡 Open |
| 低端设备性能问题 | Medium | Medium | 准备降级策略 | 🟡 Open |
| 节奏数据制作耗时 | High | Medium | 先完成前5首 | 🟡 Open |
| 测试覆盖不足 | Low | High | 强制TDD流程 | 🟢 Mitigated |

---

## 8. Daily Standup Template (每日站会模板)

```
## [日期] 进度更新

### 昨日完成
- Task X.Y: [内容] (状态: Done/In Progress)

### 今日计划
- Task X.Y: [内容] (预计工时: Xh)

### 阻塞/风险
- [问题描述] (需要: [帮助/决策])

### 测试状态
- 单元测试: X/Y 通过
- 覆盖率: XX%
```
