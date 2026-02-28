import { SupportedFileExtension } from '@/api/memory/type';

export const MAX_FILE_BYTES = 1_000_000_000; // 1GB
export const MAX_TOTAL_BYTES = 3_000_000_000; // 3GB

export const SUPPORTED_EXTENSIONS: SupportedFileExtension[] = ['jpg', 'jpeg', 'png', 'mp4', 'mov'];

export function getFileExtension(filename: string): string | undefined {
  const ext = filename.split('.').pop();
  return ext?.toLowerCase();
}

export function isSupportedExtension(ext: string | undefined): ext is SupportedFileExtension {
  return typeof ext === 'string' && SUPPORTED_EXTENSIONS.includes(ext as SupportedFileExtension);
}
