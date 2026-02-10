import { RootState } from '../index';

export const selectFriends = (state: RootState) => state.invite.friends;

export const selectTripmates = (state: RootState) => state.invite.tripmates;
