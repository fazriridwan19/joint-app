import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type {
  ApiResponse,
  PreparationRequest,
  PreparationResponse,
} from '../../../types/api'

export const preparationKeys = {
  byStage: (stageId: string) => ['preparations', stageId] as const,
}

export function usePreparations(stageId: string) {
  return useQuery({
    queryKey: preparationKeys.byStage(stageId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<PreparationResponse[]>>(
        `/roadmap/stages/${stageId}/preparations`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(stageId),
  })
}

export function useCreatePreparation(stageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: PreparationRequest) => {
      const res = await api.post<ApiResponse<PreparationResponse>>(
        `/roadmap/stages/${stageId}/preparations`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: preparationKeys.byStage(stageId) }),
  })
}

export function useUpdatePreparation(stageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      body,
    }: {
      itemId: string
      body: { content?: string; category?: string; completed?: boolean; resourceUrl?: string }
    }) => {
      const res = await api.patch<ApiResponse<PreparationResponse>>(
        `/roadmap/stages/${stageId}/preparations/${itemId}`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: preparationKeys.byStage(stageId) }),
  })
}

export function useDeletePreparation(stageId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/roadmap/stages/${stageId}/preparations/${itemId}`)
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: preparationKeys.byStage(stageId) }),
  })
}
