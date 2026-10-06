import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDot,
  CircleX,
  Ghost,
  Handshake,
  Hourglass,
  TrendingUp,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { PageSpinner, Spinner } from '../../../components/ui/spinner'
import { StatusBadge } from '../../../components/ui/badge'
import { useDashboardSummary, useDashboardFunnel, useDashboardUpcoming } from '../api/dashboard-api'
import { useAuthStore } from '../../auth/model/auth-store'

export function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: funnel, isLoading: funnelLoading } = useDashboardFunnel()
  const { data: upcoming, isLoading: upcomingLoading } = useDashboardUpcoming()

  if (!user) return null

  const statCards = [
    { label: 'Total Lamaran', value: summary?.totalApplications ?? 0, icon: BriefcaseBusiness, color: 'text-[#256b4d] bg-[#e7eee3]' },
    { label: 'Aktif',         value: summary?.activeApplications  ?? 0, icon: CircleDot,        color: 'text-blue-600 bg-blue-50' },
    { label: 'Interview',     value: summary?.interviews          ?? 0, icon: Hourglass,         color: 'text-amber-600 bg-amber-50' },
    { label: 'Assessment',    value: summary?.assessments         ?? 0, icon: TrendingUp,        color: 'text-purple-600 bg-purple-50' },
    { label: 'Offer',         value: summary?.offers              ?? 0, icon: Handshake,         color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Hired',         value: summary?.hired               ?? 0, icon: CheckCircle2,      color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Rejected',      value: summary?.rejected            ?? 0, icon: CircleX,           color: 'text-red-500 bg-red-50' },
    { label: 'Ghosted',       value: summary?.ghosted             ?? 0, icon: Ghost,             color: 'text-[#68736a] bg-[#f0f4ed]' },
  ]

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#17211b]">
          Selamat datang, {user.name.split(' ')[0]}.
        </h1>
        <p className="mt-1 text-sm text-[#68736a]">Berikut ringkasan aktivitas job hunting kamu.</p>
      </div>

      {/* Stats grid */}
      {summaryLoading ? (
        <PageSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-[#d9dfd5] bg-white p-4">
              <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-semibold text-[#17211b]">{value}</div>
              <div className="mt-0.5 text-[12px] text-[#68736a]">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

        {/* Upcoming active applications */}
        <div className="rounded-xl border border-[#d9dfd5] bg-white">
          <div className="flex items-center justify-between border-b border-[#d9dfd5] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#17211b]">Lamaran Aktif</h2>
              <p className="mt-0.5 text-[12px] text-[#9aaa9e]">Diurutkan berdasarkan aktivitas terbaru</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/applications')}
              className="text-[#256b4d]"
            >
              Lihat semua <ArrowRight size={13} />
            </Button>
          </div>

          {upcomingLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !upcoming?.items.length ? (
            <div className="px-5 py-10 text-center">
              <p className="mb-3 text-sm text-[#68736a]">Belum ada lamaran aktif.</p>
              <Button
                onClick={() => navigate('/applications')}
                className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
                size="sm"
              >
                Mulai tambah lamaran
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#d9dfd5]">
              {upcoming.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/applications/${item.id}`)}
                  className="flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors hover:bg-[#f8faf6]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-[#17211b]">{item.companyName}</div>
                    <div className="truncate text-sm text-[#68736a]">{item.position}</div>
                    <div className="mt-0.5 text-[11px] text-[#9aaa9e]">
                      Dilamar {formatDate(item.appliedDate)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={item.status} />
                    <ArrowRight size={14} className="text-[#d9dfd5]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recruitment funnel */}
        <div className="rounded-xl border border-[#d9dfd5] bg-white">
          <div className="border-b border-[#d9dfd5] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#17211b]">Recruitment Funnel</h2>
            <p className="mt-0.5 text-[12px] text-[#9aaa9e]">Konversi dari total lamaran</p>
          </div>

          {funnelLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !funnel ? (
            <div className="px-5 py-10 text-center text-sm text-[#9aaa9e]">
              Belum ada data.
            </div>
          ) : (
            <div className="px-5 py-4">
              {/* Total applied */}
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm text-[#68736a]">Total Applied</span>
                <span className="text-2xl font-semibold text-[#17211b]">{funnel.totalApplied}</span>
              </div>

              {/* Funnel stages */}
              <div className="space-y-3">
                {funnel.stages.map((stage, idx) => {
                  // Bar width proportional to rate (max 100%)
                  const barWidth = Math.min(stage.rate, 100)
                  // Progressively lighter green for each stage
                  const barColors = [
                    'bg-blue-400',
                    'bg-purple-400',
                    'bg-amber-400',
                    'bg-emerald-500',
                    'bg-emerald-600',
                  ]
                  const barColor = barColors[idx] ?? 'bg-[#256b4d]'

                  return (
                    <div key={stage.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[#4a5c4e]">{stage.stage}</span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-[#17211b]">{stage.count}</span>
                          <span className="text-[11px] text-[#9aaa9e]">{stage.rate}%</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f4ed]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Hire rate summary */}
              {funnel.totalApplied > 0 && (() => {
                const hireStage = funnel.stages.find(s => s.stage === 'Hired')
                if (!hireStage) return null
                return (
                  <div className="mt-5 rounded-lg bg-[#f0f9f4] px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#256b4d]">
                      Hire Rate
                    </div>
                    <div className="mt-0.5 text-2xl font-semibold text-[#256b4d]">
                      {hireStage.rate}%
                    </div>
                    <div className="text-[12px] text-[#68736a]">
                      {hireStage.count} dari {funnel.totalApplied} lamaran berhasil
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
