import { Box, FormControl, MenuItem, Select } from '@mui/material';
import { MapPin } from 'lucide-react';

import { DailyPlan } from '@/api/trips';

type SelectDayInTripProps = {
  dailyPlans: DailyPlan[];
  selectedDay: 'ALL' | number;
  onChange: (v: 'ALL' | number) => void;
};

const SelectDayInTrip = ({ dailyPlans, selectedDay, onChange }: SelectDayInTripProps) => {
  return (
    <Box sx={{ marginLeft: 'auto', minWidth: '25%' }}>
      <FormControl fullWidth size="small">
        <Select
          value={selectedDay}
          onChange={(e) => onChange(e.target.value as 'ALL' | number)}
          size="small"
          renderValue={(value) => (value === 'ALL' ? 'ทั้งหมด' : `วันที่ ${Number(value) + 1}`)}
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
            ทั้งหมด
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
              วันที่ {index + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelectDayInTrip;
