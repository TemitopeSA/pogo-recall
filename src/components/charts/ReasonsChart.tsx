import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartBar, ChartColumn, Table2 } from 'lucide-react'
import { reasons, study } from '../../data/mockData'
import { downloadCsv } from '../../lib/util'
import { useToast } from '../shared/Toast'
import { Segmented } from '../shared/ui'
import { axisProps, ChartCard, ChartTooltipBox } from './ChartCard'

type View = 'table' | 'bar' | 'column'
const data = [...reasons].sort((a, b) => b.pct - a.pct)
const pctLabel = (v: unknown) => `${v}%`

function Tip({ active, payload }: { active?: boolean; payload?: readonly { payload: (typeof data)[number] }[] }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return <ChartTooltipBox title={r.label} rows={[{ label: 'Share of respondents', value: `${r.pct}%` }, { label: 'Respondents', value: r.count }]} />
}

export function ReasonsBars({ view, height = 230 }: { view: Exclude<View, 'table'>; height?: number }) {
  const desc = 'Reasons for switching: ' + data.map((r) => `${r.label} ${r.pct}%`).join(', ')
  return (
    <div role="img" aria-label={desc}>
      <ResponsiveContainer width="100%" height={height}>
        {view === 'bar' ? (
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid stroke="#EFEFEF" horizontal={false} />
            <XAxis type="number" domain={[0, 40]} {...axisProps} tickFormatter={pctLabel} />
            <YAxis type="category" dataKey="label" {...axisProps} axisLine={false} width={176} tick={{ fill: '#000', fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#F6F5FF' }} content={(p) => <Tip active={p.active} payload={p.payload as never} />} />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((r) => <Cell key={r.key} fill={r.color} />)}
              <LabelList dataKey="pct" position="right" formatter={pctLabel} style={{ fill: '#000', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }} />
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 20, right: 8, left: -16, bottom: 0 }} barCategoryGap={18}>
            <CartesianGrid stroke="#EFEFEF" vertical={false} />
            <XAxis dataKey="short" {...axisProps} />
            <YAxis domain={[0, 40]} {...axisProps} axisLine={false} tickFormatter={pctLabel} />
            <Tooltip cursor={{ fill: '#F6F5FF' }} content={(p) => <Tip active={p.active} payload={p.payload as never} />} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((r) => <Cell key={r.key} fill={r.color} />)}
              <LabelList dataKey="pct" position="top" formatter={pctLabel} style={{ fill: '#000', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }} />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export function ReasonsChart({ tour }: { tour?: string }) {
  const [view, setView] = useState<View>('bar')
  const toast = useToast()
  const download = () => {
    downloadCsv('ridgeline-reasons-for-switching.csv', [['Reason', 'Share of respondents (%)', 'Respondents'], ...data.map((r) => [r.label, r.pct, r.count])])
    toast('Export ready: ridgeline-reasons-for-switching.csv')
  }
  return (
    <ChartCard
      tour={tour}
      title="Reasons for switching"
      subtitle={`Primary reason, ${study.interviews} verified lapsed buyers`}
      onDownload={download}
      controls={
        <Segmented
          label="Chart view"
          value={view}
          onChange={setView}
          options={[
            { id: 'table', label: <Table2 size={14} />, title: 'Table' },
            { id: 'bar', label: <ChartBar size={14} />, title: 'Bar chart' },
            { id: 'column', label: <ChartColumn size={14} />, title: 'Column chart' },
          ]}
        />
      }
    >
      {view === 'table' ? (
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] text-muted">
              <th className="py-2 font-medium">Reason</th>
              <th className="py-2 text-right font-medium">Share</th>
              <th className="py-2 text-right font-medium">Respondents</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.key} className="border-b border-line last:border-0 hover:bg-canvas">
                <td className="py-2.5"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: r.color }} />{r.label}</td>
                <td className="num py-2.5 text-right">{r.pct}%</td>
                <td className="num py-2.5 text-right text-muted">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ReasonsBars view={view} />
      )}
    </ChartCard>
  )
}
