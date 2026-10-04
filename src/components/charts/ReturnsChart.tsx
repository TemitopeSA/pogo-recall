import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { results, returnsCurve } from '../../data/mockData'
import { axisProps, ChartTooltipBox } from './ChartCard'

export function ReturnsChart({ height = 280 }: { height?: number }) {
  return (
    <div role="img" aria-label={`Cumulative receipt-verified returns over 30 days. Treatment group rises quickly to ${results.treatmentRate}%; holdout control rises slowly to ${results.controlRate}%.`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={returnsCurve} margin={{ top: 10, right: 56, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#EFEFEF" vertical={false} />
          <XAxis dataKey="day" {...axisProps} ticks={[0, 5, 10, 15, 20, 25, 30]} tickFormatter={(d) => `Day ${d}`} />
          <YAxis {...axisProps} axisLine={false} domain={[0, 30]} ticks={[0, 10, 20, 30]} tickFormatter={(v) => `${v}%`} width={48} />
          <Tooltip
            cursor={{ stroke: '#D4D4D4' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipBox
                  title={`Day ${label}`}
                  rows={[
                    { label: 'Offered (treatment)', value: `${payload[0].payload.treatment}% · ${Math.round((payload[0].payload.treatment / 100) * results.offered)} buyers`, color: '#6B3FE0' },
                    { label: 'Holdout (control)', value: `${payload[0].payload.control}%`, color: '#737373', dashed: true },
                  ]}
                />
              ) : null
            }
          />
          <Legend verticalAlign="top" align="left" height={28} iconType="plainline" wrapperStyle={{ fontSize: 12, color: '#737373' }} />
          <ReferenceLine y={results.treatmentRate} stroke="none" label={{ value: `${results.treatmentRate}%`, position: 'right', fill: '#6B3FE0', fontSize: 12, fontWeight: 600 }} />
          <ReferenceLine y={results.controlRate} stroke="none" label={{ value: `${results.controlRate}%`, position: 'right', fill: '#737373', fontSize: 12 }} />
          <Line name="Offered buyers (treatment)" type="monotone" dataKey="treatment" stroke="#6B3FE0" strokeWidth={2.25} dot={false} activeDot={{ r: 4 }} />
          <Line name="Holdout (control)" type="monotone" dataKey="control" stroke="#737373" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
