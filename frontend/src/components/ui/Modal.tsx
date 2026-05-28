import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  dirty?: boolean
}

export default function Modal({ open, onClose, title, children, dirty }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const [pendingClose, setPendingClose] = useState(false)

  onCloseRef.current = onClose

  const stableClose = useCallback(() => onCloseRef.current(), [])

  useEffect(() => {
    if (!open) return

    const prevFocus = document.activeElement as HTMLElement | null
    const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    setTimeout(() => firstFocusable?.focus(), 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dirty) {
          setPendingClose(true)
        } else {
          stableClose()
        }
        return
      }

      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (!open) prevFocus?.focus()
    }
  }, [open, dirty, stableClose])

  const handleClose = () => {
    if (dirty) {
      setPendingClose(true)
    } else {
      stableClose()
    }
  }

  if (!open) return null

  return (
    <>
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      >
        <div ref={contentRef} className="bg-surface rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
          </div>
          {children}
        </div>
      </div>

      {pendingClose && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">¿Descartar cambios?</h3>
            <p className="text-gray-400 text-sm mb-6">Tienes cambios sin guardar. ¿Seguro que quieres cerrar?</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setPendingClose(false); stableClose() }}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={() => setPendingClose(false)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
