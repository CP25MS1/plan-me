'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useState, useRef, useEffect, ElementType } from 'react';
import { Building, Utensils, Plane, Train, Bus, Ship, Car, Eye, Trash2, Upload, X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

import { BackButton } from '@/components/button';
import { useGetPreviewReservationsFromFiles } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-preview-reservations-from-files';
import { useCreateReservationBulk } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-create-reservation-bulk';
import { ReservationDto, ReservationType } from '@/api/reservations/type';
import { useParams } from 'next/navigation';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import useTripAddPresenceEffect from '@/app/trip/[tripId]/realtime/hooks/use-trip-add-presence';
import { useTripReservations } from '@/api/trips';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { hasAnyDuplicate, renderReservationCard } from './shared/reservation-utils';

interface UploadReservationProps {
  open: boolean;
  onClose: () => void;
}

const types: ReservationType[] = ['LODGING', 'RESTAURANT', 'FLIGHT', 'TRAIN', 'BUS', 'FERRY', 'CAR_RENTAL'];
const typeIcons: Record<ReservationType, ElementType> = {
  LODGING: Building, RESTAURANT: Utensils, FLIGHT: Plane, TRAIN: Train, BUS: Bus, FERRY: Ship, CAR_RENTAL: Car,
};

interface FileItem {
  file: File;
  type: ReservationType | '';
  error: boolean;
}

export default function UploadReservation({ open, onClose }: UploadReservationProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('trip_overview');
  const { tripId: tripIdParam } = useParams<{ tripId: string }>();
  const tripId = Number(tripIdParam);
  const { data: existingReservations = [] } = useTripReservations(tripId);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (open) { setFiles([]); setShowPreview(false); }
  }, [open]);

  const { mutateAsync: previewFiles, isPending: isPreviewing } = useGetPreviewReservationsFromFiles();
  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk(tripId);
  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  useTripAddPresenceEffect({ tripId, enabled: open, section: 'OVERVIEW_RESERVATIONS' });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'error' });

  const showErrorSnackbar = (error: unknown) => {
    if (!(error instanceof AxiosError)) return;
    const thMessage = error.response?.data?.message?.TH;
    if (typeof thMessage === 'string') setSnackbar({ open: true, message: thMessage, severity: 'error' });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.some(f => !['application/pdf', 'image/png', 'image/jpeg'].includes(f.type))) {
      setSnackbar({ open: true, message: 'โปรดอัปโหลดไฟล์ .pdf, .png, .jpg, .jpeg', severity: 'error' });
      return;
    }
    const totalSize = files.reduce((s, f) => s + f.file.size, 0) + selectedFiles.reduce((s, f) => s + f.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'ขนาดไฟล์รวมต้องไม่เกิน 20 MB', severity: 'error' });
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles.map(f => ({ file: f, type: '' as const, error: false }))]);
    e.target.value = '';
  };

  const handlePreview = async () => {
    let hasErr = false;
    const updated = files.map(f => f.type ? f : { ...f, error: true });
    setFiles(updated);
    if (updated.some(f => f.error)) {
      if (containerRef.current) {
        const idx = updated.findIndex(f => f.error);
        (containerRef.current.children[idx] as HTMLElement)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    try {
      const res = await previewFiles({ tripId, types: updated.map(f => f.type as ReservationType), files: updated.map(f => f.file) });
      setPreviewReservations(res); setShowPreview(true);
    } catch (err) { showErrorSnackbar(err); }
  };

  const handleConfirm = () => {
    if (hasAnyDuplicate(previewReservations, existingReservations)) {
      setShowDuplicateWarning(true);
      return;
    }
    proceedConfirm();
  };

  const proceedConfirm = async () => {
    try {
      await createBulk(previewReservations);
      setShowPreview(false); onClose();
    } catch (err) { showErrorSnackbar(err); }
  };

  const selectedCount = files.filter(f => f.type && !f.error).length;
  const isAllSelected = files.length > 0 && files.every(f => !!f.type);

  return (
    <>
      <Dialog open={open && !showPreview} onClose={(_, reason) => reason !== 'backdropClick' && onClose()} fullWidth PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column' } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          อัพโหลดข้อมูลการจอง
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
          {files.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', py: 4, flexGrow: 1 }} onClick={() => document.getElementById('upload-input')?.click()}>
              <input id="upload-input" type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} multiple onChange={handleFilesChange} />
              <Upload size={50} color="#9e9e9e" /> <Typography sx={{ fontWeight: 600 }}>กดเพื่ออัพโหลดไฟล์</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>รองรับไฟล์ประเภท .pdf, .png, .jpg</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Typography variant="subtitle2">ไฟล์ ({selectedCount}/{files.length})</Typography></Box>
              <Box ref={containerRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {files.map((item, index) => (
                  <Box key={index} sx={{ border: item.error ? '2px solid red' : '1px solid grey', borderRadius: 2, p: 2, mb: 2, position: 'relative' }}>
                    <IconButton onClick={() => setFiles(p => p.filter((_, i) => i !== index))} disabled={isPreviewing} sx={{ position: 'absolute', right: 0, top: 0 }} size="small"><Trash2 size={18} /></IconButton>
                    <Typography sx={{ mb: 1 }}>{item.file.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'green', mb: 1 }}>ขนาด: {(item.file.size / (1024 * 1024)).toFixed(2)} MB | ไฟล์อัพโหลดสมบูรณ์</Typography>
                    <FormControl fullWidth>
                      <Select value={item.type} displayEmpty onChange={(e) => setFiles(p => p.map((f, i) => i === index ? { ...f, type: e.target.value as ReservationType, error: false } : f))} error={item.error}
                        renderValue={(sel) => {
                          if (!sel) return t('UploadReservation.placeholder');
                          const Icon = typeIcons[sel as ReservationType];
                          return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Icon size={18} color="#25CF7A" /> {t(`UploadReservation.Type.${sel}`)}</Box>;
                        }}>
                        {types.map(tType => <MenuItem key={tType} value={tType}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{((Icon) => <Icon size={18} color="#25CF7A" />)(typeIcons[tType])} {t(`UploadReservation.Type.${tType}`)}</Box></MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                ))}
              </Box>
            </>
          )}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', pb: 1 }}>
            <Button variant="contained" startIcon={!isPreviewing && <Eye size={18} />} onClick={handlePreview} disabled={!isAllSelected || isPreviewing} sx={{ bgcolor: isAllSelected ? '#25CF7A' : 'grey.400', minWidth: 150 }}>
              {isPreviewing ? <CircularProgress size={20} color="inherit" /> : t('UploadReservation.Button')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={showPreview} onClose={(_, reason) => reason !== 'backdropClick' && setShowPreview(false)} fullWidth PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}><BackButton onBack={() => setShowPreview(false)} /></Box>
          ตัวอย่างข้อมูล
          <IconButton onClick={() => setShowPreview(false)} sx={{ position: 'absolute', right: 8, top: 8 }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Typography variant="subtitle2">ไฟล์ ({previewReservations.length}/{previewReservations.length})</Typography></Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
            {previewReservations.map((item, index) => <Box key={index} sx={{ mb: 2 }}>{renderReservationCard(item.type, item, index)}</Box>)}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pb: 1 }}>
            <Button variant="contained" sx={{ bgcolor: '#25CF7A', minWidth: 120 }} onClick={handleConfirm} disabled={isCreating}>
              {isCreating ? <CircularProgress size={20} color="inherit" /> : 'ยืนยัน'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))} />
      <ConfirmDialog open={showDuplicateWarning} onClose={() => setShowDuplicateWarning(false)}
        onConfirm={() => { setShowDuplicateWarning(false); proceedConfirm(); }}
        confirmLoading={isCreating} color="warning"
        content={<Box><Typography variant="h6" fontWeight={600} mb={1}>{t('ManualReservation.duplicateWarning.title')}</Typography><Typography>{t('ManualReservation.duplicateWarning.message')}</Typography></Box>}
        confirmLabel={t('ManualReservation.duplicateWarning.accept') as string} cancelLabel={t('ManualReservation.duplicateWarning.cancel') as string} />
    </>
  );
}
