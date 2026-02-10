import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PublicUserInfo } from '@/api/users';

export type TripmateStatus = 'JOINED' | 'INVITED';

export interface InviteUser extends PublicUserInfo {
  status: TripmateStatus;
}

type InviteState = {
  friends: InviteUser[];
  tripmates: InviteUser[];
};

const initialState: InviteState = {
  friends: [],
  tripmates: [],
};

const inviteSlice = createSlice({
  name: 'invite',

  initialState,

  reducers: {
    setFriends(state, action: PayloadAction<InviteUser[]>) {
      state.friends = action.payload;
    },

    setTripmates(state, action: PayloadAction<InviteUser[]>) {
      state.tripmates = action.payload;
    },

    addTripmate(state, action: PayloadAction<InviteUser>) {
      const exists = state.tripmates.find((u) => u.id === action.payload.id);
      if (!exists) {
        state.tripmates.push(action.payload);
      }
    },

    clearInviteStore(state) {
      state.friends = [];
      state.tripmates = [];
    },
  },
});

export const { setFriends, setTripmates, addTripmate, clearInviteStore } = inviteSlice.actions;

export default inviteSlice.reducer;
