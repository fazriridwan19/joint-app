import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, InterviewRequest, InterviewResponse } from '../../../types/api'

export const interviewKeys = {
  byApplication: (id: string) => ['interviews', id] as const,
}

export function useInterviews(applicationId: string) {
  return useQuery({
    queryKey: interviewKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<InterviewResponse[]>>(
        `/applications/${applicationId}/interviews`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateInterview(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: InterviewRequest) => {
      const res = await api.post<ApiResponse<InterviewResponse>>(
        `/applications/${applicationId}/interviews`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  })
}

export function useUpdateInterview(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<InterviewRequest> }) => {
      const res = await api.patch<ApiResponse<InterviewResponse>>(
        `/applications/${applicationId}/interviews/${id}`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  })
}

export function useDeleteInterview(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${applicationId}/interviews/${id}`)
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  })
}
