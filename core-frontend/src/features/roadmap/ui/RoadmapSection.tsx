import { useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ConfirmDialog } from '../../../components/ui/confirm-dialog'
import { Spinner } from '../../../components/ui/spinner'
import { ShowMoreButton } from '../../../components/ui/show-more-button'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import { useCollapse } from '../../../hooks/useCollapse'
import { RoadmapSetupModal } from './RoadmapSetupModal'
import { StageFormModal } from './StageFormModal'
import { useCompleteStage, useDeleteStage } from '../api/roadmap-api'
import type { RoadmapResponse, StageResponse, StageStatus } from '../../../types/api'
import { cn } from 'cn'

// ─── Stage status styles ──────────────────────────────────────────────────────

const STAGE_STYLE: Record<StageStatus, { dot: string; badge: string; label: string }> = {
  PENDING: {
    dot: 'bg-[#d9dfd5]',
    badge: 'bg-[#f0f4ed] text-[#68736a]',
    label: 'Pending',
  },
  IN_PROGRESS: {
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700',
    label: 'Berlangsung',
  },
  COMPLETED: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    label: 'Selesai',
  },
  SKIPPED: {
    dot: 'bg-[#d9dfd5]',
    badge: 'bg-[#f0f0ec] text-[#9aaa9e]',
    label: 'Dilewati',
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  applicationId: string
  roadmap: RoadmapResponse | null | undefined
  isLoading: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoadmapSection({ applicationId, roadmap, isLoading }: Props) {
  const [showSetup, setShowSetup] = useState(false)
  const [showStageForm, setShowStageForm] = useState(false)
  const [editStage, setEditStage] = useState<StageResponse | null>(null)
  const [deleteStage, setDeleteStage] = useState<StageResponse | null>(null)
  const [completeError, setCompleteError] = useState<unknown>(null)

  const completeStage = useCompleteStage(applicationId)
  const deleteStageMutation = useDeleteStage(applicationId)

  // Hook wajib dipanggil sebelum semua early return
  const stagesCollapse = useCollapse(roadmap?.stages.length ?? 0)

  const handleEditClose = () => {
    setEditStage(null)
    setShowStageForm(false)
  }

  const handleCompleteStage = async (stageId: string) => {
    setCompleteError(null)
    try {
      await completeStage.mutateAsync(stageId)
    } catch (error) {
      setCompleteError(error)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  // ── No roadmap yet ─────────────────────────────────────────────────────────
  if (!roadmap) {
    return (
      <>
        <div className="py-6 text-center">
          <p className="mb-1 font-medium text-[#17211b]">Belum ada roadmap</p>
          <p className="mb-4 text-sm text-[#68736a]">
            Buat roadmap untuk melacak setiap tahap rekrutmen lamaran ini.
          </p>
          <Button
            onClick={() => setShowSetup(true)}
            className="bg-[#256b4d] text-white hover:bg-[#1b563d]"
            size="sm"
          >
            <Plus size={14} /> Buat Roadmap
          </Button>
        </div>
        <RoadmapSetupModal
          open={showSetup}
          onClose={() => setShowSetup(false)}
          applicationId={applicationId}
        />
      </>
    )
  }

  // ── Roadmap exists ─────────────────────────────────────────────────────────
  const { stages, progressPercentage, isCustom } = roadmap

  return (
    <>
      {/* Header row: progress + add stage button */}
      <div className="mb-4 flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex justify-between text-xs text-[#68736a]">
            <span>
              {stages.filter((s) => s.status === 'COMPLETED').length} / {stages.length} selesai
              {isCustom && (
                <span className="ml-2 rounded-full bg-[#e7eee3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#256b4d]">
                  Custom
                </span>
              )}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e7eee3]">
            <div
              className="h-full rounded-full bg-[#256b4d] transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Add stage — always allowed, especially for custom roadmaps */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditStage(null)
            setShowStageForm(true)
          }}
          className="shrink-0"
        >
          <Plus size={13} /> Tambah Tahap
        </Button>
      </div>

      {completeError && <ApiErrorAlert error={completeError} />}

      {/* Stage list */}
      {stages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9dfd5] py-8 text-center">
          <p className="text-sm text-[#9aaa9e]">Belum ada tahap. Klik "Tambah Tahap" untuk mulai.</p>
        </div>
      ) : (
        <>
          <ol className="space-y-2">
            {stages.slice(0, stagesCollapse.visibleCount).map((stage, idx) => {
            const style = STAGE_STYLE[stage.status]
            const isDone = stage.status === 'COMPLETED'

            return (
              <li
                key={stage.id}
                className={cn(
                  'group flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                  isDone
                    ? 'border-emerald-100 bg-emerald-50/40'
                    : 'border-[#d9dfd5] bg-white hover:bg-[#f8faf6]',
                )}
              >
                {/* Order number */}
                <span
                  className={cn(
                    'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#f0f4ed] text-[#68736a]',
                  )}
                >
                  {isDone ? <Check size={12} /> : idx + 1}
                </span>

                {/* Stage info */}
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'font-medium leading-tight',
                      isDone ? 'text-[#68736a] line-through' : 'text-[#17211b]',
                    )}
                  >
                    {stage.name}
                  </div>
                  {stage.description && (
                    <div className="mt-0.5 line-clamp-1 text-[12px] text-[#9aaa9e]">
                      {stage.description}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        style.badge,
                      )}
                    >
                      {style.label}
                    </span>
                    {/* Scheduled date */}
                    {stage.scheduledDate && (
                      <span className="text-[11px] text-[#9aaa9e]">
                        {formatDate(stage.scheduledDate)}
                      </span>
                    )}
                    {/* Completed date */}
                    {stage.completedDate && (
                      <span className="text-[11px] text-emerald-600">
                        ✓ {formatDate(stage.completedDate)}
                      </span>
                    )}
                  </div>
                  {stage.notes && (
                    <p className="mt-1 line-clamp-2 text-[12px] italic text-[#9aaa9e]">
                      {stage.notes}
                    </p>
                  )}
                </div>

                {/* Actions — visible on hover */}
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Complete toggle */}
                  {!isDone && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => void handleCompleteStage(stage.id)}
                      disabled={completeStage.isPending}
                      title="Tandai selesai"
                      className="text-emerald-600 hover:bg-emerald-50"
                    >
                      <Check size={13} />
                    </Button>
                  )}
                  {/* Edit */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setEditStage(stage)
                      setShowStageForm(true)
                    }}
                    title="Edit tahap"
                  >
                    <Pencil size={13} />
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDeleteStage(stage)}
                    title="Hapus tahap"
                    className="text-[#ba442d] hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </li>
            )
          })}
        </ol>
        {stagesCollapse.hasMore && (
          <ShowMoreButton
            expanded={stagesCollapse.expanded}
            hiddenCount={stagesCollapse.hiddenCount}
            onToggle={stagesCollapse.toggle}
          />
        )}
        </>
      )}

      {/* Modals */}
      <StageFormModal
        open={showStageForm || Boolean(editStage)}
        onClose={handleEditClose}
        applicationId={applicationId}
        stage={editStage}
      />

      <ConfirmDialog
        open={Boolean(deleteStage)}
        onClose={() => setDeleteStage(null)}
        onConfirm={() => {
          if (!deleteStage) return
          void deleteStageMutation.mutateAsync(deleteStage.id).then(() => setDeleteStage(null))
        }}
        title="Hapus Tahap"
        description={`Yakin ingin menghapus tahap "${deleteStage?.name}"?`}
        confirmLabel="Hapus"
        isLoading={deleteStageMutation.isPending}
        variant="danger"
      />
    </>
  )
}
