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
} from '@mui/material';
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
import { useUpdateReservation } from '@/app/trip/[tripId]/overview/hooks/reservations/use-update-reservation';
import { fieldsByType } from './fields-by-type';

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
      flightPassengers =
        (reservation.details as unknown as FlightDetails)?.passengers ?? [];

      setPassengers(flightPassengers);
    }

    originalRef.current = JSON.stringify({
      formData: merged,
      passengers: reservation.type === 'FLIGHT' ? flightPassengers : [],
    });
  }, [open, reservation]);

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
        if (!p.name || !p.seatNumber) {
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
    </Dialog>
  );
}
