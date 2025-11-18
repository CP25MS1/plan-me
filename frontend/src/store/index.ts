import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import profileReducer from './profile-slice';
import i18nReducer from './i18n-slice';
import constantReducer from './constant-slice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    i18n: i18nReducer,
    constant: constantReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
