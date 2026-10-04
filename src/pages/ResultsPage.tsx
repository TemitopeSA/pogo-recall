import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck, Download, Rocket, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { ChartCard } from '../components/charts/ChartCard'
import { ReturnsChart } from '../components/charts/ReturnsChart'
import { Composer, MessageList, useAgent } from '../components/chat/AgentThread'
import { Modal } from '../components/shared/Modal'
import { Button, Card, EmptyState, StatCard, VerifiedBadge } from '../components/shared/ui'
import { useToast } from '../components/shared/Toast'
import { isDefaultCampaign, offerSummary, defaultCampaign } from '../data/campaignModel'
import { receipts, results, retailers, returnsCurve, type ReceiptRecord } from '../data/mockData'
import { cx, downloadCsv, fmtK } from '../lib/util'
import { routes, useApp } from '../state/AppState'

type SortKey = 'retailer' | 'date' | 'amount'

function ReceiptsTable() {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'date', dir: 1 })
  const [retailer, setRetailer] = useState<string>('all')
  const [open, setOpen] = useState<ReceiptRecord | null>(null)
  const rows = useMemo(() => {
    const list = receipts.filter((r) => retailer === 'all' || r.retailer === retailer)
    return [...list].sort((a, b) => {
      const v = sort.key === 'retailer' ? a.retailer.localeCompare(b.retailer) : sort.key === 'date' ? a.dayOfCampaign - b.dayOfCampaign : a.amount - b.amount
      return v * sort.dir
    })
  }, [sort, retailer])
  const header = (key: SortKey, label: string, right?: boolean) => (
    <th className={cx('px-4 py-2.5 font-medium', right && 'text-right')} aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))} className="inline-flex items-center gap-1 hover:text-ink">
        {label}
        {sort.key === key ? (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="text-faint" />}
      </button>
    </th>
  )
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h2 className="text-[14px] font-semibold">Verified repeat purchases</h2>
          <p className="mt-0.5 text-[12px] text-muted">Example receipts from returning buyers · Mock records</p>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-muted">
          Retailer
          <select value={retailer} onChange={(e) => setRetailer(e.target.value)} className="h-8 rounded-lg border border-line bg-white px-2 text-[12px] text-ink outline-none focus:border-brand">
            <option value="all">All retailers</option>
            {retailers.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="border-y border-line bg-canvas text-left text-[12px] text-muted">
            <tr>
              {header('retailer', 'Retailer')}
              <th className="px-4 py-2.5 font-medium">SKU</th>
              {header('date', 'Date')}
              {header('amount', 'Amount', true)}
              <th className="px-4 py-2.5"><span className="sr-only">Verification</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => setOpen(r)} className="cursor-pointer border-b border-line last:border-0 hover:bg-lavender">
                <td className="px-4 py-2.5 font-medium">{r.retailer}</td>
                <td className="max-w-[280px] truncate px-4 py-2.5 text-muted">{r.sku.replace('Ridgeline Protein Bar · ', '')}</td>
                <td className="num whitespace-nowrap px-4 py-2.5">{r.date}</td>
                <td className="num px-4 py-2.5 text-right">${r.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={(e) => { e.stopPropagation(); setOpen(r) }} aria-label={`View receipt ${r.id}`} className="inline-flex items-center gap-1 rounded-md text-[12px] text-[#2F7A3B] hover:underline">
                    <BadgeCheck size={14} /> Verified
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-5"><EmptyState title="No receipts for this retailer" body="Try another retailer filter." /></div>}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} labelledBy="receipt-title" width="max-w-[380px]">
        {open && (
          <div className="p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">Receipt detail · Mock record</div>
            <h2 id="receipt-title" className="num mt-1 text-[16px] font-semibold">{open.id}</h2>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              {[
                ['Retailer', open.retailer],
                ['Product', open.sku],
                ['Purchase date', `${open.date} (day ${open.dayOfCampaign} of campaign)`],
                ['Amount', `$${open.amount.toFixed(2)}`],
                ['Buyer', `${open.buyer} · offered cohort`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-2.5"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
              <div className="flex items-center justify-between gap-4"><dt className="text-muted">Verification</dt><dd><VerifiedBadge label="Receipt matched to SKU" /></dd></div>
            </dl>
            <div className="mt-5 flex justify-end"><Button variant="primary" onClick={() => setOpen(null)}>Done</Button></div>
          </div>
        )}
      </Modal>
    </Card>
  )
}

function AgentPanel({ inputRef }: { inputRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const app = useApp()
  const agent = useAgent(app.resultsThread, app.setResultsThread)
  return (
    <Card className="flex flex-col p-5" id="results-agent">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lavender text-brand"><Sparkles size={14} /></span>
        <div>
          <h2 className="text-[14px] font-semibold">Pogo agent</h2>
          <p className="text-[12px] text-muted">Grounded in this campaign’s results and study</p>
        </div>
      </div>
      <MessageList messages={app.resultsThread} thinking={agent.thinking} onFollowUp={agent.ask} firstAnswerTour="agent-panel" />
      <div className="mt-5"><Composer onSubmit={agent.ask} disabled={agent.thinking} inputRef={inputRef} placeholder="Ask a follow-up about these results…" /></div>
    </Card>
  )
}

export function ResultsPage() {
  const app = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const exportResults = () => {
    downloadCsv('ridgeline-winback-results.csv', [
      ['Metric', 'Value', 'Type'],
      ['Offered (treatment cohort)', results.offered, 'Observed'],
      ['Returned', results.returned, 'Observed'],
      ['Treatment return rate (%)', results.treatmentRate, 'Observed'],
      ['Holdout return rate (%)', results.controlRate, 'Observed'],
      ['Lift (pts)', results.liftPts, 'Observed'],
      ['Repeat purchase after return (%)', results.repeatAfterReturn, 'Observed'],
      ['Member reward payouts ($)', results.memberPayouts, 'Observed'],
      ['Cost per return ($)', results.costPerReturn, 'Campaign cost model'],
      ['Annualized incremental revenue ($)', results.annualizedRevenue, 'Modeled'],
      ['ROI (x)', results.roi, 'Modeled'],
      [],
      ['Receipt', 'Retailer', 'SKU', 'Date', 'Amount'],
      ...receipts.map((r) => [r.id, r.retailer, r.sku, r.date, r.amount]),
    ])
    toast('Export ready: ridgeline-winback-results.csv')
  }
  const askAgent = () => {
    document.getElementById('results-agent')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350)
  }

  if (!app.launched) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Ridgeline win-back results" meta={<span>30-day campaign performance</span>} stage="prove" />
        <div className="mx-auto max-w-[720px] px-8 py-16">
          <EmptyState
            title="No campaign launched yet"
            body="Launch the recovery campaign to start measuring receipt-verified returns against the holdout group. You can also view the reference 30-day results for the default campaign."
            action={
              <div className="flex gap-2">
                <Button onClick={() => navigate(routes.campaign)}>Go to campaign builder</Button>
                <Button variant="primary" onClick={() => { app.launch(defaultCampaign); app.runTransition({ kind: 'days', label: '30 days later', sub: 'Collecting receipt-verified purchases' }, routes.results) }}>
                  <Rocket size={14} /> View 30-day results
                </Button>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  const custom = app.launchedConfig && !isDefaultCampaign(app.launchedConfig)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Ridgeline win-back results"
        meta={<span>30-day campaign performance · {results.windowLabel}</span>}
        chips={<VerifiedBadge />}
        actions={<Button onClick={exportResults}><Download size={14} /> Export results</Button>}
        primary={{ label: 'Ask the agent', icon: <Sparkles size={14} />, onClick: askAgent }}
        onExport={exportResults}
        stage="prove"
      />
      <div className="mx-auto max-w-[1280px] space-y-4 px-8 py-6">
        {custom && (
          <div className="rounded-lg border border-line bg-white px-4 py-3 text-[12px] text-muted">
            Showing the reference 30-day outcome for the default campaign (price-sensitive switchers, $1.50 cashback, 14 days, 10% holdout). Your launched configuration ({offerSummary(app.launchedConfig!)}) would be measured the same way.
          </div>
        )}
        <div data-tour="results-overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Returned" value="193" note={<><span className="num">26.7%</span> of offered buyers · observed</>} />
            <StatCard label="Lift vs Control" value="+20.5 pts" note={<><span className="num">26.7%</span> treatment vs <span className="num">6.2%</span> control</>} />
            <StatCard label="Cost per Return" value="$3.86" note="Actual campaign cost model" />
            <StatCard label="ROI" value="5.1x" note="Annualized return model · modeled" />
          </div>
          <ChartCard
            title="Cumulative receipt-verified returns"
            subtitle={`Share of each group with a verified Ridgeline purchase · ${results.offered} offered buyers vs. randomized holdout`}
            onDownload={() => {
              downloadCsv('ridgeline-cumulative-returns.csv', [['Day', 'Treatment (%)', 'Control (%)'], ...returnsRows()])
              toast('Export ready: ridgeline-cumulative-returns.csv')
            }}
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_200px]">
              <ReturnsChart height={250} />
              <dl className="flex flex-col justify-center gap-3 lg:border-l lg:border-line lg:pl-6">
                <div><dt className="flex items-center gap-2 text-[12px] text-muted"><span className="h-0.5 w-4 bg-brand" />Treatment</dt><dd className="num mt-1 text-[22px] font-medium text-brand">26.7%</dd></div>
                <div><dt className="flex items-center gap-2 text-[12px] text-muted"><span className="w-4 border-t-2 border-dashed border-muted" />Control (holdout)</dt><dd className="num mt-1 text-[22px] font-medium">6.2%</dd></div>
                <div className="border-t border-line pt-3"><dt className="text-[12px] text-muted">Absolute difference</dt><dd className="num mt-1 text-[16px] font-medium">+20.5 pts</dd></div>
              </dl>
            </div>
            <p className="mt-3 text-[11px] text-faint">Curves are a fictional illustration of the supplied results. The holdout is a separate randomized group of eligible buyers; no significance test is shown.</p>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-4">
            <ReceiptsTable />
            <Card className="p-5">
              <h2 className="text-[14px] font-semibold">Member impact</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ['$1,086', 'Paid to Pogo members', 'Actual reward payouts on verified purchases. Not total campaign cost.'],
                  ['4.7', 'Average offer rating', 'How members rated the offer (out of 5).'],
                  ['58%', 'Repeat purchase after return', 'Returning buyers who bought Ridgeline again in the window.'],
                ].map(([v, l, d]) => (
                  <div key={l}>
                    <div className="num text-[22px] font-medium">{v}</div>
                    <div className="mt-1 text-[13px] font-medium">{l}</div>
                    <div className="mt-0.5 text-[12px] leading-snug text-muted">{d}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[12px] text-muted">Annualized incremental revenue: <span className="num text-ink">{fmtK(results.annualizedRevenue)}</span> (modeled, not realized). Pre-launch projection was $186K.</p>
            </Card>
          </div>
          <AgentPanel inputRef={inputRef} />
        </div>
      </div>
    </div>
  )
}

const returnsRows = () => returnsCurve.map((p) => [p.day, p.treatment, p.control])
