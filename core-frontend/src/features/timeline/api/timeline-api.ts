import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, TimelineCreateRequest, TimelineResponse } from '../../../types/api'

export const timelineKeys = {
  byApplication: (applicationId: string) => ['timeline', applicationId] as const,
}

export function useTimeline(applicationId: string) {
  return useQuery({
    queryKey: timelineKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<TimelineResponse[]>>(
        `/applications/${applicationId}/timeline`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateTimelineEvent(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: TimelineCreateRequest) => {
      const res = await api.post<ApiResponse<TimelineResponse>>(
        `/applications/${applicationId}/timeline`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: timelineKeys.byApplication(applicationId) })
    },
  })
}
