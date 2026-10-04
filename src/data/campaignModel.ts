import { results, segmentById, type SegmentId } from './mockData'

export type OfferType = 'cashback' | 'points' | 'free' | 'message'

export interface CampaignConfig {
  segments: SegmentId[]
  offerType: OfferType
  cashbackAmount: string
  points: string
  freeProduct: string
  durationDays: string
  message: string
  holdoutEnabled: boolean
  holdoutPct: string
}

export const freeProducts = [
  'Peanut Butter Crunch 1.76oz',
  'Chocolate Sea Salt 1.76oz',
  'Cookie Dough 1.76oz',
]

export const FREE_PRODUCT_VALUE = 3.29
export const DEFAULT_MESSAGE = "We'd love to have you back. Get $1.50 back on your next Ridgeline Protein Bar."

export const defaultCampaign: CampaignConfig = {
  segments: ['price'],
  offerType: 'cashback',
  cashbackAmount: '1.50',
  points: '1500',
  freeProduct: freeProducts[0],
  durationDays: '14',
  message: DEFAULT_MESSAGE,
  holdoutEnabled: true,
  holdoutPct: '10',
}

export const offerTypes: { id: OfferType; label: string; help: string }[] = [
  { id: 'cashback', label: 'Cashback', help: 'Buyers activate the offer, purchase at any retailer, and scan the receipt. Pogo pays the cashback once the purchase is verified.' },
  { id: 'points', label: 'Bonus points', help: 'Buyers earn bonus Pogo points on a verified Ridgeline purchase. 1,000 points ≈ $1.00 in member rewards.' },
  { id: 'free', label: 'Free product', help: 'Buyers purchase one bar and are reimbursed up to its shelf price after the receipt is verified.' },
  { id: 'message', label: 'Message only', help: 'A message in the Pogo app with no reward. Best for buyers whose barrier is not price, such as availability.' },
]

// Modeled return rate per segment for the default offer ($1.50 cashback, 14 days).
const SEGMENT_BASE: Record<SegmentId, number> = { price: 0.24, stock: 0.17, taste: 0.13 }
// How much a message-only campaign retains of that response, by segment.
const MESSAGE_ONLY: Record<SegmentId, number> = { price: 0.4, stock: 0.85, taste: 0.5 }
const DELIVERY_COST_PER_OFFERED = 0.625
const CONTROL_BASELINE = results.controlRate / 100
// Modeled annual value of one incremental returning buyer, calibrated to the $186K default projection.
export const ANNUAL_VALUE_PER_RETURNER = 1443

export interface Validation {
  segments?: string
  amount?: string
  points?: string
  freeProduct?: string
  duration?: string
  message?: string
  holdout?: string
}

const num = (v: string) => (v.trim() === '' ? NaN : Number(v))

export function validate(c: CampaignConfig): Validation {
  const e: Validation = {}
  if (c.segments.length === 0) e.segments = 'Select at least one audience segment.'
  const amount = num(c.cashbackAmount)
  if (c.offerType === 'cashback' && !(amount >= 0.25 && amount <= 5)) e.amount = 'Enter a cashback amount between $0.25 and $5.00.'
  const pts = num(c.points)
  if (c.offerType === 'points' && !(Number.isInteger(pts) && pts >= 250 && pts <= 10000)) e.points = 'Enter whole points between 250 and 10,000.'
  if (c.offerType === 'free' && !c.freeProduct) e.freeProduct = 'Choose the product to reimburse.'
  const d = num(c.durationDays)
  if (!(Number.isInteger(d) && d >= 3 && d <= 60)) e.duration = 'Duration must be 3 to 60 days.'
  if (c.message.trim().length === 0) e.message = 'Add the message buyers will see.'
  else if (c.message.length > 160) e.message = 'Keep the message to 160 characters or fewer.'
  const h = num(c.holdoutPct)
  if (c.holdoutEnabled && !(h >= 5 && h <= 30)) e.holdout = 'Holdout must be between 5% and 30%.'
  return e
}

export const isValid = (v: Validation) => Object.keys(v).length === 0

export function audienceSize(c: CampaignConfig) {
  return c.segments.reduce((s, id) => s + segmentById[id].count, 0)
}

export function rewardValue(c: CampaignConfig): number {
  switch (c.offerType) {
    case 'cashback': return Math.max(0, num(c.cashbackAmount) || 0)
    case 'points': return Math.max(0, (num(c.points) || 0) / 1000)
    case 'free': return FREE_PRODUCT_VALUE
    case 'message': return 0
  }
}

export interface Forecast {
  audience: number
  rateMid: number
  rateLow: number
  rateHigh: number
  expectedReturns: number
  costPerReturn: number
  incrementalRevenue: number
  holdoutSize: number
  measurement: 'Not measurable' | 'Directional' | 'Standard' | 'High precision'
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function forecast(c: CampaignConfig): Forecast {
  const audience = audienceSize(c)
  const value = rewardValue(c)
  const days = clamp(num(c.durationDays) || 14, 3, 60)
  const durationFactor = clamp(1 + 0.12 * Math.log2(days / 14), 0.75, 1.2)
  const valueFactor = (v: number) => clamp(1 + 0.2 * (v - 1.5), 0.6, 1.6)

  let weighted = 0
  for (const id of c.segments) {
    const base = SEGMENT_BASE[id]
    let f: number
    if (c.offerType === 'cashback') f = valueFactor(value)
    else if (c.offerType === 'points') f = 0.85 * valueFactor(value)
    else if (c.offerType === 'free') f = 1.22
    else f = MESSAGE_ONLY[id]
    weighted += segmentById[id].count * base * f * durationFactor
  }
  const mid = audience ? clamp(weighted / audience, 0.04, 0.45) : 0
  const midPct = Math.round(mid * 100)
  const expectedReturns = Math.round(audience * mid)
  const totalCost = expectedReturns * value + audience * DELIVERY_COST_PER_OFFERED
  const pct = num(c.holdoutPct) || 0
  const holdoutSize = c.holdoutEnabled ? Math.round((audience * pct) / (100 - pct)) : 0

  return {
    audience,
    rateMid: midPct,
    rateLow: Math.max(1, midPct - 3),
    rateHigh: midPct + 3,
    expectedReturns,
    costPerReturn: expectedReturns ? totalCost / expectedReturns : 0,
    incrementalRevenue: Math.max(0, audience * (mid - CONTROL_BASELINE)) * ANNUAL_VALUE_PER_RETURNER,
    holdoutSize,
    measurement: !c.holdoutEnabled ? 'Not measurable' : pct < 8 ? 'Directional' : pct <= 20 ? 'Standard' : 'High precision',
  }
}

export function offerHeadline(c: CampaignConfig): string {
  switch (c.offerType) {
    case 'cashback': return `Get $${(num(c.cashbackAmount) || 0).toFixed(2)} back`
    case 'points': return `Earn ${(num(c.points) || 0).toLocaleString()} bonus points`
    case 'free': return 'Try it again, on us'
    case 'message': return 'Ridgeline misses you'
  }
}

export function offerSummary(c: CampaignConfig): string {
  switch (c.offerType) {
    case 'cashback': return `$${(num(c.cashbackAmount) || 0).toFixed(2)} cashback on the next Ridgeline bar`
    case 'points': return `${(num(c.points) || 0).toLocaleString()} bonus Pogo points on a Ridgeline purchase`
    case 'free': return `Free ${c.freeProduct} via receipt reimbursement`
    case 'message': return 'Message only, no reward'
  }
}

export function isDefaultCampaign(c: CampaignConfig) {
  return JSON.stringify(c) === JSON.stringify(defaultCampaign)
}

export function suggestedMessage(c: CampaignConfig): string {
  switch (c.offerType) {
    case 'cashback': return `We'd love to have you back. Get $${(num(c.cashbackAmount) || 0).toFixed(2)} back on your next Ridgeline Protein Bar.`
    case 'points': return `We'd love to have you back. Earn ${(num(c.points) || 0).toLocaleString()} bonus points on your next Ridgeline Protein Bar.`
    case 'free': return `Try Ridgeline again, on us. Buy a ${c.freeProduct} bar and we'll reimburse it.`
    case 'message': return 'Ridgeline is back on the shelf at your store. Come grab your favorite flavor.'
  }
}

/** Apply a change and keep the message in sync if the user hasn't customized it. */
export function updateConfig(c: CampaignConfig, patch: Partial<CampaignConfig>): CampaignConfig {
  const next = { ...c, ...patch }
  if (patch.message === undefined && c.message === suggestedMessage(c)) next.message = suggestedMessage(next)
  return next
}
