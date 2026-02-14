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
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState, useRef, useEffect, ElementType } from 'react';
import { Building, Utensils, Plane, Train, Bus, Ship, Car } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';
import { BackButton } from '@/components/button';
import { useGetPreviewReservationsFromFiles } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-preview-reservations-from-files';
import { useCreateReservationBulk } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-create-reservation-bulk';
import { ReservationDto, ReservationType } from '@/api/reservations/type';
import { useParams } from 'next/navigation';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';

interface UploadReservationProps {
  open: boolean;
  onClose: () => void;
}

const types: ReservationType[] = [
  'LODGING',
  'RESTAURANT',
  'FLIGHT',
  'TRAIN',
  'BUS',
  'FERRY',
  'CAR_RENTAL',
];

const typeIcons: Record<ReservationType, ElementType> = {
  LODGING: Building,
  RESTAURANT: Utensils,
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
  FERRY: Ship,
  CAR_RENTAL: Car,
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
  const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
  const selectedCount = files.filter((f) => f.type && !f.error).length;
  const isAllSelected = files.length > 0 && files.every((f) => !!f.type);
  const { t } = useTranslation('trip_overview');

  useEffect(() => {
    if (open) {
      setFiles([]);
      setShowPreview(false);
    }
  }, [open]);

  const { tripId } = useParams<{ tripId: string }>();

  const { mutateAsync: previewFiles, isPending: isPreviewing } =
    useGetPreviewReservationsFromFiles();

  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk();

  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const showErrorSnackbar = (error: unknown) => {
    if (!(error instanceof AxiosError)) return;

    const data = error.response?.data;

    if (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as { message?: unknown }).message === 'object' &&
      (data as { message?: unknown }).message !== null
    ) {
      const thMessage = (
        data as {
          message?: { TH?: unknown };
        }
      ).message?.TH;

      if (typeof thMessage === 'string' && thMessage.trim() !== '') {
        setSnackbar({
          open: true,
          message: thMessage,
          severity: 'error',
        });
      }
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    const invalidType = selectedFiles.find((f) => !ALLOWED_TYPES.includes(f.type));

    if (invalidType) {
      setSnackbar({
        open: true,
        message: 'ไม่สามารถอัพโหลดไฟล์ได้',
        severity: 'error',
      });
      return;
    }

    const currentTotalSize = files.reduce((sum, f) => sum + f.file.size, 0);
    const newTotalSize = currentTotalSize + selectedFiles.reduce((sum, f) => sum + f.size, 0);

    if (newTotalSize > MAX_TOTAL_SIZE) {
      setSnackbar({
        open: true,
        message: 'ขนาดไฟล์รวมต้องไม่เกิน 20 MB',
        severity: 'error',
      });
      return;
    }

    const newFiles = selectedFiles.map((f) => ({
      file: f,
      type: '' as const,
      error: false,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, value: ReservationType) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, type: value, error: false } : item))
    );
  };

  const handlePreview = async () => {
    let hasError = false;

    const updatedFiles = files.map((item) => {
      if (!item.type) {
        hasError = true;
        return { ...item, error: true };
      }
      return item;
    });

    setFiles(updatedFiles);

    if (hasError && containerRef.current) {
      const firstErrorIndex = updatedFiles.findIndex((f) => f.error);
      const element = containerRef.current.children[firstErrorIndex] as HTMLElement;
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const result = await previewFiles({
        tripId: Number(tripId),
        types: updatedFiles.map((f) => f.type as ReservationType),
        files: updatedFiles.map((f) => f.file),
      });

      setPreviewReservations(result);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      showErrorSnackbar(err);
    }
  };

  const handleConfirm = async () => {
    try {
      await createBulk(previewReservations);

      setShowPreview(false);
      onClose();
    } catch (err) {
      console.error(err);
      showErrorSnackbar(err);
    }
  };

  const renderCard = (type: ReservationType, data: ReservationDto, index: number) => {
    switch (type) {
      case 'LODGING':
        return <LodgingCard data={data} />;
      case 'RESTAURANT':
        return <RestaurantCard data={data} />;
      case 'FLIGHT':
        return <FlightCard data={data} passengerIndex={index} />;
      case 'TRAIN':
        return <TrainCard data={data} />;
      case 'BUS':
        return <BusCard data={data} />;
      case 'FERRY':
        return <FerryCard data={data} />;
      case 'CAR_RENTAL':
        return <CarRentalCard data={data} />;
    }
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog
        open={open && !showPreview}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          onClose();
        }}
        fullWidth
        PaperProps={{
          sx: {
            width: 500,
            height: 600,
            borderRadius: 3,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          อัพโหลดข้อมูลการจอง
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 2,
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Placeholder */}
          {files.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                py: 4,
                flexGrow: 1,
                borderRadius: 2,
              }}
              onClick={() => document.getElementById('upload-input')?.click()}
            >
              <input
                id="upload-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                multiple
                onChange={handleFilesChange}
              />

              <UploadIcon sx={{ fontSize: 50, color: 'grey.500' }} />
              <Typography sx={{ fontWeight: 600 }}>กดเพื่ออัพโหลดไฟล์</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>
                รองรับไฟล์ประเภท .pdf, .png, .jpg
              </Typography>
            </Box>
          )}
          {files.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography variant="subtitle2">
                ไฟล์ ({selectedCount}/{files.length})
              </Typography>
            </Box>
          )}

          {/* File list */}
          {files.length > 0 && (
            <Box
              ref={containerRef}
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
              }}
            >
              {files.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    border: item.error ? '2px solid red' : '1px solid grey',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    position: 'relative',
                  }}
                >
                  <IconButton
                    onClick={() => removeFile(index)}
                    disabled={isPreviewing}
                    sx={{ position: 'absolute', right: 0, top: 0 }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Typography sx={{ mb: 1 }}>{item.file.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'green', mb: 1 }}>
                    ขนาด: {(item.file.size / (1024 * 1024)).toFixed(2)} MB | ไฟล์อัพโหลดสมบูรณ์
                  </Typography>

                  <FormControl fullWidth>
                    <Select
                      value={item.type}
                      displayEmpty
                      onChange={(e) => handleTypeChange(index, e.target.value as ReservationType)}
                      error={item.error}
                      renderValue={(selected) => {
                        if (!selected) {
                          return t('UploadReservation.placeholder');
                        }

                        const Icon = typeIcons[selected as ReservationType];

                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon size={18} color="#25CF7A" />
                            {t(`UploadReservation.Type.${selected}`)}
                          </Box>
                        );
                      }}
                    >
                      {types.map((tType) => {
                        const Icon = typeIcons[tType];

                        return (
                          <MenuItem key={tType} value={tType}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Icon size={18} color="#25CF7A" />
                              {t(`UploadReservation.Type.${tType}`)}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>
          )}

          {/* Preview button fixed at bottom */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', pb: 1 }}>
            <Button
              variant="contained"
              startIcon={!isPreviewing && <VisibilityIcon />}
              onClick={handlePreview}
              disabled={!isAllSelected || isPreviewing}
              sx={{
                bgcolor: isAllSelected ? '#25CF7A' : 'grey.400',
                minWidth: 150,
                position: 'relative',
                '&:hover': {
                  bgcolor: isAllSelected ? '#25CF7A' : 'grey.400',
                },
              }}
            >
              <span style={{ visibility: isPreviewing ? 'hidden' : 'visible' }}>
                {t('UploadReservation.Button')}
              </span>

              {isPreviewing && (
                <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          setShowPreview(false);
        }}
        fullWidth
        PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setShowPreview(false)} />
          </Box>
          ตัวอย่างข้อมูล
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          ></IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 0,
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="subtitle2">
              ไฟล์ ({previewReservations.length}/{previewReservations.length})
            </Typography>
          </Box>

          {/* List ของไฟล์ / Card */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
            {previewReservations.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {renderCard(item.type, item, index)}
              </Box>
            ))}
          </Box>

          {/* ปุ่มยืนยันด้านล่าง */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pb: 1 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#25CF7A',
                minWidth: 120,
                position: 'relative',
              }}
              onClick={handleConfirm}
              disabled={isCreating}
            >
              <span style={{ visibility: isCreating ? 'hidden' : 'visible' }}>ยืนยัน</span>

              {isCreating && (
                <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
