import { useEffect, useState } from 'react'
import { Bell, CircleCheck, Clock, Search } from 'lucide-react'
import { offerHeadline, type CampaignConfig } from '../../data/campaignModel'
import { useToast } from '../shared/Toast'
import { cx } from '../../lib/util'

export function PhonePreview({ c }: { c: CampaignConfig }) {
  const toast = useToast()
  const [activated, setActivated] = useState(false)
  useEffect(() => setActivated(false), [c.offerType, c.cashbackAmount, c.points, c.freeProduct])
  const days = Number(c.durationDays) || 14
  const hasReward = c.offerType !== 'message'
  const pill = c.offerType === 'points' ? `+${(Number(c.points) || 0).toLocaleString()} pts` : 'Earn 150 pts'
  const cta = hasReward ? 'Activate' : 'Find it near me'

  const onActivate = () => {
    setActivated(true)
    toast(hasReward ? 'Offer activated in preview (no real offer sent)' : 'Preview: store finder opened (mock)')
  }

  return (
    <div data-tour="phone-preview" className="mx-auto w-[264px]">
      <div className="rounded-[40px] border border-[#D4D4D4] bg-[#1A1A1A] p-[9px] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <div className="relative overflow-hidden rounded-[32px] bg-[#F7F7F8]">
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold">
            <span className="num">9:41</span>
            <span className="absolute left-1/2 top-2 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-[#1A1A1A]" />
            <span className="flex gap-1"><span className="h-2 w-3 rounded-sm bg-black" /><span className="h-2 w-4 rounded-sm border border-black" /></span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="font-logo text-[20px] font-bold">pogo</span>
            <span className="flex gap-3 text-[#3d3d3d]"><Search size={16} /><Bell size={16} /></span>
          </div>
          <div className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Offers for you</div>
          <div className="px-3 pb-3 pt-1.5">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="relative flex h-[112px] items-center justify-center bg-[#2E3B2F]">
                <div className="flex h-[52px] w-[150px] -rotate-6 items-center justify-center rounded-md bg-[#C8873A] shadow-md">
                  <span className="text-[13px] font-extrabold tracking-[0.12em] text-[#2E3B2F]">RIDGELINE</span>
                </div>
                {hasReward && <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand">{pill}</span>}
              </div>
              <div className="p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-[#2E3B2F] text-[8px] font-bold text-[#C8873A]">R</span>
                  Ridgeline Protein Bar
                </div>
                <div className="mt-1.5 text-[17px] font-semibold leading-tight">{offerHeadline(c)}</div>
                <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-[#555]">{c.message || 'Your message will appear here.'}</p>
                <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted">
                  <Clock size={11} /> {hasReward ? `Expires in ${days} days` : `Available for ${days} days`}
                </div>
                <button
                  onClick={onActivate}
                  disabled={activated}
                  className={cx('mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors', activated ? 'bg-[#EAF6EC] text-[#2F7A3B]' : 'bg-brand text-white hover:bg-brand-hover')}
                >
                  {activated ? <><CircleCheck size={14} /> {hasReward ? 'Activated · scan your receipt' : 'Opened'}</> : cta}
                </button>
              </div>
            </div>
            <div className="mt-2.5 h-14 rounded-2xl bg-white/70" />
          </div>
          <div className="mx-auto mb-2 h-1 w-24 rounded-full bg-black/80" />
        </div>
      </div>
    </div>
  )
}
