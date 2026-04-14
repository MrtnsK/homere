import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import StoryNode from './StoryNode'
import StoryEdge from './StoryEdge'
import { useStoryStore } from '../../store/useStoryStore'

const nodeTypes = { storyNode: StoryNode }
const edgeTypes = { storyEdge: StoryEdge }

const defaultEdgeOptions = {
  type: 'storyEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: '#4f5a7a',
  },
}

export default function StoryCanvas() {
  const rfNodes = useStoryStore((s) => s.rfNodes)
  const rfEdges = useStoryStore((s) => s.rfEdges)
  const onNodesChange = useStoryStore((s) => s.onNodesChange)
  const onEdgesChange = useStoryStore((s) => s.onEdgesChange)
  const onConnect = useStoryStore((s) => s.onConnect)
  const setSelectedNode = useStoryStore((s) => s.setSelectedNode)
  const addNode = useStoryStore((s) => s.addNode)

  // Double-clic sur le canvas → créer un nœud
  const onDoubleClick = useCallback(
    (event) => {
      // Vérifier qu'on clique sur le fond (pas un nœud)
      if (event.target.closest('.react-flow__node')) return

      const bounds = event.currentTarget.getBoundingClientRect()
      const position = {
        x: event.clientX - bounds.left - 112, // centrer (w-56 = 224px, /2 = 112)
        y: event.clientY - bounds.top - 40,
      }
      addNode(position)
    },
    [addNode]
  )

  // Clic sur le fond → désélectionner
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDoubleClick={onDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#2e3347"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const type = node.data?.storyType
            if (type === 'end') return '#10b981'
            if (type === 'end_with_malus') return '#ef4444'
            return '#6366f1'
          }}
          maskColor="rgba(15,17,23,0.7)"
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}
