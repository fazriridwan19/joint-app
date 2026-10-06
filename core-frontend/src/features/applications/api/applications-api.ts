import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type {
  ApiResponse,
  ApplicationPatchRequest,
  ApplicationRequest,
  ApplicationResponse,
  ArchiveResponse,
  StatusRequest,
  StatusResponse,
} from '../../../types/api'
import type { ApplicationStatus } from '../../../types/api'

// ─── Query keys ──────────────────────────────────────────────────────────────

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (params: ApplicationListParams) => [...applicationKeys.lists(), params] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ApplicationListParams = {
  page?: number
  page_size?: number
  q?: string
  status?: ApplicationStatus | ''
  archived?: boolean
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useApplications(params: ApplicationListParams = {}) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ApplicationResponse[]>>('/applications', { params })
      return res.data
    },
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ApplicationResponse>>(`/applications/${id}`)
      return res.data.data
    },
    enabled: Boolean(id),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ApplicationRequest) => {
      const res = await api.post<ApiResponse<ApplicationResponse>>('/applications', body)
      return res.data.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: applicationKeys.lists() })
      void qc.invalidateQueries({ queryKey: ['timeline', data.id] })
    },
  })
}

export function useUpdateApplication(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ApplicationPatchRequest) => {
      const res = await api.patch<ApiResponse<ApplicationResponse>>(`/applications/${id}`, body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void qc.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}

export function useDeleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/applications/${id}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationKeys.lists() })
    },
  })
}

export function useUpdateStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: StatusRequest) => {
      const res = await api.patch<ApiResponse<StatusResponse>>(`/applications/${id}/status`, body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      void qc.invalidateQueries({ queryKey: applicationKeys.lists() })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
      void qc.invalidateQueries({ queryKey: ['timeline', id] })
    },
  })
}

export function useArchiveApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const endpoint = archive
        ? `/applications/${id}/archive`
        : `/applications/${id}/unarchive`
      const res = await api.post<ApiResponse<ArchiveResponse>>(endpoint)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationKeys.lists() })
      void qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
