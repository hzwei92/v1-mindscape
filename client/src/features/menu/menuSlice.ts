import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MOBILE_WIDTH, MENU_WIDTH } from '../../constants';
import { getAppbarWidth } from '../../utils';
import { MenuModeType } from './menu';

export interface MenuState {
  mode: MenuModeType;
  isResizing: boolean;
  width: number;
}

const initialState: MenuState = {
  mode: '',
  isResizing: false,
  width: window.innerWidth < MOBILE_WIDTH
    ? window.innerWidth - getAppbarWidth(window.innerWidth)
    : MENU_WIDTH,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuMode: (state, action: PayloadAction<{mode: MenuModeType, toggle:boolean}>) => {
      return {
        ...state,
        mode: action.payload.toggle
          ? action.payload.mode
          : action.payload.mode === state.mode
            ? ''
            : action.payload.mode,
      };
    },
    setMenuIsResizing: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isResizing: action.payload,
      }
    },
    setMenuWidth: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        width: action.payload,
      }
    },
  },
});

export const { setMenuMode, setMenuIsResizing, setMenuWidth } = menuSlice.actions;

export const selectMenuMode = (state: RootState) => state.menu.mode;
export const selectMenuIsResizing = (state: RootState) => state.menu.isResizing;
export const selectMenuWidth = (state: RootState) => state.menu.width;

export default menuSlice.reducer