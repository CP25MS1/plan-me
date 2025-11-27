'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Locale = 'en' | 'th';

interface I18nState {
  locale: Locale;
}

const initialState: I18nState = {
  locale: 'th',
};

const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = i18nSlice.actions;
export default i18nSlice.reducer;
