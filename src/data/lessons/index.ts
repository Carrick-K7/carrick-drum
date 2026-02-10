import type { RhythmMap, Beat } from '../../types'

export type { RhythmMap, Beat }

/**
 * 第一首练习曲 - 基础四分音符
 * 
 * 特点：
 * - BPM 60（每拍1秒，适合初学者）
 * - 仅使用 kick 和 snare
 * - 简单的 4/4 拍节奏
 * - 4小节，共16拍
 * 
 * 节奏模式：
 * 第1拍: Kick (重拍)
 * 第2拍: Snare (弱拍)
 * 第3拍: Kick (重拍)
 * 第4拍: Snare (弱拍)
 * 
 * 教学提示：
 * - 左右手交替击打
 * - 保持稳定的节奏
 * - 每个鼓点都有视觉提示
 */
export const beginnerBasicRhythm: RhythmMap = {
  id: 'beginner-basic-01',
  title: '第一课：基础四分音符',
  titleEn: 'Lesson 1: Basic Quarter Notes',
  bpm: 60,
  duration: 16, // 16秒 (4小节 × 4拍 × 1秒)
  style: 'pop',
  description: '最简单的入门节奏，BPM 60，仅使用底鼓和军鼓，练习稳定的基本拍',
  difficulty: 'beginner',
  lessonInfo: {
    lessonNumber: 1,
    objective: '掌握稳定的四分音符节奏',
    tips: [
      '左脚跟随节拍轻踩地面',
      '第1、3拍用右脚踩底鼓',
      '第2、4拍用左手打军鼓',
      '保持每拍1秒的稳定速度',
    ],
    targetDrums: ['kick', 'snare'],
  },
  beats: [
    // ===== 第1小节 =====
    { time: 0.0, drum: 'kick', label: '1' },     // 第1拍 - 重拍
    { time: 1.0, drum: 'snare', label: '2' },    // 第2拍 - 弱拍
    { time: 2.0, drum: 'kick', label: '3' },     // 第3拍 - 次重拍
    { time: 3.0, drum: 'snare', label: '4' },    // 第4拍 - 弱拍
    
    // ===== 第2小节 =====
    { time: 4.0, drum: 'kick', label: '1' },
    { time: 5.0, drum: 'snare', label: '2' },
    { time: 6.0, drum: 'kick', label: '3' },
    { time: 7.0, drum: 'snare', label: '4' },
    
    // ===== 第3小节 =====
    { time: 8.0, drum: 'kick', label: '1' },
    { time: 9.0, drum: 'snare', label: '2' },
    { time: 10.0, drum: 'kick', label: '3' },
    { time: 11.0, drum: 'snare', label: '4' },
    
    // ===== 第4小节（结束）=====
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 13.0, drum: 'snare', label: '2' },
    { time: 14.0, drum: 'kick', label: '3' },
    { time: 15.0, drum: 'snare', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * 第二首练习曲 - 加入踩镲
 * 
 * 特点：
 * - BPM 60
 * - 加入闭镲，每拍都击打
 * - 手脚协调练习
 * 
 * 节奏模式：
 * 第1拍: Kick + HiHat
 * 第2拍: Snare + HiHat
 * 第3拍: Kick + HiHat
 * 第4拍: Snare + HiHat
 */
export const beginnerHiHatRhythm: RhythmMap = {
  id: 'beginner-hihat-02',
  title: '第二课：加入踩镲',
  titleEn: 'Lesson 2: Add Hi-Hat',
  bpm: 60,
  duration: 16,
  style: 'pop',
  description: '在基础节奏上加入踩镲，练习手脚协调',
  difficulty: 'beginner',
  lessonInfo: {
    lessonNumber: 2,
    objective: '掌握踩镲的稳定击打',
    tips: [
      '右手始终保持踩镲的击打',
      '左手只在2、4拍击打军鼓',
      '右脚只在1、3拍踩底鼓',
      '感受"脚-手-脚-手"的协调',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed'],
    prerequisites: ['beginner-basic-01'],
  },
  beats: [
    // ===== 第1小节 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 1.0, drum: 'snare', label: '2' },
    { time: 1.0, drum: 'hihat-closed', label: '2' },
    { time: 2.0, drum: 'kick', label: '3' },
    { time: 2.0, drum: 'hihat-closed', label: '3' },
    { time: 3.0, drum: 'snare', label: '4' },
    { time: 3.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第2小节 =====
    { time: 4.0, drum: 'kick', label: '1' },
    { time: 4.0, drum: 'hihat-closed', label: '1' },
    { time: 5.0, drum: 'snare', label: '2' },
    { time: 5.0, drum: 'hihat-closed', label: '2' },
    { time: 6.0, drum: 'kick', label: '3' },
    { time: 6.0, drum: 'hihat-closed', label: '3' },
    { time: 7.0, drum: 'snare', label: '4' },
    { time: 7.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第3小节 =====
    { time: 8.0, drum: 'kick', label: '1' },
    { time: 8.0, drum: 'hihat-closed', label: '1' },
    { time: 9.0, drum: 'snare', label: '2' },
    { time: 9.0, drum: 'hihat-closed', label: '2' },
    { time: 10.0, drum: 'kick', label: '3' },
    { time: 10.0, drum: 'hihat-closed', label: '3' },
    { time: 11.0, drum: 'snare', label: '4' },
    { time: 11.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第4小节（结束）=====
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 12.0, drum: 'hihat-closed', label: '1' },
    { time: 13.0, drum: 'snare', label: '2' },
    { time: 13.0, drum: 'hihat-closed', label: '2' },
    { time: 14.0, drum: 'kick', label: '3' },
    { time: 14.0, drum: 'hihat-closed', label: '3' },
    { time: 15.0, drum: 'snare', label: '4', isEnd: true },
    { time: 15.0, drum: 'hihat-closed', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * ============================================
 * 入门级别 (Beginner) - 课程 3-4
 * ============================================
 */

/**
 * 第三课 - 加入休止符
 * 学习在节奏中留空，培养节拍感
 */
export const beginnerRestNotes: RhythmMap = {
  id: 'beginner-rest-03',
  title: '第三课：加入休止符',
  titleEn: 'Lesson 3: Add Rest Notes',
  bpm: 60,
  duration: 16,
  style: 'pop',
  description: '学习休止符的概念，在节奏中留空，培养精准的节拍感',
  difficulty: 'beginner',
  lessonInfo: {
    lessonNumber: 3,
    objective: '掌握带休止符的节奏型',
    tips: [
      '第2拍只打踩镲，不打军鼓（休止）',
      '在心里默数"1-空-3-4"',
      '保持踩镲的稳定，即使军鼓休止',
      '休止符也是节奏的一部分',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed'],
    prerequisites: ['beginner-hihat-02'],
  },
  beats: [
    // ===== 第1小节:  kick-hihat, rest, kick-hihat, snare-hihat =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 1.0, drum: 'hihat-closed', label: '2(休)' },
    { time: 2.0, drum: 'kick', label: '3' },
    { time: 2.0, drum: 'hihat-closed', label: '3' },
    { time: 3.0, drum: 'snare', label: '4' },
    { time: 3.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第2小节: 全打 =====
    { time: 4.0, drum: 'kick', label: '1' },
    { time: 4.0, drum: 'hihat-closed', label: '1' },
    { time: 5.0, drum: 'snare', label: '2' },
    { time: 5.0, drum: 'hihat-closed', label: '2' },
    { time: 6.0, drum: 'kick', label: '3' },
    { time: 6.0, drum: 'hihat-closed', label: '3' },
    { time: 7.0, drum: 'snare', label: '4' },
    { time: 7.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第3小节: 底鼓休止 =====
    { time: 8.0, drum: 'hihat-closed', label: '1(休)' },
    { time: 9.0, drum: 'snare', label: '2' },
    { time: 9.0, drum: 'hihat-closed', label: '2' },
    { time: 10.0, drum: 'kick', label: '3' },
    { time: 10.0, drum: 'hihat-closed', label: '3' },
    { time: 11.0, drum: 'snare', label: '4' },
    { time: 11.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第4小节（结束）=====
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 12.0, drum: 'hihat-closed', label: '1' },
    { time: 13.0, drum: 'hihat-closed', label: '2(休)' },
    { time: 14.0, drum: 'kick', label: '3' },
    { time: 14.0, drum: 'hihat-closed', label: '3' },
    { time: 15.0, drum: 'snare', label: '4', isEnd: true },
    { time: 15.0, drum: 'hihat-closed', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * 第四课 - 简单加花
 * 在最后一拍加入简单的tom填充
 */
export const beginnerSimpleFill: RhythmMap = {
  id: 'beginner-fill-04',
  title: '第四课：简单加花',
  titleEn: 'Lesson 4: Simple Fill',
  bpm: 60,
  duration: 16,
  style: 'pop',
  description: '学习在段落结尾加入简单的桶鼓加花，增加节奏的变化',
  difficulty: 'beginner',
  lessonInfo: {
    lessonNumber: 4,
    objective: '掌握简单的2拍桶鼓加花',
    tips: [
      '前3小节保持基础节奏',
      '第4小节最后两拍是加花部分',
      '按照顺序击打: 高音桶→中音桶→军鼓',
      '加花要流畅，不要赶拍',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed', 'tom-high', 'tom-mid'],
    prerequisites: ['beginner-rest-03'],
  },
  beats: [
    // ===== 第1小节 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 1.0, drum: 'snare', label: '2' },
    { time: 1.0, drum: 'hihat-closed', label: '2' },
    { time: 2.0, drum: 'kick', label: '3' },
    { time: 2.0, drum: 'hihat-closed', label: '3' },
    { time: 3.0, drum: 'snare', label: '4' },
    { time: 3.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第2小节 =====
    { time: 4.0, drum: 'kick', label: '1' },
    { time: 4.0, drum: 'hihat-closed', label: '1' },
    { time: 5.0, drum: 'snare', label: '2' },
    { time: 5.0, drum: 'hihat-closed', label: '2' },
    { time: 6.0, drum: 'kick', label: '3' },
    { time: 6.0, drum: 'hihat-closed', label: '3' },
    { time: 7.0, drum: 'snare', label: '4' },
    { time: 7.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第3小节 =====
    { time: 8.0, drum: 'kick', label: '1' },
    { time: 8.0, drum: 'hihat-closed', label: '1' },
    { time: 9.0, drum: 'snare', label: '2' },
    { time: 9.0, drum: 'hihat-closed', label: '2' },
    { time: 10.0, drum: 'kick', label: '3' },
    { time: 10.0, drum: 'hihat-closed', label: '3' },
    { time: 11.0, drum: 'snare', label: '4' },
    { time: 11.0, drum: 'hihat-closed', label: '4' },
    
    // ===== 第4小节（加花结束）=====
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 12.0, drum: 'hihat-closed', label: '1' },
    { time: 13.0, drum: 'snare', label: '2' },
    { time: 13.0, drum: 'hihat-closed', label: '2' },
    { time: 13.5, drum: 'tom-high', label: '&' },
    { time: 14.0, drum: 'tom-mid', label: '3' },
    { time: 14.5, drum: 'snare', label: '&' },
    { time: 15.0, drum: 'crash', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * ============================================
 * 初级级别 (Elementary) - 课程 5-7
 * ============================================
 */

/**
 * 第五课 - 八分音符入门
 * 将一拍分为两份，加入半拍击打
 */
export const elementaryEighthNotes: RhythmMap = {
  id: 'elementary-eighth-05',
  title: '第五课：八分音符入门',
  titleEn: 'Lesson 5: Eighth Notes Intro',
  bpm: 70,
  duration: 16,
  style: 'pop',
  description: '学习八分音符，将一拍分为两份，踩镲每半拍击打一次',
  difficulty: 'elementary',
  lessonInfo: {
    lessonNumber: 5,
    objective: '掌握八分音符踩镲节奏',
    tips: [
      '速度提升到BPM 70',
      '踩镲每半拍击打: "1 & 2 & 3 & 4 &"',
      '底鼓和军鼓仍在正拍',
      '感受"正-反-正-反"的律动',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed'],
    prerequisites: ['beginner-fill-04'],
  },
  beats: [
    // ===== 第1小节 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 0.429, drum: 'hihat-closed', label: '&' },
    { time: 0.857, drum: 'snare', label: '2' },
    { time: 0.857, drum: 'hihat-closed', label: '2' },
    { time: 1.286, drum: 'hihat-closed', label: '&' },
    { time: 1.714, drum: 'kick', label: '3' },
    { time: 1.714, drum: 'hihat-closed', label: '3' },
    { time: 2.143, drum: 'hihat-closed', label: '&' },
    { time: 2.571, drum: 'snare', label: '4' },
    { time: 2.571, drum: 'hihat-closed', label: '4' },
    { time: 3.0, drum: 'hihat-closed', label: '&' },
    
    // ===== 第2小节（加入底鼓变化）=====
    { time: 3.429, drum: 'kick', label: '1' },
    { time: 3.429, drum: 'hihat-closed', label: '1' },
    { time: 3.857, drum: 'hihat-closed', label: '&' },
    { time: 4.286, drum: 'snare', label: '2' },
    { time: 4.286, drum: 'hihat-closed', label: '2' },
    { time: 4.714, drum: 'kick', label: '&' },
    { time: 4.714, drum: 'hihat-closed', label: '&' },
    { time: 5.143, drum: 'kick', label: '3' },
    { time: 5.143, drum: 'hihat-closed', label: '3' },
    { time: 5.571, drum: 'hihat-closed', label: '&' },
    { time: 6.0, drum: 'snare', label: '4' },
    { time: 6.0, drum: 'hihat-closed', label: '4' },
    { time: 6.429, drum: 'hihat-closed', label: '&' },
    
    // ===== 第3小节 =====
    { time: 6.857, drum: 'kick', label: '1' },
    { time: 6.857, drum: 'hihat-closed', label: '1' },
    { time: 7.286, drum: 'hihat-closed', label: '&' },
    { time: 7.714, drum: 'snare', label: '2' },
    { time: 7.714, drum: 'hihat-closed', label: '2' },
    { time: 8.143, drum: 'hihat-closed', label: '&' },
    { time: 8.571, drum: 'kick', label: '3' },
    { time: 8.571, drum: 'hihat-closed', label: '3' },
    { time: 9.0, drum: 'hihat-closed', label: '&' },
    { time: 9.429, drum: 'snare', label: '4' },
    { time: 9.429, drum: 'hihat-closed', label: '4' },
    { time: 9.857, drum: 'hihat-closed', label: '&' },
    
    // ===== 第4小节（结束）=====
    { time: 10.286, drum: 'kick', label: '1' },
    { time: 10.286, drum: 'hihat-closed', label: '1' },
    { time: 10.714, drum: 'hihat-closed', label: '&' },
    { time: 11.143, drum: 'snare', label: '2' },
    { time: 11.143, drum: 'hihat-closed', label: '2' },
    { time: 11.571, drum: 'hihat-closed', label: '&' },
    { time: 12.0, drum: 'kick', label: '3' },
    { time: 12.0, drum: 'hihat-closed', label: '3' },
    { time: 12.429, drum: 'hihat-closed', label: '&' },
    { time: 12.857, drum: 'snare', label: '4', isEnd: true },
    { time: 12.857, drum: 'hihat-closed', label: '4', isEnd: true },
    { time: 13.286, drum: 'hihat-closed', label: '&' },
  ] as Beat[]
}

/**
 * 第六课 - 开放踩镲技巧
 * 学习在特定节拍开放踩镲，创造音色变化
 */
export const elementaryOpenHiHat: RhythmMap = {
  id: 'elementary-open-hihat-06',
  title: '第六课：开放踩镲技巧',
  titleEn: 'Lesson 6: Open Hi-Hat Technique',
  bpm: 75,
  duration: 16,
  style: 'rock',
  description: '学习开放踩镲技巧，在第2拍或第4拍开放踩镲，创造音色变化',
  difficulty: 'elementary',
  lessonInfo: {
    lessonNumber: 6,
    objective: '掌握开放踩镲的时机控制',
    tips: [
      '开放踩镲后用闭合踩镲止音',
      '通常在第2拍或第4拍开放',
      '左脚控制踩镲的开合',
      '音色要有明显的"开-合"对比',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed', 'hihat-open'],
    prerequisites: ['elementary-eighth-05'],
  },
  beats: [
    // ===== 第1小节: 第2拍开放 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 0.4, drum: 'hihat-closed', label: '&' },
    { time: 0.8, drum: 'snare', label: '2' },
    { time: 0.8, drum: 'hihat-open', label: '2↑' },
    { time: 1.2, drum: 'hihat-closed', label: '&' },
    { time: 1.6, drum: 'kick', label: '3' },
    { time: 1.6, drum: 'hihat-closed', label: '3' },
    { time: 2.0, drum: 'hihat-closed', label: '&' },
    { time: 2.4, drum: 'snare', label: '4' },
    { time: 2.4, drum: 'hihat-closed', label: '4' },
    { time: 2.8, drum: 'hihat-closed', label: '&' },
    
    // ===== 第2小节: 第4拍开放 =====
    { time: 3.2, drum: 'kick', label: '1' },
    { time: 3.2, drum: 'hihat-closed', label: '1' },
    { time: 3.6, drum: 'hihat-closed', label: '&' },
    { time: 4.0, drum: 'snare', label: '2' },
    { time: 4.0, drum: 'hihat-closed', label: '2' },
    { time: 4.4, drum: 'hihat-closed', label: '&' },
    { time: 4.8, drum: 'kick', label: '3' },
    { time: 4.8, drum: 'hihat-closed', label: '3' },
    { time: 5.2, drum: 'hihat-closed', label: '&' },
    { time: 5.6, drum: 'snare', label: '4' },
    { time: 5.6, drum: 'hihat-open', label: '4↑' },
    { time: 6.0, drum: 'hihat-closed', label: '&' },
    
    // ===== 第3小节: 双开放 =====
    { time: 6.4, drum: 'kick', label: '1' },
    { time: 6.4, drum: 'hihat-closed', label: '1' },
    { time: 6.8, drum: 'hihat-closed', label: '&' },
    { time: 7.2, drum: 'snare', label: '2' },
    { time: 7.2, drum: 'hihat-open', label: '2↑' },
    { time: 7.6, drum: 'hihat-closed', label: '&' },
    { time: 8.0, drum: 'kick', label: '3' },
    { time: 8.0, drum: 'hihat-closed', label: '3' },
    { time: 8.4, drum: 'hihat-closed', label: '&' },
    { time: 8.8, drum: 'snare', label: '4' },
    { time: 8.8, drum: 'hihat-open', label: '4↑' },
    { time: 9.2, drum: 'hihat-closed', label: '&' },
    
    // ===== 第4小节（结束加花）=====
    { time: 9.6, drum: 'kick', label: '1' },
    { time: 9.6, drum: 'hihat-closed', label: '1' },
    { time: 10.0, drum: 'tom-high', label: '&' },
    { time: 10.4, drum: 'tom-mid', label: '2' },
    { time: 10.8, drum: 'snare', label: '&' },
    { time: 11.2, drum: 'kick', label: '3' },
    { time: 11.2, drum: 'hihat-closed', label: '3' },
    { time: 11.6, drum: 'hihat-closed', label: '&' },
    { time: 12.0, drum: 'snare', label: '4', isEnd: true },
    { time: 12.0, drum: 'crash', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * 第七课 - 基础填充练习
 * 学习2拍和4拍的桶鼓填充
 */
export const elementaryFillPractice: RhythmMap = {
  id: 'elementary-fill-07',
  title: '第七课：基础填充练习',
  titleEn: 'Lesson 7: Basic Fill Practice',
  bpm: 80,
  duration: 24,
  style: 'rock',
  description: '学习标准的2拍和4拍桶鼓填充，掌握从基础节奏到加花的过渡',
  difficulty: 'elementary',
  lessonInfo: {
    lessonNumber: 7,
    objective: '掌握2拍和4拍桶鼓填充',
    tips: [
      '填充通常出现在段落结尾',
      '从高音桶开始，依次向下',
      '保持速度稳定，不要抢拍',
      '填充后通常接 Crash 进入新段落',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed', 'tom-high', 'tom-mid', 'tom-low', 'crash'],
    prerequisites: ['elementary-open-hihat-06'],
  },
  beats: [
    // ===== 第1-2小节: 基础节奏 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 0.375, drum: 'hihat-closed', label: '&' },
    { time: 0.75, drum: 'snare', label: '2' },
    { time: 0.75, drum: 'hihat-closed', label: '2' },
    { time: 1.125, drum: 'hihat-closed', label: '&' },
    { time: 1.5, drum: 'kick', label: '3' },
    { time: 1.5, drum: 'hihat-closed', label: '3' },
    { time: 1.875, drum: 'hihat-closed', label: '&' },
    { time: 2.25, drum: 'snare', label: '4' },
    { time: 2.25, drum: 'hihat-closed', label: '4' },
    { time: 2.625, drum: 'hihat-closed', label: '&' },
    
    { time: 3.0, drum: 'kick', label: '1' },
    { time: 3.0, drum: 'hihat-closed', label: '1' },
    { time: 3.375, drum: 'hihat-closed', label: '&' },
    { time: 3.75, drum: 'snare', label: '2' },
    { time: 3.75, drum: 'hihat-closed', label: '2' },
    { time: 4.125, drum: 'hihat-closed', label: '&' },
    { time: 4.5, drum: 'kick', label: '3' },
    { time: 4.5, drum: 'hihat-closed', label: '3' },
    { time: 4.875, drum: 'hihat-closed', label: '&' },
    { time: 5.25, drum: 'snare', label: '4' },
    { time: 5.25, drum: 'hihat-closed', label: '4' },
    { time: 5.625, drum: 'hihat-closed', label: '&' },
    
    // ===== 第3小节: 2拍填充 =====
    { time: 6.0, drum: 'kick', label: '1' },
    { time: 6.0, drum: 'hihat-closed', label: '1' },
    { time: 6.375, drum: 'hihat-closed', label: '&' },
    { time: 6.75, drum: 'snare', label: '2' },
    { time: 6.75, drum: 'hihat-closed', label: '2' },
    { time: 7.125, drum: 'hihat-closed', label: '&' },
    // 填充开始
    { time: 7.5, drum: 'tom-high', label: '3' },
    { time: 7.875, drum: 'tom-mid', label: '&' },
    { time: 8.25, drum: 'tom-low', label: '4' },
    { time: 8.625, drum: 'snare', label: '&' },
    
    // ===== 第4小节: 新段落开始 =====
    { time: 9.0, drum: 'kick', label: '1' },
    { time: 9.0, drum: 'crash', label: '1' },
    { time: 9.375, drum: 'hihat-closed', label: '&' },
    { time: 9.75, drum: 'snare', label: '2' },
    { time: 9.75, drum: 'hihat-closed', label: '2' },
    { time: 10.125, drum: 'hihat-closed', label: '&' },
    { time: 10.5, drum: 'kick', label: '3' },
    { time: 10.5, drum: 'hihat-closed', label: '3' },
    { time: 10.875, drum: 'hihat-closed', label: '&' },
    { time: 11.25, drum: 'snare', label: '4' },
    { time: 11.25, drum: 'hihat-closed', label: '4' },
    { time: 11.625, drum: 'hihat-closed', label: '&' },
    
    // ===== 第5-6小节: 基础节奏 =====
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 12.0, drum: 'hihat-closed', label: '1' },
    { time: 12.375, drum: 'hihat-closed', label: '&' },
    { time: 12.75, drum: 'snare', label: '2' },
    { time: 12.75, drum: 'hihat-closed', label: '2' },
    { time: 13.125, drum: 'hihat-closed', label: '&' },
    { time: 13.5, drum: 'kick', label: '3' },
    { time: 13.5, drum: 'hihat-closed', label: '3' },
    { time: 13.875, drum: 'hihat-closed', label: '&' },
    { time: 14.25, drum: 'snare', label: '4' },
    { time: 14.25, drum: 'hihat-closed', label: '4' },
    { time: 14.625, drum: 'hihat-closed', label: '&' },
    
    { time: 15.0, drum: 'kick', label: '1' },
    { time: 15.0, drum: 'hihat-closed', label: '1' },
    { time: 15.375, drum: 'hihat-closed', label: '&' },
    { time: 15.75, drum: 'snare', label: '2' },
    { time: 15.75, drum: 'hihat-closed', label: '2' },
    { time: 16.125, drum: 'hihat-closed', label: '&' },
    { time: 16.5, drum: 'kick', label: '3' },
    { time: 16.5, drum: 'hihat-closed', label: '3' },
    { time: 16.875, drum: 'hihat-closed', label: '&' },
    { time: 17.25, drum: 'snare', label: '4' },
    { time: 17.25, drum: 'hihat-closed', label: '4' },
    { time: 17.625, drum: 'hihat-closed', label: '&' },
    
    // ===== 第6小节: 4拍填充 =====
    { time: 18.0, drum: 'tom-high', label: '1' },
    { time: 18.375, drum: 'tom-mid', label: '&' },
    { time: 18.75, drum: 'tom-high', label: '2' },
    { time: 19.125, drum: 'tom-mid', label: '&' },
    { time: 19.5, drum: 'tom-low', label: '3' },
    { time: 19.875, drum: 'tom-low', label: '&' },
    { time: 20.25, drum: 'snare', label: '4' },
    { time: 20.625, drum: 'snare', label: '&' },
    
    // ===== 第8小节（结束）=====
    { time: 21.0, drum: 'kick', label: '1' },
    { time: 21.0, drum: 'crash', label: '1' },
    { time: 21.375, drum: 'hihat-closed', label: '&' },
    { time: 21.75, drum: 'snare', label: '2' },
    { time: 21.75, drum: 'hihat-closed', label: '2' },
    { time: 22.125, drum: 'hihat-closed', label: '&' },
    { time: 22.5, drum: 'kick', label: '3' },
    { time: 22.5, drum: 'hihat-closed', label: '3' },
    { time: 22.875, drum: 'hihat-closed', label: '&' },
    { time: 23.25, drum: 'snare', label: '4', isEnd: true },
    { time: 23.25, drum: 'crash', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * ============================================
 * 中级级别 (Intermediate) - 课程 8-9
 * ============================================
 */

/**
 * 第八课 - 十六分音符组合
 * 学习更复杂的十六分音符踩镲节奏
 */
export const intermediateSixteenthNotes: RhythmMap = {
  id: 'intermediate-sixteenth-08',
  title: '第八课：十六分音符组合',
  titleEn: 'Lesson 8: Sixteenth Notes Combo',
  bpm: 85,
  duration: 16,
  style: 'rock',
  description: '学习十六分音符，将一拍分为四份，掌握高密度的踩镲节奏',
  difficulty: 'intermediate',
  lessonInfo: {
    lessonNumber: 8,
    objective: '掌握十六分音符踩镲与底鼓组合',
    tips: [
      '速度提升到BPM 85',
      '踩镲每1/4拍击打，形成"1-e-&-a"',
      '注意底鼓与踩镲的配合',
      '保持手腕放松，提高耐力',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed'],
    prerequisites: ['elementary-fill-07'],
  },
  beats: [
    // ===== 第1小节: 基础十六分音符 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 0.176, drum: 'hihat-closed', label: 'e' },
    { time: 0.353, drum: 'hihat-closed', label: '&' },
    { time: 0.529, drum: 'hihat-closed', label: 'a' },
    { time: 0.706, drum: 'snare', label: '2' },
    { time: 0.706, drum: 'hihat-closed', label: '2' },
    { time: 0.882, drum: 'hihat-closed', label: 'e' },
    { time: 1.059, drum: 'hihat-closed', label: '&' },
    { time: 1.235, drum: 'hihat-closed', label: 'a' },
    { time: 1.412, drum: 'kick', label: '3' },
    { time: 1.412, drum: 'hihat-closed', label: '3' },
    { time: 1.588, drum: 'hihat-closed', label: 'e' },
    { time: 1.765, drum: 'hihat-closed', label: '&' },
    { time: 1.941, drum: 'hihat-closed', label: 'a' },
    { time: 2.118, drum: 'snare', label: '4' },
    { time: 2.118, drum: 'hihat-closed', label: '4' },
    { time: 2.294, drum: 'hihat-closed', label: 'e' },
    { time: 2.471, drum: 'hihat-closed', label: '&' },
    { time: 2.647, drum: 'hihat-closed', label: 'a' },
    
    // ===== 第2小节: 加入底鼓鬼音 =====
    { time: 2.824, drum: 'kick', label: '1' },
    { time: 2.824, drum: 'hihat-closed', label: '1' },
    { time: 3.0, drum: 'kick', label: 'e' },
    { time: 3.0, drum: 'hihat-closed', label: 'e' },
    { time: 3.176, drum: 'hihat-closed', label: '&' },
    { time: 3.353, drum: 'hihat-closed', label: 'a' },
    { time: 3.529, drum: 'snare', label: '2' },
    { time: 3.529, drum: 'hihat-closed', label: '2' },
    { time: 3.706, drum: 'hihat-closed', label: 'e' },
    { time: 3.882, drum: 'hihat-closed', label: '&' },
    { time: 4.059, drum: 'hihat-closed', label: 'a' },
    { time: 4.235, drum: 'kick', label: '3' },
    { time: 4.235, drum: 'hihat-closed', label: '3' },
    { time: 4.412, drum: 'hihat-closed', label: 'e' },
    { time: 4.588, drum: 'kick', label: '&' },
    { time: 4.588, drum: 'hihat-closed', label: '&' },
    { time: 4.765, drum: 'hihat-closed', label: 'a' },
    { time: 4.941, drum: 'snare', label: '4' },
    { time: 4.941, drum: 'hihat-closed', label: '4' },
    { time: 5.118, drum: 'hihat-closed', label: 'e' },
    { time: 5.294, drum: 'hihat-closed', label: '&' },
    { time: 5.471, drum: 'hihat-closed', label: 'a' },
    
    // ===== 第3小节: 复杂底鼓组合 =====
    { time: 5.647, drum: 'kick', label: '1' },
    { time: 5.647, drum: 'hihat-closed', label: '1' },
    { time: 5.824, drum: 'hihat-closed', label: 'e' },
    { time: 6.0, drum: 'kick', label: '&' },
    { time: 6.0, drum: 'hihat-closed', label: '&' },
    { time: 6.176, drum: 'hihat-closed', label: 'a' },
    { time: 6.353, drum: 'snare', label: '2' },
    { time: 6.353, drum: 'hihat-closed', label: '2' },
    { time: 6.529, drum: 'hihat-closed', label: 'e' },
    { time: 6.706, drum: 'hihat-closed', label: '&' },
    { time: 6.882, drum: 'hihat-closed', label: 'a' },
    { time: 7.059, drum: 'kick', label: '3' },
    { time: 7.059, drum: 'hihat-closed', label: '3' },
    { time: 7.235, drum: 'kick', label: 'e' },
    { time: 7.235, drum: 'hihat-closed', label: 'e' },
    { time: 7.412, drum: 'kick', label: '&' },
    { time: 7.412, drum: 'hihat-closed', label: '&' },
    { time: 7.588, drum: 'hihat-closed', label: 'a' },
    { time: 7.765, drum: 'snare', label: '4' },
    { time: 7.765, drum: 'hihat-closed', label: '4' },
    { time: 7.941, drum: 'hihat-closed', label: 'e' },
    { time: 8.118, drum: 'hihat-closed', label: '&' },
    { time: 8.294, drum: 'hihat-closed', label: 'a' },
    
    // ===== 第4小节（结束加花）=====
    { time: 8.471, drum: 'tom-high', label: '1' },
    { time: 8.647, drum: 'tom-high', label: 'e' },
    { time: 8.824, drum: 'tom-mid', label: '&' },
    { time: 9.0, drum: 'tom-mid', label: 'a' },
    { time: 9.176, drum: 'tom-low', label: '2' },
    { time: 9.353, drum: 'tom-low', label: 'e' },
    { time: 9.529, drum: 'snare', label: '&' },
    { time: 9.706, drum: 'snare', label: 'a' },
    { time: 9.882, drum: 'kick', label: '3' },
    { time: 9.882, drum: 'crash', label: '3' },
    { time: 10.235, drum: 'hihat-closed', label: '&' },
    { time: 10.588, drum: 'snare', label: '4', isEnd: true },
  ] as Beat[]
}

/**
 * 第九课 - 复杂填充与过门
 * 学习复杂的线性填充和段落过门
 */
export const intermediateComplexFills: RhythmMap = {
  id: 'intermediate-complex-fill-09',
  title: '第九课：复杂填充与过门',
  titleEn: 'Lesson 9: Complex Fills & Transitions',
  bpm: 90,
  duration: 24,
  style: 'rock',
  description: '学习复杂的线性填充技巧，以及不同段落间的过门处理',
  difficulty: 'intermediate',
  lessonInfo: {
    lessonNumber: 9,
    objective: '掌握线性填充和段落过门技巧',
    tips: [
      '线性填充：每次只打一个鼓，形成流畅线条',
      '过门用于连接不同段落',
      '可以使用 paradiddle 手法（RLRR-LRLL）',
      '注意动态控制，有强有弱',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed', 'tom-high', 'tom-mid', 'tom-low', 'crash'],
    prerequisites: ['intermediate-sixteenth-08'],
  },
  beats: [
    // ===== 第1-2小节: Verse基础节奏 =====
    { time: 0.0, drum: 'kick', label: '1' },
    { time: 0.0, drum: 'hihat-closed', label: '1' },
    { time: 0.333, drum: 'hihat-closed', label: '&' },
    { time: 0.667, drum: 'snare', label: '2' },
    { time: 0.667, drum: 'hihat-closed', label: '2' },
    { time: 1.0, drum: 'hihat-closed', label: '&' },
    { time: 1.333, drum: 'kick', label: '3' },
    { time: 1.333, drum: 'hihat-closed', label: '3' },
    { time: 1.667, drum: 'hihat-closed', label: '&' },
    { time: 2.0, drum: 'snare', label: '4' },
    { time: 2.0, drum: 'hihat-closed', label: '4' },
    { time: 2.333, drum: 'hihat-closed', label: '&' },
    
    { time: 2.667, drum: 'kick', label: '1' },
    { time: 2.667, drum: 'hihat-closed', label: '1' },
    { time: 3.0, drum: 'hihat-closed', label: '&' },
    { time: 3.333, drum: 'snare', label: '2' },
    { time: 3.333, drum: 'hihat-closed', label: '2' },
    { time: 3.667, drum: 'hihat-closed', label: '&' },
    { time: 4.0, drum: 'kick', label: '3' },
    { time: 4.0, drum: 'hihat-closed', label: '3' },
    { time: 4.333, drum: 'hihat-closed', label: '&' },
    { time: 4.667, drum: 'snare', label: '4' },
    { time: 4.667, drum: 'hihat-closed', label: '4' },
    { time: 5.0, drum: 'hihat-closed', label: '&' },
    
    // ===== 第3小节: 过门到Chorus =====
    { time: 5.333, drum: 'tom-high', label: '1' },
    { time: 5.5, drum: 'tom-mid', label: 'e' },
    { time: 5.667, drum: 'tom-low', label: '&' },
    { time: 5.833, drum: 'kick', label: 'a' },
    { time: 6.0, drum: 'snare', label: '2' },
    { time: 6.167, drum: 'tom-high', label: 'e' },
    { time: 6.333, drum: 'tom-mid', label: '&' },
    { time: 6.5, drum: 'tom-low', label: 'a' },
    { time: 6.667, drum: 'kick', label: '3' },
    { time: 6.833, drum: 'snare', label: 'e' },
    { time: 7.0, drum: 'kick', label: '&' },
    { time: 7.167, drum: 'snare', label: 'a' },
    { time: 7.333, drum: 'kick', label: '4' },
    { time: 7.5, drum: 'snare', label: 'e' },
    { time: 7.667, drum: 'kick', label: '&' },
    { time: 7.833, drum: 'snare', label: 'a' },
    
    // ===== 第4小节: Chorus开始（Crash进入）=====
    { time: 8.0, drum: 'kick', label: '1' },
    { time: 8.0, drum: 'crash', label: '1' },
    { time: 8.333, drum: 'hihat-closed', label: '&' },
    { time: 8.667, drum: 'snare', label: '2' },
    { time: 8.667, drum: 'hihat-closed', label: '2' },
    { time: 9.0, drum: 'hihat-closed', label: '&' },
    { time: 9.333, drum: 'kick', label: '3' },
    { time: 9.333, drum: 'hihat-closed', label: '3' },
    { time: 9.667, drum: 'hihat-closed', label: '&' },
    { time: 10.0, drum: 'snare', label: '4' },
    { time: 10.0, drum: 'hihat-closed', label: '4' },
    { time: 10.333, drum: 'hihat-closed', label: '&' },
    
    // ===== 第5-6小节: Chorus加强节奏 =====
    { time: 10.667, drum: 'kick', label: '1' },
    { time: 10.667, drum: 'hihat-closed', label: '1' },
    { time: 10.833, drum: 'kick', label: 'e' },
    { time: 11.0, drum: 'hihat-closed', label: '&' },
    { time: 11.167, drum: 'hihat-closed', label: 'a' },
    { time: 11.333, drum: 'snare', label: '2' },
    { time: 11.333, drum: 'hihat-closed', label: '2' },
    { time: 11.5, drum: 'hihat-closed', label: 'e' },
    { time: 11.667, drum: 'hihat-closed', label: '&' },
    { time: 11.833, drum: 'hihat-closed', label: 'a' },
    { time: 12.0, drum: 'kick', label: '3' },
    { time: 12.0, drum: 'hihat-closed', label: '3' },
    { time: 12.167, drum: 'kick', label: 'e' },
    { time: 12.333, drum: 'hihat-closed', label: '&' },
    { time: 12.5, drum: 'hihat-closed', label: 'a' },
    { time: 12.667, drum: 'snare', label: '4' },
    { time: 12.667, drum: 'hihat-closed', label: '4' },
    { time: 12.833, drum: 'hihat-closed', label: 'e' },
    { time: 13.0, drum: 'hihat-closed', label: '&' },
    { time: 13.167, drum: 'hihat-closed', label: 'a' },
    
    { time: 13.333, drum: 'kick', label: '1' },
    { time: 13.333, drum: 'hihat-closed', label: '1' },
    { time: 13.5, drum: 'kick', label: 'e' },
    { time: 13.667, drum: 'hihat-closed', label: '&' },
    { time: 13.833, drum: 'hihat-closed', label: 'a' },
    { time: 14.0, drum: 'snare', label: '2' },
    { time: 14.0, drum: 'hihat-closed', label: '2' },
    { time: 14.167, drum: 'hihat-closed', label: 'e' },
    { time: 14.333, drum: 'hihat-closed', label: '&' },
    { time: 14.5, drum: 'hihat-closed', label: 'a' },
    { time: 14.667, drum: 'kick', label: '3' },
    { time: 14.667, drum: 'hihat-closed', label: '3' },
    { time: 14.833, drum: 'kick', label: 'e' },
    { time: 15.0, drum: 'hihat-closed', label: '&' },
    { time: 15.167, drum: 'hihat-closed', label: 'a' },
    { time: 15.333, drum: 'snare', label: '4' },
    { time: 15.333, drum: 'hihat-closed', label: '4' },
    { time: 15.5, drum: 'hihat-closed', label: 'e' },
    { time: 15.667, drum: 'hihat-closed', label: '&' },
    { time: 15.833, drum: 'hihat-closed', label: 'a' },
    
    // ===== 第7小节: 大填充（build-up）=====
    { time: 16.0, drum: 'tom-high', label: '1' },
    { time: 16.167, drum: 'tom-mid', label: 'e' },
    { time: 16.333, drum: 'tom-low', label: '&' },
    { time: 16.5, drum: 'snare', label: 'a' },
    { time: 16.667, drum: 'tom-high', label: '2' },
    { time: 16.833, drum: 'tom-mid', label: 'e' },
    { time: 17.0, drum: 'tom-low', label: '&' },
    { time: 17.167, drum: 'snare', label: 'a' },
    { time: 17.333, drum: 'tom-high', label: '3' },
    { time: 17.5, drum: 'tom-mid', label: 'e' },
    { time: 17.667, drum: 'tom-low', label: '&' },
    { time: 17.833, drum: 'snare', label: 'a' },
    { time: 18.0, drum: 'tom-high', label: '4' },
    { time: 18.167, drum: 'tom-mid', label: 'e' },
    { time: 18.333, drum: 'tom-low', label: '&' },
    { time: 18.5, drum: 'snare', label: 'a' },
    
    // ===== 第8小节（结束）=====
    { time: 18.667, drum: 'kick', label: '1' },
    { time: 18.667, drum: 'crash', label: '1' },
    { time: 19.0, drum: 'snare', label: '&' },
    { time: 19.333, drum: 'snare', label: '2' },
    { time: 19.667, drum: 'kick', label: '&' },
    { time: 20.0, drum: 'kick', label: '3' },
    { time: 20.333, drum: 'snare', label: '&' },
    { time: 20.667, drum: 'snare', label: '4' },
    { time: 21.0, drum: 'tom-high', label: '&' },
    { time: 21.333, drum: 'tom-mid', label: '1' },
    { time: 21.667, drum: 'tom-low', label: '&' },
    { time: 22.0, drum: 'snare', label: '2' },
    { time: 22.333, drum: 'kick', label: '&' },
    { time: 22.667, drum: 'crash', label: '3', isEnd: true },
  ] as Beat[]
}

/**
 * ============================================
 * 进阶级别 (Advanced) - 课程 10
 * ============================================
 */

/**
 * 第十课 - 综合技巧大师课
 * 融合所有技巧的综合练习，包含多种节奏型和复杂填充
 */
export const advancedMasterclass: RhythmMap = {
  id: 'advanced-masterclass-10',
  title: '第十课：综合技巧大师课',
  titleEn: 'Lesson 10: Masterclass Comprehensive',
  bpm: 100,
  duration: 32,
  style: 'rock',
  description: '融合所有技巧的综合练习，包含十六分音符、开放踩镲、复杂填充、线性过门',
  difficulty: 'advanced',
  lessonInfo: {
    lessonNumber: 10,
    objective: '综合运用所有学过的技巧',
    tips: [
      '这是前9课的集大成者',
      '包含十六分音符、开放踩镲、填充、过门',
      '注意段落间的动态对比',
      '保持稳定的拍子，展现控制力',
    ],
    targetDrums: ['kick', 'snare', 'hihat-closed', 'hihat-open', 'tom-high', 'tom-mid', 'tom-low', 'crash'],
    prerequisites: ['intermediate-complex-fill-09'],
  },
  beats: [
    // ===== Intro: 4小节建立节奏 =====
    { time: 0.0, drum: 'crash', label: '1' },
    { time: 0.3, drum: 'hihat-closed', label: '&' },
    { time: 0.6, drum: 'hihat-closed', label: '2' },
    { time: 0.9, drum: 'hihat-closed', label: '&' },
    { time: 1.2, drum: 'crash', label: '3' },
    { time: 1.5, drum: 'hihat-closed', label: '&' },
    { time: 1.8, drum: 'hihat-closed', label: '4' },
    { time: 2.1, drum: 'hihat-closed', label: '&' },
    
    { time: 2.4, drum: 'kick', label: '1' },
    { time: 2.4, drum: 'hihat-closed', label: '1' },
    { time: 2.7, drum: 'hihat-closed', label: '&' },
    { time: 3.0, drum: 'snare', label: '2' },
    { time: 3.0, drum: 'hihat-closed', label: '2' },
    { time: 3.3, drum: 'hihat-closed', label: '&' },
    { time: 3.6, drum: 'kick', label: '3' },
    { time: 3.6, drum: 'hihat-closed', label: '3' },
    { time: 3.9, drum: 'hihat-closed', label: '&' },
    { time: 4.2, drum: 'snare', label: '4' },
    { time: 4.2, drum: 'hihat-closed', label: '4' },
    { time: 4.5, drum: 'hihat-closed', label: '&' },
    
    { time: 4.8, drum: 'kick', label: '1' },
    { time: 4.8, drum: 'hihat-closed', label: '1' },
    { time: 5.1, drum: 'hihat-closed', label: '&' },
    { time: 5.4, drum: 'snare', label: '2' },
    { time: 5.4, drum: 'hihat-closed', label: '2' },
    { time: 5.7, drum: 'hihat-closed', label: '&' },
    { time: 6.0, drum: 'kick', label: '3' },
    { time: 6.0, drum: 'hihat-closed', label: '3' },
    { time: 6.3, drum: 'hihat-closed', label: '&' },
    { time: 6.6, drum: 'snare', label: '4' },
    { time: 6.6, drum: 'hihat-closed', label: '4' },
    { time: 6.9, drum: 'hihat-closed', label: '&' },
    
    // ===== Verse A: 4小节（十六分音符）=====
    { time: 7.2, drum: 'kick', label: '1' },
    { time: 7.2, drum: 'hihat-closed', label: '1' },
    { time: 7.35, drum: 'hihat-closed', label: 'e' },
    { time: 7.5, drum: 'kick', label: '&' },
    { time: 7.5, drum: 'hihat-closed', label: '&' },
    { time: 7.65, drum: 'hihat-closed', label: 'a' },
    { time: 7.8, drum: 'snare', label: '2' },
    { time: 7.8, drum: 'hihat-closed', label: '2' },
    { time: 7.95, drum: 'hihat-closed', label: 'e' },
    { time: 8.1, drum: 'hihat-closed', label: '&' },
    { time: 8.25, drum: 'hihat-closed', label: 'a' },
    { time: 8.4, drum: 'kick', label: '3' },
    { time: 8.4, drum: 'hihat-closed', label: '3' },
    { time: 8.55, drum: 'hihat-closed', label: 'e' },
    { time: 8.7, drum: 'hihat-closed', label: '&' },
    { time: 8.85, drum: 'hihat-closed', label: 'a' },
    { time: 9.0, drum: 'snare', label: '4' },
    { time: 9.0, drum: 'hihat-closed', label: '4' },
    { time: 9.15, drum: 'hihat-closed', label: 'e' },
    { time: 9.3, drum: 'hihat-closed', label: '&' },
    { time: 9.45, drum: 'hihat-closed', label: 'a' },
    
    { time: 9.6, drum: 'kick', label: '1' },
    { time: 9.6, drum: 'hihat-closed', label: '1' },
    { time: 9.75, drum: 'hihat-closed', label: 'e' },
    { time: 9.9, drum: 'hihat-closed', label: '&' },
    { time: 10.05, drum: 'hihat-closed', label: 'a' },
    { time: 10.2, drum: 'snare', label: '2' },
    { time: 10.2, drum: 'hihat-closed', label: '2' },
    { time: 10.35, drum: 'hihat-closed', label: 'e' },
    { time: 10.5, drum: 'hihat-closed', label: '&' },
    { time: 10.65, drum: 'hihat-closed', label: 'a' },
    { time: 10.8, drum: 'kick', label: '3' },
    { time: 10.8, drum: 'hihat-closed', label: '3' },
    { time: 10.95, drum: 'kick', label: 'e' },
    { time: 11.1, drum: 'hihat-closed', label: '&' },
    { time: 11.25, drum: 'kick', label: 'a' },
    { time: 11.4, drum: 'snare', label: '4' },
    { time: 11.4, drum: 'hihat-closed', label: '4' },
    { time: 11.55, drum: 'hihat-closed', label: 'e' },
    { time: 11.7, drum: 'hihat-closed', label: '&' },
    { time: 11.85, drum: 'hihat-closed', label: 'a' },
    
    { time: 12.0, drum: 'kick', label: '1' },
    { time: 12.0, drum: 'hihat-closed', label: '1' },
    { time: 12.15, drum: 'hihat-closed', label: 'e' },
    { time: 12.3, drum: 'hihat-closed', label: '&' },
    { time: 12.45, drum: 'hihat-closed', label: 'a' },
    { time: 12.6, drum: 'snare', label: '2' },
    { time: 12.6, drum: 'hihat-closed', label: '2' },
    { time: 12.75, drum: 'hihat-closed', label: 'e' },
    { time: 12.9, drum: 'hihat-closed', label: '&' },
    { time: 13.05, drum: 'hihat-closed', label: 'a' },
    { time: 13.2, drum: 'kick', label: '3' },
    { time: 13.2, drum: 'hihat-closed', label: '3' },
    { time: 13.35, drum: 'hihat-closed', label: 'e' },
    { time: 13.5, drum: 'hihat-closed', label: '&' },
    { time: 13.65, drum: 'hihat-closed', label: 'a' },
    { time: 13.8, drum: 'snare', label: '4' },
    { time: 13.8, drum: 'hihat-open', label: '4↑' },
    { time: 13.95, drum: 'hihat-closed', label: 'e' },
    { time: 14.1, drum: 'hihat-closed', label: '&' },
    { time: 14.25, drum: 'hihat-closed', label: 'a' },
    
    // ===== Pre-Chorus: 2小节（过渡）=====
    { time: 14.4, drum: 'kick', label: '1' },
    { time: 14.4, drum: 'hihat-closed', label: '1' },
    { time: 14.7, drum: 'hihat-closed', label: '&' },
    { time: 15.0, drum: 'snare', label: '2' },
    { time: 15.0, drum: 'hihat-closed', label: '2' },
    { time: 15.3, drum: 'hihat-closed', label: '&' },
    { time: 15.6, drum: 'kick', label: '3' },
    { time: 15.6, drum: 'hihat-closed', label: '3' },
    { time: 15.9, drum: 'hihat-closed', label: '&' },
    { time: 16.2, drum: 'snare', label: '4' },
    { time: 16.2, drum: 'hihat-open', label: '4↑' },
    { time: 16.5, drum: 'hihat-closed', label: '&' },
    
    { time: 16.8, drum: 'tom-high', label: '1' },
    { time: 17.0, drum: 'tom-mid', label: 'e' },
    { time: 17.2, drum: 'tom-low', label: '&' },
    { time: 17.4, drum: 'snare', label: 'a' },
    { time: 17.6, drum: 'tom-high', label: '2' },
    { time: 17.8, drum: 'tom-mid', label: 'e' },
    { time: 18.0, drum: 'tom-low', label: '&' },
    { time: 18.2, drum: 'snare', label: 'a' },
    { time: 18.4, drum: 'kick', label: '3' },
    { time: 18.6, drum: 'snare', label: 'e' },
    { time: 18.8, drum: 'kick', label: '&' },
    { time: 19.0, drum: 'snare', label: 'a' },
    { time: 19.2, drum: 'kick', label: '4' },
    { time: 19.4, drum: 'snare', label: 'e' },
    { time: 19.6, drum: 'kick', label: '&' },
    { time: 19.8, drum: 'snare', label: 'a' },
    
    // ===== Chorus: 4小节（强力节奏）=====
    { time: 20.0, drum: 'kick', label: '1' },
    { time: 20.0, drum: 'crash', label: '1' },
    { time: 20.3, drum: 'hihat-closed', label: '&' },
    { time: 20.6, drum: 'snare', label: '2' },
    { time: 20.6, drum: 'hihat-closed', label: '2' },
    { time: 20.9, drum: 'hihat-closed', label: '&' },
    { time: 21.2, drum: 'kick', label: '3' },
    { time: 21.2, drum: 'hihat-closed', label: '3' },
    { time: 21.5, drum: 'hihat-closed', label: '&' },
    { time: 21.8, drum: 'snare', label: '4' },
    { time: 21.8, drum: 'hihat-closed', label: '4' },
    { time: 22.1, drum: 'hihat-closed', label: '&' },
    
    { time: 22.4, drum: 'kick', label: '1' },
    { time: 22.4, drum: 'hihat-closed', label: '1' },
    { time: 22.55, drum: 'kick', label: 'e' },
    { time: 22.7, drum: 'hihat-closed', label: '&' },
    { time: 22.85, drum: 'kick', label: 'a' },
    { time: 23.0, drum: 'snare', label: '2' },
    { time: 23.0, drum: 'hihat-closed', label: '2' },
    { time: 23.15, drum: 'hihat-closed', label: 'e' },
    { time: 23.3, drum: 'hihat-closed', label: '&' },
    { time: 23.45, drum: 'hihat-closed', label: 'a' },
    { time: 23.6, drum: 'kick', label: '3' },
    { time: 23.6, drum: 'hihat-closed', label: '3' },
    { time: 23.75, drum: 'kick', label: 'e' },
    { time: 23.9, drum: 'hihat-closed', label: '&' },
    { time: 24.05, drum: 'kick', label: 'a' },
    { time: 24.2, drum: 'snare', label: '4' },
    { time: 24.2, drum: 'hihat-open', label: '4↑' },
    { time: 24.35, drum: 'hihat-closed', label: 'e' },
    { time: 24.5, drum: 'hihat-closed', label: '&' },
    { time: 24.65, drum: 'hihat-closed', label: 'a' },
    
    { time: 24.8, drum: 'kick', label: '1' },
    { time: 24.8, drum: 'hihat-closed', label: '1' },
    { time: 25.1, drum: 'hihat-closed', label: '&' },
    { time: 25.4, drum: 'snare', label: '2' },
    { time: 25.4, drum: 'hihat-closed', label: '2' },
    { time: 25.7, drum: 'hihat-closed', label: '&' },
    { time: 26.0, drum: 'kick', label: '3' },
    { time: 26.0, drum: 'hihat-closed', label: '3' },
    { time: 26.3, drum: 'hihat-closed', label: '&' },
    { time: 26.6, drum: 'snare', label: '4' },
    { time: 26.6, drum: 'hihat-closed', label: '4' },
    { time: 26.9, drum: 'hihat-closed', label: '&' },
    
    // ===== 大填充 + 结束 =====
    { time: 27.2, drum: 'tom-high', label: '1' },
    { time: 27.4, drum: 'tom-mid', label: 'e' },
    { time: 27.6, drum: 'tom-low', label: '&' },
    { time: 27.8, drum: 'snare', label: 'a' },
    { time: 28.0, drum: 'tom-high', label: '2' },
    { time: 28.2, drum: 'tom-mid', label: 'e' },
    { time: 28.4, drum: 'tom-low', label: '&' },
    { time: 28.6, drum: 'snare', label: 'a' },
    { time: 28.8, drum: 'kick', label: '3' },
    { time: 29.0, drum: 'snare', label: 'e' },
    { time: 29.2, drum: 'kick', label: '&' },
    { time: 29.4, drum: 'snare', label: 'a' },
    { time: 29.6, drum: 'tom-high', label: '4' },
    { time: 29.8, drum: 'tom-mid', label: 'e' },
    { time: 30.0, drum: 'tom-low', label: '&' },
    { time: 30.2, drum: 'snare', label: 'a' },
    
    { time: 30.4, drum: 'kick', label: '1' },
    { time: 30.4, drum: 'crash', label: '1' },
    { time: 30.7, drum: 'snare', label: '&' },
    { time: 31.0, drum: 'kick', label: '2' },
    { time: 31.3, drum: 'snare', label: '&' },
    { time: 31.6, drum: 'kick', label: '3' },
    { time: 31.9, drum: 'crash', label: '&', isEnd: true },
  ] as Beat[]
}

// 所有练习曲列表
export const LESSON_MAPS: RhythmMap[] = [
  // 入门级别 (Beginner) - 课程 1-4
  beginnerBasicRhythm,
  beginnerHiHatRhythm,
  beginnerRestNotes,
  beginnerSimpleFill,
  
  // 初级级别 (Elementary) - 课程 5-7
  elementaryEighthNotes,
  elementaryOpenHiHat,
  elementaryFillPractice,
  
  // 中级级别 (Intermediate) - 课程 8-9
  intermediateSixteenthNotes,
  intermediateComplexFills,
  
  // 进阶级别 (Advanced) - 课程 10
  advancedMasterclass,
]

// 通过ID获取练习曲
export const getLessonById = (id: string): RhythmMap | undefined => {
  return LESSON_MAPS.find(map => map.id === id)
}

// 获取所有初学者课程
export const getBeginnerLessons = (): RhythmMap[] => {
  return LESSON_MAPS.filter(map => map.difficulty === 'beginner')
}

// 获取所有初级课程
export const getElementaryLessons = (): RhythmMap[] => {
  return LESSON_MAPS.filter(map => map.difficulty === 'elementary')
}

// 获取所有中级课程
export const getIntermediateLessons = (): RhythmMap[] => {
  return LESSON_MAPS.filter(map => map.difficulty === 'intermediate')
}

// 获取所有进阶课程
export const getAdvancedLessons = (): RhythmMap[] => {
  return LESSON_MAPS.filter(map => map.difficulty === 'advanced')
}

// 按难度级别获取课程
export const getLessonsByDifficulty = (difficulty: string): RhythmMap[] => {
  return LESSON_MAPS.filter(map => map.difficulty === difficulty)
}

// 获取课程总数
export const getTotalLessonCount = (): number => {
  return LESSON_MAPS.length
}

// 获取课程进度信息
export const getLessonProgress = (completedLessons: string[]) => {
  const total = LESSON_MAPS.length
  const completed = completedLessons.length
  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
    nextLesson: LESSON_MAPS[completed] || null,
  }
}
