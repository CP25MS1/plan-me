import { Box, Typography } from '@mui/material';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

const EmptyDailyPlanState = () => {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 520,
        }}
      >
        <EventBusyOutlinedIcon
          sx={{
            fontSize: 64,
            color: 'text.disabled',
            mb: 2,
          }}
        />

        <Typography variant="h5" fontWeight={600} gutterBottom>
          ยังไม่สามารถวางแผนทริปรายวันได้
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          เนื่องจากยังไม่ได้กำหนดช่วงวันของทริป กรุณาระบุวันเริ่มต้นและวันสิ้นสุดก่อน
        </Typography>
      </Box>
    </Box>
  );
};

export default EmptyDailyPlanState;
