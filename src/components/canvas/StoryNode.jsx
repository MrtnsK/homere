import { memo, useCallback } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useStoryStore } from '../../store/useStoryStore'
import { NODE_TYPE_STYLES } from '../../constants/defaults'

const StoryNode = memo(({ id, data, selected }) => {
  const { storyType = 'message', text, choices = [] } = data
  const style = NODE_TYPE_STYLES[storyType] ?? NODE_TYPE_STYLES.message

  const selectedNodeId = useStoryStore((s) => s.selectedNodeId)
  const setSelectedNode = useStoryStore((s) => s.setSelectedNode)
  const startNodeId = useStoryStore((s) => s.startNodeId)
  const isStart = id === startNodeId

  const preview = text ? text.slice(0, 80) + (text.length > 80 ? '…' : '') : '(vide)'

  const handleClick = useCallback(() => {
    setSelectedNode(id)
  }, [id, setSelectedNode])

  const isSelected = selectedNodeId === id

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-56 rounded-xl border-2 bg-[#1a1d27] shadow-xl cursor-pointer
        transition-all duration-150 select-none
        ${style.border}
        ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0f1117]' : ''}
      `}
    >
      {/* Handle entrée (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#4f5a7a] !border-[#2e3347] !w-3 !h-3 !rounded-full hover:!bg-indigo-400 transition-colors"
      />

      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b border-[#2e3347]`}>
        <div className="flex items-center gap-2">
          {isStart && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              START
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
            {style.label}
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">{id}</span>
      </div>

      {/* Corps */}
      <div className="px-3 py-2.5">
        <p className={`text-xs leading-relaxed ${text ? 'text-gray-300' : 'text-gray-600 italic'}`}>
          {preview}
        </p>
      </div>

      {/* Footer : nb de choix */}
      {choices.length > 0 && (
        <div className="px-3 pb-2.5">
          <div className="flex flex-wrap gap-1">
            {choices.map((choice, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#22263a] text-gray-400 border border-[#2e3347]">
                {choice.text ? choice.text.slice(0, 18) + (choice.text.length > 18 ? '…' : '') : `Choix ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Handle sortie (bottom) — pour créer de nouvelles connexions */}
      {storyType === 'message' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[#4f5a7a] !border-[#2e3347] !w-3 !h-3 !rounded-full hover:!bg-indigo-400 transition-colors"
        />
      )}
    </div>
  )
})

StoryNode.displayName = 'StoryNode'
export default StoryNode
