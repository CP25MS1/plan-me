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
import {
  Building,
  Utensils,
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Eye,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
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
import DynamicReservationFields from './shared/dynamic-reservation-fields';
import FlightPassengerFields from './shared/flight-passenger-fields';
import {
  buildReservationFromForm,
  getFlightPassengers,
  hasAnyDuplicate,
  mergeReservationWithDetails,
  renderReservationCard,
  reservationTypeToUiType,
  type FlightPassengerFormValue,
  type UiReservationType,
  validateReservationForm,
} from './shared/reservation-utils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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

type UploadStep = 'select' | 'edit' | 'preview';

interface FileItem {
  file: File;
  type: ReservationType | '';
  error: boolean;
}

interface EditableUploadReservation {
  key: string;
  file: File;
  type: ReservationType;
  typeValue: UiReservationType;
  formData: ReservationDto | null;
  passengers: FlightPassengerFormValue[];
  errors: Record<string, boolean>;
}

export default function UploadReservation({ open, onClose }: UploadReservationProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [step, setStep] = useState<UploadStep>('select');
  const [editableReservations, setEditableReservations] = useState<EditableUploadReservation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const editableContainerRef = useRef<HTMLDivElement>(null);
  const editableFieldRefs = useRef<Record<string, Record<string, HTMLDivElement | null>>>({});
  const { t } = useTranslation('trip_overview');
  const { tripId: tripIdParam } = useParams<{ tripId: string }>();
  const tripId = Number(tripIdParam);
  const { data: existingReservations = [] } = useTripReservations(tripId);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFiles([]);
    setStep('select');
    setEditableReservations([]);
    setPreviewReservations([]);
    editableFieldRefs.current = {};
  }, [open]);

  const { mutateAsync: previewFiles, isPending: isPreviewing } =
    useGetPreviewReservationsFromFiles();
  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk(tripId);
  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  useTripAddPresenceEffect({ tripId, enabled: open, section: 'OVERVIEW_RESERVATIONS' });

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
    const thMessage = error.response?.data?.message?.TH;
    if (typeof thMessage === 'string') {
      setSnackbar({ open: true, message: thMessage, severity: 'error' });
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    if (
      selectedFiles.some(
        (file) => !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)
      )
    ) {
      setSnackbar({
        open: true,
        message: 'โปรดอัปโหลดไฟล์ประเภท .pdf, .png, .jpg, .jpeg',
        severity: 'error',
      });
      return;
    }
    const totalSize =
      files.reduce((size, item) => size + item.file.size, 0) +
      selectedFiles.reduce((size, file) => size + file.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'ขนาดไฟล์รวมต้องไม่เกิน 20 MB',
        severity: 'error',
      });
      return;
    }
    setFiles((prev) => [
      ...prev,
      ...selectedFiles.map((file) => ({ file, type: '' as const, error: false })),
    ]);
    e.target.value = '';
  };

  const handleFetchPreviewData = async () => {
    const updated = files.map((file) => (file.type ? file : { ...file, error: true }));
    setFiles(updated);

    if (updated.some((file) => file.error)) {
      if (containerRef.current) {
        const index = updated.findIndex((file) => file.error);
        (containerRef.current.children[index] as HTMLElement)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    try {
      const reservations = await previewFiles({
        tripId,
        types: updated.map((file) => file.type as ReservationType),
        files: updated.map((file) => file.file),
      });

      editableFieldRefs.current = {};
      setEditableReservations(
        reservations.map((reservation, index) => ({
          key: `${updated[index].file.name}-${index}`,
          file: updated[index].file,
          type: reservation.type,
          typeValue: reservationTypeToUiType(reservation.type),
          formData: mergeReservationWithDetails(reservation),
          passengers: reservation.type === 'FLIGHT' ? getFlightPassengers(reservation) : [],
          errors: {},
        }))
      );
      setStep('edit');
    } catch (err) {
      showErrorSnackbar(err);
    }
  };

  const scrollToFirstError = (itemKey: string, fieldName: string | null) => {
    if (!fieldName) return;

    const field = editableFieldRefs.current[itemKey]?.[fieldName];
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    editableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateEditableReservations = () => {
    let firstItemKey: string | null = null;
    let firstFieldName: string | null = null;

    const updatedReservations = editableReservations.map((reservation) => {
      const validation = validateReservationForm(
        reservation.typeValue,
        reservation.formData,
        reservation.passengers
      );

      if (!firstItemKey && validation.firstError) {
        firstItemKey = reservation.key;
        firstFieldName = validation.firstError;
      }

      return {
        ...reservation,
        errors: validation.errors,
      };
    });

    setEditableReservations(updatedReservations);

    if (firstItemKey && firstFieldName) {
      scrollToFirstError(firstItemKey, firstFieldName);
    }

    return updatedReservations.every((reservation) => Object.keys(reservation.errors).length === 0);
  };

  const handleFormChange = (reservationKey: string, name: string, value: string) => {
    setEditableReservations((prev) =>
      prev.map((reservation) =>
        reservation.key === reservationKey
          ? {
              ...reservation,
              formData: { ...(reservation.formData ?? {}), [name]: value } as ReservationDto,
              errors: { ...reservation.errors, [name]: false },
            }
          : reservation
      )
    );
  };

  const handlePassengerChange = (
    reservationKey: string,
    passengerIndex: number,
    key: 'passengerName' | 'seatNo',
    value: string
  ) => {
    setEditableReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.key !== reservationKey) return reservation;

        const passengers = reservation.passengers.map((passenger, index) =>
          index === passengerIndex ? { ...passenger, [key]: value } : passenger
        );
        const passengerErrorKey = `passenger-${passengerIndex}`;
        const errors = { ...reservation.errors };
        const updatedPassenger = passengers[passengerIndex];

        if (updatedPassenger.passengerName && updatedPassenger.seatNo) {
          delete errors[passengerErrorKey];
        }

        return {
          ...reservation,
          passengers,
          errors,
        };
      })
    );
  };

  const addPassenger = (reservationKey: string) => {
    setEditableReservations((prev) =>
      prev.map((reservation) =>
        reservation.key === reservationKey
          ? {
              ...reservation,
              passengers: [...reservation.passengers, { passengerName: '', seatNo: '' }],
            }
          : reservation
      )
    );
  };

  const removePassenger = (reservationKey: string, passengerIndex: number) => {
    setEditableReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.key !== reservationKey) return reservation;

        const passengers = reservation.passengers.filter((_, index) => index !== passengerIndex);
        const nextPassengers =
          passengers.length > 0 ? passengers : [{ passengerName: '', seatNo: '' }];
        const errors = Object.fromEntries(
          Object.entries(reservation.errors)
            .filter(([errorKey]) => errorKey !== `passenger-${passengerIndex}`)
            .map(([errorKey, hasError]) => {
              if (!errorKey.startsWith('passenger-')) return [errorKey, hasError];

              const currentIndex = Number(errorKey.replace('passenger-', ''));
              if (currentIndex < passengerIndex) return [errorKey, hasError];
              return [`passenger-${currentIndex - 1}`, hasError];
            })
        );

        return {
          ...reservation,
          passengers: nextPassengers,
          errors,
        };
      })
    );
  };

  const handlePreview = () => {
    if (!validateEditableReservations()) return;

    setPreviewReservations(
      editableReservations.map((reservation) =>
        buildReservationFromForm(
          tripId,
          reservation.typeValue,
          reservation.formData!,
          reservation.passengers
        )
      )
    );
    setStep('preview');
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
      setStep('select');
      onClose();
    } catch (err) {
      showErrorSnackbar(err);
    }
  };

  const selectedCount = files.filter((file) => file.type && !file.error).length;
  const isAllSelected = files.length > 0 && files.every((file) => !!file.type);

  return (
    <>
      <Dialog
        open={open && step === 'select'}
        onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
        fullWidth
        PaperProps={{
          sx: {
            width: 500,
            height: 600,
            borderRadius: 3,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          อัพโหลดข้อมูลการจอง
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
          {files.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                py: 4,
                flexGrow: 1,
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
              <Upload size={50} color="#9e9e9e" />
              <Typography sx={{ fontWeight: 600 }}>กดเพื่ออัพโหลดไฟล์</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>
                รองรับไฟล์ประเภท .pdf, .png, .jpg
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Typography variant="subtitle2">
                  ไฟล์ ({selectedCount}/{files.length})
                </Typography>
              </Box>
              <Box ref={containerRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {files.map((item, index) => (
                  <Box
                    key={`${item.file.name}-${index}`}
                    sx={{
                      border: item.error ? '2px solid red' : '1px solid grey',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      position: 'relative',
                    }}
                  >
                    <IconButton
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
                      }
                      disabled={isPreviewing}
                      sx={{ position: 'absolute', right: 0, top: 0 }}
                      size="small"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                    <Typography sx={{ mb: 1 }}>{item.file.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'green', mb: 1 }}>
                      ขนาด: {(item.file.size / (1024 * 1024)).toFixed(2)} MB | ไฟล์อัพโหลดสมบูรณ์
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={item.type}
                        displayEmpty
                        onChange={(e) =>
                          setFiles((prev) =>
                            prev.map((file, fileIndex) =>
                              fileIndex === index
                                ? { ...file, type: e.target.value as ReservationType, error: false }
                                : file
                            )
                          )
                        }
                        error={item.error}
                        renderValue={(selected) => {
                          if (!selected) return t('UploadReservation.placeholder');
                          const Icon = typeIcons[selected as ReservationType];
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon size={18} color="#25CF7A" />
                              {t(`UploadReservation.Type.${selected}`)}
                            </Box>
                          );
                        }}
                      >
                        {types.map((type) => (
                          <MenuItem key={type} value={type}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              {((Icon) => <Icon size={18} color="#25CF7A" />)(typeIcons[type])}
                              {t(`UploadReservation.Type.${type}`)}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ))}
              </Box>
            </>
          )}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', pb: 1 }}>
            <Button
              variant="contained"
              startIcon={!isPreviewing && <Eye size={18} />}
              onClick={handleFetchPreviewData}
              disabled={!isAllSelected || isPreviewing}
              sx={{ bgcolor: isAllSelected ? '#25CF7A' : 'grey.400', minWidth: 150 }}
            >
              {isPreviewing ? <CircularProgress size={20} color="inherit" /> : 'แสดงตัวอย่าง'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open && step === 'edit'}
        onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
        fullWidth
        PaperProps={{
          sx: {
            width: 520,
            height: 640,
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setStep('select')} />
          </Box>
          ตัวอย่างข้อมูล
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent ref={editableContainerRef} sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {editableReservations.map((reservation) => {
                const TypeIcon = typeIcons[reservation.type];
                const fieldsRef = {
                  current:
                    editableFieldRefs.current[reservation.key] ??
                    (editableFieldRefs.current[reservation.key] = {}),
                };

                return (
                  <Box
                    key={reservation.key}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                          {reservation.file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(reservation.file.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 999,
                          bgcolor: 'action.hover',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <TypeIcon size={18} color="#25CF7A" />
                        <Typography variant="body2">
                          {t(`UploadReservation.Type.${reservation.type}`)}
                        </Typography>
                      </Box>
                    </Box>

                    <DynamicReservationFields
                      typeValue={reservation.typeValue}
                      formData={reservation.formData}
                      errors={reservation.errors}
                      handleChange={(name, value) => handleFormChange(reservation.key, name, value)}
                      fieldsRef={fieldsRef}
                    />
                    <FlightPassengerFields
                      typeValue={reservation.typeValue}
                      passengers={reservation.passengers}
                      errors={reservation.errors}
                      handlePassengerChange={(index, key, value) =>
                        handlePassengerChange(reservation.key, index, key, value)
                      }
                      removePassenger={(index) => removePassenger(reservation.key, index)}
                      addPassenger={() => addPassenger(reservation.key)}
                    />
                  </Box>
                );
              })}
            </Box>
          </LocalizationProvider>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Eye size={18} />}
              onClick={handlePreview}
              sx={{ bgcolor: '#25CF7A', minWidth: 150 }}
            >
              {t('UploadReservation.Button')}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open && step === 'preview'}
        onClose={(_, reason) => reason !== 'backdropClick' && setStep('edit')}
        fullWidth
        PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setStep('edit')} />
          </Box>
          ตัวอย่างข้อมูล
          <IconButton
            onClick={() => setStep('edit')}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="subtitle2">
              ไฟล์ ({previewReservations.length}/{previewReservations.length})
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
            {previewReservations.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {renderReservationCard(item.type, item, index)}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pb: 1 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#25CF7A', minWidth: 120 }}
              onClick={handleConfirm}
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={20} color="inherit" /> : 'ยืนยัน'}
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
      <ConfirmDialog
        open={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        onConfirm={() => {
          setShowDuplicateWarning(false);
          proceedConfirm();
        }}
        confirmLoading={isCreating}
        color="warning"
        content={
          <Box>
            <Typography variant="h6" fontWeight={600} mb={1}>
              {t('ManualReservation.duplicateWarning.title')}
            </Typography>
            <Typography>{t('ManualReservation.duplicateWarning.message')}</Typography>
          </Box>
        }
        confirmLabel={t('ManualReservation.duplicateWarning.accept') as string}
        cancelLabel={t('ManualReservation.duplicateWarning.cancel') as string}
      />
    </>
  );
}
