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
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        paddingX: 1,
        paddingY: 1.25,
      }}
    >
      {/* Left */}
      <Box>
        <IconButton onClick={handleOnBack}>
          <ChevronLeft />
        </IconButton>
      </Box>

      {/* Center (title) */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '70%',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <TruncatedTooltip text={title} className="text-2xl" />
      </Box>

      {/* Right (CTA) */}
      {cta}
    </Box>
  );
};

export default MapHeader;
