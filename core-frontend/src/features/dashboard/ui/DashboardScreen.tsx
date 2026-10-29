import { useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  Handshake,
  Plus,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import { Spinner } from '../../../components/ui/spinner'
import { StatusBadge } from '../../../components/ui/badge'
import { useDashboardSummary, useDashboardFunnel, useDashboardUpcoming } from '../api/dashboard-api'
import { useAuthStore } from '../../auth/model/auth-store'

const metricCards = [
  { label: 'Total lamaran', key: 'totalApplications', icon: BriefcaseBusiness, color: 'bg-[#2c2d27] text-[#c3b994]' },
  { label: 'Masih aktif', key: 'activeApplications', icon: CircleDot, color: 'bg-[#303329] text-[#b7c497]' },
  { label: 'Interview', key: 'interviews', icon: Clock3, color: 'bg-[#383126] text-[#dfbd83]' },
  { label: 'Penawaran', key: 'offers', icon: Handshake, color: 'bg-[#3a2a27] text-[#d99788]' },
] as const

const funnelColors = [
  'bg-[#8da995]',
  'bg-[#9caec0]',
  'bg-[#c6a978]',
  'bg-[#c58d80]',
  'bg-[#7e997d]',
]

export function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useDashboardSummary()
  const {
    data: funnel,
    isLoading: funnelLoading,
    error: funnelError,
  } = useDashboardFunnel()
  const {
    data: upcoming,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useDashboardUpcoming()

  if (!user) return null

  const firstName = user.name.trim().split(/\s+/)[0]
  const today = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const apiError = summaryError ?? funnelError ?? upcomingError

  return (
    <div className="space-y-7">
      <ApiErrorAlert error={apiError} />

      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.17em] text-[#92949e]">{today}</p>
          <h2 className="text-[27px] font-semibold tracking-[-0.045em] text-[#20212a]">
            Selamat datang, {firstName}<span className="text-[#aaaab3]">.</span>
          </h2>
          <p className="mt-1.5 text-[13px] text-[#858792]">
            Pantau progres dan tetap selangkah lebih dekat dengan pekerjaan berikutnya.
          </p>
        </div>
        <Button
          onClick={() => navigate('/applications')}
          className="h-10 self-start rounded-xl bg-[#17181e] px-4 text-[12px] font-medium text-white hover:bg-[#30313a] sm:self-auto"
        >
          <Plus size={15} /> Tambah lamaran
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metricCards.map(({ label, key, icon: Icon, color }, index) => {
          const value = summary?.[key]
          return (
            <article key={key} className="rounded-2xl border border-[#e9e9ed] bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <span className={`flex size-9 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <span className="rounded-lg bg-[#f7f7f8] px-2 py-1 text-[9px] font-medium text-[#92949e]">
                  {index === 0 ? 'Semua waktu' : 'Saat ini'}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-medium text-[#858792]">{label}</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-[27px] font-semibold leading-none tracking-[-0.04em] text-[#20212a]">
                  {summaryLoading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#eeeef1]" /> : value ?? '—'}
                </p>
                <span className="mb-0.5 flex items-center gap-1 text-[10px] text-[#92949e]">
                  {index === 0 ? <Building2 size={12} /> : <ArrowDownRight size={12} />}
                  {index === 0 ? 'Tercatat' : 'Pipeline'}
                </span>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <article className="overflow-hidden rounded-2xl border border-[#e2e5df] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e2e5df] px-5 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#858b81]">Analytics</p>
              <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-[#29312b]">Recruitment funnel</h3>
              <p className="mt-1 text-[11px] text-[#72796f]">Perjalanan lamaran dari tahap awal hingga hasil</p>
            </div>
            <div className="rounded-xl border border-[#e2e5df] bg-[#f4f5f1] px-3.5 py-2">
              <p className="text-[9px] uppercase tracking-[0.12em] text-[#858b81]">Total lamaran</p>
              <p className="mt-0.5 text-[19px] font-semibold tracking-tight text-[#29312b]">{funnel?.totalApplied ?? (funnelLoading ? '…' : '—')}</p>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            {funnelLoading ? (
              <div className="flex min-h-[170px] items-center justify-center"><Spinner /></div>
            ) : !funnel?.stages.length ? (
              <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#edf0ea] text-[#858b81]">
                  <BriefcaseBusiness size={18} />
                </span>
                <p className="text-[12px] font-medium text-[#62685f]">Belum ada data funnel</p>
                <p className="mt-1 text-[10px] text-[#858b81]">Data progres akan muncul setelah ada lamaran.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {funnel.stages.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
                      <span className="font-medium text-[#62685f]">{stage.stage}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-[#858b81]">{stage.rate}%</span>
                        <span className="w-7 text-right font-semibold text-[#29312b]">{stage.count}</span>
                      </span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-full bg-[#edf0ea]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${funnelColors[index % funnelColors.length]}`}
                        style={{ width: `${Math.min(Math.max(stage.rate, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-[#e2e5df] px-5 py-3.5 sm:px-7">
            <span className="text-[10px] text-[#858b81]">Ringkasan konversi proses rekrutmen</span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#a8b58a]">
              <CheckCircle2 size={13} /> Data terbaru
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-[#e9e9ed] bg-white">
          <div className="flex items-center justify-between border-b border-[#f0f0f2] px-5 py-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#999ba5]">Overview</p>
              <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#252630]">Ringkasan status</h3>
            </div>
            <BriefcaseBusiness size={17} className="text-[#a1a2ab]" />
          </div>
          <div className="space-y-4 px-5 py-5">
            {[
              { label: 'Aktif', value: summary?.activeApplications, color: 'bg-[#a8b58a]' },
              { label: 'Assessment', value: summary?.assessments, color: 'bg-[#9c94fa]' },
              { label: 'Offer', value: summary?.offers, color: 'bg-[#f5b667]' },
              { label: 'Hired', value: summary?.hired, color: 'bg-[#73cdb5]' },
              { label: 'Rejected', value: summary?.rejected, color: 'bg-[#f08da3]' },
              { label: 'Ghosted', value: summary?.ghosted, color: 'bg-[#c6c7ce]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`size-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-[11px] text-[#737580]">{item.label}</span>
                <span className="text-[12px] font-semibold text-[#30313a]">
                  {summaryLoading ? '—' : item.value ?? '—'}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="flex w-full items-center justify-between border-t border-[#f0f0f2] px-5 py-3.5 text-[10px] font-medium text-[#777985] transition-colors hover:bg-[#fafafa] hover:text-[#282932]"
          >
            Lihat semua lamaran <ArrowRight size={14} />
          </button>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e9e9ed] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f2] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#999ba5]">Your pipeline</p>
            <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#252630]">Lamaran terbaru</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-[#5f606b] transition-colors hover:bg-[#f5f5f7]"
          >
            Lihat semua <ArrowRight size={13} />
          </button>
        </div>

        {upcomingLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : !upcoming?.items.length ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#f2f2f5] text-[#8d8f99]">
              <BriefcaseBusiness size={19} />
            </span>
            <p className="text-[12px] font-medium text-[#454650]">Belum ada lamaran aktif</p>
            <p className="mt-1 text-[11px] text-[#999ba5]">Mulai catat lamaran untuk melihat progresnya di sini.</p>
            <Button
              onClick={() => navigate('/applications')}
              className="mt-4 h-9 rounded-xl bg-[#17181e] px-3.5 text-[11px] text-white hover:bg-[#30313a]"
            >
              <Plus size={14} /> Tambah lamaran
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f3]">
            {upcoming.items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => navigate(`/applications/${item.id}`)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#fafafa] sm:px-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f0f4] text-[11px] font-semibold text-[#646571]">
                  {item.companyName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-[#30313a]">{item.companyName}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#92949e]">{item.position}</span>
                </span>
                <span className="hidden text-[10px] text-[#999ba5] sm:block">{formatDate(item.appliedDate)}</span>
                <StatusBadge status={item.status} />
                <ArrowRight size={14} className="shrink-0 text-[#b6b7bf]" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
