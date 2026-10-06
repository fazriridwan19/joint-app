import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, NoteRequest, NoteResponse } from '../../../types/api'

export const noteKeys = {
  byApplication: (applicationId: string) => ['notes', applicationId] as const,
}

export function useNotes(applicationId: string) {
  return useQuery({
    queryKey: noteKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<NoteResponse[]>>(
        `/applications/${applicationId}/notes`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateNote(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: NoteRequest) => {
      const res = await api.post<ApiResponse<NoteResponse>>(
        `/applications/${applicationId}/notes`,
        body,
      )
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: noteKeys.byApplication(applicationId) })
    },
  })
}

export function useUpdateNote(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ noteId, body }: { noteId: string; body: NoteRequest }) => {
      const res = await api.patch<ApiResponse<NoteResponse>>(`/notes/${noteId}`, body)
      return res.data.data!
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: noteKeys.byApplication(applicationId) })
    },
  })
}

export function useDeleteNote(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/notes/${noteId}`)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: noteKeys.byApplication(applicationId) })
    },
  })
}
