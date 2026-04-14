import { useEffect, useState } from 'react'

const ICONS = {
  success: (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const bg = toast.type === 'error' ? 'border-red-800 bg-red-950/90' :
             toast.type === 'success' ? 'border-emerald-800 bg-emerald-950/90' :
             'border-indigo-800 bg-indigo-950/90'

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-xl
        backdrop-blur text-sm text-gray-200 max-w-sm
        transition-all duration-300
        ${bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {ICONS[toast.type] ?? ICONS.info}
      <span>{toast.message}</span>
    </div>
  )
}
