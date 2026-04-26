'use client';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Building, Bus, Car, Plane, Ship, Train, Utensils, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/providers/theme/design-tokens';

import {
  FlightDetails,
  ReservationDetails,
  ReservationDto,
  ReservationType,
} from '@/api/reservations/type';
import { useUpdateReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-update-reservation';
import { fieldsByType } from '../fields-by-type';
import { useTripReservations } from '@/api/trips';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { AxiosError } from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { isDuplicateReservation } from './shared/reservation-utils';
import DynamicReservationFields from './shared/dynamic-reservation-fields';
import FlightPassengerFields from './shared/flight-passenger-fields';

interface EditReservationProps {
  open: boolean;
  onClose: () => void;
  tripId: number;
  reservation: ReservationDto;
}

const typeUiMap: Record<ReservationType, string> = {
  LODGING: 'Lodging',
  RESTAURANT: 'Restaurant',
  FLIGHT: 'Flight',
  TRAIN: 'Train',
  BUS: 'Bus',
  FERRY: 'Ferry',
  CAR_RENTAL: 'CarRental',
};

export default function EditReservation({
  open,
  onClose,
  tripId,
  reservation,
}: EditReservationProps) {
  const { t } = useTranslation('trip_overview');
  const updateReservation = useUpdateReservation(tripId);
  const { data: reservations = [] } = useTripReservations(tripId);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const fieldsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const typeValue = typeUiMap[reservation.type];

  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passengers, setPassengers] = useState<{ passengerName: string; seatNo: string }[]>([]);

  const originalRef = useRef<string>('');
  useEffect(() => {
    if (!open) return;
    const merged = { ...reservation, ...reservation.details } as ReservationDto;
    setFormData(merged);
    if (reservation.type === 'FLIGHT') {
      const flightPassengers = (reservation.details as unknown as FlightDetails)?.passengers ?? [];
      setPassengers(flightPassengers);
      originalRef.current = JSON.stringify({ formData: merged, passengers: flightPassengers });
    } else {
      setPassengers([]);
      originalRef.current = JSON.stringify({ formData: merged, passengers: [] });
    }
    setErrors({});
  }, [open, reservation]);

  const { showError } = useSnackbar();

  const showErrorSnackbar = (error: unknown) => {
    const apiMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.response?.data?.error || error.message
        : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    showError(apiMessage || 'เกิดข้อผิดพลาดบางอย่าง');
  };

  const hasChanges = originalRef.current !== JSON.stringify({ formData, passengers });

  const handleChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev!, [name]: val }));
    setErrors((e) => ({ ...e, [name]: false }));
  };

  const handlePassengerChange = (idx: number, key: 'passengerName' | 'seatNo', val: string) => {
    setPassengers((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`passenger-${idx}`];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    let firstError: string | null = null;
    fieldsByType[typeValue].forEach((field) => {
      const value = formData?.[field.name as keyof ReservationDto];
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = true;
        if (!firstError) firstError = field.name;
      }
    });
    if (typeValue === 'Flight') {
      passengers.forEach((p, idx) => {
        if (!p.passengerName || !p.seatNo) {
          const key = `passenger-${idx}`;
          newErrors[key] = true;
          if (!firstError) firstError = key;
        }
      });
    }
    setErrors(newErrors);
    if (firstError && fieldsRef.current[firstError]) {
      fieldsRef.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!formData || !hasChanges || !validate() || !reservation.id) return;

    if (isDuplicateReservation(formData, reservations, reservation.id)) {
      setShowDuplicateWarning(true);
      return;
    }
    proceedConfirm();
  };

  const proceedConfirm = () => {
    if (!formData || !reservation.id) return;
    const payload = {
      reservationId: reservation.id,
      reservation: {
        tripId,
        ggmpId: formData.ggmpId ?? null,
        bookingRef: formData.bookingRef ?? '',
        contactTel: formData.contactTel ?? '',
        contactEmail: formData.contactEmail ?? '',
        cost: Number(formData.cost) || 0,
        type: reservation.type,
        details: {
          type: reservation.type,
          ...buildDetails(),
        } as ReservationDetails,
      },
    };
    updateReservation.mutate(payload, { onSuccess: onClose, onError: showErrorSnackbar });
  };

  const buildDetails = () => {
    if (typeValue === 'Flight') {
      const f = formData as any;
      return {
        airline: f.airline ?? '',
        flightNo: f.flightNo ?? '',
        boardingTime: f.boardingTime ?? '',
        gateNo: f.gateNo ?? '',
        departureAirport: f.departureAirport ?? '',
        departureTime: f.departureTime ?? '',
        arrivalAirport: f.arrivalAirport ?? '',
        arrivalTime: f.arrivalTime ?? '',
        flightClass: f.flightClass ?? '',
        passengers,
      };
    }
    return fieldsByType[typeValue].reduce((acc, field) => {
      acc[field.name] = formData ? (formData as any)[field.name] : null;
      return acc;
    }, {} as any);
  };

  if (!formData) return null;

  const icons = {
    Lodging: <Building size={18} color="#3b82f6" />,
    Restaurant: <Utensils size={18} color="#ec4899" />,
    Flight: <Plane size={18} color="#22c55e" />,
    Train: <Train size={18} color="#ef4444" />,
    Bus: <Bus size={18} color="#f97316" />,
    Ferry: <Ship size={18} color="#a855f7" />,
    CarRental: <Car size={18} color="#14b8a6" />,
  };

  return (
    <Dialog open={open} fullWidth PaperProps={{ sx: { width: 420, borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        {t('ManualReservation.edit')}
        <IconButton
          onClick={onClose}
          disabled={updateReservation.isPending}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'action.hover',
          }}
        >
          {icons[typeValue as keyof typeof icons]}{' '}
          <Typography variant="body1" fontWeight={500}>
            {t(`ManualReservation.Type.${typeValue}`)}
          </Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DynamicReservationFields
            typeValue={typeValue}
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            fieldsRef={fieldsRef}
          />
          <FlightPassengerFields
            typeValue={typeValue}
            passengers={passengers}
            errors={errors}
            handlePassengerChange={handlePassengerChange}
            removePassenger={(idx) => setPassengers((p) => p.filter((_, i) => i !== idx))}
            addPassenger={() => setPassengers((p) => [...p, { passengerName: '', seatNo: '' }])}
          />
        </LocalizationProvider>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            disabled={!hasChanges || updateReservation.isPending}
            onClick={handleConfirm}
            sx={{
              borderRadius: 5,
              px: 4,
              bgcolor:
                !hasChanges || updateReservation.isPending
                  ? tokens.color.textSecondary
                  : tokens.color.primary,
            }}
          >
            {updateReservation.isPending ? (
              <CircularProgress size={22} sx={{ color: tokens.color.background }} />
            ) : (
              t('reservation.confirm')
            )}
          </Button>
        </Box>
      </DialogContent>
      <ConfirmDialog
        open={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        onConfirm={() => {
          setShowDuplicateWarning(false);
          proceedConfirm();
        }}
        confirmLoading={updateReservation.isPending}
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
    </Dialog>
  );
}
