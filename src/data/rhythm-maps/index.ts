import type { RhythmMap, Beat } from '../../types'

export type { RhythmMap, Beat }

// 摇滚节奏 - 经典的 4/4 拍摇滚节奏
export const rockRhythm: RhythmMap = {
  id: 'rock-beats',
  title: '摇滚节奏',
  titleEn: 'Rock Beats',
  bpm: 120,
  duration: 32, // 8 小节
  style: 'rock',
  description: '经典的 4/4 拍摇滚节奏，适合练习基础鼓点',
  beats: [
    // 第 1 小节
    { time: 0.0, drum: 'kick' },
    { time: 0.0, drum: 'hihat-closed' },
    { time: 0.5, drum: 'hihat-closed' },
    { time: 1.0, drum: 'snare' },
    { time: 1.0, drum: 'hihat-closed' },
    { time: 1.5, drum: 'hihat-closed' },
    // 第 2 小节
    { time: 2.0, drum: 'kick' },
    { time: 2.0, drum: 'hihat-closed' },
    { time: 2.5, drum: 'hihat-closed' },
    { time: 3.0, drum: 'snare' },
    { time: 3.0, drum: 'hihat-closed' },
    { time: 3.5, drum: 'hihat-closed' },
    // 第 3 小节 (加入底鼓双击)
    { time: 4.0, drum: 'kick' },
    { time: 4.0, drum: 'hihat-closed' },
    { time: 4.5, drum: 'kick' },
    { time: 4.75, drum: 'hihat-closed' },
    { time: 5.0, drum: 'snare' },
    { time: 5.0, drum: 'hihat-closed' },
    { time: 5.5, drum: 'hihat-closed' },
    // 第 4 小节
    { time: 6.0, drum: 'kick' },
    { time: 6.0, drum: 'hihat-closed' },
    { time: 6.5, drum: 'hihat-closed' },
    { time: 7.0, drum: 'snare' },
    { time: 7.0, drum: 'hihat-closed' },
    { time: 7.5, drum: 'hihat-closed' },
    // 第 5 小节 (加入 Crash)
    { time: 8.0, drum: 'kick' },
    { time: 8.0, drum: 'crash' },
    { time: 8.5, drum: 'hihat-closed' },
    { time: 9.0, drum: 'snare' },
    { time: 9.0, drum: 'hihat-closed' },
    { time: 9.5, drum: 'hihat-closed' },
    // 第 6 小节
    { time: 10.0, drum: 'kick' },
    { time: 10.0, drum: 'hihat-closed' },
    { time: 10.5, drum: 'hihat-closed' },
    { time: 11.0, drum: 'snare' },
    { time: 11.0, drum: 'hihat-closed' },
    { time: 11.5, drum: 'hihat-closed' },
    // 第 7 小节 (加入 Tom)
    { time: 12.0, drum: 'kick' },
    { time: 12.0, drum: 'hihat-closed' },
    { time: 12.5, drum: 'hihat-closed' },
    { time: 13.0, drum: 'snare' },
    { time: 13.0, drum: 'hihat-closed' },
    { time: 13.5, drum: 'tom-mid' },
    // 第 8 小节 (结束)
    { time: 14.0, drum: 'kick' },
    { time: 14.0, drum: 'hihat-closed' },
    { time: 14.5, drum: 'hihat-closed' },
    { time: 15.0, drum: 'snare' },
    { time: 15.0, drum: 'crash' },
    { time: 15.5, drum: 'hihat-closed' },
  ]
}

// 流行音乐 - 轻快的流行节拍
export const popRhythm: RhythmMap = {
  id: 'pop-groove',
  title: '流行律动',
  titleEn: 'Pop Groove',
  bpm: 100,
  duration: 24, // 8 小节（每小节 3 秒）
  style: 'pop',
  description: '轻快的流行节拍，适合练习踩镲控制',
  beats: [
    // 第 1 小节
    { time: 0.0, drum: 'kick' },
    { time: 0.0, drum: 'hihat-closed' },
    { time: 0.6, drum: 'hihat-closed' },
    { time: 1.2, drum: 'snare' },
    { time: 1.2, drum: 'hihat-closed' },
    { time: 1.8, drum: 'hihat-closed' },
    // 第 2 小节
    { time: 2.4, drum: 'kick' },
    { time: 2.4, drum: 'hihat-closed' },
    { time: 3.0, drum: 'hihat-open' },
    { time: 3.6, drum: 'snare' },
    { time: 3.6, drum: 'hihat-closed' },
    { time: 4.2, drum: 'hihat-closed' },
    // 第 3 小节 (加入底鼓变化)
    { time: 4.8, drum: 'kick' },
    { time: 4.8, drum: 'hihat-closed' },
    { time: 5.4, drum: 'kick' },
    { time: 5.4, drum: 'hihat-closed' },
    { time: 6.0, drum: 'snare' },
    { time: 6.0, drum: 'hihat-closed' },
    { time: 6.6, drum: 'hihat-closed' },
    // 第 4 小节
    { time: 7.2, drum: 'kick' },
    { time: 7.2, drum: 'hihat-closed' },
    { time: 7.8, drum: 'hihat-open' },
    { time: 8.4, drum: 'snare' },
    { time: 8.4, drum: 'hihat-closed' },
    { time: 9.0, drum: 'hihat-closed' },
    // 第 5 小节 (加入 Tom 填充)
    { time: 9.6, drum: 'kick' },
    { time: 9.6, drum: 'crash' },
    { time: 10.2, drum: 'hihat-closed' },
    { time: 10.8, drum: 'snare' },
    { time: 10.8, drum: 'hihat-closed' },
    { time: 11.4, drum: 'hihat-closed' },
    // 第 6 小节
    { time: 12.0, drum: 'kick' },
    { time: 12.0, drum: 'hihat-closed' },
    { time: 12.6, drum: 'hihat-open' },
    { time: 13.2, drum: 'snare' },
    { time: 13.2, drum: 'hihat-closed' },
    { time: 13.8, drum: 'hihat-closed' },
    // 第 7 小节 (Tom 滚奏)
    { time: 14.4, drum: 'kick' },
    { time: 14.4, drum: 'hihat-closed' },
    { time: 15.0, drum: 'tom-high' },
    { time: 15.3, drum: 'tom-mid' },
    { time: 15.6, drum: 'snare' },
    { time: 15.6, drum: 'tom-low' },
    // 第 8 小节 (结束)
    { time: 16.8, drum: 'kick' },
    { time: 16.8, drum: 'hihat-closed' },
    { time: 17.4, drum: 'hihat-open' },
    { time: 18.0, drum: 'snare' },
    { time: 18.0, drum: 'crash' },
    { time: 18.6, drum: 'hihat-closed' },
  ]
}

// 电子节拍 - 快速的电子音乐风格
export const electronicRhythm: RhythmMap = {
  id: 'electronic-beats',
  title: '电子节拍',
  titleEn: 'Electronic Beats',
  bpm: 128,
  duration: 20, // 约 10 小节
  style: 'electronic',
  description: '快速的电子音乐风格，适合练习速度和精准度',
  beats: [
    // 第 1 小节 (典型的四四拍 house 节奏)
    { time: 0.000, drum: 'kick' },
    { time: 0.000, drum: 'hihat-closed' },
    { time: 0.469, drum: 'hihat-closed' },
    { time: 0.938, drum: 'snare' },
    { time: 0.938, drum: 'hihat-closed' },
    { time: 1.406, drum: 'hihat-closed' },
    // 第 2 小节
    { time: 1.875, drum: 'kick' },
    { time: 1.875, drum: 'hihat-closed' },
    { time: 2.344, drum: 'hihat-closed' },
    { time: 2.813, drum: 'snare' },
    { time: 2.813, drum: 'hihat-closed' },
    { time: 3.281, drum: 'hihat-closed' },
    // 第 3 小节 (加入更多踩镲)
    { time: 3.750, drum: 'kick' },
    { time: 3.750, drum: 'hihat-closed' },
    { time: 4.219, drum: 'hihat-closed' },
    { time: 4.453, drum: 'kick' },
    { time: 4.688, drum: 'snare' },
    { time: 4.688, drum: 'hihat-closed' },
    { time: 5.156, drum: 'hihat-closed' },
    // 第 4 小节
    { time: 5.625, drum: 'kick' },
    { time: 5.625, drum: 'hihat-closed' },
    { time: 6.094, drum: 'hihat-closed' },
    { time: 6.563, drum: 'snare' },
    { time: 6.563, drum: 'hihat-closed' },
    { time: 7.031, drum: 'hihat-closed' },
    // 第 5 小节 (加入开放踩镲)
    { time: 7.500, drum: 'kick' },
    { time: 7.500, drum: 'crash' },
    { time: 7.969, drum: 'hihat-open' },
    { time: 8.438, drum: 'snare' },
    { time: 8.438, drum: 'hihat-closed' },
    { time: 8.906, drum: 'hihat-closed' },
    // 第 6 小节
    { time: 9.375, drum: 'kick' },
    { time: 9.375, drum: 'hihat-closed' },
    { time: 9.844, drum: 'hihat-closed' },
    { time: 10.313, drum: 'snare' },
    { time: 10.313, drum: 'hihat-closed' },
    { time: 10.781, drum: 'hihat-closed' },
    // 第 7 小节 (Tom 填充)
    { time: 11.250, drum: 'kick' },
    { time: 11.250, drum: 'hihat-closed' },
    { time: 11.719, drum: 'tom-high' },
    { time: 11.953, drum: 'tom-mid' },
    { time: 12.188, drum: 'snare' },
    { time: 12.188, drum: 'tom-low' },
    // 第 8 小节
    { time: 12.656, drum: 'kick' },
    { time: 12.656, drum: 'hihat-closed' },
    { time: 13.125, drum: 'hihat-closed' },
    { time: 13.594, drum: 'snare' },
    { time: 13.594, drum: 'hihat-closed' },
    { time: 14.063, drum: 'hihat-closed' },
    // 第 9 小节 (快速填充)
    { time: 14.531, drum: 'kick' },
    { time: 14.648, drum: 'kick' },
    { time: 14.766, drum: 'tom-high' },
    { time: 14.883, drum: 'tom-mid' },
    { time: 15.000, drum: 'snare' },
    { time: 15.000, drum: 'tom-low' },
    { time: 15.469, drum: 'hihat-closed' },
    // 第 10 小节 (结束)
    { time: 15.938, drum: 'kick' },
    { time: 15.938, drum: 'crash' },
    { time: 16.406, drum: 'hihat-closed' },
    { time: 16.875, drum: 'snare' },
    { time: 16.875, drum: 'hihat-closed' },
    { time: 17.344, drum: 'hihat-open' },
  ]
}

// 所有节奏映射列表
export const RHYTHM_MAPS: RhythmMap[] = [rockRhythm, popRhythm, electronicRhythm]

// 通过 ID 获取节奏映射
export const getRhythmMapById = (id: string): RhythmMap | undefined => {
  return RHYTHM_MAPS.find(map => map.id === id)
}
