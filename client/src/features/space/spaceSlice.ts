import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { MOBILE_WIDTH } from '../../constants';
import { DragState, ScrollState, SpaceType } from './space';

export interface SpaceState {
  space: SpaceType;
  FRAME: {
    isOpen: boolean;
    twigId: string;
    scale: number;
    scroll: ScrollState;
    drag: DragState;
  }
  FOCUS: {
    isOpen: boolean;
    twigId: string;
    scale: number;
    scroll: ScrollState;
    drag: DragState;
  }
}

const initialState: SpaceState = {
  space: 'FRAME',
  FRAME: {
    isOpen: true,
    twigId: '',
    scale: window.innerWidth < MOBILE_WIDTH 
      ? 0.5 
      : 1,
    drag: {
      isScreen: false,
      twigId: '',
      dx: 0,
      dy: 0,
      targetTwigId: '',
    },
    scroll: {
      left: 0,
      top: 0,
    },
  },
  FOCUS: {
    isOpen: false,
    twigId: '',
    scale: window.innerWidth < MOBILE_WIDTH 
      ? 0.5 
      : 1,
    drag: {
      isScreen: false,
      twigId: '',
      dx: 0,
      dy: 0,
      targetTwigId: '',
    },
    scroll: {
      left: 0,
      top: 0,
    },
  },
};

export const spaceSlice = createSlice({
  name: 'space',
  initialState,
  reducers: {
    setSpace: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        space: action.payload,
        [action.payload]: {
          ...state[action.payload],
          isOpen: true
        },
      };
    },
    setIsOpen: (state, action: PayloadAction<{space: SpaceType, isOpen: boolean}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          isOpen: action.payload.isOpen
        },
      };
    },
    setTwigId: (state, action: PayloadAction<{space: SpaceType, twigId: string}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          twigId: action.payload.twigId,
        },
      }
    },
    setScale: (state, action: PayloadAction<{space: SpaceType, scale: number}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          scale: action.payload.scale,
        },
      }
    },
    setScroll: (state, action: PayloadAction<{space: SpaceType, scroll: ScrollState}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          scroll: action.payload.scroll,
        },
      }
    },
    setDrag: (state, action: PayloadAction<{space: SpaceType, drag: DragState}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          drag: action.payload.drag,
        },
      }
    },
  }
});

export const {
  setSpace,
  setIsOpen,
  setTwigId,
  setScale,
  setScroll,
  setDrag,
} = spaceSlice.actions;

export const selectSpace = (state: RootState) => state.space.space;
export const selectIsOpen = (space: SpaceType) => (state: RootState) => state.space[space].isOpen;
export const selectTwigId = (space: SpaceType) => (state: RootState) => state.space[space].twigId;
export const selectScale = (space: SpaceType) => (state: RootState) => state.space[space].scale;
export const selectScroll = (space: SpaceType) => (state: RootState) => state.space[space].scroll;
export const selectDrag = (space: SpaceType) => (state: RootState) => state.space[space].drag;


export default spaceSlice.reducer