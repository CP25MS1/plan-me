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
  Typography,
} from '@mui/material';
import { ElementType, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Bus, Car, Eye, Plane, Ship, Train, Utensils, X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { BackButton } from '@/components/button';
import { fieldsByType } from '../fields-by-type';
import { useSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  ReservationDetails,
  ReservationDto,
  ReservationType,
  useCreateReservation,
} from '@/api/reservations';
import useTripAddPresenceEffect from '@/app/trip/[tripId]/realtime/hooks/use-trip-add-presence';
import { useTripReservations } from '@/api/trips';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { isDuplicateReservation, renderReservationCard } from './shared/reservation-utils';
import DynamicReservationFields from './shared/dynamic-reservation-fields';
import FlightPassengerFields from './shared/flight-passenger-fields';

interface ManualReservationProps {
  open: boolean;
  onClose: () => void;
  tripId: number;
}

export default function ManualReservation({ open, onClose, tripId }: ManualReservationProps) {
  const { t } = useTranslation('trip_overview');

  const [typeValue, setTypeValue] = useState('');
  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [passengers, setPassengers] = useState<{ passengerName: string; seatNo: string }[]>([
    { passengerName: '', seatNo: '' },
  ]);

  const fieldsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const createReservation = useCreateReservation(tripId);
  const { data: reservations = [] } = useTripReservations(tripId);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useTripAddPresenceEffect({
    tripId,
    enabled: open,
    section: 'OVERVIEW_RESERVATIONS',
  });

  useEffect(() => {
    if (!open) return;
    setTypeValue('');
    setFormData(null);
    setErrors(null);
    setShowPreview(false);
    setPassengers([{ passengerName: '', seatNo: '' }]);
  }, [open]);

  const { showSuccess, showError } = useSnackbar();

  const showErrorSnackbar = (error: unknown) => {
    const apiMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.response?.data?.error || error.message
        : t('reservation.validation.unknownError');
    showError(apiMessage || t('reservation.validation.genericError'));
  };

  const handleChange = (name: string, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }) as ReservationDto);
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const addPassenger = () => setPassengers((prev) => [...prev, { passengerName: '', seatNo: '' }]);
  const removePassenger = (index: number) =>
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  const handlePassengerChange = (index: number, key: 'passengerName' | 'seatNo', value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
    setErrors((prev) => {
      if (!prev) return prev;
      const newErrors = { ...prev };
      const passengerKey = `passenger-${index}`;
      const updatedP = { ...passengers[index], [key]: value };
      if (updatedP.passengerName && updatedP.seatNo) delete newErrors[passengerKey];
      return newErrors;
    });
  };

  const handlePreview = () => {
    if (!typeValue) {
      showError(t('ManualReservation.placeholder'));
      return;
    }
    const typeFields = fieldsByType[typeValue];
    const newErrors: Record<string, boolean> = {};
    let firstError: string | null = null;

    typeFields.forEach((field) => {
      if (field.required && !formData?.[field.name as keyof ReservationDto]) {
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
    if (Object.keys(newErrors).length === 0) setShowPreview(true);
  };

  const typeMap: Record<string, ReservationType> = {
    Lodging: 'LODGING',
    Restaurant: 'RESTAURANT',
    Flight: 'FLIGHT',
    Train: 'TRAIN',
    Bus: 'BUS',
    Ferry: 'FERRY',
    CarRental: 'CAR_RENTAL',
  };

  const handleConfirm = () => {
    if (!typeValue || !formData) {
      showError(t('reservation.validation.cannotSave'));
      return;
    }

    const payloadCheck: Partial<ReservationDto> = {
      type: typeMap[typeValue],
      bookingRef: formData.bookingRef,
      details: {
        type: typeMap[typeValue],
        ...buildDetails(typeMap[typeValue]),
      } as ReservationDetails,
    };

    if (isDuplicateReservation(payloadCheck, reservations)) {
      setShowDuplicateWarning(true);
      return;
    }

    proceedConfirm();
  };

  const proceedConfirm = () => {
    if (!typeValue || !formData) return;
    const currentType = typeMap[typeValue];
    const payload: ReservationDto = {
      tripId,
      ggmpId: formData.ggmpId ?? null,
      bookingRef: formData.bookingRef ?? '',
      contactTel: formData.contactTel ?? '',
      contactEmail: formData.contactEmail ?? '',
      cost: Number(formData.cost) || 0,
      type: currentType,
      details: {
        type: currentType,
        ...buildDetails(currentType),
      } as ReservationDetails,
    };

    createReservation.mutate(payload, {
      onSuccess: () => {
        showSuccess(t('reservation.success.created'));
        setShowPreview(false);
        onClose();
      },
      onError: showErrorSnackbar,
    });
  };

  const buildDetails = (type: ReservationType): Record<string, unknown> => {
    if (type === 'FLIGHT') {
      const f = formData as ReservationDto & Record<string, unknown>;
      return {
        airline: f?.airline ?? '',
        flightNo: f?.flightNo ?? '',
        boardingTime: f?.boardingTime ?? '',
        gateNo: f?.gateNo ?? '',
        departureAirport: f?.departureAirport ?? '',
        departureTime: f?.departureTime ?? '',
        arrivalAirport: f?.arrivalAirport ?? '',
        arrivalTime: f?.arrivalTime ?? '',
        flightClass: f?.flightClass ?? '',
        passengers: passengers.map((p) => ({ passengerName: p.passengerName, seatNo: p.seatNo })),
      };
    }
    const f = formData as ReservationDto & Record<string, unknown>;
    return fieldsByType[typeValue].reduce(
      (acc, field) => {
        acc[field.name] = f?.[field.name] ?? '';
        return acc;
      },
      {} as Record<string, unknown>
    );
  };

  const icons = {
    Lodging: <Building size={18} color="#25CF7A" />,
    Restaurant: <Utensils size={18} color="#25CF7A" />,
    Flight: <Plane size={18} color="#25CF7A" />,
    Train: <Train size={18} color="#25CF7A" />,
    Bus: <Bus size={18} color="#25CF7A" />,
    Ferry: <Ship size={18} color="#25CF7A" />,
    CarRental: <Car size={18} color="#25CF7A" />,
  };

  return (
    <>
      <Dialog
        open={open && !showPreview}
        fullWidth
        PaperProps={{ sx: { width: '420px', borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pb: 1 }}>
          {t('ManualReservation.title')}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DialogContent sx={{ pt: 0 }}>
            <FormControl fullWidth>
              <Select
                value={typeValue}
                onChange={(e) => {
                  setTypeValue(e.target.value);
                  setFormData(null);
                  setErrors({});
                  setPassengers([{ passengerName: '', seatNo: '' }]);
                }}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  '& .MuiSelect-displayEmpty': { color: typeValue ? 'inherit' : 'grey.500' },
                }}
                renderValue={(selected) =>
                  selected ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {icons[selected as keyof typeof icons]}{' '}
                      {t(`ManualReservation.Type.${selected}`)}
                    </Box>
                  ) : (
                    t('ManualReservation.placeholder')
                  )
                }
              >
                {Object.keys(fieldsByType).map((type) => {
                  const IconComp = {
                    Lodging: Building,
                    Restaurant: Utensils,
                    Flight: Plane,
                    Train: Train,
                    Bus: Bus,
                    Ferry: Ship,
                    CarRental: Car,
                  }[type] as ElementType;
                  return (
                    <MenuItem key={type} value={type} className="flex items-center gap-3">
                      <IconComp size={18} color="#25CF7A" /> {t(`ManualReservation.Type.${type}`)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

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
              removePassenger={removePassenger}
              addPassenger={addPassenger}
            />

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pb: 6, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handlePreview}
                startIcon={<Eye size={18} />}
                sx={{
                  borderRadius: 5,
                  px: 3,
                  textTransform: 'none',
                  boxShadow: 'none',
                  color: '#fff',
                  bgcolor: typeValue ? '#25CF7A' : '#B0B0B0',
                  pointerEvents: typeValue ? 'auto' : 'none',
                }}
              >
                {t('ManualReservation.Button')}
              </Button>
            </Box>
          </DialogContent>
        </LocalizationProvider>
      </Dialog>

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        fullWidth
        PaperProps={{ sx: { width: '420px', borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pb: 1, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setShowPreview(false)} />
          </Box>
          {t('reservation.previewTitle')}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {typeValue === 'Flight'
            ? passengers.map((_, i) =>
                renderReservationCard(
                  typeValue,
                  {
                    ...formData,
                    type: 'FLIGHT',
                    details: {
                      type: 'FLIGHT',
                      ...buildDetails('FLIGHT'),
                    },
                  } as ReservationDto,
                  i
                )
              )
            : renderReservationCard(typeValue, formData)}
        </DialogContent>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pb: 1, mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={createReservation.isPending}
            sx={{ borderRadius: 5, px: 3, bgcolor: '#25CF7A' }}
          >
            {createReservation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t('reservation.confirm')
            )}
          </Button>
        </Box>
      </Dialog>


      <ConfirmDialog
        open={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        onConfirm={() => {
          setShowDuplicateWarning(false);
          proceedConfirm();
        }}
        confirmLoading={createReservation.isPending}
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
