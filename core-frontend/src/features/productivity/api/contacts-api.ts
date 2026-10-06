import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type { ApiResponse, ContactRequest, ContactResponse } from '../../../types/api'

export const contactKeys = {
  all: ['contacts'] as const,
  list: (q: string) => [...contactKeys.all, 'list', q] as const,
  detail: (id: string) => [...contactKeys.all, 'detail', id] as const,
  byApplication: (applicationId: string) => ['contacts', 'application', applicationId] as const,
}

export function useContacts(q = '') {
  return useQuery({
    queryKey: contactKeys.list(q),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContactResponse[]>>('/contacts', { params: { q } })
      return res.data.data ?? []
    },
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContactResponse>>(`/contacts/${id}`)
      return res.data.data
    },
    enabled: Boolean(id),
  })
}

export function useApplicationContacts(applicationId: string) {
  return useQuery({
    queryKey: contactKeys.byApplication(applicationId),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ContactResponse[]>>(
        `/applications/${applicationId}/contacts`,
      )
      return res.data.data ?? []
    },
    enabled: Boolean(applicationId),
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ContactRequest) => {
      const res = await api.post<ApiResponse<ContactResponse>>('/contacts', body)
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: ContactRequest) => {
      const res = await api.patch<ApiResponse<ContactResponse>>(`/contacts/${id}`, body)
      return res.data.data!
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/contacts/${id}`) },
    onSuccess: () => void qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useAssociateContact(applicationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (contactId: string) => {
      await api.post(`/applications/${applicationId}/contacts`, null, { params: { contactId } })
    },
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: contactKeys.byApplication(applicationId) }),
  })
}
