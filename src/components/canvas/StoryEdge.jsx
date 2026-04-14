import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react'

const StoryEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  })

  const label = data?.label || ''

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#6366f1' : '#4f5a7a',
          strokeWidth: selected ? 2.5 : 2,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1d27] border border-[#2e3347] text-gray-400 whitespace-nowrap shadow-sm">
              {label.length > 24 ? label.slice(0, 24) + '…' : label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

StoryEdge.displayName = 'StoryEdge'
export default StoryEdge
