import { ref } from 'vue'

export function useTouch(onDrumTrigger: (drumId: string) => void) {
  const activeTouches = ref<Set<string>>(new Set())

  const handleTouchStart = (event: TouchEvent, drumId: string) => {
    event.preventDefault()
    
    // 支持多点触控，每个触摸点可以触发不同的鼓
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const touchKey = `${drumId}-${touch.identifier}`
      
      if (!activeTouches.value.has(touchKey)) {
        activeTouches.value.add(touchKey)
        onDrumTrigger(drumId)
      }
    }
  }

  const handleTouchEnd = (event: TouchEvent, drumId: string) => {
    event.preventDefault()
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const touchKey = `${drumId}-${touch.identifier}`
      activeTouches.value.delete(touchKey)
    }
  }

  const handleTouchCancel = (event: TouchEvent, drumId: string) => {
    handleTouchEnd(event, drumId)
  }

  // 处理多点触控，确保同时触发多个鼓垫
  const setupDrumPadTouch = (element: HTMLElement, drumId: string) => {
    element.addEventListener('touchstart', (e) => handleTouchStart(e, drumId), { passive: false })
    element.addEventListener('touchend', (e) => handleTouchEnd(e, drumId), { passive: false })
    element.addEventListener('touchcancel', (e) => handleTouchCancel(e, drumId), { passive: false })
    
    return () => {
      element.removeEventListener('touchstart', (e) => handleTouchStart(e, drumId))
      element.removeEventListener('touchend', (e) => handleTouchEnd(e, drumId))
      element.removeEventListener('touchcancel', (e) => handleTouchCancel(e, drumId))
    }
  }

  return {
    activeTouches,
    handleTouchStart,
    handleTouchEnd,
    setupDrumPadTouch
  }
}
