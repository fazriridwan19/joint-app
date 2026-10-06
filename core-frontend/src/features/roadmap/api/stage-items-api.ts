import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type {
  ApiResponse,
  StageItemCategoryResponse,
  StageItemPatchRequest,
  StageItemRequest,
  StageItemResponse,
} from '../../../types/api'

export const stageItemKeys = {
  all: ['stage-items'] as const,
  byApplication: (applicationId: string) => [...stageItemKeys.all, applicationId] as const,
  categories: ['stage-items', 'categories'] as const,
}

export function useStageItems(applicationId: string) {
  return useQuery({
    queryKey: stageItemKeys.byApplication(applicationId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<StageItemResponse[]>>(
        `/applications/${applicationId}/stage-items`,
      )
      return response.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useStageItemCategories() {
  return useQuery({
    queryKey: stageItemKeys.categories,
    queryFn: async () => {
      const response = await api.get<ApiResponse<StageItemCategoryResponse[]>>(
        '/roadmap/item-categories',
      )
      return response.data.data ?? []
    },
  })
}

export function useCreateStageItem(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: StageItemRequest) => {
      const response = await api.post<ApiResponse<StageItemResponse>>(
        `/applications/${applicationId}/stage-items`,
        body,
      )
      return response.data.data!
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: stageItemKeys.byApplication(applicationId) }),
  })
}

export function useUpdateStageItem(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: StageItemPatchRequest }) => {
      const response = await api.patch<ApiResponse<StageItemResponse>>(
        `/applications/${applicationId}/stage-items/${id}`,
        body,
      )
      return response.data.data!
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: stageItemKeys.byApplication(applicationId) }),
  })
}

export function useDeleteStageItem(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${applicationId}/stage-items/${id}`)
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: stageItemKeys.byApplication(applicationId) }),
  })
}