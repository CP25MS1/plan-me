import React from 'react';
import { Tooltip } from '@mui/material';

type TruncatedTooltipProps = {
  text: string;
  className?: string;
};

export const TruncatedTooltip: React.FC<TruncatedTooltipProps> = ({ text, className = '' }) => {
  return (
    <Tooltip title={text} arrow disableInteractive>
      <div
        className={`inline-block align-middle truncate ${className}`}
        style={{
          // ensure truncation behavior — override maxWidth via style or className
          maxWidth: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle',
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};

export default TruncatedTooltip;
