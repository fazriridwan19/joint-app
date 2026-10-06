import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react'
import { cn } from 'cn'
import { useAuthStore } from '../../features/auth/model/auth-store'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: BriefcaseBusiness, label: 'Lamaran' },
  { to: '/companies',    icon: Building2, label: 'Perusahaan' },
  { to: '/contacts',     icon: Users, label: 'Kontak' },
  { to: '/reminders',    icon: Bell, label: 'Reminder' },
]

export function AppShell() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  if (!user) return null

  return (
    <div className="flex min-h-svh bg-[#f5f6f0]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[220px] flex-col border-r border-[#d9dfd5] bg-white/80 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-[#d9dfd5] px-5 font-bold tracking-[0.5px] text-[#256b4d]">
          <BriefcaseBusiness size={18} />
          <span>Joint</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-3 text-sm">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 font-medium text-[#4a5c4e] transition-colors',
                  isActive
                    ? 'bg-[#e7eee3] text-[#256b4d]'
                    : 'hover:bg-[#f0f4ed] hover:text-[#256b4d]',
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-[#d9dfd5] p-3">
          <div className="mb-1 truncate px-3 py-1 text-xs text-[#68736a]">{user.name}</div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-[#4a5c4e] transition-colors hover:bg-[#f0f4ed] hover:text-[#ba442d]"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col pl-[220px]">
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
