import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { BadgeCheck, Sparkles } from 'lucide-react'
import { cx } from '../../lib/util'

type BtnVariant = 'primary' | 'outline' | 'ghost'
export function Button({ variant = 'outline', size = 'md', className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' }) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-3.5 text-[13px]',
        variant === 'primary' && 'bg-brand text-white hover:bg-brand-hover',
        variant === 'outline' && 'border border-line bg-white text-ink hover:bg-canvas',
        variant === 'ghost' && 'text-muted hover:bg-canvas hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx('rounded-xl border border-line bg-white', className)}>{children}</div>
}

export function StatCard({ label, value, note, tour, accent }: { label: string; value: ReactNode; note?: ReactNode; tour?: string; accent?: string }) {
  return (
    <Card data-tour={tour} className="p-4">
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
        {accent && <span className="h-2 w-2 rounded-full" style={{ background: accent }} aria-hidden />}
        {label}
      </div>
      <div className="num mt-2 text-[26px] font-medium leading-none tracking-tight">{value}</div>
      {note && <div className="mt-2 text-[12px] leading-snug text-muted">{note}</div>}
    </Card>
  )
}

export function InsightCallout({ title, children, tour, className }: { title: ReactNode; children?: ReactNode; tour?: string; className?: string }) {
  return (
    <div data-tour={tour} className={cx('flex gap-3 rounded-xl border border-line bg-[#F4F4F4] p-4', className)}>
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand">
        <Sparkles size={15} />
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-snug">{title}</div>
        {children && <div className="mt-1 text-[13px] leading-relaxed text-muted">{children}</div>}
      </div>
    </div>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-0.5 text-[12px] text-muted', className)}>{children}</span>
}

export function VerifiedBadge({ label = 'Receipt-verified' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF6EC] px-2.5 py-1 text-[12px] font-medium text-[#2F7A3B]">
      <BadgeCheck size={14} /> {label}
    </span>
  )
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150', checked ? 'bg-brand' : 'bg-[#D4D4D4]')}
    >
      <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  )
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: ReactNode; title?: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-canvas p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          title={o.title}
          aria-label={o.title}
          onClick={() => onChange(o.id)}
          className={cx('flex h-7 items-center rounded-md px-2 text-[12px] transition-colors', value === o.id ? 'bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-muted hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="text-[14px] font-semibold">{title}</div>
      {body && <div className="mt-1 max-w-sm text-[13px] text-muted">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name.replace('.', '').split(' ').map((p) => p[0]).join('').slice(0, 2)
  const palette = ['#E9E3FF', '#DDF1EC', '#FCE4D6', '#E5F2DF', '#FDF0D2', '#F3E0DF']
  const bg = palette[name.charCodeAt(0) % palette.length]
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[#3a3a3a]', className)} style={{ width: size, height: size, background: bg }} aria-hidden>
      {initials}
    </span>
  )
}

export function PogoMark({ size = 28, inverted = false, className }: { size?: number; inverted?: boolean; className?: string }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-[7px] font-logo font-bold leading-none', inverted ? 'bg-brand text-white' : 'bg-black text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.68 }}
      aria-hidden
    >
      P
    </span>
  )
}

export function useClickOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  return ref
}

export function Menu({ trigger, items, align = 'right', up = false }: { trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; items: { label: string; icon?: ReactNode; onSelect: () => void }[]; align?: 'left' | 'right'; up?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div role="menu" className={cx('animate-pop-in absolute z-50 min-w-[200px]', up ? 'bottom-full mb-2' : 'top-full mt-1.5', ' rounded-lg border border-line bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]', align === 'right' ? 'right-0' : 'left-0')}>
          {items.map((it) => (
            <button key={it.label} role="menuitem" onClick={() => { setOpen(false); it.onSelect() }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-canvas">
              {it.icon && <span className="text-muted">{it.icon}</span>}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
