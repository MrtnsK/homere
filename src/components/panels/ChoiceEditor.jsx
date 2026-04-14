import { useCallback } from 'react'
import { useStoryStore } from '../../store/useStoryStore'

function FlagEditor({ label, value, onChange }) {
  const handleFlagChange = (field, val) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-500 w-12 shrink-0">{label}</span>
      <input
        type="text"
        placeholder="nom du flag"
        value={value?.flag ?? ''}
        onChange={(e) => handleFlagChange('flag', e.target.value)}
        className="flex-1 min-w-0 px-2 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
      />
      <select
        value={String(value?.value ?? 'true')}
        onChange={(e) => handleFlagChange('value', e.target.value === 'true')}
        className="w-16 px-1 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-300 focus:outline-none focus:border-indigo-500"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </div>
  )
}

export default function ChoiceEditor({ nodeId, choice, index, allNodes }) {
  const updateChoice = useStoryStore((s) => s.updateChoice)
  const deleteChoice = useStoryStore((s) => s.deleteChoice)

  const update = useCallback(
    (field, value) => updateChoice(nodeId, index, { [field]: value }),
    [nodeId, index, updateChoice]
  )

  const handleConditionToggle = useCallback(() => {
    if (choice.condition) {
      update('condition', null)
    } else {
      update('condition', { flag: '', value: true })
    }
  }, [choice.condition, update])

  const handleEffectToggle = useCallback(() => {
    if (choice.effects?.length > 0) {
      update('effects', [])
    } else {
      update('effects', [{ flag: '', value: true }])
    }
  }, [choice.effects, update])

  const updateEffect = useCallback(
    (effectIndex, newEffect) => {
      const effects = [...(choice.effects ?? [])]
      effects[effectIndex] = newEffect
      update('effects', effects)
    },
    [choice.effects, update]
  )

  const addEffect = useCallback(() => {
    update('effects', [...(choice.effects ?? []), { flag: '', value: true }])
  }, [choice.effects, update])

  const removeEffect = useCallback(
    (effectIndex) => {
      update('effects', choice.effects.filter((_, i) => i !== effectIndex))
    },
    [choice.effects, update]
  )

  return (
    <div className="border border-[#2e3347] rounded-lg p-3 space-y-2.5 bg-[#0f1117]">
      {/* Header : numéro + supprimer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Choix {index + 1}
        </span>
        <button
          onClick={() => deleteChoice(nodeId, index)}
          className="text-gray-600 hover:text-red-400 transition-colors"
          title="Supprimer ce choix"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Texte du choix */}
      <input
        type="text"
        placeholder="Texte du choix…"
        value={choice.text ?? ''}
        onChange={(e) => update('text', e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs rounded bg-[#1a1d27] border border-[#2e3347] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
      />

      {/* Nœud cible */}
      <div>
        <label className="text-[10px] text-gray-500 mb-1 block">Nœud cible</label>
        <select
          value={choice.targetNodeId ?? ''}
          onChange={(e) => update('targetNodeId', e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded bg-[#1a1d27] border border-[#2e3347] text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">— sélectionner —</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.id} {n.data.text ? `— ${n.data.text.slice(0, 30)}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div>
        <button
          onClick={handleConditionToggle}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors"
        >
          <span
            className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
              choice.condition ? 'bg-indigo-500 border-indigo-500' : 'border-[#4f5a7a]'
            }`}
          >
            {choice.condition && (
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          Condition d'affichage
        </button>
        {choice.condition && (
          <div className="mt-1.5">
            <FlagEditor
              label="Flag :"
              value={choice.condition}
              onChange={(v) => update('condition', v)}
            />
          </div>
        )}
      </div>

      {/* Effets */}
      <div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleEffectToggle}
            className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors"
          >
            <span
              className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                choice.effects?.length > 0 ? 'bg-indigo-500 border-indigo-500' : 'border-[#4f5a7a]'
              }`}
            >
              {choice.effects?.length > 0 && (
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            Effets sur les flags
          </button>
          {choice.effects?.length > 0 && (
            <button
              onClick={addEffect}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Ajouter
            </button>
          )}
        </div>
        {choice.effects?.length > 0 && (
          <div className="mt-1.5 space-y-1.5">
            {choice.effects.map((effect, ei) => (
              <div key={ei} className="flex items-center gap-1">
                <div className="flex-1">
                  <FlagEditor
                    label={`[${ei + 1}]`}
                    value={effect}
                    onChange={(v) => updateEffect(ei, v)}
                  />
                </div>
                <button
                  onClick={() => removeEffect(ei)}
                  className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
