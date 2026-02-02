import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import profileReducer from './profile-slice';
import i18nReducer from './i18n-slice';
import constantReducer from './constant-slice';
import tripOverviewReducer from './trip-detail-slice';
import routeReducer from './route-slice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    i18n: i18nReducer,
    constant: constantReducer,
    tripDetail: tripOverviewReducer,
    route: routeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
