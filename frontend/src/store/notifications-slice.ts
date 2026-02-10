import { createSlice } from '@reduxjs/toolkit';
import { NotificationDto } from '@/api/notification';
import { notificationsReducers } from '@/store/reducers/notifications.reducers';

export type NotificationsState = NotificationDto[];

const initialState: NotificationsState = [];

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    ...notificationsReducers,
  },
});

export const { receiveNotifications, updateNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
