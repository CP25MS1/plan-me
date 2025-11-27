import { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material';

import { theme } from '@/providers/theme/theme';

const ThemeRegistry = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeRegistry;
