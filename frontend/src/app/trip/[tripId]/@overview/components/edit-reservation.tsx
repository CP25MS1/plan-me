'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { Plane, Building, Utensils, Train, Ship, Bus, Car } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateReservation as updateReservationAction } from '@/store/trip-detail-slice';

import {
  FlightDetails,
  FlightPassenger,
  ReservationDto,
  ReservationType,
} from '@/api/reservations/type';
import { useUpdateReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-update-reservation';
import { fieldsByType } from './fields-by-type';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';

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
  const icons = {
    Lodging: <Building size={18} color="#25CF7A" />,
    Restaurant: <Utensils size={18} color="#25CF7A" />,
    Flight: <Plane size={18} color="#25CF7A" />,
    Train: <Train size={18} color="#25CF7A" />,
    Bus: <Bus size={18} color="#25CF7A" />,
    Ferry: <Ship size={18} color="#25CF7A" />,
    CarRental: <Car size={18} color="#25CF7A" />,
  };

  const { t } = useTranslation('trip_overview');
  const updateReservation = useUpdateReservation();
  const fieldsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const typeValue = typeUiMap[reservation.type];

  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passengers, setPassengers] = useState<{ passengerName: string; seatNo: string }[]>([]);

  const originalRef = useRef<string>('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (!open) return;

    const merged = {
      ...reservation,
      ...reservation.details,
    };

    setFormData(merged);

    let flightPassengers = [] as FlightPassenger[];
    if (reservation.type === 'FLIGHT') {
      flightPassengers = (reservation.details as unknown as FlightDetails)?.passengers ?? [];

      setPassengers(flightPassengers);
    }

    originalRef.current = JSON.stringify({
      formData: merged,
      passengers: reservation.type === 'FLIGHT' ? flightPassengers : [],
    });
  }, [open, reservation]);

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

  const errorMessageMap: Record<number, string> = {
    400: 'ไม่สามารถแก้ไขข้อมูลการจองได้ โปรดตรวจสอบข้อมูลอีกครั้ง',
    403: 'คุณไม่มีสิทธิ์ในการดูข้อมูลของทริปนี้',
    404: 'ไม่พบข้อมูลการจองนี้ในระบบ',
  };

  /** ---------- change detect ---------- */
  const hasChanges =
    originalRef.current !==
    JSON.stringify({
      formData,
      passengers,
    });

  /** ---------- handlers ---------- */
  const handleChange = (name: string, val: string) => {
    setFormData((prev) => ({
      ...prev!,
      [name]: val,
    }));
    setErrors((e) => ({ ...e, [name]: false }));
  };

  const addPassenger = () => setPassengers((p) => [...p, { passengerName: '', seatNo: '' }]);

  const removePassenger = (idx: number) => setPassengers((p) => p.filter((_, i) => i !== idx));

  const handlePassengerChange = (idx: number, key: 'passengerName' | 'seatNo', val: string) => {
    setPassengers((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));
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
      fieldsRef.current[firstError]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  /** ---------- submit ---------- */
  const handleConfirm = () => {
    if (!formData || !hasChanges) return;

    if (!validate()) return;

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
        },
      },
    };

    updateReservation.mutate(payload, {
      onSuccess: (updatedReservation) => {
        dispatch(updateReservationAction(updatedReservation));
        onClose();
      },
      onError: (err) => {
        console.error(err);
        showErrorSnackbar(err);
      },
    });
  };

  const buildDetails = () => {
    switch (typeValue) {
      case 'Flight':
        const f = formData as unknown as FlightDetails;
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
      default:
        return fieldsByType[typeValue].reduce(
          (acc, field) => {
            acc[field.name] = formData
              ? (formData as unknown as Record<string, unknown>)[field.name]
              : null;
            return acc;
          },
          {} as Record<string, unknown>
        );
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} fullWidth PaperProps={{ sx: { width: 420, borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
        แก้ไขข้อมูลการจอง
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <Select
            value={typeValue}
            disabled
            displayEmpty
            sx={{
              borderRadius: 2,
              '& .MuiSelect-icon': { display: 'none' },
            }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icons[selected as keyof typeof icons]}
                {t(`ManualReservation.Type.${selected}`)}
              </Box>
            )}
          >
            <MenuItem value={typeValue}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icons[typeValue as keyof typeof icons]}
                {t(`ManualReservation.Type.${typeValue}`)}
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        {fieldsByType[typeValue].map((field) => (
          <Box
            key={field.name}
            ref={(el: HTMLDivElement | null) => {
              fieldsRef.current[field.name] = el;
            }}
          >
            <Typography
              variant="body2"
              color={errors[field.name] ? 'error.main' : 'text.secondary'}
            >
              {field.label}
            </Typography>

            <TextField
              fullWidth
              type={field.type || 'text'}
              value={formData[field.name as keyof ReservationDto] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              error={errors[field.name]}
              placeholder={field.placeholder}
            />
          </Box>
        ))}

        {typeValue === 'Flight' && (
          <Box>
            <Typography variant="body2">รายชื่อผู้โดยสาร</Typography>
            {passengers.map((p, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  label="ชื่อ"
                  value={p.passengerName}
                  onChange={(e) => handlePassengerChange(idx, 'passengerName', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="เลขที่นั่ง"
                  value={p.seatNo}
                  onChange={(e) => handlePassengerChange(idx, 'seatNo', e.target.value)}
                  fullWidth
                />
                <IconButton
                  color="error"
                  disabled={passengers.length === 1}
                  onClick={() => removePassenger(idx)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={addPassenger} sx={{ mt: 1 }}>
              + เพิ่มผู้โดยสาร
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            disabled={!hasChanges}
            onClick={handleConfirm}
            sx={{
              borderRadius: 5,
              px: 4,
              bgcolor: hasChanges ? '#25CF7A' : '#B0B0B0',
            }}
          >
            ยืนยัน
          </Button>
        </Box>
      </DialogContent>
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </Dialog>
  );
}
