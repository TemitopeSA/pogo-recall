import type { ReasonKey } from './mockData'

export interface Respondent {
  id: string
  name: string
  age: number
  city: string
  reason: ReasonKey
  quote: string
  switchedTo: string
  retailer: string
  tenure: string
  duration: string
}

export const respondents: Respondent[] = [
  { id: 'tasha', name: 'Tasha M.', age: 34, city: 'Columbus, OH', reason: 'price', quote: 'When it jumped to $3.29 I just grabbed the Northstar next to it.', switchedTo: 'Northstar Bars', retailer: 'Target', tenure: '2.5 years', duration: '7:42' },
  { id: 'daniel', name: 'Daniel R.', age: 29, city: 'Austin, TX', reason: 'protein', quote: 'I still like the bar, but I can get more protein for the same money now.', switchedTo: 'Fuel Co.', retailer: 'Amazon', tenure: '1.5 years', duration: '6:15' },
  { id: 'monica', name: 'Monica L.', age: 41, city: 'Phoenix, AZ', reason: 'stock', quote: 'My store was out for two weeks, so I tried something else and stuck with it.', switchedTo: 'Market Basic', retailer: 'Walmart', tenure: '3 years', duration: '8:03' },
  { id: 'eric', name: 'Eric B.', age: 37, city: 'Denver, CO', reason: 'taste', quote: "The texture seemed different from what I remembered. I wasn't sure it was the same recipe.", switchedTo: 'Northstar Bars', retailer: 'Kroger', tenure: '4 years', duration: '9:11' },
  { id: 'priya', name: 'Priya S.', age: 31, city: 'Chicago, IL', reason: 'price', quote: "The cheaper option is fine for my morning commute. I don't think about the brand as much anymore.", switchedTo: 'Market Basic', retailer: 'target.com', tenure: '1 year', duration: '5:48' },
  { id: 'marcus', name: 'Marcus T.', age: 45, city: 'Atlanta, GA', reason: 'stock', quote: 'I switched when my usual store stopped carrying the flavor I wanted.', switchedTo: 'Fuel Co.', retailer: 'Kroger', tenure: '2 years', duration: '6:57' },
  { id: 'kevin', name: 'Kevin H.', age: 52, city: 'Raleigh, NC', reason: 'price', quote: 'Three-something for one bar adds up when you buy a few every week.', switchedTo: 'Northstar Bars', retailer: 'Walmart', tenure: '2 years', duration: '6:22' },
  { id: 'alicia', name: 'Alicia G.', age: 27, city: 'San Diego, CA', reason: 'taste', quote: "It tasted sweeter than before. I didn't love the change.", switchedTo: 'Northstar Bars', retailer: 'Target', tenure: '1.5 years', duration: '7:05' },
  { id: 'jamal', name: 'Jamal W.', age: 33, city: 'Minneapolis, MN', reason: 'protein', quote: "I'm training for a half marathon and wanted 20 grams, not 15.", switchedTo: 'Fuel Co.', retailer: 'Amazon', tenure: '2 years', duration: '5:31' },
  { id: 'rachel', name: 'Rachel K.', age: 39, city: 'Pittsburgh, PA', reason: 'other', quote: 'Honestly, I cut back on snacking between meals for a while.', switchedTo: 'No replacement', retailer: 'Kroger', tenure: '3 years', duration: '4:49' },
  { id: 'luis', name: 'Luis F.', age: 44, city: 'Houston, TX', reason: 'price', quote: 'Northstar was on sale and it was close enough for what I need.', switchedTo: 'Northstar Bars', retailer: 'Walmart', tenure: '2.5 years', duration: '6:40' },
  { id: 'hannah', name: 'Hannah O.', age: 26, city: 'Portland, OR', reason: 'stock', quote: 'The store near me never had the peanut butter one anymore.', switchedTo: 'Market Basic', retailer: 'Kroger', tenure: '1 year', duration: '5:12' },
]

export const respondentById = Object.fromEntries(respondents.map((r) => [r.id, r])) as Record<string, Respondent>

export interface TranscriptLine {
  speaker: 'interviewer' | 'respondent'
  text: string
  time: string
}

const followUps: Record<ReasonKey, [string, string, string]> = {
  price: [
    "The price went up, and I could get a similar bar beside it for less. It wasn't a hard decision.",
    "If it came down a bit, or if there was a good offer, I'd give it another shot.",
    'Somewhere under $2.80 would feel fair again.',
  ],
  taste: [
    'It just tasted different, a bit drier. I kept wondering if they changed the recipe.',
    "If they told me what changed, or let me try it again for free, I'd be open to it.",
    'Price was never really the issue for me. It was the bar itself.',
  ],
  stock: [
    "It wasn't on the shelf when I went. After a couple of trips I just picked up what was there.",
    "If I knew it was reliably back at my store, I'd probably switch back. I liked it.",
    "I'd pay the same as before, I just need to be able to find it.",
  ],
  protein: [
    'I started paying more attention to grams of protein, and other bars give me more for the same price.',
    "A higher-protein version would get me back. Or a deal that makes up the difference.",
    "Maybe if it were cheaper, but really it's the protein.",
  ],
  other: [
    "Mostly my routine changed. I wasn't snacking at work as much.",
    "If I'm back in that routine, Ridgeline would probably be the one I'd grab.",
    "A reminder or an offer at the right time would probably work on me.",
  ],
}

export function transcriptFor(r: Respondent): TranscriptLine[] {
  const [why, back, price] = followUps[r.reason]
  return [
    { speaker: 'interviewer', text: 'What changed about your decision to buy Ridgeline?', time: '0:42' },
    { speaker: 'respondent', text: r.quote + ' ' + why, time: '0:51' },
    { speaker: 'interviewer', text: `You mentioned ${r.switchedTo === 'No replacement' ? 'cutting back' : r.switchedTo}. How does that compare for you?`, time: '2:08' },
    { speaker: 'respondent', text: r.switchedTo === 'No replacement' ? "I didn't really replace it with anything. I just stopped buying bars for a bit." : `${r.switchedTo} is fine. It does the job, and I can find it at ${r.retailer}.`, time: '2:19' },
    { speaker: 'interviewer', text: 'What would make you consider buying it again?', time: '4:31' },
    { speaker: 'respondent', text: back, time: '4:40' },
    { speaker: 'interviewer', text: 'At what price would Ridgeline feel worth it again?', time: '5:56' },
    { speaker: 'respondent', text: price, time: '6:04' },
  ]
}
