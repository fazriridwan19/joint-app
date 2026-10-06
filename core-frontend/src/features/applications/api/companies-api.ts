import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, CompanyRequest, CompanyResponse } from '../../../types/api'

// ─── Query keys ──────────────────────────────────────────────────────────────

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (q: string) => [...companyKeys.lists(), q] as const,
  detail: (id: string) => [...companyKeys.all, 'detail', id] as const,
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCompanies(q = '', page = 1, page_size = 50) {
  return useQuery({
    queryKey: companyKeys.list(q),
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanyResponse[]>>('/companies', {
        params: { q, page, page_size },
      })
      return res.data.data ?? []
    },
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<CompanyResponse>>(`/companies/${id}`)
      return res.data.data
    },
    enabled: Boolean(id),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: CompanyRequest) => {
      const res = await api.post<ApiResponse<CompanyResponse>>('/companies', body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<CompanyRequest>) => {
      const res = await api.patch<ApiResponse<CompanyResponse>>(`/companies/${id}`, body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: companyKeys.detail(id) })
      void qc.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${id}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}
