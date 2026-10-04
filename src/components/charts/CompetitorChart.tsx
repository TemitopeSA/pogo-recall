import { competitors, funnel } from '../../data/mockData'
import { cx } from '../../lib/util'

export function CompetitorBars({ emphasize, compact }: { emphasize?: boolean; compact?: boolean }) {
  return (
    <ul className={cx('flex flex-col', compact ? 'gap-2.5' : 'gap-4')} aria-label="Distribution of identified competitor switching">
      {competitors.map((c, i) => (
        <li key={c.name}>
          <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
            <span className={cx('font-medium', emphasize && i !== 0 && 'text-muted')}>{c.name}</span>
            <span className="num text-[12px] text-muted">{c.count.toLocaleString()} buyers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cx('flex-1 overflow-hidden rounded-md bg-[#F3F3F3]', compact ? 'h-4' : 'h-6')}>
              <div
                className="h-full rounded-md transition-opacity duration-300"
                style={{ width: `${(c.pct / competitors[0].pct) * 100}%`, background: c.color, opacity: emphasize && i !== 0 ? 0.35 : 1 }}
              />
            </div>
            <span className="num w-10 text-right text-[13px] font-medium">{c.pct}%</span>
          </div>
        </li>
      ))}
      {!compact && <li className="text-[12px] text-faint">Share of {funnel.switched.toLocaleString()} lapsed buyers with a verified purchase of a competing bar.</li>}
    </ul>
  )
}
