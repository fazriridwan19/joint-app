import { useState } from 'react'
import { CheckCircle2, MessageSquare, Pencil, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { Spinner } from '../../../components/ui/spinner'
import { ShowMoreButton } from '../../../components/ui/show-more-button'
import { useCollapse } from '../../../hooks/useCollapse'
import { useFollowUps, useCreateFollowUp, useUpdateFollowUp, useCompleteFollowUp } from '../api/followups-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { FollowUpChannel, FollowUpRequest, FollowUpResponse } from '../../../types/api'
import { cn } from 'cn'

const CHANNEL_LABELS: Record<FollowUpChannel, string> = {
  EMAIL: 'Email', LINKEDIN: 'LinkedIn', WHATSAPP: 'WhatsApp', PHONE: 'Telepon', OTHER: 'Lainnya',
}
const STATUS_STYLE: Record<string, string> = {
  PLANNED: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-[#f0f0ec] text-[#9aaa9e]',
}

type Props = { applicationId: string }

export function FollowUpSection({ applicationId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<FollowUpResponse | null>(null)
  const [completeTarget, setCompleteTarget] = useState<FollowUpResponse | null>(null)
  const [form, setForm] = useState<FollowUpRequest>({ followUpDate: '', channel: 'EMAIL' })
  const [completeForm, setCompleteForm] = useState({ result: '', nextFollowUpDate: '' })
  const [error, setError] = useState('')

  const { data: followUps = [], isLoading } = useFollowUps(applicationId)
  const createMutation = useCreateFollowUp(applicationId)
  const updateMutation = useUpdateFollowUp(applicationId)
  const completeMutation = useCompleteFollowUp(applicationId)
  const collapse = useCollapse(followUps.length)

  const openCreate = () => {
    setForm({ followUpDate: new Date().toISOString().split('T')[0], channel: 'EMAIL' })
    setEditTarget(null); setShowForm(true)
  }
  const openEdit = (f: FollowUpResponse) => {
    setForm({ followUpDate: f.followUpDate, channel: f.channel, message: f.message ?? '' })
    setEditTarget(f); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditTarget(null); setError('') }
  const set = <K extends keyof FollowUpRequest>(k: K, v: FollowUpRequest[K]) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      editTarget
        ? await updateMutation.mutateAsync({ id: editTarget.id, body: form })
        : await createMutation.mutateAsync(form)
      closeForm()
    } catch (err) { setError(getApiMessage(err)) }
  }

  const handleComplete = async () => {
    if (!completeTarget) return
    await completeMutation.mutateAsync({ id: completeTarget.id, result: completeForm.result || undefined, nextFollowUpDate: completeForm.nextFollowUpDate || undefined })
    setCompleteTarget(null)
  }

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] text-[#9aaa9e]">{followUps.filter(f => f.status === 'PLANNED').length} follow-up aktif</span>
        <Button variant="outline" size="sm" onClick={openCreate}><Plus size={13} /> Tambah</Button>
      </div>

      {followUps.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#9aaa9e]">Belum ada follow-up.</p>
      ) : (
        <>
          <div className="space-y-2">
            {followUps.slice(0, collapse.visibleCount).map((f) => (
              <div key={f.id} className={cn('group rounded-lg border p-3', f.status === 'COMPLETED' ? 'border-emerald-100 bg-emerald-50/30' : 'border-[#d9dfd5]')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', STATUS_STYLE[f.status])}>
                        {f.status === 'PLANNED' ? 'Direncanakan' : f.status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                      <span className="text-[12px] text-[#9aaa9e]">{CHANNEL_LABELS[f.channel]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-[#17211b]">
                      <MessageSquare size={13} className="text-[#9aaa9e]" />
                      {formatDate(f.followUpDate)}
                    </div>
                    {f.message && <p className="mt-1 text-sm text-[#68736a]">{f.message}</p>}
                    {f.result && <p className="mt-1 text-sm text-emerald-700 italic">Hasil: {f.result}</p>}
                    {f.nextFollowUpDate && <p className="mt-0.5 text-[12px] text-[#9aaa9e]">Follow-up berikutnya: {formatDate(f.nextFollowUpDate)}</p>}
                  </div>
                  {f.status === 'PLANNED' && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                      <Button variant="ghost" size="icon-xs" onClick={() => setCompleteTarget(f)} className="text-emerald-600 hover:bg-emerald-50" title="Tandai selesai"><CheckCircle2 size={13} /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => openEdit(f)}><Pencil size={13} /></Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {collapse.hasMore && (
            <ShowMoreButton expanded={collapse.expanded} hiddenCount={collapse.hiddenCount} onToggle={collapse.toggle} />
          )}
        </>
      )}

      {/* Create / Edit */}
      <Modal open={showForm} onClose={closeForm} title={editTarget ? 'Edit Follow-up' : 'Tambah Follow-up'} size="sm"
        footer={<>
          <Button variant="outline" onClick={closeForm}>Batal</Button>
          <Button form="followup-form" type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">Simpan</Button>
        </>}>
        <form id="followup-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
          <Input label="Tanggal *" type="date" required value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} />
          <Select label="Channel *" value={form.channel} onChange={(e) => set('channel', e.target.value as FollowUpChannel)}>
            {(Object.entries(CHANNEL_LABELS) as [FollowUpChannel, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Textarea label="Pesan" value={form.message ?? ''} onChange={(e) => set('message', e.target.value || undefined)} rows={2} placeholder="Rencana isi follow-up..." />
          {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>

      {/* Complete modal */}
      <Modal open={Boolean(completeTarget)} onClose={() => setCompleteTarget(null)} title="Selesaikan Follow-up" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setCompleteTarget(null)}>Batal</Button>
          <Button onClick={() => void handleComplete()} disabled={completeMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">
            {completeMutation.isPending ? 'Menyimpan...' : 'Tandai Selesai'}
          </Button>
        </>}>
        <div className="grid gap-3">
          <Textarea label="Hasil follow-up" value={completeForm.result} onChange={(e) => setCompleteForm((p) => ({ ...p, result: e.target.value }))} rows={2} placeholder="Respons yang diterima..." />
          <Input label="Jadwal follow-up berikutnya" type="date" value={completeForm.nextFollowUpDate} onChange={(e) => setCompleteForm((p) => ({ ...p, nextFollowUpDate: e.target.value }))} />
        </div>
      </Modal>
    </>
  )
}
