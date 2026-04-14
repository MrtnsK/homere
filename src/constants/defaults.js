import { nanoid } from 'nanoid'

export const NODE_TYPES = {
  MESSAGE: 'message',
  END: 'end',
  END_WITH_MALUS: 'end_with_malus',
}

export const DEFAULT_META = {
  title: 'Nouvelle histoire',
  author: '',
  version: '1.0',
  language: 'fr',
  defaultDelay: 3,
  timeoutThreshold: 30,
}

export const makeNodeId = () => nanoid(8)

export const makeNewNode = (position = { x: 100, y: 100 }) => {
  const id = makeNodeId()
  return {
    id,
    type: 'storyNode',
    position,
    data: {
      storyType: NODE_TYPES.MESSAGE,
      text: '',
      delay: null,
      choices: [],
    },
  }
}

export const makeNewChoice = () => ({
  text: '',
  targetNodeId: '',
  condition: null,
  effects: [],
})

// Couleurs par type de nœud
export const NODE_TYPE_STYLES = {
  [NODE_TYPES.MESSAGE]: {
    border: 'border-indigo-500',
    badge: 'bg-indigo-500/20 text-indigo-300',
    label: 'Message',
    dot: 'bg-indigo-400',
  },
  [NODE_TYPES.END]: {
    border: 'border-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300',
    label: 'Fin',
    dot: 'bg-emerald-400',
  },
  [NODE_TYPES.END_WITH_MALUS]: {
    border: 'border-red-500',
    badge: 'bg-red-500/20 text-red-300',
    label: 'Fin (malus)',
    dot: 'bg-red-400',
  },
}
