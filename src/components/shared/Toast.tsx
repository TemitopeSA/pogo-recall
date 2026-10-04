import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CircleCheck, Info } from 'lucide-react'

interface Toast { id: number; text: string; tone: 'success' | 'info' }
const Ctx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})
let n = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = ++n
    setToasts((t) => [...t.slice(-2), { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="animate-rise-in flex items-center gap-2 rounded-lg bg-black px-3.5 py-2.5 text-[13px] text-white shadow-lg">
            {t.tone === 'success' ? <CircleCheck size={15} className="text-c-green" /> : <Info size={15} className="text-bubble" />}
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
