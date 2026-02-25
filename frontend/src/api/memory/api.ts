import { AxiosResponse } from 'axios';
import { apiClient } from '@/api/client';
import {
  CreateAlbumResponseDto,
  UploadMemoriesResponseDto,
  ListAlbumsResponseDto,
  ListMemoriesResponseDto,
  RefreshSignedUrlResponseDto,
  SupportedFileExtension,
} from './type';

// ================= CREATE ALBUM =================

export const createTripAlbum = async (
  tripId: number,
  formData: FormData
): Promise<CreateAlbumResponseDto> => {
  const response: AxiosResponse<CreateAlbumResponseDto> =
    await apiClient.post<CreateAlbumResponseDto>(`/trips/${tripId}/album`, formData);

  return response.data;
};

// ================= DELETE ALBUM =================

export const deleteTripAlbum = async (tripId: number): Promise<void> => {
  await apiClient.delete<void>(`/trips/${tripId}/album`);
};

// ================= UPLOAD MEMORIES =================

export const uploadMemories = async (
  tripId: number,
  formData: FormData
): Promise<UploadMemoriesResponseDto> => {
  const response: AxiosResponse<UploadMemoriesResponseDto> =
    await apiClient.post<UploadMemoriesResponseDto>(`/trips/${tripId}/album/memories`, formData);

  return response.data;
};

// ================= DELETE MEMORIES =================

export const deleteMemories = async (tripId: number, memoryIds: number[]): Promise<void> => {
  await apiClient.delete<void>(`/trips/${tripId}/album/memories`, {
    data: { memoryIds },
  });
};

// ================= LIST MY ACCESSIBLE ALBUMS =================

export const getMyAccessibleAlbums = async (
  limit?: number,
  cursor?: string
): Promise<ListAlbumsResponseDto> => {
  const response: AxiosResponse<ListAlbumsResponseDto> = await apiClient.get<ListAlbumsResponseDto>(
    `/albums/me`,
    {
      params: {
        ...(limit !== undefined && { limit }),
        ...(cursor !== undefined && { cursor }),
      },
    }
  );

  return response.data;
};

// ================= LIST MEMORIES =================

export const getMemoriesInAlbum = async (
  tripId: number,
  params?: {
    extensions?: SupportedFileExtension[];
    limit?: number;
    cursor?: string;
  }
): Promise<ListMemoriesResponseDto> => {
  const response: AxiosResponse<ListMemoriesResponseDto> =
    await apiClient.get<ListMemoriesResponseDto>(`/trips/${tripId}/album/memories`, {
      params: {
        ...(params?.extensions && { extensions: params.extensions }),
        ...(params?.limit !== undefined && { limit: params.limit }),
        ...(params?.cursor !== undefined && { cursor: params.cursor }),
      },
    });

  return response.data;
};

// ================= REFRESH SIGNED URL =================

export const refreshMemorySignedUrl = async (
  tripId: number,
  memoryId: number,
  extension?: SupportedFileExtension
): Promise<RefreshSignedUrlResponseDto> => {
  const response: AxiosResponse<RefreshSignedUrlResponseDto> =
    await apiClient.get<RefreshSignedUrlResponseDto>(
      `/trips/${tripId}/album/memories/${memoryId}/signed-url`,
      {
        params: {
          ...(extension !== undefined && { extension }),
        },
      }
    );

  return response.data;
};
