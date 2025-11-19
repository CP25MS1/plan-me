'use client';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';

export default function SectionCard({ title, label }: { title: string; label: string }) {
  return (
    <Accordion
      defaultExpanded
      sx={{
        mb: 2,
        borderRadius: '16px !important',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Paper
          variant="outlined"
          sx={{
            borderStyle: 'dashed',
            borderRadius: 2,
            borderColor: 'primary',
            backgroundColor: 'success.light',
            p: 2,
            cursor: 'pointer',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <AddIcon sx={{ color: 'primary' }} />
            <Typography sx={{ fontWeight: 700, color: 'primary' }}>{label}</Typography>
          </Box>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
}
