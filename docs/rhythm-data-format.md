# Drum App 练习曲库 - 数据格式说明

## 数据格式规范

### RhythmMap 接口

```typescript
interface RhythmMap {
  id: string                    // 唯一标识符
  title: string                 // 中文标题
  titleEn: string               // 英文标题
  bpm: number                   // 节拍速度
  duration: number              // 总时长（秒）
  beats: Beat[]                 // 节拍数据数组
  style: 'rock' | 'pop' | 'electronic'  // 音乐风格
  description: string           // 课程描述
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  lessonInfo: LessonInfo        // 教学信息
}
```

### Beat 接口

```typescript
interface Beat {
  time: number      // 时间（秒，从0开始）
  drum: string      // 鼓件ID
  label?: string    // 节拍标签（1, 2, 3, 4, &, e, a等）
  isEnd?: boolean   // 是否为结束拍
}
```

### LessonInfo 接口

```typescript
interface LessonInfo {
  lessonNumber: number          // 课程编号
  objective: string             // 学习目标
  tips: string[]                // 练习提示
  targetDrums: string[]         // 目标鼓件
  prerequisites?: string[]      // 前置课程ID
}
```

---

## 课程数据概览

### 入门级别 (Beginner) - 4首

| ID | 标题 | BPM | 时长 | 主要技能 |
|----|------|-----|------|----------|
| beginner-basic-01 | 第一课：基础四分音符 | 60 | 16s | Kick, Snare |
| beginner-hihat-02 | 第二课：加入踩镲 | 60 | 16s | + HiHat |
| beginner-rest-03 | 第三课：加入休止符 | 60 | 16s | Rest Notes |
| beginner-fill-04 | 第四课：简单加花 | 60 | 16s | Tom Fill |

### 初级级别 (Elementary) - 3首

| ID | 标题 | BPM | 时长 | 主要技能 |
|----|------|-----|------|----------|
| elementary-eighth-05 | 第五课：八分音符入门 | 70 | 16s | 8th Notes |
| elementary-open-hihat-06 | 第六课：开放踩镲技巧 | 75 | 16s | Open HiHat |
| elementary-fill-07 | 第七课：基础填充练习 | 80 | 24s | 2拍/4拍填充 |

### 中级级别 (Intermediate) - 2首

| ID | 标题 | BPM | 时长 | 主要技能 |
|----|------|-----|------|----------|
| intermediate-sixteenth-08 | 第八课：十六分音符组合 | 85 | 16s | 16th Notes |
| intermediate-complex-fill-09 | 第九课：复杂填充与过门 | 90 | 24s | Linear Fills |

### 进阶级别 (Advanced) - 1首

| ID | 标题 | BPM | 时长 | 主要技能 |
|----|------|-----|------|----------|
| advanced-masterclass-10 | 第十课：综合技巧大师课 | 100 | 32s | Comprehensive |

---

## 节拍计算公式

### 基础时间计算

```
一拍时长 = 60 / BPM (秒)

例如:
- BPM 60: 一拍 = 1.0 秒
- BPM 70: 一拍 = 0.857 秒
- BPM 80: 一拍 = 0.75 秒
- BPM 90: 一拍 = 0.667 秒
- BPM 100: 一拍 = 0.6 秒
```

### 音符时值

| 音符类型 | 时值比例 | BPM 60 | BPM 80 | BPM 100 |
|----------|----------|--------|--------|---------|
| 四分音符 | 1 拍 | 1.0s | 0.75s | 0.6s |
| 八分音符 | 1/2 拍 | 0.5s | 0.375s | 0.3s |
| 十六分音符 | 1/4 拍 | 0.25s | 0.1875s | 0.15s |

### 计算示例 (BPM 85)

```
一拍时长 = 60 / 85 ≈ 0.706 秒
八分音符 = 0.706 / 2 ≈ 0.353 秒
十六分音符 = 0.706 / 4 ≈ 0.176 秒
```

---

## 鼓件ID列表

| ID | 名称 | 中文名 | 按键 |
|----|------|--------|------|
| kick | Kick | 底鼓 | A |
| snare | Snare | 军鼓 | S |
| hihat-closed | Hi-Hat Closed | 闭合踩镲 | D |
| hihat-open | Hi-Hat Open | 开放踩镲 | F |
| crash | Crash | 碎音镲 | G |
| tom-low | Tom Low | 低音桶鼓 | H |
| tom-mid | Tom Mid | 中音桶鼓 | J |
| tom-high | Tom High | 高音桶鼓 | K |

---

## 辅助函数

### 获取课程

```typescript
// 通过ID获取课程
getLessonById(id: string): RhythmMap | undefined

// 按难度获取课程
getBeginnerLessons(): RhythmMap[]
getElementaryLessons(): RhythmMap[]
getIntermediateLessons(): RhythmMap[]
getAdvancedLessons(): RhythmMap[]
getLessonsByDifficulty(difficulty: string): RhythmMap[]

// 获取统计信息
getTotalLessonCount(): number
getLessonProgress(completedLessons: string[]): LessonProgress
```

---

## 数据验证清单

- [x] 所有课程ID唯一
- [x] 时间戳精确到小数点后3位
- [x] 每首课程有 isEnd 标记的最后一拍
- [x] 前置依赖关系正确
- [x] BPM 与难度级别匹配
- [x] 目标鼓件在可用列表中
- [x] 标签格式统一（1, 2, 3, 4, &, e, a）

---

## 扩展指南

### 添加新课程

1. 在 `lessons/index.ts` 中创建新的 RhythmMap 对象
2. 确保ID唯一且符合命名规范
3. 计算正确的时间戳（基于BPM）
4. 添加到 LESSON_MAPS 数组
5. 更新相关难度分类函数

### 命名规范

```
{difficulty}-{topic}-{number}

示例:
- beginner-basic-01
- elementary-eighth-05
- intermediate-sixteenth-08
- advanced-masterclass-10
```

### 时间戳计算工具函数

```typescript
// 计算指定BPM下的拍子时间
function calculateBeatTime(bpm: number, beat: number, subdivision = 1): number {
  const beatDuration = 60 / bpm
  return beat * beatDuration / subdivision
}

// 计算小节时间
function calculateBarTime(bpm: number, bar: number, beatsPerBar = 4): number {
  const beatDuration = 60 / bpm
  return bar * beatsPerBar * beatDuration
}
```
