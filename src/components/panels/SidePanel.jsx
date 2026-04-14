import { useStoryStore } from '../../store/useStoryStore'
import NodeEditor from './NodeEditor'

export default function SidePanel() {
  const selectedNodeId = useStoryStore((s) => s.selectedNodeId)

  return (
    <aside
      className={`
        h-full bg-[#1a1d27] border-l border-[#2e3347] flex flex-col overflow-hidden
        transition-all duration-200
        ${selectedNodeId ? 'w-72' : 'w-0 border-l-0'}
      `}
    >
      {selectedNodeId && <NodeEditor nodeId={selectedNodeId} />}
    </aside>
  )
}
