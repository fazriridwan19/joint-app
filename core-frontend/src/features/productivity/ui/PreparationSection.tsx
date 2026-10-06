import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Input, Select, Textarea } from '../../../components/ui/input'
import { Spinner } from '../../../components/ui/spinner'
import { usePreparations, useCreatePreparation, useUpdatePreparation, useDeletePreparation } from '../api/preparations-api'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import type { PreparationCategory, PreparationRequest } from '../../../types/api'
import { cn } from 'cn'

const CATEGORY_LABELS: Record<PreparationCategory, string> = {
  STUDY_TOPIC: 'Materi Belajar',
  INTERVIEW_QUESTION: 'Pertanyaan Interview',
  COMPANY_RESEARCH: 'Riset Perusahaan',
  TECHNICAL_PRACTICE: 'Latihan Teknis',
  QUESTION_FOR_INTERVIEWER: 'Pertanyaan untuk Interviewer',
  REFLECTION: 'Refleksi',
}

const CATEGORY_COLOR: Record<PreparationCategory, string> = {
  STUDY_TOPIC: 'text-blue-700 bg-blue-50',
  INTERVIEW_QUESTION: 'text-purple-700 bg-purple-50',
  COMPANY_RESEARCH: 'text-amber-700 bg-amber-50',
  TECHNICAL_PRACTICE: 'text-orange-700 bg-orange-50',
  QUESTION_FOR_INTERVIEWER: 'text-emerald-700 bg-emerald-50',
  REFLECTION: 'text-[#68736a] bg-[#f0f4ed]',
}

type Props = { stageId: string; stageName: string }

export function PreparationSection({ stageId, stageName }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PreparationRequest>({ content: '', category: 'STUDY_TOPIC' })
  const [error, setError] = useState('')

  const { data: items = [], isLoading } = usePreparations(stageId)
  const createMutation = useCreatePreparation(stageId)
  const updateMutation = useUpdatePreparation(stageId)
  const deleteMutation = useDeletePreparation(stageId)

  const closeForm = () => { setShowForm(false); setError('') }
  const set = <K extends keyof PreparationRequest>(k: K, v: PreparationRequest[K]) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try { await createMutation.mutateAsync(form); closeForm() }
    catch (err) { setError(getApiMessage(err)) }
  }

  const toggleComplete = async (itemId: string, completed: boolean) => {
    await updateMutation.mutateAsync({ itemId, body: { completed: !completed } })
  }

  const completedCount = items.filter(i => i.completed).length
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100)

  if (isLoading) return <div className="flex justify-center py-4"><Spinner /></div>

  return (
    <div className="rounded-lg border border-[#d9dfd5] bg-[#f8faf6] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-[#17211b]">Persiapan: {stageName}</div>
          {items.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e7eee3]">
                <div className="h-full rounded-full bg-[#256b4d] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="shrink-0 text-[11px] text-[#9aaa9e]">{completedCount}/{items.length}</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="xs" onClick={() => { setForm({ content: '', category: 'STUDY_TOPIC' }); setShowForm(true) }}>
          <Plus size={12} /> Tambah
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-[#9aaa9e]">Belum ada item persiapan.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="group flex items-start gap-2">
              <button type="button"
                onClick={() => void toggleComplete(item.id, item.completed)}
                className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                  item.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[#d9dfd5] hover:border-emerald-400')}>
                {item.completed && <span className="text-[9px]">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm', item.completed && 'line-through text-[#9aaa9e]')}>{item.content}</div>
                <span className={cn('mt-0.5 inline-block rounded-full px-1.5 py-0 text-[10px] font-medium', CATEGORY_COLOR[item.category])}>
                  {CATEGORY_LABELS[item.category]}
                </span>
                {item.resourceUrl && (
                  <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer"
                    className="ml-2 text-[11px] text-[#256b4d] hover:underline">→ Sumber</a>
                )}
              </div>
              <Button variant="ghost" size="icon-xs"
                onClick={() => void deleteMutation.mutateAsync(item.id)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-[#ba442d] hover:bg-red-50">
                <Trash2 size={11} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={showForm} onClose={closeForm} title={`Tambah Persiapan — ${stageName}`} size="sm"
        footer={<>
          <Button variant="outline" onClick={closeForm}>Batal</Button>
          <Button form="prep-form" type="submit" disabled={createMutation.isPending} className="bg-[#256b4d] text-white hover:bg-[#1b563d]">Tambah</Button>
        </>}>
        <form id="prep-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-3">
          <Select label="Kategori *" value={form.category} onChange={(e) => set('category', e.target.value as PreparationCategory)}>
            {(Object.entries(CATEGORY_LABELS) as [PreparationCategory, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Textarea label="Isi *" required value={form.content} onChange={(e) => set('content', e.target.value)} rows={2} placeholder="Contoh: Review Spring Boot annotations" />
          <Input label="URL Sumber" type="url" value={form.resourceUrl ?? ''} onChange={(e) => set('resourceUrl', e.target.value || undefined)} placeholder="https://..." />
          {error && <ApiErrorAlert error={error} />}
        </form>
      </Modal>
    </div>
  )
}
