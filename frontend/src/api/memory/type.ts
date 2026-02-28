import { PublicUserInfo } from '@/api/users';

export type MemoryType = 'IMAGE' | 'VIDEO';

export type SupportedFileExtension = 'jpg' | 'jpeg' | 'png' | 'mp4' | 'mov';

// ================= ALBUM =================

export interface AlbumDto {
  albumId: number;
  tripId: number;
  tripName?: string;
  albumName: string;
  memoryCount: number;
  totalSizeBytes: number; // ใช้คำนวณ limit 3GB
  createdAt: string;
  isOwner: boolean; // ใช้ควบคุม rule owner
  thumbnailMemoryId?: number; // ใช้แสดง thumbnail (รูปแรกที่อัปโหลด)
}

export interface CreateAlbumResponseDto {
  album: {
    albumId: number;
    tripId: number;
    name: string;
    createdBy: PublicUserInfo;
    createdAt: string;
  };
  createdMemoriesCount: number;
  memories: MemoryItemDto[];
}

// ================= MEMORY =================

export interface MemoryItemDto {
  id: number;
  albumId: number;
  tripId: number;
  uploader: PublicUserInfo;
  originalFilename: string;
  fileExtension: SupportedFileExtension;
  contentType: string;
  memoryType: MemoryType;
  sizeBytes: number; // ใช้ตรวจ 1GB
  createdAt: string;
  signedUrl: string;
  signedUrlExpiresAt: string;
}

export interface UploadMemoriesResponseDto {
  createdCount: number;
  items: MemoryItemDto[];
}

export interface ListAlbumsResponseDto {
  items: AlbumDto[];
  nextCursor?: string;
}

export interface ListMemoriesResponseDto {
  items: MemoryItemDto[];
  nextCursor?: string;
}

export interface RefreshSignedUrlResponseDto {
  memoryId: number;
  signedUrl: string;
  signedUrlExpiresAt: string;
}
