import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'dark' | 'light' | 'cyberpunk'

interface ThemeColors {
  bg: string
  bgGradient: string
  text: string
  textMuted: string
  pad: string
  padBorder: string
  accent: string
  header: string
}

const themes: Record<Theme, ThemeColors> = {
  dark: {
    bg: '#1a1a2e',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    text: '#eee',
    textMuted: '#94a3b8',
    pad: 'rgba(22, 33, 62, 0.9)',
    padBorder: 'rgba(233, 69, 96, 0.25)',
    accent: '#e94560',
    header: 'bg-gradient-to-r from-pink-500 to-violet-500'
  },
  light: {
    bg: '#f8fafc',
    bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    text: '#1e293b',
    textMuted: '#64748b',
    pad: 'rgba(255, 255, 255, 0.9)',
    padBorder: 'rgba(99, 102, 241, 0.25)',
    accent: '#6366f1',
    header: 'bg-gradient-to-r from-indigo-500 to-blue-500'
  },
  cyberpunk: {
    bg: '#0a0a0f',
    bgGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #0d1f1f 100%)',
    text: '#00ff9f',
    textMuted: '#00b8a9',
    pad: 'rgba(10, 20, 30, 0.95)',
    padBorder: 'rgba(0, 255, 159, 0.4)',
    accent: '#ff00ff',
    header: 'bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400'
  }
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('dark')
  
  // Load saved theme
  const loadTheme = () => {
    try {
      const saved = localStorage.getItem('drum-theme') as Theme
      if (saved && themes[saved]) {
        currentTheme.value = saved
      }
    } catch (err) {
      console.error('Failed to load theme:', err)
    }
    applyTheme()
  }
  
  // Apply theme to CSS variables
  const applyTheme = () => {
    const theme = themes[currentTheme.value]
    const root = document.documentElement
    
    root.style.setProperty('--drum-bg', theme.bg)
    root.style.setProperty('--drum-text', theme.text)
    root.style.setProperty('--drum-text-muted', theme.textMuted)
    root.style.setProperty('--drum-pad', theme.pad)
    root.style.setProperty('--drum-pad-border', theme.padBorder)
    root.style.setProperty('--drum-accent', theme.accent)
    
    // Apply background
    document.body.style.background = theme.bgGradient
    document.body.style.color = theme.text
  }
  
  // Set theme
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('drum-theme', theme)
    applyTheme()
  }
  
  // Toggle between themes
  const cycleTheme = () => {
    const themeList: Theme[] = ['dark', 'light', 'cyberpunk']
    const currentIndex = themeList.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themeList.length
    setTheme(themeList[nextIndex])
  }
  
  // Get current theme colors
  const themeColors = computed(() => themes[currentTheme.value])
  
  // Get theme label
  const themeLabel = computed(() => {
    const labels: Record<Theme, string> = {
      dark: '暗夜',
      light: '明亮',
      cyberpunk: '赛博朋克'
    }
    return labels[currentTheme.value]
  })
  
  // Initialize
  loadTheme()
  
  return {
    currentTheme,
    themeColors,
    themeLabel,
    setTheme,
    cycleTheme
  }
})
