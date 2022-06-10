import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { PaletteMode } from '@mui/material';

export interface WindowState {
  mode: PaletteMode;
  width: number;
  height: number;
}

const initialState: WindowState = {
  mode: (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) ? 'dark' : 'light',
  width: window.innerWidth,
  height: window.innerHeight,
};

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {
    setSize: (state, action: PayloadAction<{width: number, height: number}>) => {
      return {
        ...state,
        width: action.payload.width,
        height: action.payload.height,
      }
    },
    setMode: (state, action: PayloadAction<PaletteMode>) => {
      return {
        ...state,
        mode: action.payload
      };
    },
    toggleMode: (state) => {
      return {
        ...state,
        mode: state.mode === 'dark' ? 'light' : 'dark',
      };
    },
  },
});

export const { setSize, setMode, toggleMode } = windowSlice.actions;

export const selectWidth = (state: RootState) => state.window.width;
export const selectHeight = (state: RootState) => state.window.height;
export const selectMode = (state: RootState) => state.window.mode;

export default windowSlice.reducer