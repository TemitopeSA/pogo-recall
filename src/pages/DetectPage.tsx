import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { ChartCard } from '../components/charts/ChartCard'
import { CompetitorBars } from '../components/charts/CompetitorChart'
import { LapseTrendChart } from '../components/charts/LapseTrendChart'
import { Button, InsightCallout, StatCard } from '../components/shared/ui'
import { useToast } from '../components/shared/Toast'
import { brand, competitors, funnel, lapseTrend } from '../data/mockData'
import { downloadCsv, fmtK, cx } from '../lib/util'
import { routes, useApp } from '../state/AppState'

export function DetectPage() {
  const app = useApp()
  const toast = useToast()
  const competitorRef = useRef<HTMLDivElement>(null)
  const [emphasize, setEmphasize] = useState(false)

  useEffect(() => {
    if (!app.focusCompetitor) return
    setEmphasize(true)
    const el = competitorRef.current
    const t1 = setTimeout(() => el?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80)
    const t2 = setTimeout(() => { setEmphasize(false); app.setFocusCompetitor(0) }, 4500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [app.focusCompetitor]) // eslint-disable-line react-hooks/exhaustive-deps

  const askWhy = () => app.runTransition({ kind: 'loading', label: 'Preparing research view', sub: 'Interviewing 250 verified lapsed buyers' }, routes.understand)

  const exportCsv = () => {
    downloadCsv('ridgeline-recall-overview.csv', [
      ['Metric', 'Value'],
      ['Verified buyers (12 mo)', funnel.verifiedBuyers],
      ['Lapsed (60+ days)', funnel.lapsed],
      ['Switched to competitor', funnel.switched],
      ['Revenue at risk (annual, est.)', funnel.revenueAtRisk],
      [],
      ['Competitor', 'Share (%)', 'Buyers'],
      ...competitors.map((c) => [c.name, c.pct, c.count]),
      [],
      ['Week of last purchase', 'Lapsed buyers'],
      ...lapseTrend.map((w) => [w.label, w.lapses]),
    ])
    toast('Export ready: ridgeline-recall-overview.csv')
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={brand.product}
        meta={<span>Customer recovery opportunity · <span className="num">12,480</span> verified buyers · Last 12 months</span>}
        primary={{ label: 'Ask why they left', onClick: askWhy, icon: <ArrowRight size={14} /> }}
        onExport={exportCsv}
        stage="detect"
      />
      <div className="mx-auto max-w-[1280px] space-y-4 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard tour="kpi-verified" label="Verified Buyers" value="12,480" note="Card- and receipt-verified, last 12 months" />
          <StatCard label="Lapsed" value="3,120" note={<><span className="num">25%</span> · no purchase in 60+ days</>} />
          <StatCard label="Switched to Competitor" value="1,904" note={<><span className="num">61%</span> of lapsed buyers</>} />
          <StatCard label="Revenue at Risk" value={fmtK(funnel.revenueAtRisk)} note="Estimated annual spend of lapsed buyers" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div ref={competitorRef} className={cx('rounded-xl', emphasize && 'focus-pulse ring-2 ring-brand')}>
            <ChartCard
              tour="competitor-chart"
              className="h-full"
              title="Where lapsed buyers went"
              subtitle="Verified competitor purchases among switched buyers"
              onDownload={() => {
                downloadCsv('ridgeline-competitor-switching.csv', [['Competitor', 'Share (%)', 'Buyers'], ...competitors.map((c) => [c.name, c.pct, c.count])])
                toast('Export ready: ridgeline-competitor-switching.csv')
              }}
            >
              <CompetitorBars emphasize={emphasize} />
            </ChartCard>
          </div>
          <ChartCard
            tour="lapse-trend"
            title="Weekly customer lapses"
            subtitle="Lapsed buyers by week of their last Ridgeline purchase"
            onDownload={() => {
              downloadCsv('ridgeline-weekly-lapses.csv', [['Week of last purchase', 'Lapsed buyers'], ...lapseTrend.map((w) => [w.label, w.lapses])])
              toast('Export ready: ridgeline-weekly-lapses.csv')
            }}
            footer="Lapses accelerated after the price change. Research can help distinguish pricing pressure from availability and product concerns."
          >
            <LapseTrendChart />
          </ChartCard>
        </div>

        <InsightCallout title="1,904 customers switched. The reasons are still recoverable.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Start with verified competitor switching, then interview lapsed buyers before deciding what offer to send.</span>
            <Button variant="primary" size="sm" onClick={askWhy}>Ask why they left <ArrowRight size={14} /></Button>
          </div>
        </InsightCallout>
      </div>
    </div>
  )
}
