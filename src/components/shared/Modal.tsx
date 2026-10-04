import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../../lib/util'

interface Props {
  open: boolean
  onClose?: () => void
  labelledBy: string
  children: ReactNode
  width?: string
  dismissable?: boolean
  z?: string
}

export function Modal({ open, onClose, labelledBy, children, width = 'max-w-[480px]', dismissable = true, z = 'z-[70]' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement as HTMLElement
    const t = setTimeout(() => {
      const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]') ?? ref.current?.querySelector<HTMLElement>('button, [href], input, textarea, select')
      el?.focus({ preventScroll: true })
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable && onCloseRef.current) {
        e.stopPropagation()
        onCloseRef.current()
      }
      if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, textarea, select'))
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey, true)
      prevFocus.current?.focus?.({ preventScroll: true })
    }
  }, [open, dismissable])

  if (!open) return null
  return (
    <div className={cx('fixed inset-0 flex items-center justify-center p-4', z)}>
      <div className="animate-fade-in absolute inset-0 bg-[rgba(16,10,30,0.45)]" onClick={() => dismissable && onClose?.()} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={cx('animate-pop-in relative w-full rounded-xl bg-white shadow-[0_20px_60px_rgba(20,10,40,0.22)]', width)}>
        {dismissable && onClose && (
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-md p-1.5 text-muted transition-colors hover:bg-canvas hover:text-ink">
            <X size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
