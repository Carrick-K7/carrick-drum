import { onMounted, onUnmounted } from 'vue'
import { KEY_MAP } from '../constants/drums'

export function useKeyboard(onDrumTrigger: (drumId: string) => void) {
  const pressedKeys = new Set<string>()

  const handleKeyDown = (event: KeyboardEvent) => {
    // 防止重复触发（按住不放的情况）
    if (pressedKeys.has(event.key)) return
    
    const key = event.key.toLowerCase()
    const drumId = KEY_MAP[key]
    
    if (drumId) {
      pressedKeys.add(event.key)
      event.preventDefault()
      onDrumTrigger(drumId)
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.key)
  }

  // 防止窗口失去焦点时按键卡住
  const handleBlur = () => {
    pressedKeys.clear()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleBlur)
  })

  return {
    pressedKeys
  }
}
