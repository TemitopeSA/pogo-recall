import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/app-shell/PageHeader'
import { Composer, MessageList, useAgent } from '../components/chat/AgentThread'
import { routes, useApp } from '../state/AppState'
import { useToast } from '../components/shared/Toast'

const suggestions = ['Show me buyers we lost to Northstar', 'Why did customers switch?', 'Which segment should we target next?', 'How was ROI calculated?']

export function ChatPage() {
  const app = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const agent = useAgent(app.chat, app.setChat, (a) => {
    if (a.navigate === 'detect-northstar') {
      setTimeout(() => {
        app.setFocusCompetitor(Date.now())
        app.runTransition({ kind: 'loading', label: 'Opening Recall overview', sub: 'Ridgeline Protein Bar · competitor switching' }, routes.detect, 500)
      }, 900)
    }
  })
  return (
    <div className="animate-fade-in flex min-h-[calc(100vh-60px)] flex-col">
      <PageHeader
        title="Ridgeline lapsed buyers"
        meta={<span>Pogo agent · Ridgeline Foods workspace</span>}
        primary={{ label: 'New chat', icon: <Plus size={14} />, onClick: () => { app.setChat(() => []); toast('Started a new conversation', 'info') } }}
        actions={<button onClick={() => navigate(routes.detect)} className="hidden text-[13px] text-muted hover:text-ink md:block">Open Recall</button>}
      />
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-6 py-6">
        {app.chat.length === 0 && !agent.thinking ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender text-brand"><Sparkles size={18} /></span>
            <h2 className="mt-3 text-[18px] font-semibold">What do you want to know about your buyers?</h2>
            <p className="mt-1 text-[13px] text-muted">Answers come from verified purchases and completed studies in this workspace.</p>
          </div>
        ) : (
          <div className="flex-1"><MessageList messages={app.chat} thinking={agent.thinking} onFollowUp={agent.ask} /></div>
        )}
        <div className="sticky bottom-4 mt-6 space-y-2.5 bg-canvas pt-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} onClick={() => agent.ask(s)} disabled={agent.thinking} className="h-8 rounded-full border border-line bg-white px-3 text-[12px] hover:border-brand hover:text-brand disabled:opacity-50">{s}</button>
            ))}
          </div>
          <Composer onSubmit={agent.ask} disabled={agent.thinking} placeholder="Ask about Ridgeline buyers…" />
        </div>
      </div>
    </div>
  )
}
