import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MENU_WIDTH, MOBILE_WIDTH } from '../../constants';
import { getAppbarWidth } from '../../utils';

export interface FrameState {
  isResizing: boolean;
  width: number;
}

const initialState: FrameState = {
  isResizing: false,
  width: window.innerWidth - getAppbarWidth(window.innerWidth)
};

export const frameSlice = createSlice({
  name: 'frame',
  initialState,
  reducers: {
    setFrameIsResizing: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isResizing: action.payload,
      };
    },
    setFrameWidth: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        width: action.payload,
      }
    },
  },
});

export const {
  setFrameIsResizing,
  setFrameWidth,
} = frameSlice.actions;

export const selectFrameIsResizing = (state: RootState) => state.frame.isResizing;
export const selectFrameWidth = (state: RootState) => state.frame.width;

export default frameSlice.reducer