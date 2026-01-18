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

import { ReservationDto, ReservationType } from '@/api/reservations/type';
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

  const typeValue = typeUiMap[reservation.type];

  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passengers, setPassengers] = useState<{ name: string; seatNumber: string }[]>([]);

  const originalRef = useRef<string>('');

  useEffect(() => {
    if (!open) return;

    const merged = {
      ...reservation,
      ...reservation.details,
    };

    setFormData(merged);

    if (reservation.type === 'FLIGHT') {
      setPassengers(
        reservation.details.passengers.map((p) => ({
          name: p.passengerName,
          seatNumber: p.seatNo,
        }))
      );
    }

    originalRef.current = JSON.stringify({
      formData: merged,
      passengers: reservation.type === 'FLIGHT' ? reservation.details.passengers : [],
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

  const addPassenger = () => setPassengers((p) => [...p, { name: '', seatNumber: '' }]);

  const removePassenger = (idx: number) => setPassengers((p) => p.filter((_, i) => i !== idx));

  const handlePassengerChange = (idx: number, key: 'name' | 'seatNumber', val: string) => {
    setPassengers((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));
  };

  /** ---------- submit ---------- */
  const handleConfirm = () => {
    if (!formData || !hasChanges) return;

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
      onSuccess: onClose,
    });
  };

  const buildDetails = () => {
    const f = formData as any;

    switch (typeValue) {
      case 'Flight':
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
          passengers: passengers.map((p) => ({
            passengerName: p.name,
            seatNo: p.seatNumber,
          })),
        };
      default:
        return fieldsByType[typeValue].reduce(
          (acc, field) => {
            acc[field.name] = f[field.name] ?? '';
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
          <Box key={field.name}>
            <Typography variant="body2" color="text.secondary">
              {field.label}
            </Typography>
            <TextField
              fullWidth
              value={formData[field.name as keyof ReservationDto] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              error={!!errors[field.name]}
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
                  value={p.name}
                  onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="เลขที่นั่ง"
                  value={p.seatNumber}
                  onChange={(e) => handlePassengerChange(idx, 'seatNumber', e.target.value)}
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
