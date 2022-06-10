import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MENU_WIDTH, MOBILE_WIDTH } from '../../constants';
import { getAppbarWidth } from '../../utils';

export interface FocusState {
  isSynced: boolean;
  shouldSync: boolean;
}

const initialState: FocusState = {
  isSynced: true,
  shouldSync: false,
};

export const frameSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    setFocusIsSynced: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isSynced: action.payload
      }
    },
    setFocusShouldSync: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        shouldSync: action.payload
      }
    },
  },
});

export const {
  setFocusIsSynced,
  setFocusShouldSync,
} = frameSlice.actions;

export const selectFocusIsSynced = (state: RootState) => state.focus.isSynced;
export const selectFocusShouldSync = (state: RootState) => state.focus.shouldSync;

export default frameSlice.reducer