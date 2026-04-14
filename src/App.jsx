import { useCallback, useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import StoryCanvas from './components/canvas/StoryCanvas'
import SidePanel from './components/panels/SidePanel'
import Toolbar from './components/toolbar/Toolbar'
import GlobalSettingsModal from './components/modals/GlobalSettingsModal'
import Toast from './components/Toast'
import { useStoryStore } from './store/useStoryStore'

let toastId = 0

export default function App() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type, message, duration }) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message, duration }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Auto-save feedback : marquer "saved" 1.5s après chaque modification
  useEffect(() => {
    let timer
    const unsub = useStoryStore.subscribe(
      (state) => state.saveStatus,
      (status) => {
        if (status === 'unsaved') {
          clearTimeout(timer)
          timer = setTimeout(() => {
            useStoryStore.getState().setSaveStatus('saved')
          }, 1200)
        }
      }
    )
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0f1117]">
        <Toolbar onToast={addToast} />

        <div className="flex flex-1 overflow-hidden">
          <StoryCanvas />
          <SidePanel />
        </div>

        <GlobalSettingsModal />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ReactFlowProvider>
  )
}
