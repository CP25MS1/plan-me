import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PublicUserInfo, UserProfile } from '@/api/users';
import { PendingInvitationDto } from '@/api/invite';

type ProfileState = {
  currentUser: UserProfile | null;
  invitations: PendingInvitationDto[];
};

const initialState: ProfileState = {
  currentUser: null,
  invitations: [],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<UserProfile | null>) {
      if (!action.payload) return;
      state.currentUser = action.payload;
    },
    followUser(state, action: PayloadAction<PublicUserInfo>) {
      if (!state.currentUser) return;
      const exists = state.currentUser.following.find((u) => u.id === action.payload.id);
      if (!exists) state.currentUser.following.push(action.payload);
    },
    unfollowUser(state, action: PayloadAction<number>) {
      if (!state.currentUser) return;
      state.currentUser.following = state.currentUser.following.filter(
        (u) => u.id !== action.payload
      );
    },
    removeFollower(state, action: PayloadAction<number>) {
      if (!state.currentUser) return;
      state.currentUser.followers = state.currentUser.followers.filter(
        (u) => u.id !== action.payload
      );
    },
    setInvitations(state, action: PayloadAction<PendingInvitationDto[]>) {
      state.invitations = action.payload;
    },
    removeInvitation(state, action: PayloadAction<{ invitationId: number }>) {
      const invitationId = action.payload.invitationId;
      const removedIndex = state.invitations.findIndex((i) => i.invitationId === invitationId);
      if (removedIndex === -1) return;
      state.invitations.splice(removedIndex, 1);
    },
  },
});

export const {
  setCurrentUser,
  followUser,
  unfollowUser,
  removeFollower,
  setInvitations,
  removeInvitation,
} = profileSlice.actions;
export default profileSlice.reducer;
