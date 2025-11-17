import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import { tokens } from './design-tokens';

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: tokens.color.primary,
        light: tokens.color.primaryLight,
        dark: tokens.color.primaryDark,
        contrastText: tokens.color.contrastText,
      },
      background: {
        default: tokens.color.background,
      },
      text: {
        primary: tokens.color.textPrimary,
      },
      success: { main: tokens.color.success, dark: tokens.color.successDark },
      error: { main: tokens.color.error, dark: tokens.color.errorDark },
      warning: { main: tokens.color.warning, dark: tokens.color.warningDark },
      info: { main: tokens.color.info, dark: tokens.color.infoDark },
    },
  })
);

export default theme;
