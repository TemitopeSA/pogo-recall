import { competitors, funnel, priceReturnCount, reasons, results, segmentById, study } from './mockData'

export type Attachment =
  | { kind: 'competitor-chart' }
  | { kind: 'reasons-chart' }
  | { kind: 'availability-table' }
  | { kind: 'results-summary' }
  | { kind: 'audience'; name: string; count: number; note: string }

export interface AgentAnswer {
  intent: 'northstar' | 'next-segment' | 'why' | 'roi' | 'test-next' | 'results' | 'buyers' | 'fallback'
  text: string
  thoughtSeconds: number
  work: string[]
  attachments: Attachment[]
  followUps: string[]
  navigate?: 'detect-northstar'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  answer?: AgentAnswer
}

const northstar = competitors[0]

export function respond(raw: string): AgentAnswer {
  const q = raw.toLowerCase()

  if (q.includes('northstar') || (q.includes('lost') && q.includes('buyers'))) {
    return {
      intent: 'northstar',
      text: `Northstar Bars is the largest destination. ${northstar.pct}% of the ${funnel.switched.toLocaleString()} identified competitor switchers (${northstar.count.toLocaleString()} verified buyers) moved to Northstar, most within weeks of the Aug 18 price change. Opening the Recall overview so you can see where the rest went.`,
      thoughtSeconds: 18,
      work: [
        'Filtered verified Ridgeline Protein Bar buyers, last 12 months (12,480)',
        'Kept buyers with no Ridgeline purchase in 60+ days (3,120 lapsed)',
        'Matched later receipts to competitor SKUs (1,904 switched)',
        `Grouped switchers by destination brand: Northstar Bars ${northstar.pct}%`,
      ],
      attachments: [
        { kind: 'audience', name: 'Lapsed to Northstar Bars', count: northstar.count, note: 'Receipt-verified switchers' },
        { kind: 'competitor-chart' },
      ],
      followUps: ['Why did customers switch?', 'Which segment should we target next?'],
      navigate: 'detect-northstar',
    }
  }

  if (q.includes('test next') || q.includes('experiment') || (q.includes('test') && q.includes('what'))) {
    return {
      intent: 'test-next',
      text: 'Two tests are worth running next, each with its own randomized holdout. First, send a “back in stock” message (no reward) to out-of-stock lapsers who shop at Target, where availability is strongest. Second, test $1.00 against $1.50 cashback with new price-sensitive switchers to find the lowest offer that still brings buyers back.',
      thoughtSeconds: 14,
      work: [
        'Compared observed results with pre-launch forecast (26.7% vs 21–27% modeled)',
        'Ranked untested segments by size and stated barrier',
        'Checked store availability for out-of-stock lapsers',
        'Drafted two holdout-controlled test designs',
      ],
      attachments: [{ kind: 'availability-table' }],
      followUps: ['Which segment should we target next?', 'How was ROI calculated?'],
    }
  }

  if (q.includes('segment') || q.includes('next') || q.includes('target')) {
    const s = segmentById.stock
    return {
      intent: 'next-segment',
      text: `Out-of-stock lapsers are the strongest next test. Their barrier is availability, not necessarily willingness to pay. Confirm that Ridgeline is back in stock at the stores they use, then test a targeted return message against a holdout group. That's ${s.count} verified buyers, and Target is the safest place to start.`,
      thoughtSeconds: 18,
      work: [
        'Reviewed the 30-day results for price-sensitive switchers (26.7% vs 6.2% control)',
        `Compared the remaining segments: out-of-stock (${s.count}) and taste-change (${segmentById.taste.count})`,
        'Out-of-stock interviewees showed low price sensitivity, so a reward may be unnecessary',
        'Joined segment stores with illustrative shelf-availability data',
      ],
      attachments: [
        { kind: 'audience', name: s.name, count: s.count, note: 'Suggested next audience' },
        { kind: 'availability-table' },
      ],
      followUps: ['What should we test next?', 'How was ROI calculated?', 'Why did customers switch?'],
    }
  }

  if (q.includes('roi') || q.includes('calculat') || q.includes('cost')) {
    return {
      intent: 'roi',
      text: `The 5.1x ROI is a modeled, annualized figure, not realized revenue. It compares the campaign's cost with $214K in modeled annualized incremental revenue. That model is based on the observed lift: ${results.treatmentRate}% of offered buyers returned, against ${results.controlRate}% in the holdout (+${results.liftPts} pts), with ${results.repeatAfterReturn}% buying again after returning. The $${results.memberPayouts.toLocaleString()} paid to members covers reward payouts only, not total campaign cost. Cost per return is $${results.costPerReturn.toFixed(2)}.`,
      thoughtSeconds: 9,
      work: [
        `Observed: ${results.returned} receipt-verified returns among ${results.offered} offered buyers`,
        `Observed: holdout return rate ${results.controlRate}%, lift ${results.liftPts} pts`,
        'Modeled: annualized value of incremental returners, including repeat purchases',
        'Modeled: ROI = annualized incremental revenue ÷ total campaign cost',
      ],
      attachments: [{ kind: 'results-summary' }],
      followUps: ['Which segment should we target next?', 'What should we test next?'],
    }
  }

  if (q.includes('why') || q.includes('switch') || q.includes('leave') || q.includes('left') || q.includes('reason')) {
    return {
      intent: 'why',
      text: `Price leads. In ${study.interviews} AI-moderated interviews with verified lapsed buyers, ${reasons[0].pct}% said the price went up, followed by taste or texture changes (${reasons[1].pct}%) and stock problems (${reasons[2].pct}%). Among price-driven switchers, ${study.priceReturnPct}% (${priceReturnCount} people) say they'd return at ${study.priceReturnThreshold} or less.`,
      thoughtSeconds: 12,
      work: [
        `Read ${study.interviews} interview transcripts from the “${study.title}” study`,
        'Coded each interview for its primary switching reason',
        'Ranked reasons by share of respondents',
        'Pulled price-threshold answers from price-driven switchers',
      ],
      attachments: [{ kind: 'reasons-chart' }],
      followUps: ['Show me buyers we lost to Northstar', 'Which segment should we target next?'],
    }
  }

  if (q.includes('result') || q.includes('return') || q.includes('lift') || q.includes('work')) {
    return {
      intent: 'results',
      text: `After 30 days, ${results.returned} of ${results.offered} offered buyers made a receipt-verified Ridgeline purchase (${results.treatmentRate}%). The holdout group returned at ${results.controlRate}%, so the observed lift is +${results.liftPts} percentage points.`,
      thoughtSeconds: 7,
      work: ['Matched receipts in the 30-day window to offered and holdout buyers', 'Computed return rates for each group'],
      attachments: [{ kind: 'results-summary' }],
      followUps: ['How was ROI calculated?', 'Which segment should we target next?'],
    }
  }

  if (q.includes('buyer') || q.includes('summar') || q.includes('lapsed')) {
    return {
      intent: 'buyers',
      text: `Ridgeline Protein Bar has ${funnel.verifiedBuyers.toLocaleString()} verified buyers over the last 12 months. ${funnel.lapsed.toLocaleString()} have lapsed (no purchase in 60+ days), and ${funnel.switched.toLocaleString()} of them switched to a competitor. That puts an estimated $1.42M in annual revenue at risk.`,
      thoughtSeconds: 6,
      work: ['Counted verified buyers from card and receipt data', 'Applied the 60-day lapse rule', 'Matched competitor purchases'],
      attachments: [{ kind: 'audience', name: 'Lapsed Ridgeline buyers', count: funnel.lapsed, note: 'No purchase in 60+ days' }],
      followUps: ['Show me buyers we lost to Northstar', 'Why did customers switch?'],
    }
  }

  return {
    intent: 'fallback',
    text: 'This prototype covers the Ridgeline Protein Bar recovery workflow. I can show where lapsed buyers went, explain why they switched, walk through the campaign results, or suggest the next segment to target.',
    thoughtSeconds: 3,
    work: ['Matched the question against the Ridgeline Recall workspace'],
    attachments: [],
    followUps: ['Show me buyers we lost to Northstar', 'Why did customers switch?', 'How was ROI calculated?', 'What should we test next?'],
  }
}

let seq = 0
export const msgId = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`
