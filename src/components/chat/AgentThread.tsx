import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, Copy, Users } from 'lucide-react'
import { respond, msgId, type AgentAnswer, type Attachment, type ChatMessage } from '../../data/agent'
import { availability, results } from '../../data/mockData'
import { CompetitorBars } from '../charts/CompetitorChart'
import { ReasonsBars } from '../charts/ReasonsChart'
import { ThoughtRow } from '../respondents/RespondentDrawer'
import { PogoMark } from '../shared/ui'
import { useToast } from '../shared/Toast'
import { copyText, cx, prefersReducedMotion } from '../../lib/util'
import { track } from '@vercel/analytics'

export function AvailabilityTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-[12px]">
        <caption className="sr-only">Illustrative store availability for out-of-stock lapsers</caption>
        <thead className="bg-canvas text-left text-muted">
          <tr><th className="px-3 py-2 font-medium">Retailer</th><th className="px-3 py-2 font-medium">Availability</th><th className="px-3 py-2 font-medium">Suggested action</th></tr>
        </thead>
        <tbody>
          {availability.map((a) => (
            <tr key={a.retailer} className="border-t border-line">
              <td className="px-3 py-2 font-medium">{a.retailer}</td>
              <td className="px-3 py-2"><span className="num">{a.inStock}%</span> in stock</td>
              <td className="px-3 py-2">
                <span className={cx('inline-flex items-center gap-1.5', a.action === 'Prioritize' ? 'text-[#2F7A3B]' : a.action === 'Test selectively' ? 'text-[#9A6A12]' : 'text-c-coral')}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{a.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-line bg-canvas px-3 py-1.5 text-[10px] text-faint">Illustrative fictional data</div>
    </div>
  )
}

function AttachmentView({ a }: { a: Attachment }) {
  const box = (title: string, body: ReactNode) => (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="mb-3 text-[12px] font-semibold">{title}</div>
      {body}
    </div>
  )
  switch (a.kind) {
    case 'audience':
      return (
        <div className="inline-flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lavender text-brand"><Users size={15} /></span>
          <div>
            <div className="text-[13px] font-medium">{a.name}</div>
            <div className="text-[11px] text-muted"><span className="num">{a.count.toLocaleString()}</span> buyers · {a.note}</div>
          </div>
        </div>
      )
    case 'competitor-chart': return box('Where lapsed buyers went', <CompetitorBars compact />)
    case 'reasons-chart': return box('Reasons for switching', <ReasonsBars view="bar" height={190} />)
    case 'availability-table': return <AvailabilityTable />
    case 'results-summary':
      return box('30-day results', (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[[String(results.returned), 'Returned'], [`${results.treatmentRate}%`, 'Treatment'], [`${results.controlRate}%`, 'Control'], [`${results.roi}x`, 'ROI (modeled)']].map(([v, l]) => (
            <div key={l} className="rounded-lg bg-canvas py-2"><div className="num text-[15px] font-medium">{v}</div><div className="text-[10px] text-muted">{l}</div></div>
          ))}
        </div>
      ))
  }
}

export function AssistantMessage({ answer, onFollowUp, tourTarget }: { answer: AgentAnswer; onFollowUp?: (q: string) => void; tourTarget?: string }) {
  const toast = useToast()
  return (
    <div className="flex gap-3" data-tour={tourTarget}>
      <PogoMark size={26} inverted className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-3">
        <ThoughtRow seconds={answer.thoughtSeconds} label={`Show Work · Thought for ${answer.thoughtSeconds} seconds`} steps={answer.work} />
        <p className="text-[14px] leading-relaxed">{answer.text}</p>
        {answer.attachments.map((a, i) => <AttachmentView key={i} a={a} />)}
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={async () => { const ok = await copyText(answer.text); toast(ok ? 'Response copied' : 'Could not access the clipboard', ok ? 'success' : 'info') }} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-muted hover:bg-canvas hover:text-ink" aria-label="Copy response">
            <Copy size={13} /> Copy
          </button>
          {onFollowUp && answer.followUps.map((q) => (
            <button key={q} onClick={() => onFollowUp(q)} className="h-7 rounded-full border border-line bg-white px-3 text-[12px] hover:border-brand hover:text-brand">{q}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UserBubble({ text }: { text: string }) {
  return <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-br-md bg-bubble px-4 py-2.5 text-[14px]">{text}</div></div>
}

export function Thinking() {
  return (
    <div className="flex items-center gap-3" role="status">
      <PogoMark size={26} inverted />
      <span className="dot-pulse flex items-center gap-1 text-[13px] text-muted">Thinking <span>•</span><span>•</span><span>•</span></span>
    </div>
  )
}

/** Shared Pogo agent conversation, used by the global Chat and the Results agent panel. */
export function useAgent(messages: ChatMessage[], setMessages: (fn: (m: ChatMessage[]) => ChatMessage[]) => void, onAnswer?: (a: AgentAnswer) => void) {
  const [thinking, setThinking] = useState(false)
  const ask = (q: string) => {
    const text = q.trim()
    if (!text || thinking) return
    setMessages((m) => [...m, { id: msgId(), role: 'user', text }])
    setThinking(true)
    setTimeout(() => {
      const answer = respond(text)
      track('agent_question', { intent: answer.intent })
      setMessages((m) => [...m, { id: msgId(), role: 'assistant', text: '', answer }])
      setThinking(false)
      onAnswer?.(answer)
    }, prefersReducedMotion() ? 300 : 1500)
  }
  return { messages, thinking, ask }
}

export function Composer({ onSubmit, disabled, placeholder = 'Ask the Pogo agent…', inputRef }: { onSubmit: (q: string) => void; disabled?: boolean; placeholder?: string; inputRef?: React.RefObject<HTMLTextAreaElement | null> }) {
  const [v, setV] = useState('')
  const submit = () => { if (v.trim() && !disabled) { onSubmit(v); setV('') } }
  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 focus-within:border-brand">
      <label className="sr-only" htmlFor={placeholder}>Message</label>
      <textarea
        id={placeholder}
        ref={inputRef}
        rows={1}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        placeholder={placeholder}
        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent focus-visible:outline-none px-2 py-2 text-[14px] outline-none placeholder:text-faint"
      />
      <button type="submit" disabled={!v.trim() || disabled} aria-label="Send" className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-hover disabled:opacity-40">
        <ArrowUp size={16} />
      </button>
    </form>
  )
}

export function MessageList({ messages, thinking, onFollowUp, firstAnswerTour }: { messages: ChatMessage[]; thinking: boolean; onFollowUp: (q: string) => void; firstAnswerTour?: string }) {
  const end = useRef<HTMLDivElement>(null)
  const count = useRef(messages.length)
  useEffect(() => {
    if (messages.length !== count.current || thinking) end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    count.current = messages.length
  }, [messages.length, thinking])
  const firstAssistantId = messages.find((m) => m.role === 'assistant')?.id
  return (
    <div className="space-y-6">
      {messages.map((m) => {
        if (m.role === 'user') return <UserBubble key={m.id} text={m.text} />
        const tour = m.id === firstAssistantId ? firstAnswerTour : undefined
        return m.answer ? <div key={m.id} className="animate-rise-in"><AssistantMessage answer={m.answer} onFollowUp={onFollowUp} tourTarget={tour} /></div> : null
      })}
      {thinking && <Thinking />}
      <div ref={end} />
    </div>
  )
}
