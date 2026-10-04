import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ANNUAL_VALUE_PER_RETURNER, type Forecast } from '../../data/campaignModel'
import { results } from '../../data/mockData'
import { Card } from '../shared/ui'
import { cx, fmtK } from '../../lib/util'

export function CampaignForecast({ f, holdoutEnabled }: { f: Forecast; holdoutEnabled: boolean }) {
  const [open, setOpen] = useState(false)
  const empty = f.audience === 0
  const rows = [
    { label: 'Expected return rate', value: empty ? '—' : `${f.rateLow}–${f.rateHigh}%`, note: empty ? '' : `≈ ${f.expectedReturns} returning buyers` },
    { label: 'Est. cost per returning buyer', value: empty ? '—' : `$${f.costPerReturn.toFixed(2)}`, note: 'Rewards plus delivery' },
    { label: 'Projected incremental annual revenue', value: empty ? '—' : fmtK(f.incrementalRevenue), note: holdoutEnabled ? 'Modeled vs. holdout baseline' : 'Cannot be verified without a holdout' },
  ]
  return (
    <Card className="p-5" aria-live="polite">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Campaign forecast</h2>
        <span className="rounded-md bg-canvas px-2 py-0.5 text-[11px] text-muted">Modeled</span>
      </div>
      <dl className="mt-3 divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-[12px] text-muted">{r.label}<span className="block text-[11px] text-faint">{r.note}</span></dt>
            <dd className="num text-[17px] font-medium">{r.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[12px] text-muted">Measurement</dt>
          <dd className={cx('text-[12px] font-medium', holdoutEnabled ? 'text-[#2F7A3B]' : 'text-c-orange')}>
            {f.measurement}{holdoutEnabled && <span className="font-normal text-muted"> · ~<span className="num">{f.holdoutSize}</span> held out</span>}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-snug text-faint">Modeled estimates, not guaranteed outcomes.</p>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-2 inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink">
        <ChevronRight size={13} className={cx('transition-transform', open && 'rotate-90')} /> How this is calculated
      </button>
      {open && (
        <ul className="animate-fade-in mt-2 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-muted">
          <li>Return rate: each segment's modeled response to the default offer, scaled by reward value, offer type and duration.</li>
          <li>Cost per return: (returns × reward value + $0.625 delivery per offered buyer) ÷ returns.</li>
          <li>Revenue: offered × (return rate − {results.controlRate}% baseline) × ${ANNUAL_VALUE_PER_RETURNER.toLocaleString()} modeled annual value per incremental returner.</li>
          <li>Holdout buyers are drawn from the eligible pool in addition to the offered audience.</li>
        </ul>
      )}
    </Card>
  )
}
