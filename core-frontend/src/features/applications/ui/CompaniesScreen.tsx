import { useState } from 'react'
import { Building2, Plus, Search, Pencil, Globe, MapPin, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { PageSpinner } from '../../../components/ui/spinner'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { useCompanies, useDeleteCompany } from '../api/companies-api'
import { CompanyForm } from './CompanyForm'
import type { CompanyResponse } from '../../../types/api'

export function CompaniesScreen() {
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editCompany, setEditCompany] = useState<CompanyResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CompanyResponse | null>(null)

  const { data: companies = [], isLoading } = useCompanies(searchQuery)
  const deleteMutation = useDeleteCompany()

  const applySearch = () => setSearchQuery(search)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleEditClose = () => {
    setEditCompany(null)
    setShowForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#17211b]">Perusahaan</h1>
          <p className="mt-0.5 text-sm text-[#68736a]">
            Daftar perusahaan yang pernah kamu lamar
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
        >
          <Plus size={15} /> Tambah Perusahaan
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9aaa9e]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="Cari perusahaan..."
            className="w-full rounded-md border border-[#d9dfd5] bg-white py-2 pr-3 pl-9 text-sm outline-none placeholder:text-[#9aaa9e] focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
          />
        </div>
        <Button variant="outline" onClick={applySearch}>
          Cari
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSpinner />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada perusahaan"
          description="Tambahkan perusahaan untuk mulai membuat lamaran."
          action={
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
            >
              <Plus size={15} /> Tambah Perusahaan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="group relative rounded-xl border border-[#d9dfd5] bg-white p-4 transition-shadow hover:shadow-sm"
            >
              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setEditCompany(company)}
                  aria-label="Edit"
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setDeleteTarget(company)}
                  className="text-[#ba442d] hover:bg-red-50"
                  aria-label="Hapus"
                >
                  <Trash2 size={13} />
                </Button>
              </div>

              {/* Company info */}
              <div className="mb-2 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e7eee3] text-[#256b4d]">
                  <Building2 size={18} />
                </div>
                <div>
                  <div className="font-semibold leading-tight text-[#17211b]">{company.name}</div>
                  {company.industry && (
                    <div className="text-[12px] text-[#9aaa9e]">{company.industry}</div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-[#68736a]">
                {company.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0 text-[#9aaa9e]" />
                    {company.location}
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="shrink-0 text-[#9aaa9e]" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="truncate text-[#256b4d] hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {company.notes && (
                <p className="mt-2 line-clamp-2 text-[12px] text-[#9aaa9e]">{company.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CompanyForm
        open={showForm || Boolean(editCompany)}
        onClose={handleEditClose}
        company={editCompany}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Hapus Perusahaan"
        description={`Yakin ingin menghapus "${deleteTarget?.name}"? Data lamaran terkait tidak akan ikut terhapus.`}
        confirmLabel="Hapus"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  )
}
