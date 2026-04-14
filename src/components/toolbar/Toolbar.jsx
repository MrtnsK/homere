import { useCallback, useRef, useState } from 'react'
import { useStoryStore } from '../../store/useStoryStore'
import { exportStory, downloadJson } from '../../utils/exportJson'
import { parseImportedJson } from '../../utils/importJson'

function SaveBadge({ status }) {
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Sauvegardé
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Non sauvegardé
    </span>
  )
}

export default function Toolbar({ onToast }) {
  const meta = useStoryStore((s) => s.meta)
  const saveStatus = useStoryStore((s) => s.saveStatus)
  const setSettingsOpen = useStoryStore((s) => s.setSettingsOpen)
  const importStory = useStoryStore((s) => s.importStory)
  const rfNodes = useStoryStore((s) => s.rfNodes)
  const startNodeId = useStoryStore((s) => s.startNodeId)
  const setSaveStatus = useStoryStore((s) => s.setSaveStatus)
  const addNode = useStoryStore((s) => s.addNode)

  const fileInputRef = useRef(null)
  const [exportError, setExportError] = useState(null)

  const handleExport = useCallback(() => {
    setExportError(null)
    const result = exportStory(meta, startNodeId, rfNodes)
    if (!result.ok) {
      setExportError(result.errors)
      onToast?.({ type: 'error', message: 'Export impossible : corrigez les erreurs.' })
      return
    }
    const filename = `${meta.title.replace(/\s+/g, '_').toLowerCase() || 'story'}.json`
    downloadJson(result.json, filename)
    onToast?.({ type: 'success', message: `Exporté : ${filename}` })
  }, [meta, startNodeId, rfNodes, onToast])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = parseImportedJson(ev.target.result)
        if (!result.ok) {
          onToast?.({ type: 'error', message: result.error })
          return
        }
        importStory(result.data)
        onToast?.({ type: 'success', message: 'Histoire importée avec succès.' })
        setSaveStatus('unsaved')
      }
      reader.readAsText(file)
      // Reset pour permettre re-import du même fichier
      e.target.value = ''
    },
    [importStory, onToast, setSaveStatus]
  )

  const handleAddNode = useCallback(() => {
    addNode({ x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 })
  }, [addNode])

  return (
    <header className="flex items-center justify-between px-4 h-12 bg-[#1a1d27] border-b border-[#2e3347] shrink-0 z-10">
      {/* Gauche : logo + titre */}
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-indigo-400 tracking-tight">Homere</span>
        <span className="text-[#2e3347]">|</span>
        <span className="text-sm text-gray-300 truncate max-w-[200px]" title={meta.title}>
          {meta.title || 'Nouvelle histoire'}
        </span>
        <SaveBadge status={saveStatus} />
      </div>

      {/* Centre : actions rapides */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddNode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          title="Ajouter un nœud (ou double-clic sur le canvas)"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nœud
        </button>
      </div>

      {/* Droite : actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#22263a] hover:bg-[#2e3347] text-gray-300 hover:text-white transition-colors border border-[#2e3347]"
          title="Paramètres de l'histoire"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#22263a] hover:bg-[#2e3347] text-gray-300 hover:text-white transition-colors border border-[#2e3347]"
          title="Importer un JSON"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importer
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium transition-colors"
          title="Exporter en JSON iOS"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Erreurs d'export inline (disparaissent au prochain clic) */}
      {exportError && (
        <div className="absolute top-14 right-4 z-50 bg-red-900/90 border border-red-700 rounded-lg px-3 py-2 text-xs text-red-200 max-w-sm shadow-xl">
          <p className="font-semibold mb-1">Export bloqué</p>
          <ul className="list-disc list-inside space-y-0.5">
            {exportError.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </header>
  )
}
