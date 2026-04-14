import { useCallback, useEffect, useRef } from 'react'
import { useStoryStore } from '../../store/useStoryStore'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">
        {label}
        {hint && <span className="ml-1 text-gray-600 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-2.5 py-1.5 text-sm rounded-lg bg-[#0f1117] border border-[#2e3347] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors'

export default function GlobalSettingsModal() {
  const isOpen = useStoryStore((s) => s.isSettingsOpen)
  const setSettingsOpen = useStoryStore((s) => s.setSettingsOpen)
  const meta = useStoryStore((s) => s.meta)
  const updateMeta = useStoryStore((s) => s.updateMeta)
  const startNodeId = useStoryStore((s) => s.startNodeId)
  const setStartNode = useStoryStore((s) => s.setStartNode)
  const rfNodes = useStoryStore((s) => s.rfNodes)
  const resetStory = useStoryStore((s) => s.resetStory)

  const overlayRef = useRef(null)

  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') setSettingsOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, setSettingsOpen])

  const handleOverlayClick = useCallback(
    (e) => { if (e.target === overlayRef.current) setSettingsOpen(false) },
    [setSettingsOpen]
  )

  const update = useCallback((field, value) => updateMeta({ [field]: value }), [updateMeta])

  const handleReset = useCallback(() => {
    if (window.confirm('Réinitialiser l\'histoire ? Toutes les données seront perdues.')) {
      resetStory()
      setSettingsOpen(false)
    }
  }, [resetStory, setSettingsOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-[#1a1d27] border border-[#2e3347] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e3347]">
          <h2 className="text-sm font-semibold text-gray-100">Paramètres de l'histoire</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-gray-500 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 space-y-4">
          {/* Méta */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Titre">
              <input
                type="text"
                value={meta.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Mon histoire"
                className={inputClass}
              />
            </Field>
            <Field label="Auteur">
              <input
                type="text"
                value={meta.author}
                onChange={(e) => update('author', e.target.value)}
                placeholder="Auteur"
                className={inputClass}
              />
            </Field>
            <Field label="Version">
              <input
                type="text"
                value={meta.version}
                onChange={(e) => update('version', e.target.value)}
                placeholder="1.0"
                className={inputClass}
              />
            </Field>
            <Field label="Langue">
              <input
                type="text"
                value={meta.language}
                onChange={(e) => update('language', e.target.value)}
                placeholder="fr"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Délai par défaut" hint="(secondes)">
              <input
                type="number"
                min={0}
                step={0.5}
                value={meta.defaultDelay}
                onChange={(e) => update('defaultDelay', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Seuil de timeout" hint="(secondes)">
              <input
                type="number"
                min={0}
                step={1}
                value={meta.timeoutThreshold}
                onChange={(e) => update('timeoutThreshold', Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Nœud de départ */}
          <Field label="Nœud de départ">
            <select
              value={startNodeId}
              onChange={(e) => setStartNode(e.target.value)}
              className={inputClass}
            >
              {rfNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} {n.data.text ? `— ${n.data.text.slice(0, 40)}` : ''}
                </option>
              ))}
            </select>
          </Field>

          {/* Statistiques */}
          <div className="rounded-lg bg-[#0f1117] border border-[#2e3347] px-4 py-3 flex items-center gap-6 text-xs text-gray-500">
            <span><span className="text-gray-200 font-semibold">{rfNodes.length}</span> nœud{rfNodes.length > 1 ? 's' : ''}</span>
            <span>
              <span className="text-gray-200 font-semibold">
                {rfNodes.reduce((acc, n) => acc + (n.data.choices?.length ?? 0), 0)}
              </span> choix total
            </span>
            <span>
              <span className="text-gray-200 font-semibold">
                {rfNodes.filter((n) => n.data.storyType === 'end' || n.data.storyType === 'end_with_malus').length}
              </span> fin{rfNodes.filter((n) => n.data.storyType !== 'message').length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            Réinitialiser l'histoire…
          </button>
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
