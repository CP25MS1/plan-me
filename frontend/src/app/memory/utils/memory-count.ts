import { MemoryItemDto } from '@/api/memory/type';

type AlbumPreviewInfo = {
  imageCount: number;
  videoCount: number;
  coverImage: string | null;
};

export function getMemoryCount(memories: MemoryItemDto[]): AlbumPreviewInfo {
  let imageCount = 0;
  let videoCount = 0;
  let coverImage: string | null = null;

  for (const memory of memories) {
    if (memory.memoryType === 'IMAGE') {
      imageCount++;

      if (!coverImage) {
        coverImage = memory.signedUrl;
      }
    } else if (memory.memoryType === 'VIDEO') {
      videoCount++;
    }
  }

  return {
    imageCount,
    videoCount,
    coverImage,
  };
}
