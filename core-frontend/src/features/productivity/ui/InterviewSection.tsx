import { useState } from 'react'
import { CalendarDays, MapPin, Pencil, Plus, Trash2, Video } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { Spinner } from '../../../components/ui/spinner'
import { ShowMoreButton } from '../../../components/ui/show-more-button'
import { useCollapse } from '../../../hooks/useCollapse'
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview } from '../api/interviews-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { InterviewRequest, InterviewResponse, InterviewType, StageResponse } from '../../../types/api'
import { cn } from 'cn'

const TYPE_LABELS: Record<InterviewType, string> = {
  HR: 'HR Interview', TECHNICAL: 'Technical', USER: 'User Interview',
  MANAGER: 'Manager', FINAL: 'Final Interview',
}

const TYPE_COLOR: Record<InterviewType, string> = {
  HR: 'bg-blue-50 text-blue-700', TECHNICAL: 'bg-purple-50 text-purple-700',
  USER: 'bg-amber-50 text-amber-700', MANAGER: 'bg-orange-50 text-orange-700',
  FINAL: 'bg-emerald-50 text-emerald-700',
}

type FormState = Partial<InterviewRequest> & { type: InterviewType; interviewDate: string; startTime: string; endTime: string }
const emptyForm: FormState = { type: 'HR', interviewDate: '', startTime: '', endTime: '', timezone: 'Asia/Jakarta' }

type Props = { applicationId: string; stages?: StageResponse[] }

export function InterviewSection({ applicationId, stages = [] }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editInterview, setEditInterview] = useState<InterviewResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InterviewResponse | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')

  const { data: interviews = [], isLoading } = useInterviews(applicationId)
  const createMutation = useCreateInterview(applicationId)
  const updateMutation = useUpdateInterview(applicationId)
  const deleteMutation = useDeleteInterview(applicationId)
  const isPending = createMutation.isPending || updateMutation.isPending
  const collapse = useCollapse(interviews.length)

  const openCreate = () => { setForm(emptyForm); setEditInterview(null); setShowForm(true) }
  const openEdit = (iv: InterviewResponse) => {
    setForm({ type: iv.type, interviewDate: iv.interviewDate, startTime: iv.startTime, endTime: iv.endTime,
      timezone: iv.timezone, roadmapStageId: iv.roadmapStageId ?? undefined,
      interviewer: iv.interviewer ?? '', meetingUrl: iv.meetingUrl ?? '',
      location: iv.location ?? '', notes: iv.notes ?? '' })
    setEditInterview(iv); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditInterview(null); setError('') }
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      const body: InterviewRequest = { type: form.type, interviewDate: form.interviewDate,
        startTime: form.startTime, endTime: form.endTime, timezone: form.timezone,
        roadmapStageId: form.roadmapStageId || undefined,
        interviewer: form.interviewer || undefined, meetingUrl: form.meetingUrl || undefined,
        location: form.location || undefined, notes: form.notes || undefined }
      editInterview
        ? await updateMutation.mutateAsync({ id: editInterview.id, body })
        : await createMutation.mutateAsync(body)
      closeForm()
    } catch (err) { setError(getApiMessage(err)) }
  }

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] text-[#9aaa9e]">{interviews.length} jadwal interview</span>
        <Button variant="outline" size="sm" onClick={openCreate}><Plus size={13} /> Jadwalkan</Button>
      </div>

      {interviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#9aaa9e]">Belum ada jadwal interview.</p>
      ) : (
        <>
          <div className="space-y-3">
            {interviews.slice(0, collapse.visibleCount).map((iv) => (
              <div key={iv.id} className="group rounded-lg border border-[#d9dfd5] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', TYPE_COLOR[iv.type])}>
                        {TYPE_LABELS[iv.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-[#17211b]">
                      <CalendarDays size={13} className="text-[#9aaa9e]" />
                      {formatDate(iv.interviewDate)} · {iv.startTime} – {iv.endTime}
                    </div>
                    {iv.interviewer && <div className="mt-0.5 text-sm text-[#68736a]">Interviewer: {iv.interviewer}</div>}
                    {iv.roadmapStageId && stages.length > 0 && (() => {
                      const stage = stages.find(s => s.id === iv.roadmapStageId)
                      return stage ? (
                        <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[#256b4d]">
                          <span className="rounded bg-[#e7eee3] px-1.5 py-0.5 font-medium">
                            {stage.name}
                          </span>
                        </div>
                      ) : null
                    })()}
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {iv.meetingUrl && (
                        <a href={iv.meetingUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[12px] text-[#256b4d] hover:underline">
                          <Video size={12} /> Meeting URL
                        </a>
                      )}
                      {iv.location && <span className="flex items-center gap-1 text-[12px] text-[#68736a]"><MapPin size={12} />{iv.location}</span>}
                    </div>
                    {iv.notes && <p className="mt-1 text-[12px] text-[#9aaa9e] italic">{iv.notes}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(iv)}><Pencil size={13} /></Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(iv)} className="text-[#ba442d] hover:bg-red-50"><Trash2 size={13} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {collapse.hasMore && (
            <ShowMoreButton expanded={collapse.expanded} hiddenCount={collapse.hiddenCount} onToggle={collapse.toggle} />
          )}
        </>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={closeForm} title={editInterview ? 'Edit Interview' : 'Jadwalkan Interview'} size="md"
        footer={<>
          <Button variant="outline" onClick={closeForm} disabled={isPending}>Batal</Button>
          <Button form="interview-form" type="submit" disabled={isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">
            {isPending ? 'Menyimpan...' : editInterview ? 'Simpan' : 'Jadwalkan'}
          </Button>
        </>}>
        <form id="interview-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
          <Select label="Tipe Interview *" value={form.type} onChange={(e) => set('type', e.target.value as InterviewType)}>
            {(Object.keys(TYPE_LABELS) as InterviewType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </Select>
          {stages.length > 0 && (
            <Select label="Kaitkan ke Tahap Roadmap"
              value={form.roadmapStageId ?? ''}
              onChange={(e) => set('roadmapStageId', e.target.value || undefined)}>
              <option value="">— Tidak dikaitkan —</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.stageOrder}. {s.name}</option>
              ))}
            </Select>
          )}
          <Input label="Tanggal *" type="date" required value={form.interviewDate} onChange={(e) => set('interviewDate', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Mulai *" type="time" required value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
            <Input label="Selesai *" type="time" required value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </div>
          <Input label="Interviewer" value={form.interviewer ?? ''} onChange={(e) => set('interviewer', e.target.value)} placeholder="Nama interviewer" />
          <Input label="Meeting URL" type="url" value={form.meetingUrl ?? ''} onChange={(e) => set('meetingUrl', e.target.value)} placeholder="https://meet.google.com/..." />
          <Input label="Lokasi" value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Gedung A lt 3 / Online" />
          <Textarea label="Catatan" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} rows={2} />
          {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)) }}
        title="Hapus Interview" description={`Hapus jadwal ${deleteTarget ? TYPE_LABELS[deleteTarget.type] : ''}?`}
        confirmLabel="Hapus" isLoading={deleteMutation.isPending} variant="danger" />
    </>
  )
}
