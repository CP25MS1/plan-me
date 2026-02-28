'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { useUploadMemories } from '../hooks/use-upload-memories';
import {
  getFileExtension,
  isSupportedExtension,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
} from '../utils/file';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: number;
  existingTotalBytes: number;
}

export default function UploadMemoryDialog({ open, onClose, tripId, existingTotalBytes }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useUploadMemories();

  const validate = (): boolean => {
    let total = existingTotalBytes;

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`ไฟล์ ${file.name} เกิน 1GB`);
        return false;
      }

      const ext = getFileExtension(file.name);
      if (!isSupportedExtension(ext)) {
        setError(`ไฟล์ ${file.name} ไม่รองรับประเภทนี้`);
        return false;
      }

      total += file.size;
    }

    if (total > MAX_TOTAL_BYTES) {
      setError('ขนาดรวมของทริปเกิน 3GB');
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    setError(null);
    if (!validate()) return;

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    await mutateAsync({ tripId, formData });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>เพิ่มความทรงจำ</DialogTitle>

      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          variant="contained"
          disabled={isPending || files.length === 0}
          onClick={handleUpload}
        >
          อัปโหลด
        </Button>
      </DialogActions>
    </Dialog>
  );
}
