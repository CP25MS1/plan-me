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

  const errorMessageMap: Record<number, string> = {
    400: 'โปรดตรวจสอบข้อมูลอีกครั้ง',
    403: 'คุณไม่มีสิทธิ์ในการดูข้อมูลของทริปนี้',
    404: 'ไม่พบทริปนี้ในระบบ',
    500: 'เกิดข้อผิดพลาด หรือเนื้อหาในไฟล์ไม่สอดคล้องกับประเภทการจองที่เลือก',
  };

  const showErrorSnackbar = (error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      const message = (status && errorMessageMap[status]) || 'เกิดข้อผิดพลาดบางอย่าง';

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });

      return;
    }

    setSnackbar({
      open: true,
      message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
      severity: 'error',
    });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      file: f,
      type: '' as const,
      error: false,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
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
                style={{ display: 'none' }}
                multiple
                onChange={handleFilesChange}
              />
              <UploadIcon sx={{ fontSize: 50, color: 'grey.500' }} />
              <Typography sx={{ fontWeight: 600 }}>ลากหรือวางไฟล์ที่นี่</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                หรือคลิกเพื่อเลือกไฟล์จากอุปกรณ์
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>
                รองรับไฟล์ประเภท .pdf, .png, .jpg, .jpeg
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
                          return <Typography color="grey.500">เลือกประเภทข้อมูลการจอง</Typography>;
                        }

                        const Icon = typeIcons[selected as ReservationType];

                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon size={18} color="#25CF7A" />
                            {selected}
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        เลือกประเภทข้อมูลการจอง
                      </MenuItem>
                      {types.map((t) => {
                        const Icon = typeIcons[t];

                        return (
                          <MenuItem key={t} value={t}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Icon size={18} color="#25CF7A" />
                              {t}
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
              startIcon={<VisibilityIcon />}
              onClick={handlePreview}
              disabled={files.length === 0 || isPreviewing}
            >
              {isPreviewing ? 'กำลังโหลด...' : 'แสดงตัวอย่าง'}
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
          >
            <CloseIcon />
          </IconButton>
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
              sx={{ bgcolor: '#25CF7A' }}
              onClick={handleConfirm}
              disabled={isCreating}
            >
              {isCreating ? 'กำลังบันทึก...' : 'ยืนยัน'}
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
