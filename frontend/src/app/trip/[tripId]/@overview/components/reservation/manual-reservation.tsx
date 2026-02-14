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
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { ElementType, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Bus, Car, Plane, Ship, Train, Utensils } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import LodgingCard from '@/app/trip/[tripId]/@overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/@overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/@overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/@overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/@overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/@overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/@overview/components/cards/carrental';
import { BackButton } from '@/components/button';
import { fieldsByType } from '../fields-by-type';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { tokens } from '@/providers/theme/design-tokens';

import { ReservationDto, ReservationType, useCreateReservation } from '@/api/reservations';

interface ManualReservationProps {
  open: boolean;
  onClose: () => void;
  tripId: number;
  onReservationCreated: (reservation: ReservationDto) => void;
}

export default function ManualReservation({
  open,
  onClose,
  tripId,
  onReservationCreated,
}: ManualReservationProps) {
  const { t } = useTranslation('trip_overview');

  const [typeValue, setTypeValue] = useState('');
  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [passengers, setPassengers] = useState<{ passengerName: string; seatNo: string }[]>([
    { passengerName: '', seatNo: '' },
  ]);

  const fieldsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const createReservation = useCreateReservation();

  /** RESET ทุกครั้งที่เปิด */
  useEffect(() => {
    if (!open) return;

    setTypeValue('');
    setFormData(null);
    setErrors(null);
    setShowPreview(false);
    setPassengers([{ passengerName: '', seatNo: '' }]);
  }, [open]);

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
      const apiMessage =
        error.response?.data?.message || error.response?.data?.error || error.message;

      setSnackbar({
        open: true,
        message: apiMessage || 'เกิดข้อผิดพลาดบางอย่าง',
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

  const handleChange = (name: string, val: string) => {
    setFormData(
      (prev) =>
        ({
          ...prev,
          [name]: val,
        }) as ReservationDto
    );

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

      const updatedPassenger =
        key === 'passengerName'
          ? { ...passengers[index], passengerName: value }
          : { ...passengers[index], seatNo: value };

      if (updatedPassenger.passengerName && updatedPassenger.seatNo) {
        delete newErrors[passengerKey];
      }

      return newErrors;
    });
  };

  const handlePreview = () => {
    if (!typeValue) {
      setSnackbar({
        open: true,
        message: 'กรุณาเลือกประเภทของข้อมูลการจอง',
        severity: 'error',
      });
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
      fieldsRef.current[firstError]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    if (Object.keys(newErrors).length === 0) {
      setShowPreview(true);
    }
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
      setSnackbar({
        open: true,
        message: 'ไม่สามารถบันทึกข้อมูลได้',
        severity: 'error',
      });
      return;
    }

    const payload: ReservationDto = {
      tripId,
      ggmpId: formData.ggmpId ?? null,
      bookingRef: formData.bookingRef ?? '',
      contactTel: formData.contactTel ?? '',
      contactEmail: formData.contactEmail ?? '',
      cost: Number(formData.cost) || 0,
      type: typeMap[typeValue],
      details: {
        type: typeMap[typeValue],
        ...buildDetails(),
      },
    };

    createReservation.mutate(payload, {
      onSuccess: (data) => {
        setSnackbar({
          open: true,
          message: 'เพิ่มข้อมูลการจองสำเร็จ',
          severity: 'success',
        });

        onReservationCreated(data);
        setShowPreview(false);
        onClose();
      },
      onError: (err) => {
        console.error(err);
        showErrorSnackbar(err);
      },
    });
  };

  const buildDetails = (): Record<string, unknown> => {
    const f = formData as unknown as Record<string, unknown>;
    const ps = passengers as Array<Record<string, unknown>>;

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
          passengers: ps.map((p) => ({
            passengerName: p.passengerName,
            seatNo: p.seatNo,
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
      {/* Dialog กรอกข้อมูล */}

      <Dialog
        open={open && !showPreview}
        fullWidth
        PaperProps={{ sx: { width: '420px', borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pb: 1 }}>
          {t('ManualReservation.title')}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DialogContent sx={{ pt: 0 }}>
            <FormControl fullWidth>
              <Select
                value={typeValue}
                onChange={(e) => {
                  const newType = e.target.value;
                  setTypeValue(newType);
                  setFormData(null);
                  setErrors({});
                  setPassengers([{ passengerName: '', seatNo: '' }]);
                }}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  '& .MuiSelect-displayEmpty': {
                    color: typeValue ? 'inherit' : 'grey.500',
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return t('ManualReservation.placeholder');
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {icons[selected as keyof typeof icons]}{' '}
                      {t(`ManualReservation.Type.${selected}`)}
                    </Box>
                  );
                }}
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
                      <IconComp size={18} color="#25CF7A" />
                      {t(`ManualReservation.Type.${type}`)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {typeValue && fieldsByType[typeValue]?.length ? (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {fieldsByType[typeValue].map((field) => {
                  const hasError = !!errors?.[field.name];
                  const value = formData?.[field.name as keyof ReservationDto] as string;
                  const isEmail = field.type === 'email';
                  const isNumber = field.type === 'number';

                  const emailInvalid =
                    isEmail && !!value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

                  const numberInvalid = isNumber && !!value && !/^\d+$/.test(value);
                  return (
                    <Box
                      key={field.name}
                      ref={(el: HTMLDivElement | null) => {
                        fieldsRef.current[field.name] = el;
                      }}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        color={
                          (errors ? errors[field.name] : false) ? 'error.main' : 'text.secondary'
                        }
                      >
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
                              ? dayjs(
                                  formData?.[field.name as keyof ReservationDto] as string,
                                  'HH:mm'
                                )
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
                          onChange={(value) =>
                            handleChange(field.name, value ? value.toISOString() : '')
                          }
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
                            const value = e.target.value;

                            if (field.type === 'number') {
                              if (/^\d*$/.test(value)) {
                                handleChange(field.name, value);
                              }
                              return;
                            }

                            handleChange(field.name, value);
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

                {/* Section ผู้โดยสาร Flight */}
                {typeValue === 'Flight' && (
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
                            onChange={(e) =>
                              handlePassengerChange(idx, 'passengerName', e.target.value)
                            }
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
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  height: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'grey.600',
                }}
              >
                <Typography variant="subtitle1" fontWeight={500}>
                  {t('ManualReservation.nodata')}
                </Typography>
                <Typography variant="body2">{t('ManualReservation.placeholder')}</Typography>
              </Box>
            )}

            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pb: 6, mt: 2 }}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 5,
                  px: 3,
                  textTransform: 'none',
                  boxShadow: 'none',
                  color: '#fff',
                  bgcolor: typeValue ? '#25CF7A' : '#B0B0B0',
                  pointerEvents: typeValue ? 'auto' : 'none',
                }}
                startIcon={<VisibilityIcon />}
                onClick={handlePreview}
              >
                {t('ManualReservation.Button')}
              </Button>
            </Box>
          </DialogContent>
        </LocalizationProvider>
      </Dialog>

      {/* Dialog Preview */}
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
          ตัวอย่างข้อมูลการจอง
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          ></IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 0,
            maxHeight: '400px',
            overflowY: 'scroll',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {typeValue === 'Lodging' && <LodgingCard data={formData} />}
          {typeValue === 'Restaurant' && <RestaurantCard data={formData} />}
          {typeValue === 'Flight' && formData && (
            <>
              {passengers.map((_, i) => {
                const previewData: ReservationDto = {
                  tripId,
                  ggmpId: formData.ggmpId ?? null,
                  bookingRef: formData.bookingRef ?? '',
                  contactTel: formData.contactTel ?? '',
                  contactEmail: formData.contactEmail ?? '',
                  cost: Number(formData.cost) || 0,
                  type: 'FLIGHT',
                  details: {
                    type: 'FLIGHT',
                    ...buildDetails(),
                  },
                };

                return <FlightCard key={i} data={previewData} passengerIndex={i} />;
              })}
            </>
          )}

          {typeValue === 'Train' && <TrainCard data={formData} />}
          {typeValue === 'Bus' && <BusCard data={formData} />}
          {typeValue === 'Ferry' && <FerryCard data={formData} />}
          {typeValue === 'CarRental' && <CarRentalCard data={formData} />}
        </DialogContent>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pb: 1, mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={createReservation.isPending}
            sx={{
              borderRadius: 5,
              px: 3,
              bgcolor: '#25CF7A',
            }}
          >
            {createReservation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'ยืนยัน'
            )}
          </Button>
        </Box>
      </Dialog>
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
    </>
  );
}
