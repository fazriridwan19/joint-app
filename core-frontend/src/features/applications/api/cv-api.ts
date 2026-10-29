import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api-client'
import type {
  ApiResponse,
  CvAnalysisResponse,
  CvProfileDetailResponse,
  CvProfileResponse,
} from '../../../types/api'

export const cvKeys = {
  all: (applicationId: string) => ['applications', applicationId, 'cv'] as const,
  profiles: (applicationId: string) => [...cvKeys.all(applicationId), 'profiles'] as const,
  detail: (applicationId: string, profileId: string) =>
    [...cvKeys.all(applicationId), 'detail', profileId] as const,
}

function requireData<T>(data: T | null): T {
  if (data === null) throw new Error('Respons server tidak berisi data CV.')
  return data
}

function isProcessing(profile: Pick<CvProfileResponse, 'status'> | Pick<CvProfileDetailResponse, 'status'>) {
  return profile.status === 'PENDING' || profile.status === 'IN_PROGRESS'
}

export function useCvProfiles(applicationId: string) {
  return useQuery({
    queryKey: cvKeys.profiles(applicationId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<CvProfileResponse[]>>(
        `/applications/${applicationId}/cv`,
      )
      return requireData(response.data.data)
    },
    enabled: Boolean(applicationId),
    refetchInterval: (query) =>
      query.state.data?.some(isProcessing) ? 3000 : false,
  })
}

export function useCvProfileDetail(applicationId: string, profileId: string) {
  return useQuery({
    queryKey: cvKeys.detail(applicationId, profileId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<CvProfileDetailResponse>>(
        `/applications/${applicationId}/cv/${profileId}/detail`,
      )
      return requireData(response.data.data)
    },
    enabled: Boolean(applicationId && profileId),
    refetchInterval: (query) =>
      query.state.data && isProcessing(query.state.data) ? 3000 : false,
  })
}

export function useUploadCv(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post<ApiResponse<CvProfileResponse>>(
        `/applications/${applicationId}/cv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return requireData(response.data.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cvKeys.profiles(applicationId) })
    },
  })
}

export function useAnalyzeCv(applicationId: string, profileId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<CvAnalysisResponse>>(
        `/applications/${applicationId}/cv/${profileId}/analyze`,
      )
      return requireData(response.data.data)
    },
    onSuccess: (analysis) => {
      queryClient.setQueryData<CvProfileDetailResponse>(
        cvKeys.detail(applicationId, profileId),
        (profile) => profile
          ? {
              ...profile,
              stage: analysis.stage,
              status: analysis.status,
              summary: analysis.summary,
              strengths: analysis.strengths,
              weaknesses: analysis.weaknesses,
            }
          : profile,
      )
      queryClient.setQueryData<CvProfileResponse[]>(
        cvKeys.profiles(applicationId),
        (profiles) => profiles?.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                stage: analysis.stage,
                status: analysis.status,
                summary: analysis.summary,
                strengths: analysis.strengths,
                weaknesses: analysis.weaknesses,
              }
            : profile,
        ),
      )
      void queryClient.invalidateQueries({ queryKey: cvKeys.profiles(applicationId) })
      void queryClient.invalidateQueries({ queryKey: cvKeys.detail(applicationId, profileId) })
    },
  })
}
