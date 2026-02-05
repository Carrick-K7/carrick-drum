// 合成伴奏音频节拍器
// 使用 Web Audio API 生成节拍声音

interface MetronomeConfig {
  bpm: number
  beatsPerMeasure: number
  duration: number // seconds
}

// 创建音频上下文并生成节拍音频
export async function generateMetronomeAudio(config: MetronomeConfig): Promise<Blob> {
  const { bpm, beatsPerMeasure, duration } = config
  const sampleRate = 44100
  const totalSamples = Math.floor(duration * sampleRate)
  
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    1, // mono
    totalSamples,
    sampleRate
  )
  
  const beatInterval = 60 / bpm // seconds per beat
  const numBeats = Math.floor(duration / beatInterval)
  
  // 创建主增益节点
  const masterGain = offlineCtx.createGain()
  masterGain.gain.value = 0.3 // Lower volume for accompaniment
  masterGain.connect(offlineCtx.destination)
  
  // 为每个拍子创建声音
  for (let i = 0; i < numBeats; i++) {
    const time = i * beatInterval
    const isAccent = i % beatsPerMeasure === 0
    
    // 创建振荡器（拍子音）
    const osc = offlineCtx.createOscillator()
    const gain = offlineCtx.createGain()
    
    osc.frequency.value = isAccent ? 1000 : 800
    osc.type = 'sine'
    
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(isAccent ? 0.8 : 0.5, time + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
    
    osc.connect(gain)
    gain.connect(masterGain)
    
    osc.start(time)
    osc.stop(time + 0.1)
  }
  
  // 渲染音频
  const buffer = await offlineCtx.startRendering()
  
  // 转换为 WAV Blob
  return audioBufferToWav(buffer)
}

// 将 AudioBuffer 转换为 WAV 格式的 Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16
  
  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  
  const dataLength = buffer.length * numChannels * bytesPerSample
  const bufferLength = 44 + dataLength
  
  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)
  
  // WAV 文件头
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)
  
  // 写入音频数据
  const offset = 44
  const channelData: Float32Array[] = []
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i))
  }
  
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset + (i * numChannels + channel) * bytesPerSample, intSample, true)
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// 导出预设节拍器配置
export const METRONOME_PRESETS = {
  rock: { bpm: 120, beatsPerMeasure: 4, duration: 32 },
  pop: { bpm: 100, beatsPerMeasure: 4, duration: 24 },
  electronic: { bpm: 128, beatsPerMeasure: 4, duration: 20 }
} as const
