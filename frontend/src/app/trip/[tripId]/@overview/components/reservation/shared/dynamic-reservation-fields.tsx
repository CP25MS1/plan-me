'use client';

import { Box, Typography, TextField } from '@mui/material';
import { DatePicker, TimePicker, DateTimePicker } from '@mui/x-date-pickers';
import { tokens } from '@/providers/theme/design-tokens';
import dayjs from 'dayjs';
import { ReservationDto } from '@/api/reservations/type';
import { fieldsByType } from '../../fields-by-type';

interface DynamicReservationFieldsProps {
  typeValue: string;
  formData: ReservationDto | null;
  errors: Record<string, boolean> | null;
  handleChange: (name: string, val: string) => void;
  fieldsRef: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export default function DynamicReservationFields({
  typeValue,
  formData,
  errors,
  handleChange,
  fieldsRef,
}: DynamicReservationFieldsProps) {
  if (!typeValue || !fieldsByType[typeValue]?.length) return null;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              if (fieldsRef && fieldsRef.current) {
                fieldsRef.current[field.name] = el;
              }
            }}
            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography
              variant="body2"
              color={(errors ? errors[field.name] : false) ? 'error.main' : 'text.secondary'}
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
                    ? dayjs(formData?.[field.name as keyof ReservationDto] as string, 'HH:mm')
                    : null
                }
                onChange={(value) => handleChange(field.name, value ? value.format('HH:mm') : '')}
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
    </Box>
  );
}
