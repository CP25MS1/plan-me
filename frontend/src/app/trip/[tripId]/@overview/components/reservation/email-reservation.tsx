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
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ReactNode, ElementType, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Building, Bus, Car, Plane, Ship, Train, Utensils } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { BackButton } from '@/components/button';
import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';
import { useGetReservationEmailInfo } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-reservation-email-info';
import { useGetPreviewsReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-previews-reservation';
import { ReservationDto, ReservationType } from '@/api/reservations/type';
import { useCreateReservationBulk } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-create-reservation-bulk';
import { useReadEmailInbox } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-read-email-inbox';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(relativeTime);

interface EmailReservationProps {
  open: boolean;
  onClose: () => void;
}

interface EmailItem {
  emailId: number;
  subject: string;
  receivedAt: string;
  type: ReservationType | '';
  error?: boolean;
}

const types = ['LODGING', 'RESTAURANT', 'FLIGHT', 'TRAIN', 'BUS', 'FERRY', 'CAR_RENTAL'];
const icons: Record<ReservationType, ReactNode> = {
  LODGING: <Building size={18} color="#25CF7A" />,
  RESTAURANT: <Utensils size={18} color="#25CF7A" />,
  FLIGHT: <Plane size={18} color="#25CF7A" />,
  TRAIN: <Train size={18} color="#25CF7A" />,
  BUS: <Bus size={18} color="#25CF7A" />,
  FERRY: <Ship size={18} color="#25CF7A" />,
  CAR_RENTAL: <Car size={18} color="#25CF7A" />,
};

export default function EmailReservation({ open, onClose }: EmailReservationProps) {
  const { tripId } = useParams<{ tripId: string }>();
  const { t } = useTranslation('trip_overview');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const { refetch: refetchEmailInfos, isFetching } = useGetReservationEmailInfo(Number(tripId));

  const resetEmailSelection = () => {
    setEmails([]);
    setSelectedTypes({});
    setShowPreview(false);
  };

  const [showPreview, setShowPreview] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Record<number, ReservationType>>({});
  const [copiedAlert, setCopiedAlert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setEmails([]);
      setShowPreview(false);
      setSelectedTypes({});
    }
  }, [open]);

  /* COPY EMAIL */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
  };

  /* FETCH EMAILS */
  const checkEmails = async () => {
    resetEmailSelection();
    const { data } = await refetchEmailInfos();
    if (!data) return;

    setEmails(
      data.map((e) => {
        const cleanedDate = e.sentAt.replace(' ICT', '');

        return {
          emailId: e.emailId,
          subject: e.subject,
          receivedAt: dayjs(cleanedDate).fromNow(),
          type: '',
        };
      })
    );
  };

  /* DELETE */
  const removeEmail = (index: number) => {
    setEmails((prev) => prev.filter((_, i) => i !== index));

    setSelectedTypes((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
    duration?: number;
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

  const isAllSelected = emails.length > 0 && emails.every((_, index) => !!selectedTypes[index]);

  const handleTypeChange = (index: number, value: ReservationType) => {
    setSelectedTypes((prev) => ({ ...prev, [index]: value }));

    setEmails((prev) =>
      prev.map((item, i) => (i === index ? { ...item, error: false, type: value } : item))
    );
  };

  // Preview Email
  const { mutateAsync: getPreviews, isPending } = useGetPreviewsReservation();
  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  const handlePreview = async () => {
    let hasError = false;

    const updated = emails.map((item, i) => {
      if (!selectedTypes[i]) {
        hasError = true;
        return { ...item, error: true };
      }
      return { ...item, error: false };
    });

    setEmails(updated);

    if (hasError) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก',
        severity: 'error',
        duration: 5000,
      });

      if (containerRef.current) {
        const firstError = updated.findIndex((e) => e.error);
        const element = containerRef.current.children[firstError] as HTMLElement;
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return;
    }

    try {
      const payload = emails.map((e, i) => ({
        emailId: e.emailId,
        type: selectedTypes[i],
      }));

      const result = await getPreviews({
        tripId: Number(tripId),
        emails: payload,
      });

      setPreviewReservations(result);
      setShowPreview(true);
    } catch {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก',
        severity: 'error',
        duration: 5000,
      });
    }
  };

  // Confirm Create
  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk();
  const { mutateAsync: readEmailInbox } = useReadEmailInbox();

  const handleConfirm = async () => {
    try {
      await createBulk(previewReservations);

      setSnackbar({
        open: true,
        message: 'เพิ่มข้อมูลการจองสำเร็จ',
        severity: 'success',
      });

      setShowPreview(false);
      onClose();

      await readEmailInbox({
        emailIds: emails.map((e) => e.emailId),
      });

      refetchEmailInfos();
    } catch (err) {
      showErrorSnackbar(err);
    }
  };

  const renderCard = (reservation: ReservationDto, index: number) => {
    switch (reservation.type) {
      case 'LODGING':
        return <LodgingCard data={reservation} />;
      case 'RESTAURANT':
        return <RestaurantCard data={reservation} />;
      case 'FLIGHT':
        return <FlightCard data={reservation} passengerIndex={index} />;
      case 'TRAIN':
        return <TrainCard data={reservation} />;
      case 'BUS':
        return <BusCard data={reservation} />;
      case 'FERRY':
        return <FerryCard data={reservation} />;
      case 'CAR_RENTAL':
        return <CarRentalCard data={reservation} />;
      default:
        return null;
    }
  };

  const selectedCount = emails.filter((e) => e.type && !e.error).length;

  return (
    <>
      {/* Email Reservation Dialog */}
      <Dialog
        open={open && !showPreview}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          onClose();
        }}
        fullWidth
        PaperProps={{ sx: { width: 720, height: 600, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          ส่งต่อข้อมูลการจองผ่านอีเมล
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* EMAIL BOX */}
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
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            startIcon={!isFetching ? <EmailIcon /> : null}
            onClick={checkEmails}
            disabled={isFetching || isPending}
            sx={{
              mb: 2,
              bgcolor: '#25CF7A',
              minWidth: 180,
              position: 'relative',
            }}
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
                  <DeleteIcon />
                </IconButton>

                <Typography>{item.subject}</Typography>
                <Typography sx={{ fontSize: 12, color: 'grey.600' }}>{item.receivedAt}</Typography>

                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select
                    value={selectedTypes[index] || ''}
                    displayEmpty
                    onChange={(e) => handleTypeChange(index, e.target.value as ReservationType)}
                    error={!!item.error}
                    renderValue={(selected) => {
                      if (!selected) return t('ManualReservation.placeholder');

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {icons[selected as keyof typeof icons]}
                          {t(`EmailReservation.Type.${selected}`)}
                        </Box>
                      );
                    }}
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
              startIcon={!isPending && <VisibilityIcon />}
              onClick={handlePreview}
              disabled={isPending || !isAllSelected}
              sx={{
                bgcolor: isAllSelected ? '#25CF7A' : 'grey.400',
                minWidth: 150,
                position: 'relative',
                '&:hover': {
                  bgcolor: isAllSelected ? '#25CF7A' : 'grey.400',
                },
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
            onClick={() => {
              setShowPreview(false);
              onClose();
            }}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          ></IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="subtitle2">
              อีเมล ({selectedCount}/{selectedCount})
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
            {previewReservations.map((item, index) => (
              <Box key={index}>{renderCard(item, index)}</Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={isCreating}
              sx={{
                bgcolor: '#25CF7A',
                minWidth: 120,
                position: 'relative',
              }}
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
        message="คัดลอกอีเมลแล้ว"
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
    </>
  );
}
