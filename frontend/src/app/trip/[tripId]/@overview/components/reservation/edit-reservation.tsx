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
  CircularProgress,
} from '@mui/material';
import { Plane, Building, Utensils, Train, Ship, Bus, Car } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateReservation as updateReservationAction } from '@/store/trip-detail-slice';
import { tokens } from '@/providers/theme/design-tokens';

import {
  FlightDetails,
  FlightPassenger,
  ReservationDto,
  ReservationType,
} from '@/api/reservations/type';
import { useUpdateReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-update-reservation';
import { fieldsByType } from '../fields-by-type';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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
    } else {
      setPassengers([]);
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
      const message =
        error.response?.data?.message || error.response?.data?.error || 'เกิดข้อผิดพลาดบางอย่าง';

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

  // clear specific passenger field error on change
  const handlePassengerChange = (idx: number, key: 'passengerName' | 'seatNo', val: string) => {
    setPassengers((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));

    setErrors((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      if (key === 'passengerName') delete copy[`passengerName-${idx}`];
      if (key === 'seatNo') delete copy[`seatNo-${idx}`];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    let firstError: string | null = null;

    // validate main fields
    fieldsByType[typeValue].forEach((field) => {
      const value = formData?.[field.name as keyof ReservationDto];
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = true;
        if (!firstError) firstError = field.name;
      }
    });

    // validate passengers (split per-field)
    if (typeValue === 'Flight') {
      passengers.forEach((p, idx) => {
        if (!p.passengerName) {
          const key = `passengerName-${idx}`;
          newErrors[key] = true;
          if (!firstError) firstError = key;
        }
        if (!p.seatNo) {
          const key = `seatNo-${idx}`;
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
      case 'Flight': {
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
      }
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
        <IconButton
          onClick={onClose}
          disabled={updateReservation.isPending}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
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

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {fieldsByType[typeValue].map((field) => {
            const hasError = !!errors?.[field.name];
            const value = formData?.[field.name as keyof ReservationDto] as string;
            const isEmail = field.type === 'email';
            const isNumber = field.type === 'number';

            const emailInvalid = isEmail && !!value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const numberInvalid = isNumber && !!value && !/^\d+$/.test(value);

            return (
              <Box
                key={field.name}
                ref={(el: HTMLDivElement | null) => {
                  fieldsRef.current[field.name] = el;
                }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
              >
                <Typography variant="body2" color={hasError ? 'error.main' : 'text.secondary'}>
                  {field.label}
                  {field.required && (
                    <Box
                      component="span"
                      sx={{
                        color: 'error.main',
                        ml: 1,
                        fontSize: '1.1em',
                        position: 'relative',
                        top: '0.2em',
                      }}
                    >
                      *
                    </Box>
                  )}
                </Typography>

                {field.type === 'date' ? (
                  <DatePicker
                    enableAccessibleFieldDOMStructure={false}
                    value={
                      formData?.[field.name as keyof ReservationDto]
                        ? dayjs(formData?.[field.name as keyof ReservationDto] as string)
                        : null
                    }
                    onChange={(value) =>
                      handleChange(field.name, value ? value.format('YYYY-MM-DD') : '')
                    }
                    format="DD/MM/YYYY"
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: hasError,
                        placeholder: field.placeholder,
                        helperText: hasError ? 'โปรดระบุข้อมูล' : '',
                        FormHelperTextProps: {
                          sx: { color: tokens.color.error },
                        },
                      },
                    }}
                  />
                ) : field.type === 'time' ? (
                  <TimePicker
                    enableAccessibleFieldDOMStructure={false}
                    ampm={false}
                    value={
                      formData?.[field.name as keyof ReservationDto]
                        ? dayjs(formData?.[field.name as keyof ReservationDto] as string, 'HH:mm')
                        : null
                    }
                    onChange={(value) =>
                      handleChange(field.name, value ? value.format('HH:mm') : '')
                    }
                    format="HH:mm"
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: hasError,
                        placeholder: field.placeholder,
                        helperText: hasError ? 'โปรดระบุข้อมูล' : '',
                        FormHelperTextProps: {
                          sx: { color: tokens.color.error },
                        },
                      },
                    }}
                  />
                ) : field.type === 'datetime-local' ? (
                  <DateTimePicker
                    enableAccessibleFieldDOMStructure={false}
                    ampm={false}
                    views={['year', 'day', 'hours', 'minutes']}
                    openTo="day"
                    timeSteps={{ minutes: 1 }}
                    value={
                      formData?.[field.name as keyof ReservationDto]
                        ? dayjs(formData?.[field.name as keyof ReservationDto] as string)
                        : null
                    }
                    onChange={(value) => handleChange(field.name, value ? value.toISOString() : '')}
                    format="DD/MM/YYYY HH:mm"
                    slots={{ textField: TextField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: hasError,
                        placeholder: field.placeholder,
                        helperText: hasError ? 'โปรดระบุข้อมูล' : '',
                        FormHelperTextProps: {
                          sx: { color: tokens.color.error },
                        },
                      },
                    }}
                  />
                ) : (
                  <TextField
                    type={field.type || 'text'}
                    value={value ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (field.type === 'number') {
                        if (/^\d*$/.test(v)) handleChange(field.name, v);
                        return;
                      }
                      handleChange(field.name, v);
                    }}
                    fullWidth
                    error={hasError || emailInvalid || numberInvalid}
                    placeholder={field.placeholder}
                    helperText={
                      hasError
                        ? 'โปรดระบุข้อมูล'
                        : emailInvalid
                          ? 'โปรดระบุอีเมลในรูปแบบ username@domain'
                          : numberInvalid
                            ? 'กรุณากรอกตัวเลขเท่านั้น'
                            : ''
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: tokens.color.error,
                      },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </LocalizationProvider>

        {typeValue === 'Flight' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              รายชื่อผู้โดยสาร
            </Typography>

            {passengers.map((p, idx) => {
              const nameError = !!errors?.[`passengerName-${idx}`];
              const seatError = !!errors?.[`seatNo-${idx}`];

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
                    size="small"
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
                      size="small"
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
                      <DeleteIcon />
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
        )}

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
              'ยืนยัน'
            )}
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
