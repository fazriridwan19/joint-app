import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { cn } from 'cn'
import { useAuthStore } from '../../features/auth/model/auth-store'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: BriefcaseBusiness, label: 'Lamaran' },
  { to: '/companies', icon: Building2, label: 'Perusahaan' },
  { to: '/contacts', icon: Users, label: 'Kontak' },
  { to: '/reminders', icon: Bell, label: 'Reminder' },
]

export function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  if (!user) return null

  const currentPage =
    navItems.find(({ to }) =>
      to === '/dashboard'
        ? location.pathname === to
        : location.pathname.startsWith(to),
    )?.label ?? 'Dashboard'

  return (
    <div className="joint-theme min-h-svh bg-[#f4f5f7] text-[#20212a]">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[#dcdcde] bg-[#fafafa] text-[#333238] transition-transform duration-200 md:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#dcdcde] px-6">
          <Link to="/dashboard" className="flex items-center gap-3" aria-label="Joint dashboard">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#fc6d26] text-white">
              <BriefcaseBusiness size={19} strokeWidth={2.5} />
            </span>
            <span className="text-[19px] font-semibold tracking-[-0.04em]">joint<span className="text-[#fc6d26]">.</span></span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737278]">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#fff1e8] text-[#333238]'
                      : 'text-[#626168] hover:bg-[#f0f0f0] hover:text-[#333238]',
                  )
                }
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#dcdcde] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-xs font-semibold text-[#d34b1f]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#333238]">{user.name}</p>
              <p className="truncate text-[10px] text-[#737278]">Personal workspace</p>
            </div>
            <ChevronDown size={15} className="text-[#737278]" />
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[#626168] transition-colors hover:bg-white hover:text-[#333238]"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      <div className="min-h-svh md:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e9eaed] bg-white/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-[#575965] hover:bg-[#f1f2f4] md:hidden"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9698a1]">Workspace</p>
              <h1 className="mt-0.5 text-[14px] font-semibold text-[#24252d]">{currentPage}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Buka reminder"
              onClick={() => navigate('/reminders')}
              className="relative rounded-xl border border-[#ebecf0] p-2.5 text-[#777985] transition-colors hover:bg-[#f5f6f7] hover:text-[#282932]"
            >
              <Bell size={17} />
            </button>
            <span className="hidden h-8 w-px bg-[#ebecf0] sm:block" />
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#ececf1] text-[11px] font-semibold text-[#454653]">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[150px] truncate text-[12px] font-medium text-[#464751]">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
