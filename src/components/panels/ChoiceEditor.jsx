import { useCallback } from 'react'
import { useStoryStore } from '../../store/useStoryStore'

// Détermine si une condition/effet utilise un int ou un bool
function getValueType(obj, boolKey, intKey) {
  if (obj?.[intKey] !== null && obj?.[intKey] !== undefined) return 'int'
  return 'bool'
}

/**
 * Éditeur générique pour condition et effet.
 *
 * Pour une condition : keys = { bool: 'boolEquals', int: 'intEquals' }
 * Pour un effet      : keys = { bool: 'setBool',    int: 'setInt'    }
 */
function FlagEditor({ label, value, onChange, keys }) {
  const valueType = getValueType(value, keys.bool, keys.int)

  const handleFlagChange = (e) => {
    onChange({ ...value, flag: e.target.value })
  }

  const handleTypeChange = (newType) => {
    if (newType === 'bool') {
      onChange({ flag: value?.flag ?? '', [keys.bool]: true, [keys.int]: null })
    } else {
      onChange({ flag: value?.flag ?? '', [keys.bool]: null, [keys.int]: 0 })
    }
  }

  const handleValueChange = (e) => {
    if (valueType === 'bool') {
      onChange({ ...value, [keys.bool]: e.target.value === 'true' })
    } else {
      const n = parseInt(e.target.value, 10)
      onChange({ ...value, [keys.int]: isNaN(n) ? 0 : n })
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-[10px] text-gray-500 w-10 shrink-0">{label}</span>
      )}
      {/* Nom du flag */}
      <input
        type="text"
        placeholder="flag"
        value={value?.flag ?? ''}
        onChange={handleFlagChange}
        className="flex-1 min-w-0 px-2 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
      />
      {/* Type : bool / int */}
      <select
        value={valueType}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="w-14 px-1 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-400 focus:outline-none focus:border-indigo-500"
      >
        <option value="bool">bool</option>
        <option value="int">int</option>
      </select>
      {/* Valeur */}
      {valueType === 'bool' ? (
        <select
          value={String(value?.[keys.bool] ?? 'true')}
          onChange={handleValueChange}
          className="w-16 px-1 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <input
          type="number"
          value={value?.[keys.int] ?? 0}
          onChange={handleValueChange}
          className="w-16 px-1 py-1 text-xs rounded bg-[#0f1117] border border-[#2e3347] text-gray-300 focus:outline-none focus:border-indigo-500"
        />
      )}
    </div>
  )
}

const CONDITION_KEYS = { bool: 'boolEquals', int: 'intEquals' }
const EFFECT_KEYS    = { bool: 'setBool',    int: 'setInt'    }

const makeEmptyCondition = () => ({ flag: '', boolEquals: true, intEquals: null })
const makeEmptyEffect    = () => ({ flag: '', setBool: true,    setInt: null    })

export default function ChoiceEditor({ nodeId, choice, index, allNodes }) {
  const updateChoice = useStoryStore((s) => s.updateChoice)
  const deleteChoice = useStoryStore((s) => s.deleteChoice)

  const update = useCallback(
    (field, value) => updateChoice(nodeId, index, { [field]: value }),
    [nodeId, index, updateChoice]
  )

  const handleConditionToggle = useCallback(() => {
    update('condition', choice.condition ? null : makeEmptyCondition())
  }, [choice.condition, update])

  const handleEffectToggle = useCallback(() => {
    update('effects', choice.effects?.length > 0 ? [] : [makeEmptyEffect()])
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
    update('effects', [...(choice.effects ?? []), makeEmptyEffect()])
  }, [choice.effects, update])

  const removeEffect = useCallback(
    (effectIndex) => {
      update('effects', choice.effects.filter((_, i) => i !== effectIndex))
    },
    [choice.effects, update]
  )

  return (
    <div className="border border-[#2e3347] rounded-lg p-3 space-y-2.5 bg-[#0f1117]">
      {/* Header */}
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

      {/* Condition d'affichage */}
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
              value={choice.condition}
              onChange={(v) => update('condition', v)}
              keys={CONDITION_KEYS}
            />
          </div>
        )}
      </div>

      {/* Effets sur les flags */}
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
                    keys={EFFECT_KEYS}
                  />
                </div>
                <button
                  onClick={() => removeEffect(ei)}
                  className="text-gray-600 hover:text-red-400 transition-colors ml-1 shrink-0"
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
