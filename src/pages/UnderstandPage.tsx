import { useMemo, useState } from 'react'
import { ArrowRight, Check, Clock, MessagesSquare, Search, Users } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { ReasonsChart } from '../components/charts/ReasonsChart'
import { RespondentCard, ReasonTag } from '../components/respondents/RespondentCard'
import { RespondentDrawer } from '../components/respondents/RespondentDrawer'
import { Button, Card, Chip, EmptyState, InsightCallout, Toggle } from '../components/shared/ui'
import { useToast } from '../components/shared/Toast'
import { priceReturnCount, reasons, reasonByKey, segments, study, type ReasonKey } from '../data/mockData'
import { respondents } from '../data/respondents'
import { cx, downloadCsv } from '../lib/util'
import { routes, useApp, type StudyTab } from '../state/AppState'

const tabs: { id: StudyTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'report', label: 'Report' },
  { id: 'responses', label: 'Responses' },
  { id: 'settings', label: 'Settings' },
]

function StudyTabs() {
  const { studyTab, setStudyTab } = useApp()
  return (
    <div role="tablist" aria-label="Study views" className="flex gap-6 border-t border-line px-8">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={studyTab === t.id}
          aria-controls={`panel-${t.id}`}
          onClick={() => setStudyTab(t.id)}
          className={cx('-mb-px border-b-2 py-3 text-[13px] transition-colors', studyTab === t.id ? 'border-black font-medium text-ink' : 'border-transparent text-muted hover:text-ink')}
        >
          {t.label}
          {t.id === 'responses' && <span className="num ml-1.5 text-[11px] text-faint">{study.interviews}</span>}
        </button>
      ))}
    </div>
  )
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender text-brand">{icon}</span>
      <div>
        <div className="num text-[18px] font-medium leading-none">{value}</div>
        <div className="mt-1 text-[12px] text-muted">{label}</div>
      </div>
    </div>
  )
}

function Summary() {
  const { setStudyTab, setDrawerId } = useApp()
  return (
    <div className="space-y-4">
      <div data-tour="study-insight" className="space-y-4">
        <InsightCallout title="Price, not product, is driving most switching.">
          {study.priceReturnPct}% of price-driven switchers say they'd return at {study.priceReturnThreshold} or less.
          <span className="mt-1 block text-[12px] text-faint">
            Based on the {reasons[0].count} respondents ({reasons[0].pct}%) whose primary reason was price; {priceReturnCount} named a return price of {study.priceReturnThreshold} or less. Not a finding across all 250.
          </span>
        </InsightCallout>
        <ReasonsChart />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={<Users size={16} />} value="250" label="Interviews with verified lapsed buyers" />
        <Metric icon={<Clock size={16} />} value="6 hours" label="From launch to completed study" />
        <Metric icon={<MessagesSquare size={16} />} value="5" label="Key questions with adaptive follow-ups" />
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Representative voices</h2>
          <Button variant="ghost" size="sm" onClick={() => setStudyTab('responses')}>All responses <ArrowRight size={14} /></Button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {respondents.slice(0, 3).map((r) => (
            <button key={r.id} onClick={() => setDrawerId(r.id)} className="rounded-lg border border-line p-3 text-left hover:bg-canvas">
              <ReasonTag reason={r.reason} />
              <p className="mt-2 text-[13px] leading-relaxed">“{r.quote}”</p>
              <div className="mt-2 text-[12px] text-muted">{r.name}, {r.age} · {r.city}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Responses() {
  const { setDrawerId } = useApp()
  const [q, setQ] = useState('')
  const [reason, setReason] = useState<ReasonKey | 'all'>('all')
  const [sort, setSort] = useState<'reason' | 'name'>('reason')
  const order = reasons.map((r) => r.key)
  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return respondents
      .filter((r) => (reason === 'all' || r.reason === reason) && (!term || r.name.toLowerCase().includes(term) || r.city.toLowerCase().includes(term)))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : order.indexOf(a.reason) - order.indexOf(b.reason) || a.name.localeCompare(b.name)))
  }, [q, reason, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search respondents</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or city" className="h-9 w-[240px] rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] outline-none focus:border-brand" />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Reason
          <select value={reason} onChange={(e) => setReason(e.target.value as ReasonKey | 'all')} className="h-9 rounded-lg border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-brand">
            <option value="all">All reasons</option>
            {reasons.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as 'reason' | 'name')} className="h-9 rounded-lg border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-brand">
            <option value="reason">By reason</option>
            <option value="name">By name</option>
          </select>
        </label>
        <span className="ml-auto text-[12px] text-muted">Showing <span className="num">{list.length}</span> featured of <span className="num">250</span> interviews</span>
      </div>
      <div className="mt-4">
        {list.length === 0 ? (
          <EmptyState title="No respondents match" body="Try a different name, city or reason." action={<Button size="sm" onClick={() => { setQ(''); setReason('all') }}>Clear filters</Button>} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((r) => <RespondentCard key={r.id} r={r} tour={r.id === 'tasha' ? 'respondent-tasha' : undefined} onOpen={() => setDrawerId(r.id)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function Report() {
  const quotes = ['tasha', 'monica', 'eric', 'daniel'].map((id) => respondents.find((r) => r.id === id)!)
  return (
    <Card className="mx-auto max-w-[860px] p-8">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">Research report</div>
      <h2 className="mt-1 text-[20px] font-semibold">{study.title}</h2>
      <p className="mt-1 text-[13px] text-muted">250 AI-moderated interviews with verified lapsed Ridgeline Protein Bar buyers · Completed in 6 hours</p>

      <section className="mt-7">
        <h3 className="text-[14px] font-semibold">Executive summary</h3>
        <p className="mt-2 text-[14px] leading-relaxed">
          Price is the leading reason Ridgeline buyers left: {reasons[0].pct}% named the price increase as their primary reason, and {study.priceReturnPct}% of those price-driven switchers say they would return at {study.priceReturnThreshold} or less. Product concerns (taste or texture, {reasons[1].pct}%) and availability ({reasons[2].pct}%) are smaller but distinct groups that call for different responses.
        </p>
      </section>

      <section className="mt-7">
        <h3 className="text-[14px] font-semibold">Ranked switching reasons</h3>
        <ol className="mt-3 space-y-2">
          {reasons.map((r, i) => (
            <li key={r.key} className="flex items-center gap-3 text-[13px]">
              <span className="num w-5 text-faint">{i + 1}</span>
              <span className="w-56">{r.label}</span>
              <div className="h-2 flex-1 rounded-full bg-[#F3F3F3]"><div className="h-full rounded-full" style={{ width: `${(r.pct / 38) * 100}%`, background: r.color }} /></div>
              <span className="num w-10 text-right">{r.pct}%</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-7">
        <h3 className="text-[14px] font-semibold">In their words</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {quotes.map((r) => (
            <blockquote key={r.id} className="rounded-lg border-l-2 border-brand bg-lavender px-4 py-3 text-[13px] leading-relaxed">
              “{r.quote}”
              <footer className="mt-1.5 text-[12px] text-muted">{r.name}, {r.age} · {reasonByKey[r.reason].label}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h3 className="text-[14px] font-semibold">Actionable opportunities</h3>
        <ul className="mt-3 space-y-2.5">
          {segments.map((s) => (
            <li key={s.id} className="flex gap-3 text-[13px] leading-relaxed">
              <Check size={15} className="mt-0.5 shrink-0 text-c-green" />
              <span><span className="font-medium">{s.name} (<span className="num">{s.count}</span>).</span> {s.recommendation}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#2F7A3B]">Findings</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed">
            <li>Price is the most-cited primary reason (38%).</li>
            <li>62% of price-driven switchers name a return price of $2.79 or less.</li>
            <li>Northstar Bars is the most common destination (46% of switchers).</li>
          </ul>
        </div>
        <div className="rounded-lg border border-line p-4">
          <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-c-orange">Hypotheses to test</div>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed">
            <li>A ~$1.50 incentive will bring price-sensitive switchers back. Test with a holdout.</li>
            <li>The Aug 18 price change drove the rise in lapses. Timing is suggestive, not proof.</li>
            <li>Availability fixes alone may recover out-of-stock lapsers.</li>
          </ul>
        </div>
      </section>
    </Card>
  )
}

function Settings() {
  const toast = useToast()
  const [name, setName] = useState(study.title)
  const [count, setCount] = useState('250')
  const [qs, setQs] = useState(study.questions)
  const [followUps, setFollowUps] = useState(true)
  const [dirty, setDirty] = useState(false)
  const field = 'h-9 w-full rounded-lg border border-line bg-white px-3 text-[13px] outline-none focus:border-brand'
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card className="space-y-5 p-6">
        <div>
          <label htmlFor="st-name" className="text-[12px] font-medium text-muted">Study name</label>
          <input id="st-name" className={cx(field, 'mt-1.5')} value={name} onChange={(e) => { setName(e.target.value); setDirty(true) }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[12px] font-medium text-muted">Target cohort</div>
            <div className="mt-1.5 flex h-9 items-center rounded-lg border border-line bg-canvas px-3 text-[13px]">Lapsed Ridgeline buyers · 60+ days</div>
          </div>
          <div>
            <label htmlFor="st-count" className="text-[12px] font-medium text-muted">Interview count</label>
            <input id="st-count" type="number" min={50} max={1000} className={cx(field, 'num mt-1.5')} value={count} onChange={(e) => { setCount(e.target.value); setDirty(true) }} />
          </div>
        </div>
        <div>
          <div className="text-[12px] font-medium text-muted">Key questions</div>
          <ol className="mt-1.5 space-y-2">
            {qs.map((q, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="num w-5 text-[12px] text-faint">{i + 1}</span>
                <input aria-label={`Key question ${i + 1}`} className={field} value={q} onChange={(e) => { setQs((all) => all.map((x, j) => (j === i ? e.target.value : x))); setDirty(true) }} />
              </li>
            ))}
          </ol>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
          <div>
            <div className="text-[13px] font-medium">Adaptive follow-ups</div>
            <div className="text-[12px] text-muted">The AI moderator probes vague answers before moving on.</div>
          </div>
          <Toggle id="st-follow" label="Adaptive follow-ups" checked={followUps} onChange={(v) => { setFollowUps(v); setDirty(true) }} />
        </div>
        <div className="flex justify-end gap-2">
          <Button disabled={!dirty} onClick={() => { setName(study.title); setCount('250'); setQs(study.questions); setFollowUps(true); setDirty(false) }}>Reset</Button>
          <Button variant="primary" disabled={!dirty} onClick={() => { setDirty(false); toast('Study settings saved (local only)') }}>Save changes</Button>
        </div>
      </Card>
      <Card className="h-fit p-6">
        <h3 className="text-[14px] font-semibold">Research configuration</h3>
        <dl className="mt-3 space-y-2.5 text-[13px]">
          {[
            ['Status', <span className="inline-flex items-center gap-1.5 text-[#2F7A3B]"><span className="h-1.5 w-1.5 rounded-full bg-c-green" />Completed</span>],
            ['Completed in', '6 hours'],
            ['Method', 'AI-moderated video'],
            ['Eligibility', 'Verified purchase, then 60+ day gap'],
            ['Cohorts', '1'],
            ['Incentive', '$6 per completed interview'],
            ['Languages', 'English'],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-3 border-b border-line pb-2.5 last:border-0">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}

export function UnderstandPage() {
  const app = useApp()
  const toast = useToast()
  const createCampaign = () => {
    if (!app.launched) app.resetCampaign()
    app.runTransition({ kind: 'loading', label: 'Building campaign from research', sub: 'Turning switching reasons into audiences' }, routes.campaign)
  }
  const exportCsv = () => {
    downloadCsv('ridgeline-study-responses.csv', [['Respondent', 'Age', 'City', 'Primary reason', 'Quote'], ...respondents.map((r) => [r.name, r.age, r.city, reasonByKey[r.reason].label, r.quote])])
    toast('Export ready: ridgeline-study-responses.csv')
  }
  return (
    <div className="animate-fade-in">
      <PageHeader
        tour="study-header"
        title={study.title}
        meta={<span><span className="num">250</span> interviews · Completed in 6 hours</span>}
        chips={<><Chip>1 Cohort</Chip><Chip>5 Key Questions</Chip><Chip className="border-transparent bg-[#EAF6EC] text-[#2F7A3B]"><Check size={12} /> Completed</Chip></>}
        primary={{ label: 'Create win-back campaign', onClick: createCampaign, icon: <ArrowRight size={14} /> }}
        onExport={exportCsv}
        stage="understand"
        tabs={<StudyTabs />}
      />
      <div role="tabpanel" id={`panel-${app.studyTab}`} aria-labelledby={`tab-${app.studyTab}`} className="mx-auto max-w-[1280px] px-8 py-6">
        {app.studyTab === 'summary' && <Summary />}
        {app.studyTab === 'responses' && <Responses />}
        {app.studyTab === 'report' && <Report />}
        {app.studyTab === 'settings' && <Settings />}
      </div>
      <RespondentDrawer />
    </div>
  )
}
