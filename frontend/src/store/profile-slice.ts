import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PublicUserInfo, UserProfile } from '@/api/users';

type ProfileState = {
  currentUser: UserProfile | null;
  currentUserId: number | null;
};

const initialState: ProfileState = {
  currentUser: null,
  currentUserId: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<UserProfile>) {
      state.currentUser = action.payload;
      state.currentUserId = action.payload.id;
    },
    setCurrentUserId(state, action: PayloadAction<number>) {
      state.currentUserId = action.payload;
      if (state.currentUser) {
        state.currentUser.id = action.payload;
      }
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
  },
});

export const { setCurrentUser, setCurrentUserId, followUser, unfollowUser, removeFollower } =
  profileSlice.actions;
export default profileSlice.reducer;
