import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, TaskPatchRequest, TaskRequest, TaskResponse } from '../../../types/api'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (page: number) => [...taskKeys.all, 'list', page] as const,
  byApplication: (id: string) => ['tasks', 'application', id] as const,
}

export function useTasks(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: taskKeys.list(page),
    queryFn: async () => {
      const res = await api.get<ApiResponse<TaskResponse[]>>('/tasks', {
        params: { page, page_size: pageSize },
      })
      return res.data
    },
  })
}

export function useApplicationTasks(applicationId: string) {
  return useQuery({
    queryKey: taskKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<TaskResponse[]>>(
        `/applications/${applicationId}/tasks`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: TaskRequest) => {
      const res = await api.post<ApiResponse<TaskResponse>>('/tasks', body)
      return res.data.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: taskKeys.all })
      if (data.applicationId)
        void qc.invalidateQueries({ queryKey: taskKeys.byApplication(data.applicationId) })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: TaskPatchRequest }) => {
      const res = await api.patch<ApiResponse<TaskResponse>>(`/tasks/${id}`, body)
      return res.data.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: taskKeys.all })
      if (data.applicationId)
        void qc.invalidateQueries({ queryKey: taskKeys.byApplication(data.applicationId) })
    },
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<TaskResponse>>(`/tasks/${id}/complete`)
      return res.data.data!
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: taskKeys.all })
      if (data.applicationId)
        void qc.invalidateQueries({ queryKey: taskKeys.byApplication(data.applicationId) })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/tasks/${id}`) },
    onSuccess: () => void qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
