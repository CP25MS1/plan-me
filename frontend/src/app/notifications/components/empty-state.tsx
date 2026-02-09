import { Box, Typography } from '@mui/material';

export const EmptyState = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography fontSize={16} fontWeight={500}>
      ยังไม่มีการแจ้งเตือน
    </Typography>
    <Typography fontSize={14} color="text.secondary">
      เมื่อมีความเคลื่อนไหว เราจะแจ้งให้คุณทราบ
    </Typography>
  </Box>
);
