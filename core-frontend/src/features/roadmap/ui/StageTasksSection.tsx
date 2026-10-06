import { useState } from 'react'
import { CalendarDays, ExternalLink, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { Modal } from '../../../components/ui/modal'
import { Spinner } from '../../../components/ui/spinner'
import { ShowMoreButton } from '../../../components/ui/show-more-button'
import { useCollapse } from '../../../hooks/useCollapse'
import {
  useCreateStageItem,
  useDeleteStageItem,
  useStageItemCategories,
  useStageItems,
  useUpdateStageItem,
} from '../api/stage-items-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type {
  PriorityLevel,
  StageItemCategoryResponse,
  StageItemPatchRequest,
  StageItemRequest,
  StageItemResponse,
  StageItemStatus,
  StageResponse,
} from '../../../types/api'
import { cn } from 'cn'

type Props = { applicationId: string; stages?: StageResponse[] }
type GroupFilter = 'ALL' | 'INTERVIEW' | 'TASK'
type FormState = StageItemRequest

const STATUS_LABEL: Record<StageItemStatus, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'Sedang dikerjakan',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

const STATUS_STYLE: Record<StageItemStatus, string> = {
  TODO: 'bg-[#f0f4ed] text-[#68736a]',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  DONE: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-[#f0f0ec] text-[#9aaa9e]',
}

const emptyForm: FormState = {
  roadmapStageId: '',
  categoryId: '',
  title: '',
  content: '',
  scheduledAt: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  endTime: '10:00',
  timezone: 'Asia/Jakarta',
  priority: 'MEDIUM',
}

function categoryLabel(category: StageItemCategoryResponse) {
  return `${category.group === 'INTERVIEW' ? 'Interview' : category.group === 'TASK' ? 'Task' : 'Preparation'} · ${category.label}`
}

export function StageTasksSection({ applicationId, stages = [] }: Props) {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('ALL')
  const [stageFilter, setStageFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<StageItemResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StageItemResponse | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')

  const { data: items = [], isLoading } = useStageItems(applicationId)
  const { data: categories = [], isLoading: categoriesLoading } = useStageItemCategories()
  const createMutation = useCreateStageItem(applicationId)
  const updateMutation = useUpdateStageItem(applicationId)
  const deleteMutation = useDeleteStageItem(applicationId)

  const visibleItems = items.filter((item) =>
    (groupFilter === 'ALL' || item.categoryGroup === groupFilter) &&
    (!stageFilter || item.roadmapStageId === stageFilter),
  )
  const collapse = useCollapse(visibleItems.length)
  const activeCount = visibleItems.filter((item) => item.status !== 'DONE' && item.status !== 'CANCELLED').length
  const stageName = (stageId: string) => stages.find((stage) => stage.id === stageId)?.name ?? 'Tanpa tahap'
  const isPending = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    const firstCategory = categories.find((category) => category.group !== 'PREPARATION')
    setForm({
      ...emptyForm,
      roadmapStageId: stages[0]?.id ?? '',
      categoryId: firstCategory?.id ?? '',
    })
    setEditItem(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (item: StageItemResponse) => {
    setForm({
      roadmapStageId: item.roadmapStageId,
      categoryId: item.categoryId,
      title: item.title,
      content: item.content ?? '',
      scheduledAt: item.scheduledAt ?? emptyForm.scheduledAt,
      startTime: item.startTime ?? emptyForm.startTime,
      endTime: item.endTime ?? emptyForm.endTime,
      timezone: item.timezone ?? emptyForm.timezone,
      url: item.url ?? '',
      assignee: item.assignee ?? '',
      location: item.location ?? '',
      priority: item.priority ?? 'MEDIUM',
    })
    setEditItem(item)
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditItem(null)
    setError('')
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      if (editItem) {
        const body: StageItemPatchRequest = { ...form, status: editItem.status }
        await updateMutation.mutateAsync({ id: editItem.id, body })
      } else {
        await createMutation.mutateAsync(form)
      }
      closeForm()
    } catch (requestError) {
      setError(getApiMessage(requestError))
    }
  }

  const toggleStatus = async (item: StageItemResponse) => {
    const status: StageItemStatus = item.status === 'DONE' ? 'TODO' : 'DONE'
    try {
      await updateMutation.mutateAsync({ id: item.id, body: { status } })
    } catch (requestError) {
      setError(getApiMessage(requestError))
    }
  }

  const formatDate = (date: string | null) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Tanpa tanggal'

  if (isLoading || categoriesLoading) return <div className="flex justify-center py-6"><Spinner /></div>

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] text-[#9aaa9e]">{activeCount} item aktif · {visibleItems.length} ditampilkan</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(['ALL', 'INTERVIEW', 'TASK'] as GroupFilter[]).map((group) => (
              <button key={group} type="button" onClick={() => setGroupFilter(group)}
                className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', groupFilter === group ? 'bg-[#256b4d] text-white' : 'bg-[#f0f4ed] text-[#68736a]')}>
                {group === 'ALL' ? 'Semua' : group === 'INTERVIEW' ? 'Interview' : 'Task'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Select aria-label="Filter tahap" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="min-w-40">
            <option value="">Semua tahap</option>
            {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={openCreate}><Plus size={13} /> Tambah item</Button>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#9aaa9e]">Belum ada stage task.</p>
      ) : (
        <>
          <div className="space-y-2">
            {visibleItems.slice(0, collapse.visibleCount).map((item) => (
              <div key={item.id} className={cn('group flex items-start gap-3 rounded-lg border px-3 py-3', item.status === 'DONE' ? 'border-emerald-100 bg-emerald-50/30 opacity-70' : 'border-[#d9dfd5] bg-white')}>
                <button type="button" onClick={() => void toggleStatus(item)} aria-label={item.status === 'DONE' ? 'Tandai belum selesai' : 'Tandai selesai'}
                  className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border', item.status === 'DONE' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[#d9dfd5] hover:border-emerald-400')}>
                  {item.status === 'DONE' && <span className="text-[10px]">✓</span>}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-medium text-[#17211b]', item.status === 'DONE' && 'line-through text-[#9aaa9e]')}>{item.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-[#e7eee3] px-1.5 py-0.5 text-[10px] font-semibold text-[#256b4d]">{item.categoryLabel}</span>
                    <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', STATUS_STYLE[item.status])}>{STATUS_LABEL[item.status]}</span>
                    <span className="text-[11px] text-[#68736a]">{stageName(item.roadmapStageId)}</span>
                    {item.priority && <span className="text-[11px] text-[#9aaa9e]">{item.priority}</span>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[#68736a]">
                    <span className="flex items-center gap-1"><CalendarDays size={12} />{formatDate(item.scheduledAt)}{item.startTime ? ` · ${item.startTime}–${item.endTime ?? ''}` : ''}</span>
                    {item.location && <span className="flex items-center gap-1"><MapPin size={12} />{item.location}</span>}
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#256b4d] hover:underline"><ExternalLink size={12} />Link</a>}
                  </div>
                  {item.content && <p className="mt-1 text-[12px] text-[#68736a]">{item.content}</p>}
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon-xs" onClick={() => openEdit(item)} aria-label="Edit stage task"><Pencil size={13} /></Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(item)} className="text-[#ba442d] hover:bg-red-50" aria-label="Hapus stage task"><Trash2 size={13} /></Button>
                </div>
              </div>
            ))}
          </div>
          {collapse.hasMore && <ShowMoreButton expanded={collapse.expanded} hiddenCount={collapse.hiddenCount} onToggle={collapse.toggle} />}
        </>
      )}

      <Modal open={showForm} onClose={closeForm} title={editItem ? 'Edit Stage Task' : 'Tambah Stage Task'} size="md"
        footer={<><Button variant="outline" onClick={closeForm} disabled={isPending}>Batal</Button><Button form="stage-task-form" type="submit" disabled={isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">{isPending ? 'Menyimpan...' : 'Simpan'}</Button></>}>
        <form id="stage-task-form" onSubmit={(event) => void handleSubmit(event)} className="grid gap-3">
          <Input label="Judul *" required value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="Siapkan CV terbaru" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tahap *" required value={form.roadmapStageId} onChange={(event) => set('roadmapStageId', event.target.value)}>
              <option value="" disabled>Pilih tahap</option>
              {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.stageOrder}. {stage.name}</option>)}
            </Select>
            <Select label="Kategori *" required value={form.categoryId} onChange={(event) => set('categoryId', event.target.value)}>
              <option value="" disabled>Pilih kategori</option>
              {categories.filter((category) => category.group !== 'PREPARATION').map((category) => <option key={category.id} value={category.id}>{categoryLabel(category)}</option>)}
            </Select>
          </div>
          <Textarea label="Deskripsi" value={form.content ?? ''} onChange={(event) => set('content', event.target.value)} rows={2} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Tanggal *" required type="date" value={form.scheduledAt} onChange={(event) => set('scheduledAt', event.target.value)} />
            <Input label="Mulai *" required type="time" value={form.startTime} onChange={(event) => set('startTime', event.target.value)} />
            <Input label="Selesai *" required type="time" value={form.endTime} onChange={(event) => set('endTime', event.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Prioritas *" required value={form.priority} onChange={(event) => set('priority', event.target.value as PriorityLevel)}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
            </Select>
            <Input label="Penanggung jawab" value={form.assignee ?? ''} onChange={(event) => set('assignee', event.target.value)} placeholder="Nama" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Lokasi" value={form.location ?? ''} onChange={(event) => set('location', event.target.value)} placeholder="Online / kantor" />
            <Input label="URL" type="url" value={form.url ?? ''} onChange={(event) => set('url', event.target.value)} placeholder="https://..." />
          </div>
          {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void deleteMutation.mutateAsync(deleteTarget.id).then(() => setDeleteTarget(null)) }}
        title="Hapus Stage Task" description={`Hapus item "${deleteTarget?.title}"?`} confirmLabel="Hapus" isLoading={deleteMutation.isPending} variant="danger" />
    </>
  )
}