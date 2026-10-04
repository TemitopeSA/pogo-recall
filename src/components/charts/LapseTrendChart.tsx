import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { lapseTrend, priceChangeWeek } from '../../data/mockData'
import { axisProps, ChartTooltipBox } from './ChartCard'

export function LapseTrendChart({ height = 240 }: { height?: number }) {
  return (
    <div role="img" aria-label="Weekly lapsed buyers over 12 weeks. Lapses hold near 170 to 180 per week, then rise to 268 in the week of the Aug 18 price increase and reach about 360 to 380 per week afterwards.">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={lapseTrend} margin={{ top: 24, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#EFEFEF" vertical={false} />
          <XAxis dataKey="label" {...axisProps} interval={1} />
          <YAxis {...axisProps} axisLine={false} width={44} />
          <Tooltip
            cursor={{ stroke: '#D4D4D4' }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <ChartTooltipBox
                  title={`Week of ${payload[0].payload.label}`}
                  rows={[{ label: 'Lapsed buyers', value: Number(payload[0].value).toLocaleString(), color: '#6B3FE0' }]}
                />
              ) : null
            }
          />
          <ReferenceLine
            x={priceChangeWeek}
            stroke="#2E145A"
            strokeDasharray="4 3"
            label={{ value: 'Price increase · Aug 18', position: 'insideTopLeft', fill: '#2E145A', fontSize: 11, fontWeight: 600, offset: 0, dy: -20, dx: 4 }}
          />
          <Area type="monotone" dataKey="lapses" stroke="#6B3FE0" strokeWidth={2} fill="#6B3FE0" fillOpacity={0.08} dot={{ r: 2.5, fill: '#6B3FE0', strokeWidth: 0 }} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
