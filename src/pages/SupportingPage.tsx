import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Activity, FlaskConical, Lightbulb, Plus, Users } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { Button, Card, Chip, InsightCallout, StatCard } from '../components/shared/ui'
import { useToast } from '../components/shared/Toast'
import { axisProps, ChartCard, ChartTooltipBox } from '../components/charts/ChartCard'
import { brand, competitors, funnel, reasons, segments, study } from '../data/mockData'
import { routes, useApp } from '../state/AppState'

function Row({ title, meta, tag, onClick }: { title: string; meta: string; tag?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-4 border-b border-line px-5 py-3.5 text-left last:border-0 hover:bg-canvas">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium">{title}</div>
        <div className="mt-0.5 text-[12px] text-muted">{meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {tag && <Chip>{tag}</Chip>}
        <ArrowRight size={14} className="text-faint" />
      </div>
    </button>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in">
      <PageHeader title={`Good morning, ${brand.user.name.split(' ')[0]}`} meta={<span>{brand.client} workspace</span>} primary={{ label: 'Open Recall', icon: <ArrowRight size={14} />, onClick: () => navigate(routes.detect) }} />
      <div className="mx-auto max-w-[1080px] space-y-4 px-8 py-6">
        <InsightCallout title="New in Signals: Pogo Recall">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>1,904 verified Ridgeline buyers switched to competitors. Find out why and bring them back.</span>
            <Button variant="primary" size="sm" onClick={() => navigate(routes.detect)}>Open Recall <ArrowRight size={14} /></Button>
          </div>
        </InsightCallout>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Verified buyers" value={funnel.verifiedBuyers.toLocaleString()} note="Ridgeline Protein Bar, 12 months" />
          <StatCard label="Active studies" value="3" note="1 completed this week" />
          <StatCard label="Saved audiences" value={String(segments.length + 2)} />
        </div>
        <Card>
          <div className="px-5 pb-2 pt-5 text-[14px] font-semibold">Recent activity</div>
          <Row title={study.title} meta="Study · 250 interviews · Completed in 6 hours" tag="Completed" onClick={() => navigate(routes.understand)} />
          <Row title="Ridgeline recovery campaign" meta="Recall · Price-sensitive switchers · 724 buyers" tag="Draft" onClick={() => navigate(routes.campaign)} />
          <Row title="Ridgeline lapsed buyers" meta="Chat · Pogo agent" onClick={() => navigate(routes.chat)} />
        </Card>
      </div>
    </div>
  )
}

export function AudiencesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const list = [
    { name: 'Verified Ridgeline buyers', count: funnel.verifiedBuyers, src: 'Purchase behavior · 12 months' },
    { name: 'Lapsed Ridgeline buyers', count: funnel.lapsed, src: 'No purchase in 60+ days' },
    { name: 'Lapsed to Northstar Bars', count: competitors[0].count, src: 'Receipt-verified competitor switching' },
    ...segments.map((s) => ({ name: s.name, count: s.count, src: 'Recall segment · purchases + interviews' })),
  ]
  return (
    <div className="animate-fade-in">
      <PageHeader title="Audiences" meta={<span>{list.length} saved audiences</span>} primary={{ label: 'New audience', icon: <Plus size={14} />, onClick: () => toast('Audience builder is not part of this concept', 'info') }} />
      <div className="mx-auto max-w-[1080px] px-8 py-6">
        <Card>
          {list.map((a) => (
            <Row key={a.name} title={a.name} meta={`${a.count.toLocaleString()} verified buyers · ${a.src}`} tag={a.src.startsWith('Recall') ? 'Recall' : undefined} onClick={() => navigate(a.src.startsWith('Recall') ? routes.campaign : routes.detect)} />
          ))}
        </Card>
      </div>
    </div>
  )
}

export function StudiesPage() {
  const navigate = useNavigate()
  const app = useApp()
  const toast = useToast()
  return (
    <div className="animate-fade-in">
      <PageHeader title="Studies" meta={<span>3 studies</span>} primary={{ label: 'New study', icon: <Plus size={14} />, onClick: () => toast('Study setup is not part of this concept', 'info') }} />
      <div className="mx-auto max-w-[1080px] px-8 py-6">
        <Card>
          <Row title={study.title} meta="250 interviews · 1 cohort · 5 key questions" tag="Completed" onClick={() => { app.setStudyTab('summary'); navigate(routes.understand) }} />
          <Row title="Ridgeline flavor concept test" meta="120 interviews · 2 cohorts" tag="Completed" onClick={() => toast('Only the Recall study is available in this concept', 'info')} />
          <Row title="Morning snack occasions" meta="80 of 200 interviews" tag="In field" onClick={() => toast('Only the Recall study is available in this concept', 'info')} />
        </Card>
      </div>
    </div>
  )
}

export function InsightsPage() {
  const navigate = useNavigate()
  const items = [
    { title: 'Price, not product, is driving most switching.', body: `${reasons[0].pct}% of lapsed buyers cite price. 62% of price-driven switchers would return at $2.79 or less.`, to: routes.understand },
    { title: 'Northstar Bars captured 46% of switchers.', body: `${competitors[0].count} verified buyers moved to Northstar, mostly after Aug 18.`, to: routes.detect },
    { title: 'Offers recovered 26.7% of price-sensitive switchers.', body: 'Versus 6.2% in the holdout group. Receipt-verified.', to: routes.results },
  ]
  return (
    <div className="animate-fade-in">
      <PageHeader title="Insights Library" meta={<span>{items.length} insights · Ridgeline Foods</span>} />
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-4 px-8 py-6 md:grid-cols-3">
        {items.map((i) => (
          <button key={i.title} onClick={() => navigate(i.to)} className="rounded-xl border border-line bg-white p-5 text-left hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <Lightbulb size={16} className="text-brand" />
            <div className="mt-3 text-[14px] font-semibold leading-snug">{i.title}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{i.body}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in">
      <PageHeader title="Projects" meta={<span>1 project</span>} />
      <div className="mx-auto max-w-[1080px] px-8 py-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">Ridgeline win-back</div>
              <div className="mt-0.5 text-[12px] text-muted">Owner: {brand.user.name}</div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate(routes.detect)}>Open <ArrowRight size={14} /></Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              [<Activity size={14} />, 'Recall overview', routes.detect],
              [<FlaskConical size={14} />, study.title, routes.understand],
              [<Users size={14} />, 'Recovery campaign', routes.campaign],
            ].map(([icon, label, to]) => (
              <button key={String(label)} onClick={() => navigate(to as string)} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-left text-[13px] hover:bg-canvas">
                <span className="text-muted">{icon}</span><span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const monthly = [
  ['Oct', 1090], ['Nov', 1120], ['Dec', 1180], ['Jan', 1205], ['Feb', 1190], ['Mar', 1230], ['Apr', 1260], ['May', 1275], ['Jun', 1290], ['Jul', 1240], ['Aug', 1105], ['Sep', 980],
].map(([m, v]) => ({ month: m as string, buyers: v as number }))

export function PurchaseMetricsPage() {
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in">
      <PageHeader title="Purchase Metrics" meta={<span>{brand.product} · Monthly active verified buyers</span>} primary={{ label: 'Investigate in Recall', icon: <ArrowRight size={14} />, onClick: () => navigate(routes.detect) }} />
      <div className="mx-auto max-w-[1080px] space-y-4 px-8 py-6">
        <ChartCard title="Monthly verified buyers" subtitle="Buyers with at least one verified Ridgeline purchase in the month" footer="Monthly buyers fell after the Aug 18 price change. Recall shows where they went.">
          <div role="img" aria-label="Monthly verified buyers, rising from about 1,090 to 1,290 through June, then falling to 980 by September.">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#EFEFEF" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} axisLine={false} />
                <Tooltip cursor={{ fill: '#F6F5FF' }} content={({ active, payload }) => active && payload?.length ? <ChartTooltipBox title={String(payload[0].payload.month)} rows={[{ label: 'Verified buyers', value: Number(payload[0].value).toLocaleString() }]} /> : null} />
                <Bar dataKey="buyers" fill="#4FB3A2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

export function SignalFeedPage() {
  const navigate = useNavigate()
  return (
    <div className="animate-fade-in">
      <PageHeader title="Signals" meta={<span>Signal feed · {brand.client}</span>} />
      <div className="mx-auto max-w-[1080px] px-8 py-6">
        <Card>
          <Row title="Lapse spike: Ridgeline Protein Bar" meta="Weekly lapses up ~2x since Aug 18 · 1,904 switched to competitors" tag="Recall" onClick={() => navigate(routes.detect)} />
          <Row title="Competitor gain: Northstar Bars" meta="46% of identified Ridgeline switchers" onClick={() => navigate(routes.detect)} />
          <Row title="Availability gap: Kroger" meta="71% in-stock rate across Ridgeline SKUs (illustrative)" onClick={() => navigate(routes.results)} />
        </Card>
      </div>
    </div>
  )
}
