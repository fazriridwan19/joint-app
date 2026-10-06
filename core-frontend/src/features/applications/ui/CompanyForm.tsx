import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/modal'
import { Input, Textarea } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { useCreateCompany, useUpdateCompany } from '../api/companies-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { CompanyRequest, CompanyResponse } from '../../../types/api'

type Props = {
  open: boolean
  onClose: () => void
  company?: CompanyResponse | null
  onCreated?: (company: CompanyResponse) => void
}

const emptyForm: CompanyRequest = { name: '' }

export function CompanyForm({ open, onClose, company, onCreated }: Props) {
  const isEdit = Boolean(company)
  const [form, setForm] = useState<CompanyRequest>(emptyForm)
  const [error, setError] = useState('')

  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany(company?.id ?? '')
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        website: company.website ?? undefined,
        careerUrl: company.careerUrl ?? undefined,
        industry: company.industry ?? undefined,
        location: company.location ?? undefined,
        description: company.description ?? undefined,
        notes: company.notes ?? undefined,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [company, open])

  const set = <K extends keyof CompanyRequest>(k: K, v: CompanyRequest[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(form)
        onClose()
      } else {
        const created = await createMutation.mutateAsync(form)
        onCreated?.(created)
        onClose()
      }
    } catch (err) {
      setError(getApiMessage(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
      size="md"
      footer={
        <>
          <Button className="text-black" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            form="company-form"
            type="submit"
            disabled={isPending}
            className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
          >
            {isPending ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Tambah Perusahaan'}
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
        <Input
          label="Nama Perusahaan *"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="PT Teknologi Maju"
        />
        <Input
          label="Industry"
          value={form.industry ?? ''}
          onChange={(e) => set('industry', e.target.value || undefined)}
          placeholder="Technology, Finance..."
        />
        <Input
          label="Lokasi"
          value={form.location ?? ''}
          onChange={(e) => set('location', e.target.value || undefined)}
          placeholder="Jakarta, Indonesia"
        />
        <Input
          label="Website"
          type="url"
          value={form.website ?? ''}
          onChange={(e) => set('website', e.target.value || undefined)}
          placeholder="https://..."
        />
        <Input
          label="Career Page URL"
          type="url"
          value={form.careerUrl ?? ''}
          onChange={(e) => set('careerUrl', e.target.value || undefined)}
          placeholder="https://.../careers"
        />
        <Textarea
          label="Catatan"
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value || undefined)}
          placeholder="Catatan tentang perusahaan..."
        />
        {error && <ApiErrorAlert error={error} />}
      </form>
    </Modal>
  )
}
