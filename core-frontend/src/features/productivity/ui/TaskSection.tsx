import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { Spinner } from '../../../components/ui/spinner'
import { ShowMoreButton } from '../../../components/ui/show-more-button'
import { useCollapse } from '../../../hooks/useCollapse'
import { useApplicationTasks, useCreateTask, useUpdateTask, useCompleteTask, useDeleteTask } from '../api/tasks-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { PriorityLevel, StageResponse, TaskRequest, TaskResponse, TaskStatus } from '../../../types/api'
import { cn } from 'cn'

const STATUS_STYLE: Record<TaskStatus, string> = {
  TODO: 'bg-[#f0f4ed] text-[#68736a]',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  DONE: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-[#f0f0ec] text-[#9aaa9e]',
}
const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'Todo', IN_PROGRESS: 'Sedang Dikerjakan', DONE: 'Selesai', CANCELLED: 'Dibatalkan',
}

type Props = { applicationId: string; stages?: StageResponse[] }

export function TaskSection({ applicationId, stages = [] }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<TaskResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskResponse | null>(null)
  const [form, setForm] = useState<Partial<TaskRequest>>({ title: '' })
  const [error, setError] = useState('')

  const { data: tasks = [], isLoading } = useApplicationTasks(applicationId)
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const completeMutation = useCompleteTask()
  const deleteMutation = useDeleteTask()

  // ── Hooks wajib dipanggil sebelum semua early return ──────────────────────
  const active = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED')
  const done = tasks.filter(t => t.status === 'DONE' || t.status === 'CANCELLED')
  const allTasks = [...active, ...done]
  const collapse = useCollapse(allTasks.length)

  const openCreate = () => {
    setForm({ title: '', applicationId, dueDate: undefined, priority: undefined })
    setEditTask(null); setShowForm(true)
  }
  const openEdit = (t: TaskResponse) => {
    setForm({ title: t.title, description: t.description ?? '', dueDate: t.dueDate ?? undefined,
      priority: t.priority ?? undefined, roadmapStageId: t.roadmapStageId ?? undefined })
    setEditTask(t); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditTask(null); setError('') }
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      if (editTask) {
        await updateMutation.mutateAsync({ id: editTask.id, body: {
          title: form.title, description: form.description,
          dueDate: form.dueDate, priority: form.priority,
          roadmapStageId: form.roadmapStageId,
        }})
      } else {
        await createMutation.mutateAsync({ title: form.title!, applicationId,
          description: form.description, dueDate: form.dueDate,
          priority: form.priority, roadmapStageId: form.roadmapStageId,
        })
      }
      closeForm()
    } catch (err) { setError(getApiMessage(err)) }
  }

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const isOverdue = (t: TaskResponse) => t.dueDate && t.status !== 'DONE' && t.status !== 'CANCELLED' && new Date(t.dueDate) < new Date()

  if (isLoading) return <div className="flex justify-center py-6"><Spinner /></div>

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] text-[#9aaa9e]">{active.length} task aktif</span>
        <Button variant="outline" size="sm" onClick={openCreate}><Plus size={13} /> Tambah Task</Button>
      </div>

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#9aaa9e]">Belum ada task.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {allTasks.slice(0, collapse.visibleCount).map((t) => (
              <div key={t.id} className={cn('group flex items-center gap-3 rounded-lg border px-3 py-2.5', t.status === 'DONE' ? 'border-emerald-100 bg-emerald-50/30 opacity-70' : 'border-[#d9dfd5] bg-white')}>
                {/* Complete checkbox */}
                <button type="button" onClick={() => t.status !== 'DONE' && void completeMutation.mutateAsync(t.id)}
                  className={cn('flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                    t.status === 'DONE' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[#d9dfd5] hover:border-emerald-400')}>
                  {t.status === 'DONE' && <span className="text-[10px]">✓</span>}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-medium', t.status === 'DONE' && 'line-through text-[#9aaa9e]')}>{t.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', STATUS_STYLE[t.status])}>{STATUS_LABEL[t.status]}</span>
                    {t.dueDate && (
                      <span className={cn('text-[11px]', isOverdue(t) ? 'font-semibold text-[#ba442d]' : 'text-[#9aaa9e]')}>
                        {isOverdue(t) ? '⚠ ' : ''}{formatDate(t.dueDate)}
                      </span>
                    )}
                    {t.priority && <span className="text-[11px] text-[#9aaa9e]">{t.priority}</span>}
                    {t.roadmapStageId && stages.length > 0 && (() => {
                      const stage = stages.find(s => s.id === t.roadmapStageId)
                      return stage ? (
                        <span className="rounded bg-[#e7eee3] px-1.5 py-0.5 text-[10px] font-medium text-[#256b4d]">
                          {stage.name}
                        </span>
                      ) : null
                    })()}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                  <Button variant="ghost" size="icon-xs" onClick={() => openEdit(t)}><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(t)} className="text-[#ba442d] hover:bg-red-50"><Trash2 size={13} /></Button>
                </div>
              </div>
            ))}
          </div>
          {collapse.hasMore && (
            <ShowMoreButton expanded={collapse.expanded} hiddenCount={collapse.hiddenCount} onToggle={collapse.toggle} />
          )}
        </>
      )}

      <Modal open={showForm} onClose={closeForm} title={editTask ? 'Edit Task' : 'Tambah Task'} size="sm"
        footer={<>
          <Button variant="outline" onClick={closeForm}>Batal</Button>
          <Button form="task-form" type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">Simpan</Button>
        </>}>
        <form id="task-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
          <Input label="Judul *" required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="Siapkan CV terbaru" />
          <Textarea label="Deskripsi" value={form.description ?? ''} onChange={(e) => set('description', e.target.value || undefined)} rows={2} />
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
          <div className="grid grid-cols-2 gap-3">
            <Input label="Tenggat" type="date" value={form.dueDate ?? ''} onChange={(e) => set('dueDate', e.target.value || undefined)} />
            <Select label="Prioritas" value={form.priority ?? ''} onChange={(e) => set('priority', e.target.value as PriorityLevel || undefined)}>
              <option value="">— Pilih —</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>
                  {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)) }}
        title="Hapus Task" description={`Hapus task "${deleteTarget?.title}"?`}
        confirmLabel="Hapus" isLoading={deleteMutation.isPending} variant="danger" />
    </>
  )
}
