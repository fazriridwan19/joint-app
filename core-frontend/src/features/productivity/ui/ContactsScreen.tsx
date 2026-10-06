import { useState } from 'react'
import { Mail, Pencil, Phone, Plus, Search, Trash2, User } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { PageSpinner } from '../../../components/ui/spinner'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { useContacts, useDeleteContact } from '../api/contacts-api'
import { ContactForm } from './ContactForm'
import type { ContactResponse } from '../../../types/api'

export function ContactsScreen() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editContact, setEditContact] = useState<ContactResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactResponse | null>(null)

  const { data: contacts = [], isLoading } = useContacts(query)
  const deleteMutation = useDeleteContact()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#17211b]">Kontak</h1>
          <p className="mt-0.5 text-sm text-[#68736a]">Recruiter, interviewer, dan kontak lainnya</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">
          <Plus size={15} /> Tambah Kontak
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9aaa9e]" />
          <input type="search" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
            placeholder="Cari kontak..." className="w-full rounded-md border border-[#d9dfd5] bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]" />
        </div>
        <Button variant="outline" onClick={() => setQuery(search)}>Cari</Button>
      </div>

      {isLoading ? <PageSpinner /> : contacts.length === 0 ? (
        <EmptyState icon={User} title="Belum ada kontak"
          description="Simpan recruiter atau interviewer untuk mudah dihubungi."
          action={<Button onClick={() => setShowForm(true)} className="bg-[#256b4d] text-white hover:bg-[#1b563d]"><Plus size={15} /> Tambah Kontak</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <div key={c.id} className="group relative rounded-xl border border-[#d9dfd5] bg-white p-4">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-xs" onClick={() => setEditContact(c)}><Pencil size={13} /></Button>
                <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(c)} className="text-[#ba442d] hover:bg-red-50"><Trash2 size={13} /></Button>
              </div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e7eee3] text-[#256b4d] font-semibold text-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-[#17211b] leading-tight">{c.name}</div>
                  {c.role && <div className="text-[12px] text-[#9aaa9e]">{c.role}</div>}
                </div>
              </div>
              <div className="space-y-1 text-sm text-[#68736a]">
                {c.email && <div className="flex items-center gap-1.5"><Mail size={12} className="shrink-0 text-[#9aaa9e]" />{c.email}</div>}
                {c.phone && <div className="flex items-center gap-1.5"><Phone size={12} className="shrink-0 text-[#9aaa9e]" />{c.phone}</div>}
                {c.linkedinUrl && (
                  <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#256b4d] hover:underline" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[#9aaa9e]">in</span>LinkedIn
                  </a>
                )}
              </div>
              {c.notes && <p className="mt-2 line-clamp-2 text-[12px] text-[#9aaa9e]">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <ContactForm open={showForm || Boolean(editContact)} onClose={() => { setShowForm(false); setEditContact(null) }} contact={editContact} />
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)) }}
        title="Hapus Kontak" description={`Yakin hapus "${deleteTarget?.name}"?`}
        confirmLabel="Hapus" isLoading={deleteMutation.isPending} variant="danger" />
    </div>
  )
}
