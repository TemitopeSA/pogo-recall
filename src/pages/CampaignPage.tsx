import { useMemo, useState } from 'react'
import { Rocket } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { SegmentSelector } from '../components/campaign/SegmentSelector'
import { OfferConfiguration } from '../components/campaign/OfferConfiguration'
import { CampaignForecast } from '../components/campaign/CampaignForecast'
import { PhonePreview } from '../components/campaign/PhonePreview'
import { LaunchConfirmation } from '../components/campaign/LaunchConfirmation'
import { Button, Card, Chip } from '../components/shared/ui'
import { useToast } from '../components/shared/Toast'
import { forecast, isValid, offerSummary, validate } from '../data/campaignModel'
import { segmentById } from '../data/mockData'
import { downloadCsv } from '../lib/util'
import { routes, useApp } from '../state/AppState'
import { track } from '@vercel/analytics'

export function CampaignPage() {
  const app = useApp()
  const toast = useToast()
  const c = app.campaign
  const f = useMemo(() => forecast(c), [c])
  const errors = validate(c)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const label = `Launch to ${f.audience.toLocaleString()} verified buyers`

  const tryLaunch = () => {
    app.setShowErrors(true)
    if (!isValid(errors)) {
      toast(`Fix ${Object.keys(errors).length === 1 ? '1 issue' : `${Object.keys(errors).length} issues`} before launching`, 'info')
      return
    }
    setConfirmOpen(true)
  }
  const onConfirm = async () => {
    setConfirmOpen(false)
    app.launch(c)
    track('campaign_launched', { offer: c.offerType, segments: c.segments.join('+'), audience: f.audience, holdout: c.holdoutEnabled })
    toast('Campaign launched')
    await app.runTransition({ kind: 'days', label: '30 days later', sub: 'Collecting receipt-verified purchases' }, routes.results)
  }
  const exportCsv = () => {
    downloadCsv('ridgeline-campaign-config.csv', [
      ['Setting', 'Value'],
      ['Segments', c.segments.map((s) => segmentById[s].name).join('; ')],
      ['Audience', f.audience],
      ['Offer', offerSummary(c)],
      ['Duration (days)', c.durationDays],
      ['Message', c.message],
      ['Holdout', c.holdoutEnabled ? `${c.holdoutPct}%` : 'Off'],
      ['Forecast return rate', `${f.rateLow}-${f.rateHigh}%`],
      ['Forecast cost per return', f.costPerReturn.toFixed(2)],
      ['Forecast incremental annual revenue (modeled)', Math.round(f.incrementalRevenue)],
    ])
    toast('Export ready: ridgeline-campaign-config.csv')
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ridgeline recovery campaign"
        meta={<span><span className="num">{f.audience.toLocaleString()}</span> targeted buyers{c.segments.length > 1 ? ' (estimate)' : ''}</span>}
        chips={<><Chip>From study: Why did Ridgeline buyers leave?</Chip>{app.launched && <Chip className="border-transparent bg-[#EAF6EC] text-[#2F7A3B]">Live</Chip>}</>}
        primary={{ label, onClick: tryLaunch, icon: <Rocket size={14} /> }}
        onExport={exportCsv}
        stage="winback"
      />
      <div className="mx-auto max-w-[1360px] px-8 pb-28 pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
          <SegmentSelector />
          <OfferConfiguration />
          <div className="flex flex-col gap-4 lg:col-span-2 lg:grid lg:grid-cols-2 xl:col-span-1 xl:flex">
            <CampaignForecast f={f} holdoutEnabled={c.holdoutEnabled} />
            <Card className="p-5">
              <h2 className="text-[14px] font-semibold">What buyers will see</h2>
              <p className="mb-4 mt-0.5 text-[12px] text-muted">Live preview in the Pogo consumer app</p>
              <PhonePreview c={c} />
            </Card>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 z-20 border-t border-line bg-white py-3 pl-8 pr-20">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] text-muted">
            {offerSummary(c)} · {c.durationDays || '—'} days · {c.holdoutEnabled ? `${c.holdoutPct}% holdout` : 'No holdout'}
            {app.showErrors && !isValid(errors) && <span className="ml-2 text-c-coral">· {Object.values(errors)[0]}</span>}
          </div>
          <Button variant="primary" className="h-10 px-5" onClick={tryLaunch}><Rocket size={15} /> {label}</Button>
        </div>
      </div>
      <LaunchConfirmation open={confirmOpen} c={c} f={f} onCancel={() => setConfirmOpen(false)} onConfirm={onConfirm} />
    </div>
  )
}
