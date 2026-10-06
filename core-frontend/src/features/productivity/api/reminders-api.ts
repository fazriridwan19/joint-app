import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, ReminderRequest, ReminderResponse } from '../../../types/api'

export const reminderKeys = {
  all: ['reminders'] as const,
  list: (pending: boolean, page: number) => [...reminderKeys.all, 'list', pending, page] as const,
}

export function useReminders(pending = true, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: reminderKeys.list(pending, page),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ReminderResponse[]>>('/reminders', {
        params: { pending, page, page_size: pageSize },
      })
      return res.data
    },
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ReminderRequest) => {
      const res = await api.post<ApiResponse<ReminderResponse>>('/reminders', body)
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}

export function useUpdateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: { type?: string; dueAt?: string; message?: string }
    }) => {
      const res = await api.patch<ApiResponse<ReminderResponse>>(`/reminders/${id}`, body)
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}

export function useCompleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse<ReminderResponse>>(`/reminders/${id}/complete`)
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}

export function useSnoozeReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, snoozedUntil }: { id: string; snoozedUntil: string }) => {
      const res = await api.post<ApiResponse<ReminderResponse>>(`/reminders/${id}/snooze`, {
        snoozedUntil,
      })
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}

export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/reminders/${id}`) },
    onSuccess: () => void qc.invalidateQueries({ queryKey: reminderKeys.all }),
  })
}
