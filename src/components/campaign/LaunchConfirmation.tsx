import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/ui'
import { offerSummary, type CampaignConfig, type Forecast } from '../../data/campaignModel'
import { segmentById } from '../../data/mockData'

export function LaunchConfirmation({ open, c, f, onCancel, onConfirm }: { open: boolean; c: CampaignConfig; f: Forecast; onCancel: () => void; onConfirm: () => void }) {
  const [launching, setLaunching] = useState(false)
  const rows: [string, string][] = [
    ['Audience', `${c.segments.map((s) => segmentById[s].name).join(', ')} · ${f.audience.toLocaleString()} buyers${c.segments.length > 1 ? ' (estimate)' : ''}`],
    ['Offer', offerSummary(c)],
    ['Duration', `${c.durationDays} days`],
    ['Holdout', c.holdoutEnabled ? `${c.holdoutPct}% of eligible buyers (~${f.holdoutSize}) receive no offer` : 'None. Incremental lift will not be measurable'],
    ['Forecast', `${f.rateLow}–${f.rateHigh}% expected return rate (modeled)`],
  ]
  const confirm = () => {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); onConfirm() }, 600)
  }
  return (
    <Modal open={open} onClose={launching ? undefined : onCancel} labelledBy="launch-title" width="max-w-[500px]">
      <div className="p-6">
        <h2 id="launch-title" className="text-[16px] font-semibold">Launch win-back campaign?</h2>
        <p className="mt-1 text-[13px] text-muted">Buyers will see this offer in the Pogo app. Returns are measured from receipt-verified purchases.</p>
        <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 px-4 py-2.5 text-[13px]">
              <dt className="w-20 shrink-0 text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12px] text-muted">Concept prototype: this uses mock data and no real offers are sent.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel} disabled={launching}>Cancel</Button>
          <Button variant="primary" onClick={confirm} disabled={launching} data-autofocus>
            <Rocket size={14} /> {launching ? 'Launching…' : 'Launch campaign'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
