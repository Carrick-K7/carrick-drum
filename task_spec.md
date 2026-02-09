# Drum App 开发任务规范

## 项目概述
基于 Web Audio API 的 Vue 3 架子鼓 Web 应用

---

## Phase 0: 项目初始化 ✅
- [x] 初始化 Vite + Vue 3 + TypeScript 项目
- [x] 配置 Tailwind CSS
- [x] 配置 ESLint + Prettier
- [x] 安装 Pinia (状态管理)

## Phase 1: 核心功能开发 ✅
- [x] 音频引擎 (useAudio composable)
  - [x] Web Audio API 初始化
  - [x] 音频采样加载 (Rock 鼓组)
  - [x] 实时播放
- [x] 键盘支持 (useKeyboard composable)
- [x] 触摸支持 (useTouch composable)
- [x] DrumKit 组件
- [x] DrumPad 组件
- [x] KeyboardHint 组件

## Phase 2: UI 优化 ✅
- [x] 响应式布局
- [x] 视觉反馈优化
- [x] 加载状态
- [x] 动画效果

## Phase 3: 增强功能 ✅

### 3.1 录音功能 ✅
- [x] Recording Store (Pinia)
  - [x] 录制按键/触摸事件时间戳
  - [x] 本地存储 (localStorage)
  - [x] 回放功能
- [x] RecordingPanel 组件
  - [x] 录音列表展示
  - [x] 播放控制
  - [x] 录音管理 (重命名/删除)
  - [x] 进度条显示

### 3.2 主题切换 ✅
- [x] Theme Store (Pinia)
  - [x] light/dark/cyberpunk 三种主题
  - [x] CSS Variables 实现
  - [x] 本地存储偏好
- [x] ThemeToggle 组件
- [x] 全应用主题适配

### 3.3 多鼓组切换 ✅
- [x] DrumKit Store (Pinia)
  - [x] Rock 鼓组 (采样)
  - [x] Electronic 鼓组 (Web Audio API 合成)
  - [x] 本地存储偏好
- [x] DrumKitSelector 组件
- [x] 合成音效实现
  - [x] Kick (正弦波 + 音高衰减)
  - [x] Snare (噪声 + 包络)
  - [x] Hi-Hat (高频噪声)
  - [x] Crash (长衰减噪声)
  - [x] Toms (正弦波)

### 3.4 设置面板 ✅
- [x] Settings Store (Pinia)
  - [x] 主音量控制
  - [x] 各鼓件独立音量
  - [x] 显示/隐藏键盘提示
  - [x] 减少动画选项
  - [x] 本地存储
- [x] SettingsPanel 组件
  - [x] 音量滑块
  - [x] 切换开关
  - [x] 恢复默认
- [x] 音量与音频引擎集成

---
## Phase 4: 伴奏模式 🎵 (当前开发中)

### 4.1 产品规格更新 (product_spec.md)
**新功能：伴奏演奏模式**
- 内置 2-3 首免费版权伴奏乐曲
- 自动模式：AI演示，自动按键打鼓
- 手动模式：播放音乐，用户跟着节奏敲
- 歌曲选择器 + 播放控制

### 4.2 开发任务
- [ ] 音频资源准备
  - [ ] 搜索免费版权音乐 (YouTube Audio Library / Free Music Archive)
  - [ ] 或使用 Web Audio API 合成简单节拍
  - [ ] 2-3 首不同风格 (摇滚/流行/电子)
- [ ] 节奏映射系统
  - [ ] 定义每首歌的鼓点节奏数据
  - [ ] 时间点 → 鼓件映射
- [ ] Accompaniment Store (Pinia)
  - [ ] 歌曲列表管理
  - [ ] 播放状态控制
  - [ ] 自动/手动模式切换
  - [ ] 当前播放进度
- [ ] 歌曲选择组件 (SongSelector.vue)
  - [ ] 歌曲列表展示
  - [ ] 歌曲预览播放
- [ ] 播放控制组件 (PlaybackControls.vue)
  - [ ] 播放/暂停/停止
  - [ ] 进度条
  - [ ] 自动/手动模式切换
- [ ] 自动演奏模式
  - [ ] 按时间触发鼓点
  - [ ] 视觉反馈跟随
- [ ] 集成到主应用
  - [ ] App.vue 添加伴奏模式入口
  - [ ] 与现有鼓组组件联动

### 4.3 技术要点
- Web Audio API 时间精确控制
- requestAnimationFrame 或 setInterval 实现自动演奏
- 节奏数据 JSON 格式设计

---

## 技术栈
- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- Pinia
- Web Audio API

## 在线演示
http://64.188.26.139:5173/

## 最近更新
- 2025-02-05: Phase 3 完成，新增录音、主题、多鼓组、设置面板功能
