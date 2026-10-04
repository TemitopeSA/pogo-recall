// Centralized mock data for Pogo Recall. All brands, people and records are fictional.

export const brand = {
  product: 'Ridgeline Protein Bar',
  client: 'Ridgeline Foods',
  user: { name: 'Jordan Reyes', initials: 'JR', org: 'Ridgeline Foods' },
} as const

export const retailers = ['Target', 'Walmart', 'Kroger', 'target.com', 'Amazon'] as const
export type Retailer = (typeof retailers)[number]

export const funnel = {
  verifiedBuyers: 12480,
  lapsed: 3120,
  switched: 1904,
  revenueAtRisk: 1_420_000,
} as const

export interface CompetitorShare {
  name: string
  pct: number
  count: number
  color: string
}

const competitorPcts = [
  { name: 'Northstar Bars', pct: 46, color: '#6B3FE0' },
  { name: 'Fuel Co.', pct: 31, color: '#4FB3A2' },
  { name: 'Market Basic', pct: 23, color: '#E4793A' },
]

// Counts derived from the stated percentages; the largest bucket absorbs rounding so the total stays 1,904.
export const competitors: CompetitorShare[] = (() => {
  const rows = competitorPcts.map((c) => ({ ...c, count: Math.round((funnel.switched * c.pct) / 100) }))
  const diff = funnel.switched - rows.reduce((s, r) => s + r.count, 0)
  rows[0].count += diff
  return rows
})()

export interface LapseWeek {
  week: string
  label: string
  lapses: number
}

// Lapsed buyers grouped by the week of their last Ridgeline purchase. Sums to 3,120.
export const lapseTrend: LapseWeek[] = [
  { week: 'W1', label: 'Jul 7', lapses: 168 },
  { week: 'W2', label: 'Jul 14', lapses: 174 },
  { week: 'W3', label: 'Jul 21', lapses: 171 },
  { week: 'W4', label: 'Jul 28', lapses: 179 },
  { week: 'W5', label: 'Aug 4', lapses: 176 },
  { week: 'W6', label: 'Aug 11', lapses: 182 },
  { week: 'W7', label: 'Aug 18', lapses: 268 },
  { week: 'W8', label: 'Aug 25', lapses: 331 },
  { week: 'W9', label: 'Sep 1', lapses: 362 },
  { week: 'W10', label: 'Sep 8', lapses: 374 },
  { week: 'W11', label: 'Sep 15', lapses: 358 },
  { week: 'W12', label: 'Sep 22', lapses: 377 },
]
export const priceChangeWeek = 'Aug 18'

export type ReasonKey = 'price' | 'taste' | 'stock' | 'protein' | 'other'

export interface Reason {
  key: ReasonKey
  label: string
  short: string
  pct: number
  count: number
  color: string
}

export const study = {
  title: 'Why did Ridgeline buyers leave?',
  interviews: 250,
  hours: 6,
  cohorts: 1,
  keyQuestions: 5,
  priceReturnPct: 62,
  priceReturnThreshold: '$2.79',
  questions: [
    'What changed about your decision to buy Ridgeline?',
    'What did you buy instead, and where?',
    'How does the alternative compare on price, taste and protein?',
    'What would make you consider buying Ridgeline again?',
    'At what price would Ridgeline feel worth it again?',
  ],
}

export const reasons: Reason[] = [
  { key: 'price', label: 'Price went up', short: 'Price', pct: 38, count: 95, color: '#6B3FE0' },
  { key: 'taste', label: 'Taste/texture changed', short: 'Taste', pct: 24, count: 60, color: '#4FB3A2' },
  { key: 'stock', label: 'Out of stock at my store', short: 'Out of stock', pct: 19, count: 47, color: '#E4793A' },
  { key: 'protein', label: 'Found a higher-protein option', short: 'Protein', pct: 12, count: 30, color: '#5DB46A' },
  { key: 'other', label: 'Other', short: 'Other', pct: 7, count: 18, color: '#A1A1A1' },
]
export const reasonByKey = Object.fromEntries(reasons.map((r) => [r.key, r])) as Record<ReasonKey, Reason>

// 62% of the 95 price-driven switchers.
export const priceReturnCount = Math.round((reasons[0].count * study.priceReturnPct) / 100)

export type SegmentId = 'price' | 'stock' | 'taste'

export interface Segment {
  id: SegmentId
  name: string
  count: number
  reason: ReasonKey
  description: string
  characteristics: string[]
  recommendation: string
}

export const segments: Segment[] = [
  {
    id: 'price',
    name: 'Price-sensitive switchers',
    count: 724,
    reason: 'price',
    description: 'Switched after the Aug 18 price change and cite price as their main reason.',
    characteristics: [
      'Last Ridgeline purchase within 8 weeks of the price change',
      'Now buying Northstar Bars or Market Basic',
      'Most say they would return at $2.79 or less',
    ],
    recommendation: 'Cashback that brings the effective price near $2.79 for the next purchase.',
  },
  {
    id: 'stock',
    name: 'Out-of-stock lapsers',
    count: 362,
    reason: 'stock',
    description: 'Stopped buying after their usual store ran out or dropped a flavor.',
    characteristics: [
      'Concentrated at Kroger and Walmart locations',
      'Low stated price sensitivity',
      'Often switched to whatever was on the shelf',
    ],
    recommendation: 'Confirm store availability first, then send a “back in stock” message.',
  },
  {
    id: 'taste',
    name: 'Taste-change lapsers',
    count: 457,
    reason: 'taste',
    description: 'Noticed a taste or texture difference and stopped repurchasing.',
    characteristics: [
      'Long-tenured buyers (12+ purchases)',
      'Mention the Peanut Butter Crunch flavor most often',
      'Mixed willingness to try again',
    ],
    recommendation: 'Free product via receipt reimbursement, so they can re-try at no cost.',
  },
]
export const segmentById = Object.fromEntries(segments.map((s) => [s.id, s])) as Record<SegmentId, Segment>

// Observed results of the reference (default) campaign, 30 days after launch.
export const results = {
  offered: 724,
  returned: 193,
  treatmentRate: 26.7,
  controlRate: 6.2,
  liftPts: 20.5,
  repeatAfterReturn: 58,
  costPerReturn: 3.86,
  annualizedRevenue: 214_000,
  roi: 5.1,
  memberPayouts: 1086,
  offerRating: 4.7,
  windowLabel: 'Nov 3 – Dec 2',
}

export interface ReturnsPoint {
  day: number
  treatment: number
  control: number
}

// Illustrative cumulative return curves (percent of each group). Ends at the observed 26.7% and 6.2%.
export const returnsCurve: ReturnsPoint[] = Array.from({ length: 31 }, (_, day) => {
  const t = results.treatmentRate * ((1 - Math.exp(-day / 9)) / (1 - Math.exp(-30 / 9)))
  const c = results.controlRate * (day / 30) ** 1.05
  return { day, treatment: Math.round(t * 10) / 10, control: Math.round(c * 10) / 10 }
})

export interface Availability {
  retailer: string
  inStock: number
  action: 'Prioritize' | 'Test selectively' | 'Verify before sending'
}

export const availability: Availability[] = [
  { retailer: 'Target', inStock: 92, action: 'Prioritize' },
  { retailer: 'Walmart', inStock: 84, action: 'Test selectively' },
  { retailer: 'Kroger', inStock: 71, action: 'Verify before sending' },
]

export interface ReceiptRecord {
  id: string
  retailer: Retailer
  sku: string
  date: string
  dayOfCampaign: number
  amount: number
  buyer: string
}

export const receipts: ReceiptRecord[] = [
  { id: 'RCP-48213', retailer: 'Target', sku: 'Ridgeline Protein Bar · Peanut Butter Crunch 1.76oz', date: 'Nov 4', dayOfCampaign: 2, amount: 3.29, buyer: 'T. M.' },
  { id: 'RCP-48251', retailer: 'Walmart', sku: 'Ridgeline Protein Bar · Chocolate Sea Salt 4-pack', date: 'Nov 5', dayOfCampaign: 3, amount: 11.49, buyer: 'L. F.' },
  { id: 'RCP-48307', retailer: 'Kroger', sku: 'Ridgeline Protein Bar · Cookie Dough 1.76oz', date: 'Nov 6', dayOfCampaign: 4, amount: 3.29, buyer: 'K. H.' },
  { id: 'RCP-48390', retailer: 'target.com', sku: 'Ridgeline Protein Bar · Variety 12-ct box', date: 'Nov 8', dayOfCampaign: 6, amount: 32.99, buyer: 'P. S.' },
  { id: 'RCP-48422', retailer: 'Amazon', sku: 'Ridgeline Protein Bar · Peanut Butter Crunch 12-ct', date: 'Nov 9', dayOfCampaign: 7, amount: 33.49, buyer: 'D. R.' },
  { id: 'RCP-48517', retailer: 'Target', sku: 'Ridgeline Protein Bar · Chocolate Sea Salt 1.76oz', date: 'Nov 11', dayOfCampaign: 9, amount: 3.29, buyer: 'S. A.' },
  { id: 'RCP-48598', retailer: 'Walmart', sku: 'Ridgeline Protein Bar · Peanut Butter Crunch 4-pack', date: 'Nov 13', dayOfCampaign: 11, amount: 11.49, buyer: 'B. N.' },
  { id: 'RCP-48644', retailer: 'Kroger', sku: 'Ridgeline Protein Bar · Chocolate Sea Salt 1.76oz', date: 'Nov 15', dayOfCampaign: 13, amount: 3.29, buyer: 'C. J.' },
  { id: 'RCP-48731', retailer: 'Target', sku: 'Ridgeline Protein Bar · Variety 12-ct box', date: 'Nov 18', dayOfCampaign: 16, amount: 32.99, buyer: 'M. O.' },
  { id: 'RCP-48802', retailer: 'Amazon', sku: 'Ridgeline Protein Bar · Cookie Dough 12-ct', date: 'Nov 21', dayOfCampaign: 19, amount: 33.49, buyer: 'R. V.' },
  { id: 'RCP-48876', retailer: 'target.com', sku: 'Ridgeline Protein Bar · Chocolate Sea Salt 4-pack', date: 'Nov 25', dayOfCampaign: 23, amount: 11.99, buyer: 'E. W.' },
  { id: 'RCP-48940', retailer: 'Walmart', sku: 'Ridgeline Protein Bar · Cookie Dough 1.76oz', date: 'Nov 30', dayOfCampaign: 28, amount: 3.29, buyer: 'G. P.' },
]
