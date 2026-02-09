import { PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState } from '@/store/notifications-slice';

export const notificationsReducers = {
  receiveNotifications(state: NotificationsState, { payload }: PayloadAction<NotificationsState>) {
    state.push(...payload);
  },
  markNotificationAsRead(
    state: NotificationsState,
    { payload }: PayloadAction<{ notificationId: number }>
  ) {
    const readId = state.findIndex((n) => n.id === payload.notificationId);
    state[readId] = { ...state[readId], isRead: true };
  },
};
