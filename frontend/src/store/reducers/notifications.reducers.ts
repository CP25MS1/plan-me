import { PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState } from '@/store/notifications-slice';
import { NotificationDto } from '@/api/notification';

export const notificationsReducers = {
  receiveNotifications(state: NotificationsState, { payload }: PayloadAction<NotificationsState>) {
    state.push(...payload);
  },
  updateNotification(state: NotificationsState, { payload }: PayloadAction<NotificationDto>) {
    const index = state.findIndex((n) => n.id === payload.id);
    if (index === -1) return;
    state[index] = payload;
  },
};
