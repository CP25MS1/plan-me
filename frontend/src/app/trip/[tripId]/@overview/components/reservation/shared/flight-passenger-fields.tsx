'use client';

import { Box, Typography, TextField, IconButton, Button } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { tokens } from '@/providers/theme/design-tokens';

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
  if (typeValue !== 'Flight') return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        รายชื่อผู้โดยสาร
      </Typography>

      {passengers.map((p, idx) => {
        const hasError = !!errors?.[`passenger-${idx}`];

        const nameError = hasError && !p.passengerName;
        const seatError = hasError && !p.seatNo;

        return (
          <Box key={idx} sx={{ mt: 2 }}>
            {/* ===== ชื่อ ===== */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              ผู้จอง
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
              placeholder="eg. สมพงษ์"
              helperText={nameError ? 'โปรดระบุข้อมูล' : ''}
              FormHelperTextProps={{
                sx: { color: tokens.color.error },
              }}
              sx={{ mb: 2 }}
            />

            {/* ===== เลขที่นั่ง ===== */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              เลขที่นั่ง
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
                placeholder="eg. 12A"
                helperText={seatError ? 'โปรดระบุข้อมูล' : ''}
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
          + เพิ่มผู้โดยสาร
        </Button>
      </Box>
    </Box>
  );
}
