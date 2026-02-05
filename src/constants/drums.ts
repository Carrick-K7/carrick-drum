import type { Drum } from '../types'

export const DRUMS: Drum[] = [
  {
    id: 'kick',
    name: 'Kick',
    nameZh: '底鼓',
    key: 'A',
    sample: '/samples/rock/kick.mp3',
    color: '#e94560'
  },
  {
    id: 'snare',
    name: 'Snare',
    nameZh: '军鼓',
    key: 'S',
    sample: '/samples/rock/snare.mp3',
    color: '#f39c12'
  },
  {
    id: 'hihat-closed',
    name: 'Hi-Hat Closed',
    nameZh: '闭合踩镲',
    key: 'D',
    sample: '/samples/rock/hihat-closed.mp3',
    color: '#3498db'
  },
  {
    id: 'hihat-open',
    name: 'Hi-Hat Open',
    nameZh: '开放踩镲',
    key: 'F',
    sample: '/samples/rock/hihat-open.mp3',
    color: '#9b59b6'
  },
  {
    id: 'crash',
    name: 'Crash',
    nameZh: '碎音镲',
    key: 'G',
    sample: '/samples/rock/crash.mp3',
    color: '#1abc9c'
  },
  {
    id: 'tom-low',
    name: 'Tom Low',
    nameZh: '低音桶鼓',
    key: 'H',
    sample: '/samples/rock/tom-low.mp3',
    color: '#e74c3c'
  },
  {
    id: 'tom-mid',
    name: 'Tom Mid',
    nameZh: '中音桶鼓',
    key: 'J',
    sample: '/samples/rock/tom-mid.mp3',
    color: '#f1c40f'
  },
  {
    id: 'tom-high',
    name: 'Tom High',
    nameZh: '高音桶鼓',
    key: 'K',
    sample: '/samples/rock/tom-high.mp3',
    color: '#2ecc71'
  }
]

export const KEY_MAP: Record<string, string> = DRUMS.reduce((acc, drum) => {
  acc[drum.key.toLowerCase()] = drum.id
  return acc
}, {} as Record<string, string>)
