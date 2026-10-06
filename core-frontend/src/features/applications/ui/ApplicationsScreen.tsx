import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { PageSpinner } from '../../../components/ui/spinner'
import { StatusBadge, PriorityBadge } from '../../../components/ui/badge'
import { useApplications, type ApplicationListParams } from '../api/applications-api'
import { ApplicationForm } from './ApplicationForm'
import type { ApplicationStatus } from '../../../types/api'
import { cn } from 'cn'

const STATUS_FILTERS: { label: string; value: ApplicationStatus | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Wishlist', value: 'WISHLIST' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Assessment', value: 'ASSESSMENT' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Offer', value: 'OFFER' },
  { label: 'Hired', value: 'HIRED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Ghosted', value: 'GHOSTED' },
]

export function ApplicationsScreen() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [params, setParams] = useState<ApplicationListParams>({
    page: 1,
    page_size: 20,
    q: '',
    status: '',
    archived: false,
  })
  const [search, setSearch] = useState('')

  const { data, isLoading } = useApplications(params)
  const applications = data?.data ?? []
  const pagination = data?.meta?.pagination

  const applySearch = () =>
    setParams((p) => ({ ...p, q: search, page: 1 }))

  const setStatus = (status: ApplicationStatus | '') =>
    setParams((p) => ({ ...p, status, page: 1 }))

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null
    const fmt = (n: number) =>
      new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
    if (min && max) return `Rp ${fmt(min)} – ${fmt(max)}`
    if (min) return `Rp ${fmt(min)}+`
    return `s/d Rp ${fmt(max!)}`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#17211b]">Lamaran</h1>
          <p className="mt-0.5 text-sm text-[#68736a]">
            Kelola seluruh proses lamaran pekerjaan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
        >
          <Plus size={15} /> Tambah Lamaran
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9aaa9e]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Cari perusahaan atau posisi..."
              className="w-full rounded-md border border-[#d9dfd5] bg-white py-2 pr-3 pl-9 text-sm text-[#17211b] outline-none placeholder:text-[#9aaa9e] focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
            />
          </div>
          <Button
            variant="outline"
            onClick={applySearch}
          >
            Cari
          </Button>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                params.status === value
                  ? 'border-[#256b4d] bg-[#256b4d] text-white'
                  : 'border-[#d9dfd5] bg-white text-[#4a5c4e] hover:border-[#256b4d] hover:text-[#256b4d]',
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setParams((p) => ({ ...p, archived: !p.archived, page: 1 }))}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              params.archived
                ? 'border-[#68736a] bg-[#68736a] text-white'
                : 'border-[#d9dfd5] bg-white text-[#4a5c4e] hover:border-[#68736a]',
            )}
          >
            Arsip
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Belum ada lamaran"
          description="Mulai tambahkan lamaran pertamamu untuk melacak progress job hunting."
          action={
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
            >
              <Plus size={15} /> Tambah Lamaran
            </Button>
          }
        />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-[#d9dfd5] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d9dfd5] bg-[#f8faf6] text-left text-[11px] font-semibold uppercase tracking-wider text-[#68736a]">
                  <th className="px-4 py-3">Perusahaan & Posisi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 md:table-cell">Prioritas</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Tanggal</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Gaji</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9dfd5]">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-[#f8faf6]',
                      app.archived && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#17211b]">{app.companyName}</div>
                      <div className="text-[#68736a]">{app.position}</div>
                      {app.workArrangement && (
                        <div className="mt-0.5 text-[11px] text-[#9aaa9e]">
                          {app.workArrangement === 'REMOTE'
                            ? 'Remote'
                            : app.workArrangement === 'HYBRID'
                            ? 'Hybrid'
                            : 'Onsite'}
                          {app.location ? ` · ${app.location}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <PriorityBadge priority={app.priority} />
                    </td>
                    <td className="hidden px-4 py-3 text-[#68736a] lg:table-cell">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className="hidden px-4 py-3 text-[#68736a] lg:table-cell">
                      {formatSalary(app.salaryRangeMin, app.salaryRangeMax) ?? (
                        <span className="text-[#b0bdb3]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#9aaa9e]">
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#68736a]">
              <span>
                {pagination.totalItems} lamaran · halaman {pagination.page} dari{' '}
                {pagination.totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevious}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                >
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create form modal */}
      <ApplicationForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
