import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, ChevronDown, FolderKanban, FlaskConical, House, Library, MessageSquare, PanelLeftClose, PanelLeftOpen, Receipt, Users } from 'lucide-react'
import { useApp, routes } from '../../state/AppState'
import { brand } from '../../data/mockData'
import { cx } from '../../lib/util'
import { PogoMark } from '../shared/ui'

export const navItems = [
  { id: 'home', label: 'Home', icon: House, path: '/home' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: routes.chat },
  { id: 'audiences', label: 'Audiences', icon: Users, path: '/audiences' },
  { id: 'studies', label: 'Studies', icon: FlaskConical, path: '/studies' },
  { id: 'insights', label: 'Insights Library', icon: Library, path: '/insights' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
  { id: 'signals', label: 'Signals', icon: Activity, path: routes.detect },
  { id: 'purchase', label: 'Purchase Metrics', icon: Receipt, path: '/purchase-metrics' },
] as const

const signalsSub = [
  { label: 'Recall', path: routes.detect, badge: 'New' },
  { label: 'Signal feed', path: '/signals' },
]

function activeId(path: string) {
  if (path.startsWith('/signals')) return 'signals'
  return navItems.find((n) => path.startsWith(n.path))?.id ?? ''
}

export function Sidebar() {
  const { sidebarExpanded: expanded, setSidebarExpanded } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const current = activeId(pathname)
  const [signalsOpen, setSignalsOpen] = useState(true)

  return (
    <nav aria-label="Primary" className={cx('relative z-30 flex h-full shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200', expanded ? 'w-[224px]' : 'w-14')}>
      <Link to="/home" className={cx('flex h-14 items-center', expanded ? 'gap-2.5 px-3.5' : 'justify-center')} aria-label="Pogo home">
        <PogoMark size={28} />
        {expanded && <span className="text-[15px] font-semibold tracking-tight">Pogo</span>}
      </Link>

      <ul className={cx('flex flex-1 flex-col gap-1 pt-2', expanded ? 'px-2' : 'items-center')}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = current === item.id
          const isSignals = item.id === 'signals'
          return (
            <li key={item.id} className={cx('group relative', expanded && 'w-full')}>
              <button
                onClick={() => {
                  if (isSignals && expanded) setSignalsOpen((o) => (active ? !o : true))
                  navigate(item.path)
                }}
                aria-current={active ? 'page' : undefined}
                aria-label={expanded ? undefined : item.label}
                className={cx(
                  'flex items-center rounded-lg text-[#3d3d3d] transition-colors duration-150 hover:bg-[#F2F2F2] hover:text-ink',
                  expanded ? 'h-9 w-full gap-2.5 px-2.5 text-[13px]' : 'h-9 w-9 justify-center',
                  active && 'bg-[#EFEFEF] text-ink',
                )}
              >
                <Icon size={18} strokeWidth={1.75} />
                {expanded && <span className="flex-1 text-left">{item.label}</span>}
                {expanded && isSignals && <ChevronDown size={14} className={cx('text-faint transition-transform', !signalsOpen && '-rotate-90')} />}
              </button>
              {!expanded && (
                <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-[12px] text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {item.label}{isSignals && ' · Recall'}
                </span>
              )}
              {expanded && isSignals && signalsOpen && (
                <ul className="ml-[22px] mt-1 flex flex-col gap-0.5 border-l border-line pl-2.5">
                  {signalsSub.map((s) => {
                    const subActive = s.path === routes.detect ? pathname.startsWith(routes.detect) : pathname === s.path
                    return (
                      <li key={s.label}>
                        <Link to={s.path} className={cx('flex h-8 items-center justify-between rounded-md px-2 text-[13px] text-muted hover:bg-[#F2F2F2] hover:text-ink', subActive && 'bg-[#F2F2F2] font-medium text-ink')}>
                          {s.label}
                          {s.badge && <span className="rounded bg-lavender px-1.5 py-px text-[10px] font-semibold text-brand">{s.badge}</span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <div className={cx('flex flex-col gap-2 pb-3', expanded ? 'px-2' : 'items-center')}>
        <button
          onClick={() => setSidebarExpanded(!expanded)}
          aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={expanded}
          className={cx('flex h-9 items-center rounded-lg text-muted hover:bg-[#F2F2F2] hover:text-ink', expanded ? 'gap-2.5 px-2.5 text-[13px]' : 'w-9 justify-center')}
        >
          {expanded ? <PanelLeftClose size={18} strokeWidth={1.75} /> : <PanelLeftOpen size={18} strokeWidth={1.75} />}
          {expanded && 'Collapse'}
        </button>
        <div className={cx('flex items-center', expanded ? 'gap-2.5 rounded-lg border border-line px-2 py-2' : 'justify-center')} title={`${brand.user.name} · ${brand.user.org}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDEDED] text-[12px] font-semibold text-[#3d3d3d]">{brand.user.initials}</span>
          {expanded && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-medium">{brand.user.name}</div>
              <div className="truncate text-[12px] text-muted">{brand.user.org}</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
