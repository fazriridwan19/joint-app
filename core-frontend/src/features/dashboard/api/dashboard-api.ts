import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, DashboardSummary, DashboardFunnel, DashboardUpcoming } from '../../../types/api'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary')
      return res.data.data
    },
  })
}

export function useDashboardFunnel() {
  return useQuery({
    queryKey: ['dashboard', 'funnel'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardFunnel>>('/dashboard/funnel')
      return res.data.data
    },
  })
}

export function useDashboardUpcoming() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardUpcoming>>('/dashboard/upcoming')
      return res.data.data
    },
  })
}
