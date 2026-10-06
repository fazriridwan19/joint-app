import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type {
  ApiResponse,
  FollowUpPatchRequest,
  FollowUpRequest,
  FollowUpResponse,
} from '../../../types/api'

export const followUpKeys = {
  byApplication: (id: string) => ['follow-ups', id] as const,
}

export function useFollowUps(applicationId: string) {
  return useQuery({
    queryKey: followUpKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<FollowUpResponse[]>>(
        `/applications/${applicationId}/follow-ups`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateFollowUp(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: FollowUpRequest) => {
      const res = await api.post<ApiResponse<FollowUpResponse>>(
        `/applications/${applicationId}/follow-ups`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: followUpKeys.byApplication(applicationId) }),
  })
}

export function useUpdateFollowUp(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: FollowUpPatchRequest }) => {
      const res = await api.patch<ApiResponse<FollowUpResponse>>(
        `/applications/${applicationId}/follow-ups/${id}`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: followUpKeys.byApplication(applicationId) }),
  })
}

export function useCompleteFollowUp(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      result,
      nextFollowUpDate,
    }: {
      id: string
      result?: string
      nextFollowUpDate?: string
    }) => {
      const res = await api.post<ApiResponse<FollowUpResponse>>(
        `/applications/${applicationId}/follow-ups/${id}/complete`,
        { result, nextFollowUpDate },
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: followUpKeys.byApplication(applicationId) })
      void qc.invalidateQueries({ queryKey: ['timeline', applicationId] })
    },
  })
}
