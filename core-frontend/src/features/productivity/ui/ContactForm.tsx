import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/modal'
import { Input, Textarea } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { useCreateContact, useUpdateContact } from '../api/contacts-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { ContactRequest, ContactResponse } from '../../../types/api'

type Props = {
  open: boolean
  onClose: () => void
  contact?: ContactResponse | null
}

const empty: ContactRequest = { name: '' }

export function ContactForm({ open, onClose, contact }: Props) {
  const isEdit = Boolean(contact)
  const [form, setForm] = useState<ContactRequest>(empty)
  const [error, setError] = useState('')

  const createMutation = useCreateContact()
  const updateMutation = useUpdateContact(contact?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        role: contact.role ?? undefined,
        email: contact.email ?? undefined,
        linkedinUrl: contact.linkedinUrl ?? undefined,
        phone: contact.phone ?? undefined,
        notes: contact.notes ?? undefined,
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [contact, open])

  const set = <K extends keyof ContactRequest>(k: K, v: ContactRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      isEdit ? await updateMutation.mutateAsync(form) : await createMutation.mutateAsync(form)
      onClose()
    } catch (err) { setError(getApiMessage(err)) }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Kontak' : 'Tambah Kontak'} size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Batal</Button>
          <Button form="contact-form" type="submit" disabled={isPending}
            className="bg-[#256b4d] text-white hover:bg-[#1b563d]">
            {isPending ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah'}
          </Button>
        </>
      }>
      <form id="contact-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
        <Input label="Nama *" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" />
        <Input label="Role" value={form.role ?? ''} onChange={(e) => set('role', e.target.value || undefined)} placeholder="HR Manager" />
        <Input label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value || undefined)} />
        <Input label="LinkedIn" type="url" value={form.linkedinUrl ?? ''} onChange={(e) => set('linkedinUrl', e.target.value || undefined)} placeholder="https://linkedin.com/in/..." />
        <Input label="Telepon" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value || undefined)} />
        <Textarea label="Catatan" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value || undefined)} rows={2} />
        {error && <ApiErrorAlert error={error} />}
      </form>
    </Modal>
  )
}
