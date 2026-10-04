import { Coins, Gift, MessageSquareText, Wallet } from 'lucide-react'
import { freeProducts, offerTypes, updateConfig, validate, type CampaignConfig, type OfferType } from '../../data/campaignModel'
import { useApp } from '../../state/AppState'
import { Card, Toggle } from '../shared/ui'
import { cx } from '../../lib/util'

const icons: Record<OfferType, React.ReactNode> = {
  cashback: <Wallet size={16} />,
  points: <Coins size={16} />,
  free: <Gift size={16} />,
  message: <MessageSquareText size={16} />,
}
const field = 'h-9 w-full rounded-lg border bg-white px-3 text-[13px] outline-none focus:border-brand'
const durations = ['7', '14', '21', '30']

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} role="alert" className="mt-1.5 text-[12px] text-c-coral">{msg}</p> : null
}

export function OfferConfiguration() {
  const { campaign: c, setCampaign, showErrors } = useApp()
  const v = showErrors ? validate(c) : {}
  const set = (patch: Partial<CampaignConfig>) => setCampaign((prev) => updateConfig(prev, patch))
  const help = offerTypes.find((o) => o.id === c.offerType)!.help

  return (
    <Card data-tour="offer-config" className="flex h-full flex-col p-5">
      <h2 className="text-[14px] font-semibold">Build the offer</h2>
      <p className="mt-0.5 text-[12px] text-muted">Delivered in the Pogo consumer app. Rewards are paid only on receipt-verified purchases.</p>

      <fieldset className="mt-4">
        <legend className="text-[12px] font-medium text-muted">Offer type</legend>
        <div role="radiogroup" className="mt-1.5 grid grid-cols-2 gap-2">
          {offerTypes.map((o) => {
            const on = c.offerType === o.id
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={on}
                onClick={() => set({ offerType: o.id })}
                className={cx('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors', on ? 'border-brand bg-lavender font-medium text-brand' : 'border-line hover:bg-canvas')}
              >
                {icons[o.id]} {o.label}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-muted">{help}</p>
      </fieldset>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {c.offerType === 'cashback' && (
          <div>
            <label htmlFor="of-amount" className="text-[12px] font-medium text-muted">Cashback amount</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">$</span>
              <input id="of-amount" type="number" step="0.25" min="0.25" max="5" inputMode="decimal" aria-invalid={!!v.amount} aria-describedby="of-amount-err" value={c.cashbackAmount} onChange={(e) => set({ cashbackAmount: e.target.value })} className={cx(field, 'num pl-6', v.amount ? 'border-c-coral' : 'border-line')} />
            </div>
            <Err id="of-amount-err" msg={v.amount} />
          </div>
        )}
        {c.offerType === 'points' && (
          <div>
            <label htmlFor="of-points" className="text-[12px] font-medium text-muted">Bonus points</label>
            <input id="of-points" type="number" step="250" min="250" max="10000" aria-invalid={!!v.points} aria-describedby="of-points-err" value={c.points} onChange={(e) => set({ points: e.target.value })} className={cx(field, 'num mt-1.5', v.points ? 'border-c-coral' : 'border-line')} />
            <Err id="of-points-err" msg={v.points} />
          </div>
        )}
        {c.offerType === 'free' && (
          <div>
            <label htmlFor="of-product" className="text-[12px] font-medium text-muted">Product reimbursed</label>
            <select id="of-product" value={c.freeProduct} onChange={(e) => set({ freeProduct: e.target.value })} className={cx(field, 'mt-1.5 border-line')}>
              {freeProducts.map((p) => <option key={p}>{p}</option>)}
            </select>
            <p className="mt-1.5 text-[11px] text-faint">Reimbursed up to $3.29 after receipt verification.</p>
          </div>
        )}
        <div className={c.offerType === 'message' ? 'col-span-2' : ''}>
          <label htmlFor="of-duration" className="text-[12px] font-medium text-muted">Duration (days)</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <input id="of-duration" type="number" min="3" max="60" aria-invalid={!!v.duration} aria-describedby="of-duration-err" value={c.durationDays} onChange={(e) => set({ durationDays: e.target.value })} className={cx(field, 'num w-16 shrink-0', v.duration ? 'border-c-coral' : 'border-line')} />
            <div className="flex gap-1">
              {durations.map((d) => (
                <button key={d} onClick={() => set({ durationDays: d })} aria-label={`${d} days`} className={cx('num h-9 rounded-lg border px-2 text-[12px]', c.durationDays === d ? 'border-brand bg-lavender text-brand' : 'border-line text-muted hover:bg-canvas')}>{d}</button>
              ))}
            </div>
          </div>
          <Err id="of-duration-err" msg={v.duration} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="of-message" className="text-[12px] font-medium text-muted">Message buyers will see</label>
          <span className={cx('num text-[11px]', c.message.length > 160 ? 'text-c-coral' : 'text-faint')}>{c.message.length}/160</span>
        </div>
        <textarea id="of-message" rows={3} aria-invalid={!!v.message} aria-describedby="of-message-err" value={c.message} onChange={(e) => set({ message: e.target.value })} className={cx('mt-1.5 w-full resize-none rounded-lg border bg-white px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-brand', v.message ? 'border-c-coral' : 'border-line')} />
        <Err id="of-message-err" msg={v.message} />
      </div>

      <div data-tour="holdout" className="mt-4 rounded-xl border border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="of-holdout" className="text-[13px] font-medium">Hold out a control group</label>
          <Toggle id="of-holdout" label="Hold out a control group" checked={c.holdoutEnabled} onChange={(on) => set({ holdoutEnabled: on })} />
        </div>
        <div className={cx('mt-3 flex items-center gap-3', !c.holdoutEnabled && 'opacity-40')}>
          <input type="range" min="5" max="30" step="1" aria-label="Holdout percentage" disabled={!c.holdoutEnabled} value={Number(c.holdoutPct) || 10} onChange={(e) => set({ holdoutPct: e.target.value })} className="flex-1 accent-[#6B3FE0]" />
          <div className="relative w-16">
            <input type="number" min="5" max="30" aria-label="Holdout percent" disabled={!c.holdoutEnabled} value={c.holdoutPct} onChange={(e) => set({ holdoutPct: e.target.value })} className={cx(field, 'num pr-6', v.holdout ? 'border-c-coral' : 'border-line')} />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted">%</span>
          </div>
        </div>
        <Err id="of-holdout-err" msg={v.holdout} />
        <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
          {c.holdoutEnabled
            ? 'Eligible buyers in the holdout group will not receive this offer. Their purchase behavior gives us a baseline for measuring incremental impact.'
            : 'Without a randomized holdout, the campaign can report how many buyers returned, but not how many returned because of the offer.'}
        </p>
      </div>
    </Card>
  )
}
