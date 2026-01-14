'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Button,
  Box,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect, useRef, ElementType } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, Building, Utensils, Train, Ship, Bus, Car } from 'lucide-react';
import LodgingCard from '@/app/trip/[tripId]/overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/overview/components/cards/carrental';
import { BackButton } from '@/components/button';
import { fieldsByType } from './fields-by-type';
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
  const [typeValue, setTypeValue] = useState('');
  const [formData, setFormData] = useState<ReservationDto | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [passengers, setPassengers] = useState<{ name: string; seatNumber: string }[]>([
    { name: '', seatNumber: '' },
  ]);
  const { t } = useTranslation('trip_overview');

  const fieldsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const createReservation = useCreateReservation();

  useEffect(() => {
    if (open) {
      setTypeValue('');
      setFormData(null);
      setErrors(null);
      setShowPreview(false);
      setPassengers([{ name: '', seatNumber: '' }]);
    }
  }, [open]);

  const handleChange = (name: string, val: string) => {
    setFormData((prev) => {
      const newVal = {
        ...prev,
        [name]: val,
      } as ReservationDto;
      return newVal;
    });

    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const addPassenger = () => setPassengers((prev) => [...prev, { name: '', seatNumber: '' }]);
  const removePassenger = (index: number) =>
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  const handlePassengerChange = (index: number, key: 'name' | 'seatNumber', value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)));
  };

  const handlePreview = () => {
    if (!typeValue) return;

    const typeFields = fieldsByType[typeValue];
    const newErrors: Record<string, boolean> = {};
    let firstError: string | null = null;

    typeFields.forEach((field) => {
      if (field.required && (formData ? !formData[field.name as keyof ReservationDto] : false)) {
        newErrors[field.name] = true;
        if (!firstError) firstError = field.name;
      }
    });

    // ตรวจสอบผู้โดยสาร
    if (typeValue === 'Flight') {
      passengers.forEach((p, idx) => {
        if (!p.name || !p.seatNumber) {
          newErrors[`passenger-${idx}`] = true;
          if (!firstError) firstError = `passenger-${idx}`;
        }
      });
    }

    setErrors(newErrors);

    if (firstError && fieldsRef.current[firstError]) {
      fieldsRef.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (Object.keys(newErrors).length === 0) {
      if (typeValue === 'Flight') {
        setFormData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
          } as ReservationDto;
        });
      }
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
    if (!tripId) {
      console.error('Missing tripId');
      return;
    }

    if (!typeValue) {
      console.error('Missing reservation type');
      return;
    }

    const payload = {
      tripId: tripId,
      ggmpId: formData?.ggmpId || null,
      bookingRef: formData?.bookingRef || '',
      contactTel: formData?.contactTel || '',
      contactEmail: formData?.contactEmail || '',
      cost: Number(formData?.cost) || 0,
      type: typeMap[typeValue],
      details: { type: typeMap[typeValue], ...buildDetails() },
    };
    createReservation.mutate(payload as unknown as ReservationDto, {
      onSuccess: (data) => {
        onClose();
        setShowPreview(false);
        onReservationCreated(data);
      },
      onError: (err) => {
        console.error('Create reservation failed', err);
      },
    });
  };

  const buildDetails = (): Record<string, unknown> => {
    const f = formData as unknown as Record<string, unknown>;
    const ps = passengers as Array<Record<string, unknown>>;
    switch (typeValue) {
      case 'Lodging':
        return {
          lodgingName: f?.lodgingName ?? '',
          lodgingAddress: f?.lodgingAddress ?? '',
          underName: f?.underName ?? '',
          checkinDate: f?.checkinDate ?? '',
          checkoutDate: f?.checkoutDate ?? '',
        };
      case 'Flight':
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
          passengers: ps.map((p) => ({ passengerName: p.name, seatNo: p.seatNumber })),
        };
      case 'Restaurant':
        return {
          restaurantName: f?.restaurantName ?? '',
          restaurantAddress: f?.restaurantAddress ?? '',
          underName: f?.underName ?? '',
          reservationDate: f?.reservationDate ?? '',
          reservationTime: f?.reservationTime ?? '',
          tableNo: f?.tableNo ?? '',
          queueNo: f?.queueNo ?? '',
          partySize: (f?.partySize ?? '') ? Number(f?.partySize ?? '') : undefined,
        };
      case 'Train':
        return {
          trainNo: f?.trainNo ?? '',
          trainClass: f?.trainClass ?? '',
          seatClass: f?.seatClass ?? '',
          seatNo: f?.seatNo ?? '',
          passengerName: f?.passengerName ?? '',
          departureStation: f?.departureStation ?? '',
          departureTime: f?.departureTime ?? '',
          arrivalStation: f?.arrivalStation ?? '',
          arrivalTime: f?.arrivalTime ?? '',
        };
      case 'Bus':
        return {
          transportCompany: f?.transportCompany ?? '',
          departureStation: f?.departureStation ?? '',
          departureTime: f?.departureTime ?? '',
          arrivalStation: f?.arrivalStation ?? '',
          busClass: f?.busClass ?? '',
          passengerName: f?.passengerName ?? '',
          seatNo: f?.seatNo ?? '',
        };
      case 'Ferry':
        return {
          transportCompany: f?.transportCompany ?? '',
          passengerName: f?.passengerName ?? '',
          departurePort: f?.departurePort ?? '',
          departureTime: f?.departureTime ?? '',
          arrivalPort: f?.arrivalPort ?? '',
          arrivalTime: f?.arrivalTime ?? '',
          ticketType: f?.ticketType ?? '',
        };
      case 'CarRental':
        return {
          rentalCompany: f?.rentalCompany ?? '',
          carModel: f?.carModel ?? '',
          vrn: f?.vrn ?? '',
          renterName: f?.renterName ?? '',
          pickupLocation: f?.pickupLocation ?? '',
          pickupTime: f?.pickupTime ?? '',
          dropoffLocation: f?.dropoffLocation ?? '',
          dropoffTime: f?.dropoffTime ?? '',
        };
      default:
        return {};
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

        <DialogContent sx={{ pt: 0 }}>
          <FormControl fullWidth>
            <Select
              value={typeValue}
              onChange={(e) => {
                const newType = e.target.value;
                setTypeValue(newType);
                setFormData(null);
                setErrors({});
                setPassengers([{ name: '', seatNumber: '' }]);
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
              <MenuItem value="" disabled>
                {t('ManualReservation.placeholder')}
              </MenuItem>
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
              {fieldsByType[typeValue].map((field) => (
                <Box
                  key={field.name}
                  ref={(el: HTMLDivElement | null) => {
                    fieldsRef.current[field.name] = el;
                  }}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                >
                  <Typography
                    variant="body2"
                    color={(errors ? errors[field.name] : false) ? 'error.main' : 'text.secondary'}
                  >
                    {field.label}
                  </Typography>
                  <TextField
                    type={field.type || 'text'}
                    value={formData?.[field.name as keyof ReservationDto] ?? ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    fullWidth
                    variant="outlined"
                    error={errors ? !!errors[field.name] : false}
                  />
                </Box>
              ))}

              {/* Section ผู้โดยสาร Flight */}
              {typeValue === 'Flight' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    รายชื่อผู้โดยสาร
                  </Typography>
                  {passengers.map((p, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                      <TextField
                        label="ชื่อ"
                        value={p.name}
                        onChange={(e) => {
                          const newName = e.target.value;
                          handlePassengerChange(idx, 'name', newName);
                          const editedPassenger = { ...passengers[idx], name: newName };
                          handleChange(
                            'passengers',
                            passengers.with(idx, editedPassenger) as unknown as string
                          );
                        }}
                        fullWidth
                        size="small"
                        error={errors ? !!errors[`passenger-${idx}`] : false}
                      />
                      <TextField
                        label="เลขที่นั่ง"
                        value={p.seatNumber}
                        onChange={(e) => {
                          const newSeatNumber = e.target.value;
                          handlePassengerChange(idx, 'seatNumber', newSeatNumber);
                          const editedPassenger = { ...passengers[idx], seatNumber: newSeatNumber };
                          handleChange(
                            'passengers',
                            passengers.with(idx, editedPassenger) as unknown as string
                          );
                        }}
                        fullWidth
                        size="small"
                        error={errors ? !!errors[`passenger-${idx}`] : false}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removePassenger(idx)}
                        disabled={passengers.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      textAlign: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
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
          ตัวอย่างข้อมูลของ {typeValue && t(`ManualReservation.Type.${typeValue}`)}
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
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
          {typeValue === 'Lodging' && <LodgingCard data={formData} />}
          {typeValue === 'Restaurant' && <RestaurantCard data={formData} />}
          {typeValue === 'Flight' && formData && <FlightCard data={formData} />}

          {typeValue === 'Train' && <TrainCard data={formData} />}
          {typeValue === 'Bus' && <BusCard data={formData} />}
          {typeValue === 'Ferry' && <FerryCard data={formData} />}
          {typeValue === 'CarRental' && <CarRentalCard data={formData} />}

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pb: 2, mt: 2 }}>
            <Button
              variant="contained"
              sx={{
                borderRadius: 5,
                px: 3,
                textTransform: 'none',
                boxShadow: 'none',
                color: '#fff',
                bgcolor: '#25CF7A',
              }}
              onClick={handleConfirm}
            >
              ยืนยัน
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
