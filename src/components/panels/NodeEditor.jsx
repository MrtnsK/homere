import { useCallback } from 'react'
import { useStoryStore } from '../../store/useStoryStore'
import { NODE_TYPES, NODE_TYPE_STYLES } from '../../constants/defaults'
import ChoiceEditor from './ChoiceEditor'

const TYPE_OPTIONS = [
  { value: NODE_TYPES.MESSAGE, label: 'Message' },
  { value: NODE_TYPES.END, label: 'Fin' },
  { value: NODE_TYPES.END_WITH_MALUS, label: 'Fin avec malus' },
]

export default function NodeEditor({ nodeId }) {
  const node = useStoryStore((s) => s.rfNodes.find((n) => n.id === nodeId))
  const allNodes = useStoryStore((s) => s.rfNodes)
  const updateNodeData = useStoryStore((s) => s.updateNodeData)
  const deleteNode = useStoryStore((s) => s.deleteNode)
  const duplicateNode = useStoryStore((s) => s.duplicateNode)
  const addChoice = useStoryStore((s) => s.addChoice)
  const startNodeId = useStoryStore((s) => s.startNodeId)
  const setStartNode = useStoryStore((s) => s.setStartNode)

  const update = useCallback(
    (field, value) => updateNodeData(nodeId, { [field]: value }),
    [nodeId, updateNodeData]
  )

  if (!node) {
    return (
      <div className="p-4 text-sm text-gray-500">Nœud introuvable.</div>
    )
  }

  const { storyType, text, delay, choices = [] } = node.data
  const style = NODE_TYPE_STYLES[storyType] ?? NODE_TYPE_STYLES.message
  const isStart = nodeId === startNodeId

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2e3347] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-sm font-semibold text-gray-100">Éditer le nœud</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 bg-[#0f1117] px-2 py-0.5 rounded">
          {nodeId}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Type */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Type de nœud</label>
          <div className="flex gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('storyType', opt.value)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  storyType === opt.value
                    ? `${NODE_TYPE_STYLES[opt.value].badge} ${NODE_TYPE_STYLES[opt.value].border}`
                    : 'bg-[#0f1117] border-[#2e3347] text-gray-500 hover:border-[#4f5a7a] hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nœud de départ */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Nœud de départ</span>
          <button
            onClick={() => setStartNode(isStart ? startNodeId : nodeId)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isStart ? 'bg-amber-500' : 'bg-[#2e3347]'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isStart ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>

        {/* Texte */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Texte du message</label>
          <textarea
            value={text ?? ''}
            onChange={(e) => update('text', e.target.value)}
            rows={5}
            placeholder="Saisissez le texte du message…"
            className="w-full px-2.5 py-2 text-sm rounded-lg bg-[#0f1117] border border-[#2e3347] text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Délai */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            Délai (secondes)
            <span className="ml-1 text-gray-600 font-normal">— override du défaut global</span>
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={delay ?? ''}
            onChange={(e) => update('delay', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="Délai par défaut"
            className="w-full px-2.5 py-1.5 text-sm rounded-lg bg-[#0f1117] border border-[#2e3347] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Choix — seulement pour les nœuds "message" */}
        {storyType === NODE_TYPES.MESSAGE && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 font-medium">
                Choix ({choices.length})
              </label>
              <button
                onClick={() => addChoice(nodeId)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter
              </button>
            </div>

            {choices.length === 0 ? (
              <p className="text-xs text-gray-600 italic text-center py-3 border border-dashed border-[#2e3347] rounded-lg">
                Aucun choix — nœud terminal ou à relier
              </p>
            ) : (
              <div className="space-y-2">
                {choices.map((choice, i) => (
                  <ChoiceEditor
                    key={i}
                    nodeId={nodeId}
                    choice={choice}
                    index={i}
                    allNodes={allNodes.filter((n) => n.id !== nodeId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions en bas */}
      <div className="px-4 pb-4 pt-2 border-t border-[#2e3347] flex gap-2 shrink-0">
        <button
          onClick={() => duplicateNode(nodeId)}
          className="flex-1 py-1.5 text-xs rounded-lg bg-[#22263a] hover:bg-[#2e3347] text-gray-300 hover:text-white border border-[#2e3347] transition-colors"
        >
          Dupliquer
        </button>
        <button
          onClick={() => deleteNode(nodeId)}
          className="flex-1 py-1.5 text-xs rounded-lg bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-900/50 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
