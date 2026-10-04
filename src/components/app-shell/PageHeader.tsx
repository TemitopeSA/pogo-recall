import { useState, type ReactNode } from 'react'
import { CircleHelp, Download, EllipsisVertical, Info, Link2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button, Menu } from '../shared/ui'
import { Modal } from '../shared/Modal'
import { useToast } from '../shared/Toast'
import { useTour } from '../tour/TourProvider'
import { copyText } from '../../lib/util'
import { WorkflowStepper, type Stage } from './WorkflowStepper'

interface Props {
  title: ReactNode
  meta?: ReactNode
  chips?: ReactNode
  primary?: { label: ReactNode; onClick: () => void; icon?: ReactNode; disabled?: boolean }
  actions?: ReactNode
  onExport?: () => void
  stage?: Stage
  tabs?: ReactNode
  tour?: string
}

export function PageHeader({ title, meta, chips, primary, actions, onExport, stage, tabs, tour }: Props) {
  const toast = useToast()
  const t = useTour()
  const { pathname } = useLocation()
  const [about, setAbout] = useState(false)

  const copyLink = async () => {
    const ok = await copyText(window.location.origin + pathname)
    toast(ok ? 'Link copied to clipboard' : 'Could not access the clipboard', ok ? 'success' : 'info')
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-8 pb-4 pt-5" data-tour={tour}>
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold leading-tight tracking-tight">{title}</h1>
          {(meta || chips) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted">
              {meta}
              {chips}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Menu
            trigger={({ toggle, open }) => (
              <Button variant="ghost" className="w-9 px-0" onClick={toggle} aria-label="More actions" aria-expanded={open}>
                <EllipsisVertical size={18} className="text-ink" />
              </Button>
            )}
            items={[
              { label: 'Help & guided tour', icon: <CircleHelp size={14} />, onSelect: () => t.setOverviewOpen(true) },
              { label: 'Export', icon: <Download size={14} />, onSelect: () => (onExport ? onExport() : toast('Export ready: nothing tabular on this page', 'info')) },
              { label: 'About this concept', icon: <Info size={14} />, onSelect: () => setAbout(true) },
            ]}
          />
          <Button onClick={copyLink}><Link2 size={14} /> Copy Link</Button>
          {primary && (
            <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled}>
              {primary.icon}
              {primary.label}
            </Button>
          )}
        </div>
      </div>
      {stage && (
        <div className="border-t border-line px-6 py-2">
          <WorkflowStepper current={stage} />
        </div>
      )}
      {tabs}
      <Modal open={about} onClose={() => setAbout(false)} labelledBy="about-title" width="max-w-[480px]">
        <div className="p-6">
          <h2 id="about-title" className="text-[16px] font-semibold">About this concept</h2>
          <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted">
            <p><span className="font-medium text-ink">Pogo Recall</span> extends Pogo’s verified-buyer research into a closed-loop win-back workflow: detect lapsed and switched buyers, interview them, send targeted offers in the Pogo app, and measure receipt-verified returns against a holdout.</p>
            <p>This is a concept prototype. Ridgeline Foods, its competitors, respondents, receipts and campaign results are fictional. No data leaves your browser and no offers are sent.</p>
            <p>Observed figures (returns, return rates, payouts) are distinguished from modeled figures (forecasts, annualized revenue, ROI) throughout.</p>
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="primary" onClick={() => setAbout(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </header>
  )
}
