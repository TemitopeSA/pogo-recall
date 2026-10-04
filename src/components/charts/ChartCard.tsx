import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { Card } from '../shared/ui'
import { cx } from '../../lib/util'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  controls?: ReactNode
  onDownload?: () => void
  children: ReactNode
  tour?: string
  className?: string
  id?: string
  footer?: ReactNode
}

export function ChartCard({ title, subtitle, controls, onDownload, children, tour, className, id, footer }: Props) {
  return (
    <Card data-tour={tour} id={id} className={cx('flex flex-col p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {controls}
          {onDownload && (
            <button onClick={onDownload} aria-label="Download CSV" title="Download CSV" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink">
              <Download size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex-1">{children}</div>
      {footer && <div className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-muted">{footer}</div>}
    </Card>
  )
}

export const axisProps = {
  tick: { fill: '#737373', fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: '#E6E6E6' },
} as const

export function ChartTooltipBox({ title, rows }: { title: ReactNode; rows: { label: string; value: ReactNode; color?: string; dashed?: boolean }[] }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-[12px] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <div className="font-medium">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="mt-1 flex items-center gap-2 text-muted">
          {r.color && <span className="h-0.5 w-3" style={{ background: r.color, borderTop: r.dashed ? `2px dashed ${r.color}` : undefined, height: r.dashed ? 0 : 2 }} />}
          <span>{r.label}</span>
          <span className="num ml-auto pl-3 text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
