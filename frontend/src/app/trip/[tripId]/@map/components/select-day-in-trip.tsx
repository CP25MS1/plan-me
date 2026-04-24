import { Box, FormControl, MenuItem, Select } from '@mui/material';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DailyPlan } from '@/api/trips';

type SelectDayInTripProps = {
  dailyPlans: DailyPlan[];
  selectedDay: 'ALL' | number;
  onChange: (v: 'ALL' | number) => void;
};

const SelectDayInTrip = ({ dailyPlans, selectedDay, onChange }: SelectDayInTripProps) => {
  const { t } = useTranslation('trip_overview');

  return (
    <Box sx={{ marginLeft: 'auto', minWidth: '25%' }}>
      <FormControl fullWidth size="small">
        <Select
          value={selectedDay}
          onChange={(e) => onChange(e.target.value as 'ALL' | number)}
          size="small"
          renderValue={(value) =>
            value === 'ALL'
              ? t('map.selectDay.all')
              : t('map.selectDay.dayLabel', { day: Number(value) + 1 })
          }
          sx={{
            '& .MuiSelect-icon': { display: 'none' },
            '& .MuiSelect-select': {
              paddingRight: '16px !important',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          {/* ALL */}
          <MenuItem value="ALL">
            <MapPin size={18} style={{ marginRight: 6 }} />
            {t('map.selectDay.all')}
          </MenuItem>

          {/* Days */}
          {dailyPlans.map((day, index) => (
            <MenuItem key={day.id} value={index}>
              <MapPin
                size={18}
                style={{
                  marginRight: 6,
                  color: day.pinColor,
                }}
              />
              {t('map.selectDay.dayLabel', { day: index + 1 })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectDayInTrip;
