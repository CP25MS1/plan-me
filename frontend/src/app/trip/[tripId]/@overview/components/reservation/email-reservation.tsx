'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactNode, ElementType, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Building,
  Bus,
  Car,
  Copy,
  Eye,
  Mail,
  Plane,
  Ship,
  Train,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { BackButton } from '@/components/button';
import { useGetReservationEmailInfo } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-reservation-email-info';
import { useGetPreviewsReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-previews-reservation';
import { ReservationDto, ReservationEmailInfo, ReservationType } from '@/api/reservations/type';
import { useCreateReservationBulk } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-create-reservation-bulk';
import { useReadEmailInbox } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-read-email-inbox';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
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
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

interface EmailReservationProps {
  open: boolean;
  onClose: () => void;
}

type EmailStep = 'select' | 'edit' | 'preview';

interface EmailItem extends ReservationEmailInfo {
  receivedAt: string;
  type: ReservationType | '';
  error?: boolean;
  prefillReservation?: ReservationDto | null;
}

interface EditableEmailReservation {
  key: string;
  emailId: number;
  subject: string;
  receivedAt: string;
  type: ReservationType;
  typeValue: UiReservationType;
  formData: ReservationDto | null;
  passengers: FlightPassengerFormValue[];
  errors: Record<string, boolean>;
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
const icons: Record<ReservationType, ReactNode> = {
  LODGING: <Building size={18} color="#25CF7A" />,
  RESTAURANT: <Utensils size={18} color="#25CF7A" />,
  FLIGHT: <Plane size={18} color="#25CF7A" />,
  TRAIN: <Train size={18} color="#25CF7A" />,
  BUS: <Bus size={18} color="#25CF7A" />,
  FERRY: <Ship size={18} color="#25CF7A" />,
  CAR_RENTAL: <Car size={18} color="#25CF7A" />,
};

const isReservationRecord = (value: unknown): value is Partial<ReservationDto> => {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  return (
    'details' in record ||
    'bookingRef' in record ||
    'contactEmail' in record ||
    'contactTel' in record ||
    'cost' in record
  );
};

const extractPrefillReservation = (
  emailInfo: ReservationEmailInfo,
  selectedType: ReservationType
): ReservationDto | null => {
  const record = emailInfo as ReservationEmailInfo & Record<string, unknown>;
  const candidates = [record.reservation, record.previewReservation, record.data, record];

  for (const candidate of candidates) {
    if (!isReservationRecord(candidate)) continue;

    return {
      ...(candidate as ReservationDto),
      type: ((candidate as ReservationDto).type ?? selectedType) as ReservationType,
    };
  }

  return null;
};

export default function EmailReservation({ open, onClose }: EmailReservationProps) {
  const { tripId: tripIdParam } = useParams<{ tripId: string }>();
  const tripId = Number(tripIdParam);
  const { t } = useTranslation('trip_overview');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [step, setStep] = useState<EmailStep>('select');
  const [editableReservations, setEditableReservations] = useState<EditableEmailReservation[]>([]);
  const { refetch: refetchEmailInfos, isFetching } = useGetReservationEmailInfo(tripId);
  const { data: existingReservations = [] } = useTripReservations(tripId);

  useTripAddPresenceEffect({ tripId, enabled: open, section: 'OVERVIEW_RESERVATIONS' });

  const [copiedAlert, setCopiedAlert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editableContainerRef = useRef<HTMLDivElement>(null);
  const editableFieldRefs = useRef<Record<string, Record<string, HTMLDivElement | null>>>({});
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmails([]);
    setStep('select');
    setEditableReservations([]);
    setPreviewReservations([]);
    editableFieldRefs.current = {};
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
  };

  const checkEmails = async () => {
    setEmails([]);
    setStep('select');
    setEditableReservations([]);
    setPreviewReservations([]);
    editableFieldRefs.current = {};

    const { data } = await refetchEmailInfos();
    if (!data) return;

    setEmails(
      data.map((email) => ({
        ...email,
        receivedAt: dayjs(email.sentAt.replace(' ICT', '')).fromNow(),
        type: '',
        prefillReservation: null,
      }))
    );
  };

  const removeEmail = (index: number) => {
    setEmails((prev) => prev.filter((_, emailIndex) => emailIndex !== index));
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
    duration?: number;
  }>({ open: false, message: '', severity: 'error' });

  const showErrorSnackbar = (error: unknown) => {
    if (!(error instanceof AxiosError)) return;
    const thMessage = error.response?.data?.message?.TH;
    if (typeof thMessage === 'string') {
      setSnackbar({ open: true, message: thMessage, severity: 'error' });
    }
  };

  const handleTypeChange = (index: number, value: ReservationType) => {
    setEmails((prev) =>
      prev.map((item, emailIndex) =>
        emailIndex === index
          ? {
              ...item,
              error: false,
              type: value,
              prefillReservation: extractPrefillReservation(item, value),
            }
          : item
      )
    );
  };

  const { mutateAsync: getPreviews, isPending } = useGetPreviewsReservation();
  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  const buildEditableReservations = (
    items: EmailItem[],
    reservationsByEmailId: Record<number, ReservationDto>
  ) => {
    editableFieldRefs.current = {};
    setEditableReservations(
      items.map((item, index) => {
        const reservation = reservationsByEmailId[item.emailId];

        return {
          key: `${item.emailId}-${index}`,
          emailId: item.emailId,
          subject: item.subject,
          receivedAt: item.receivedAt,
          type: reservation.type,
          typeValue: reservationTypeToUiType(reservation.type),
          formData: mergeReservationWithDetails(reservation),
          passengers: reservation.type === 'FLIGHT' ? getFlightPassengers(reservation) : [],
          errors: {},
        };
      })
    );
    setStep('edit');
  };

  const handleFetchPreviewData = async () => {
    let hasError = false;
    const updatedEmails = emails.map((item) => {
      if (!item.type) {
        hasError = true;
        return { ...item, error: true };
      }
      return { ...item, error: false };
    });

    setEmails(updatedEmails);

    if (hasError) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก',
        severity: 'error',
        duration: 5000,
      });
      return;
    }

    const reservationsByEmailId: Record<number, ReservationDto> = {};
    const missingPrefill = updatedEmails.filter((item) => {
      if (item.prefillReservation) {
        reservationsByEmailId[item.emailId] = item.prefillReservation;
        return false;
      }
      return true;
    });

    try {
      if (missingPrefill.length > 0) {
        const fetchedReservations = await getPreviews({
          tripId,
          emails: missingPrefill.map((item) => ({
            emailId: item.emailId,
            type: item.type as ReservationType,
          })),
        });

        missingPrefill.forEach((item, index) => {
          reservationsByEmailId[item.emailId] = fetchedReservations[index];
        });
      }

      buildEditableReservations(updatedEmails, reservationsByEmailId);
    } catch (error) {
      showErrorSnackbar(error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก',
        severity: 'error',
        duration: 5000,
      });
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

  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk(tripId);
  const { mutateAsync: readEmailInbox } = useReadEmailInbox();

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
      setSnackbar({
        open: true,
        message: 'เพิ่มข้อมูลการจองสำเร็จ',
        severity: 'success',
      });
      setStep('select');
      onClose();
      await readEmailInbox({ emailIds: emails.map((email) => email.emailId) });
      refetchEmailInfos();
    } catch (error) {
      showErrorSnackbar(error);
    }
  };

  const selectedCount = emails.filter((email) => email.type && !email.error).length;
  const isAllSelected = emails.length > 0 && emails.every((email) => !!email.type);
  const previewCards = editableReservations.flatMap((reservation, reservationIndex) => {
    const previewReservation = buildReservationFromForm(
      tripId,
      reservation.typeValue,
      reservation.formData!,
      reservation.passengers
    );

    if (reservation.typeValue === 'Flight') {
      return reservation.passengers.map((_, passengerIndex) => ({
        key: `${reservation.key}-${passengerIndex}`,
        content: renderReservationCard('FLIGHT', previewReservation, passengerIndex),
      }));
    }

    return [
      {
        key: `${reservation.key}-${reservationIndex}`,
        content: renderReservationCard(previewReservation.type, previewReservation),
      },
    ];
  });

  return (
    <>
      <Dialog
        open={open && step === 'select'}
        onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
        fullWidth
        PaperProps={{ sx: { width: 720, height: 600, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          ส่งต่อข้อมูลการจองผ่านอีเมล
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              border: '1px solid #d0d0d0',
              px: 1.5,
              py: 1,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                flexGrow: 1,
                color: 'grey.700',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              cp25ms1+{tripId}@gmail.com
            </Typography>
            <Tooltip title="Copy">
              <IconButton
                onClick={() => copyToClipboard(`cp25ms1+${tripId}@gmail.com`)}
                size="small"
              >
                <Copy size={18} />
              </IconButton>
            </Tooltip>
          </Box>
          <Button
            variant="contained"
            startIcon={!isFetching && <Mail size={18} />}
            onClick={checkEmails}
            disabled={isFetching || isPending}
            sx={{ mb: 2, bgcolor: '#25CF7A', minWidth: 180, position: 'relative' }}
          >
            <span style={{ visibility: isFetching ? 'hidden' : 'visible' }}>
              เช็คอีเมลที่เข้ามา
            </span>
            {isFetching && (
              <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />
            )}
          </Button>
          {emails.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography variant="subtitle2">
                อีเมล ({selectedCount}/{emails.length})
              </Typography>
            </Box>
          )}
          <Box
            ref={containerRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {emails.map((item, index) => (
              <Box
                key={item.emailId}
                sx={{
                  border: item.error ? '2px solid red' : '1px solid grey',
                  borderRadius: 2,
                  p: 2,
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={() => removeEmail(index)}
                  sx={{ position: 'absolute', right: 0, top: 0 }}
                  size="small"
                >
                  <Trash2 size={18} />
                </IconButton>
                <Typography>{item.subject}</Typography>
                <Typography sx={{ fontSize: 12, color: 'grey.600' }}>{item.receivedAt}</Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    value={item.type || ''}
                    displayEmpty
                    onChange={(e) => handleTypeChange(index, e.target.value as ReservationType)}
                    error={!!item.error}
                    renderValue={(selected) =>
                      selected ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {icons[selected as keyof typeof icons]}
                          {t(`EmailReservation.Type.${selected}`)}
                        </Box>
                      ) : (
                        t('ManualReservation.placeholder')
                      )
                    }
                  >
                    {types.map((type) => {
                      const IconComp = {
                        LODGING: Building,
                        RESTAURANT: Utensils,
                        FLIGHT: Plane,
                        TRAIN: Train,
                        BUS: Bus,
                        FERRY: Ship,
                        CAR_RENTAL: Car,
                      }[type] as ElementType;
                      return (
                        <MenuItem key={type} value={type} className="flex items-center gap-3">
                          <IconComp size={18} color="#25CF7A" />
                          {t(`EmailReservation.Type.${type}`)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={!isPending && <Eye size={18} />}
              onClick={handleFetchPreviewData}
              disabled={isPending || !isAllSelected}
              sx={{
                bgcolor: isAllSelected ? '#25CF7A' : 'grey.400',
                minWidth: 150,
                position: 'relative',
              }}
            >
              <span style={{ visibility: isPending ? 'hidden' : 'visible' }}>แสดงตัวอย่าง</span>
              {isPending && (
                <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open && step === 'edit'}
        onClose={(_, reason) => reason !== 'backdropClick' && onClose()}
        fullWidth
        PaperProps={{ sx: { width: 560, height: 640, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setStep('select')} />
          </Box>
          ข้อมูลการจองจากอีเมล
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent ref={editableContainerRef} sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {editableReservations.map((reservation) => {
                const TypeIcon = {
                  LODGING: Building,
                  RESTAURANT: Utensils,
                  FLIGHT: Plane,
                  TRAIN: Train,
                  BUS: Bus,
                  FERRY: Ship,
                  CAR_RENTAL: Car,
                }[reservation.type];
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
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                          {reservation.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reservation.receivedAt}
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
                          {t(`EmailReservation.Type.${reservation.type}`)}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Eye size={18} />}
              onClick={handlePreview}
              sx={{ bgcolor: '#25CF7A', minWidth: 150, position: 'relative' }}
            >
              ยืนยันข้อมูลการจอง
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
          ตัวอย่างข้อมูลการจอง
          <IconButton
            onClick={() => setStep('edit')}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="subtitle2">
              อีเมล ({previewCards.length}/{previewCards.length})
            </Typography>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {previewCards.map((card) => (
              <Box key={card.key}>{card.content}</Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={isCreating}
              sx={{ bgcolor: '#25CF7A', minWidth: 120, position: 'relative' }}
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
        open={copiedAlert}
        message="เพิ่มข้อมูลการจองสำเร็จ"
        severity="success"
        onClose={() => setCopiedAlert(false)}
      />
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={snackbar.duration}
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
