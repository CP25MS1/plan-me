import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DefaultObjective } from '@/api/trips';

type ConstantState = {
  defaultObjectives: DefaultObjective[];
};

const initialState: ConstantState = {
  defaultObjectives: [],
};

const constantSlice = createSlice({
  name: 'constant',
  initialState,
  reducers: {
    setDefaultObjectives(state, action: PayloadAction<DefaultObjective[]>) {
      state.defaultObjectives = action.payload;
    },
  },
});

export const { setDefaultObjectives } = constantSlice.actions;
export default constantSlice.reducer;
