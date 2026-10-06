import { useState } from 'react'
import { Bell, BellOff, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { EmptyState } from '../../../components/ui/empty-state'
import { PageSpinner } from '../../../components/ui/spinner'
import { Modal } from '../../../components/ui/modal'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { useReminders, useCreateReminder, useCompleteReminder, useSnoozeReminder, useDeleteReminder } from '../api/reminders-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { ReminderRequest, ReminderResponse, ReminderType } from '../../../types/api'
import { cn } from 'cn'

const TYPE_LABELS: Record<ReminderType, string> = {
  INTERVIEW: 'Interview', ASSESSMENT_DEADLINE: 'Deadline Assessment',
  FOLLOW_UP: 'Follow-up', APPLICATION_DEADLINE: 'Deadline Lamaran',
  RECRUITMENT_STAGE: 'Tahap Rekrutmen', CUSTOM: 'Custom', NO_UPDATE: 'Tidak Ada Update',
}

export function RemindersScreen() {
  const [pending, setPending] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [snoozeTarget, setSnoozeTarget] = useState<ReminderResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReminderResponse | null>(null)
  const [snoozeUntil, setSnoozeUntil] = useState('')
  const [form, setForm] = useState<ReminderRequest>({ type: 'CUSTOM', dueAt: '' })
  const [error, setError] = useState('')

  const { data, isLoading } = useReminders(pending, page)
  const reminders = data?.data ?? []
  const pagination = data?.meta?.pagination

  const createMutation = useCreateReminder()
  const completeMutation = useCompleteReminder()
  const snoozeMutation = useSnoozeReminder()
  const deleteMutation = useDeleteReminder()

  const closeForm = () => { setShowForm(false); setError('') }
  const set = <K extends keyof ReminderRequest>(k: K, v: ReminderRequest[K]) => setForm((p) => ({ ...p, [k]: v }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try { await createMutation.mutateAsync(form); closeForm() }
    catch (err) { setError(getApiMessage(err)) }
  }

  const handleSnooze = async () => {
    if (!snoozeTarget || !snoozeUntil) return
    await snoozeMutation.mutateAsync({ id: snoozeTarget.id, snoozedUntil: new Date(snoozeUntil).toISOString() })
    setSnoozeTarget(null)
  }

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const isPast = (d: string) => new Date(d) < new Date()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#17211b]">Reminder</h1>
          <p className="mt-0.5 text-sm text-[#68736a]">Jangan sampai lupa langkah penting</p>
        </div>
        <Button onClick={() => { setForm({ type: 'CUSTOM', dueAt: '' }); setShowForm(true) }}
          className="bg-[#256b4d] text-white hover:bg-[#1b563d]">
          <Plus size={15} /> Tambah Reminder
        </Button>
      </div>

      {/* Toggle pending / all */}
      <div className="mb-4 flex gap-2">
        {[{ label: 'Aktif', value: true }, { label: 'Semua', value: false }].map(({ label, value }) => (
          <button key={label} type="button" onClick={() => { setPending(value); setPage(1) }}
            className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              pending === value ? 'border-[#256b4d] bg-[#256b4d] text-white' : 'border-[#d9dfd5] bg-white text-[#4a5c4e] hover:border-[#256b4d]')}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? <PageSpinner /> : reminders.length === 0 ? (
        <EmptyState icon={Bell} title="Tidak ada reminder" description="Tambah reminder untuk jaga diri tetap on track." />
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const overdue = !r.completed && isPast(r.dueAt)
            return (
              <div key={r.id} className={cn('group flex items-start gap-3 rounded-xl border bg-white p-4',
                overdue ? 'border-amber-200 bg-amber-50/40' : r.completed ? 'border-[#d9dfd5] opacity-60' : 'border-[#d9dfd5]')}>
                <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                  r.completed ? 'bg-emerald-50 text-emerald-600' : overdue ? 'bg-amber-50 text-amber-600' : 'bg-[#e7eee3] text-[#256b4d]')}>
                  {r.completed ? <CheckCircle2 size={16} /> : overdue ? <BellOff size={16} /> : <Bell size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#17211b]">{TYPE_LABELS[r.type]}</span>
                  </div>
                  {r.message && <p className="mt-0.5 text-sm text-[#68736a]">{r.message}</p>}
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9aaa9e]">
                    <Clock size={12} />
                    <span className={cn(overdue && 'font-semibold text-amber-600')}>
                      {formatDateTime(r.dueAt)}{overdue ? ' · Terlambat' : ''}
                    </span>
                  </div>
                  {r.snoozedUntil && <p className="mt-0.5 text-[11px] text-[#9aaa9e]">Ditunda hingga {formatDateTime(r.snoozedUntil)}</p>}
                </div>
                {!r.completed && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                    <Button variant="ghost" size="xs" onClick={() => void completeMutation.mutateAsync(r.id)} className="text-emerald-600 hover:bg-emerald-50">Selesai</Button>
                    <Button variant="ghost" size="xs" onClick={() => { setSnoozeTarget(r); setSnoozeUntil('') }}>Tunda</Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(r)} className="text-[#ba442d] hover:bg-red-50"><Trash2 size={13} /></Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[#68736a]">
          <span>{pagination.totalItems} reminder</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrevious} onClick={() => setPage(p => p - 1)}>←</Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>→</Button>
          </div>
        </div>
      )}

      {/* Create form */}
      <Modal open={showForm} onClose={closeForm} title="Tambah Reminder" size="sm"
        footer={<>
          <Button variant="outline" onClick={closeForm}>Batal</Button>
          <Button form="reminder-form" type="submit" disabled={createMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">Simpan</Button>
        </>}>
        <form id="reminder-form" onSubmit={(e) => void handleCreate(e)} className="grid gap-3">
          <Select label="Tipe *" value={form.type} onChange={(e) => set('type', e.target.value as ReminderType)}>
            {(Object.entries(TYPE_LABELS) as [ReminderType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Input label="Waktu *" type="datetime-local" required value={form.dueAt.slice(0, 16)}
            onChange={(e) => set('dueAt', new Date(e.target.value).toISOString())} />
          <Textarea label="Pesan" value={form.message ?? ''} onChange={(e) => set('message', e.target.value || undefined)} rows={2} placeholder="Detail reminder..." />
          {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>

      {/* Snooze modal */}
      <Modal open={Boolean(snoozeTarget)} onClose={() => setSnoozeTarget(null)} title="Tunda Reminder" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setSnoozeTarget(null)}>Batal</Button>
          <Button onClick={() => void handleSnooze()} disabled={!snoozeUntil || snoozeMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">Tunda</Button>
        </>}>
        <Input label="Tunda hingga *" type="datetime-local" value={snoozeUntil} onChange={(e) => setSnoozeUntil(e.target.value)} />
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)) }}
        title="Hapus Reminder" description="Hapus reminder ini?" confirmLabel="Hapus" isLoading={deleteMutation.isPending} variant="danger" />
    </div>
  )
}
