'use client';

import { Box, Typography, TextField, IconButton, Button } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';
import { useTranslation } from 'react-i18next';

interface FlightPassengerFieldsProps {
  typeValue: string;
  passengers: { passengerName: string; seatNo: string }[];
  errors: Record<string, boolean> | null;
  handlePassengerChange: (index: number, key: 'passengerName' | 'seatNo', value: string) => void;
  removePassenger: (index: number) => void;
  addPassenger: () => void;
}

export default function FlightPassengerFields({
  typeValue,
  passengers,
  errors,
  handlePassengerChange,
  removePassenger,
  addPassenger,
}: FlightPassengerFieldsProps) {
  const { t } = useTranslation('trip_overview');

  if (typeValue !== 'Flight') return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {t('reservation.flightPassengers.title')}
      </Typography>

      {passengers.map((p, idx) => {
        const hasError = !!errors?.[`passenger-${idx}`];

        const nameError = hasError && !p.passengerName;
        const seatError = hasError && !p.seatNo;

        return (
          <Box key={idx} sx={{ mt: 2 }}>
            {/* ===== ชื่อ ===== */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {t('reservation.flightPassengers.bookingName')}
              <Box
                component="span"
                sx={{
                  color: 'error.main',
                  ml: 0.5,
                  fontSize: '1.1em',
                  position: 'relative',
                  top: '0.2em',
                }}
              >
                *
              </Box>
            </Typography>

            <TextField
              value={p.passengerName}
              onChange={(e) => handlePassengerChange(idx, 'passengerName', e.target.value)}
              fullWidth
              error={nameError}
              placeholder={t('reservation.flightPassengers.bookingNamePlaceholder')}
              helperText={nameError ? t('reservation.validation.requiredField') : ''}
              FormHelperTextProps={{
                sx: { color: tokens.color.error },
              }}
              sx={{ mb: 2 }}
            />

            {/* ===== เลขที่นั่ง ===== */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {t('reservation.flightPassengers.seatNo')}
              <Box
                component="span"
                sx={{
                  color: 'error.main',
                  ml: 0.5,
                  fontSize: '1.1em',
                  position: 'relative',
                  top: '0.2em',
                }}
              >
                *
              </Box>
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                value={p.seatNo}
                onChange={(e) => handlePassengerChange(idx, 'seatNo', e.target.value)}
                fullWidth
                error={seatError}
                placeholder={t('reservation.flightPassengers.seatNoPlaceholder')}
                helperText={seatError ? t('reservation.validation.requiredField') : ''}
                FormHelperTextProps={{
                  sx: { color: tokens.color.error },
                }}
              />

              <IconButton
                color="error"
                onClick={() => removePassenger(idx)}
                disabled={passengers.length === 1}
                sx={{ mt: 1 }}
              >
                <Trash2 size={18} />
              </IconButton>
            </Box>
          </Box>
        );
      })}

      <Box sx={{ textAlign: 'center' }}>
        <Button variant="outlined" sx={{ mt: 1 }} onClick={addPassenger}>
          {t('reservation.flightPassengers.addPassenger')}
        </Button>
      </Box>
    </Box>
  );
}
