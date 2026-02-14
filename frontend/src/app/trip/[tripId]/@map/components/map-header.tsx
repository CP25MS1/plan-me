import { Box, IconButton } from '@mui/material';
import { ChevronLeft } from 'lucide-react';
import { TruncatedTooltip } from '@/components/atoms';
import { ReactNode } from 'react';

type MapHeaderProps = {
  title: string;
  onBack?: () => void;
  cta?: ReactNode;
};

const MapHeader = ({ title, onBack, cta }: MapHeaderProps) => {
  const handleOnBack = () => {
    if (onBack) return onBack();
    if (globalThis.history.length > 1) return globalThis.history.back();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 1.25,
      }}
    >
      <IconButton onClick={handleOnBack}>
        <ChevronLeft />
      </IconButton>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          textAlign: 'center',
        }}
      >
        <TruncatedTooltip text={title} className="text-2xl" />
      </Box>

      <Box sx={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>{cta}</Box>
    </Box>
  );
};

export default MapHeader;
