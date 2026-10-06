import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, RoadmapResponse, StageRequest, StageResponse } from '../../../types/api'

// ─── Query keys ──────────────────────────────────────────────────────────────

export const roadmapKeys = {
  all: ['roadmap'] as const,
  byApplication: (applicationId: string) => [...roadmapKeys.all, applicationId] as const,
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type StagePatchRequest = {
  name?: string
  description?: string
  stageOrder?: number
  scheduledDate?: string   // ISO date: YYYY-MM-DD
  notes?: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useRoadmap(applicationId: string) {
  return useQuery({
    queryKey: roadmapKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<RoadmapResponse>>(
        `/applications/${applicationId}/roadmap`,
      )
      return res.data.data
    },
    enabled: Boolean(applicationId),
    retry: false, // 404 jika belum ada roadmap — tidak perlu retry
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create roadmap. custom=false → seed 8 default stages; custom=true → kosong. */
export function useCreateRoadmap(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (custom: boolean) => {
      const res = await api.post<ApiResponse<RoadmapResponse>>(
        `/applications/${applicationId}/roadmap`,
        null,
        { params: { custom } },
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roadmapKeys.byApplication(applicationId) })
    },
  })
}

export function useAddStage(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: StageRequest) => {
      const res = await api.post<ApiResponse<StageResponse>>(
        `/applications/${applicationId}/roadmap/stages`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roadmapKeys.byApplication(applicationId) })
    },
  })
}

export function useUpdateStage(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ stageId, body }: { stageId: string; body: StagePatchRequest }) => {
      const res = await api.patch<ApiResponse<StageResponse>>(`/roadmap/stages/${stageId}`, body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roadmapKeys.byApplication(applicationId) })
    },
  })
}

export function useCompleteStage(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stageId: string) => {
      const res = await api.post<ApiResponse<StageResponse>>(
        `/roadmap/stages/${stageId}/complete`,
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roadmapKeys.byApplication(applicationId) })
      void qc.invalidateQueries({ queryKey: ['timeline', applicationId] })
    },
  })
}

export function useDeleteStage(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stageId: string) => {
      await api.delete(`/roadmap/stages/${stageId}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: roadmapKeys.byApplication(applicationId) })
    },
  })
}
