import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToIdToTrueType, IdToTrueType } from '../../utils';
import { SpaceType } from '../space/space';
import { IdToHeightType, IToTwigIdType, ArrowIdToTwigIdType, Twig } from './twig';

export interface TwigState {
  'FRAME': {
    idToDescIdToTrue: IdToIdToTrueType;
    twigIdToTrue: IdToTrueType;
    idToHeight: IdToHeightType;
    iToTwigId: IToTwigIdType;
    detailIdToTwigId: ArrowIdToTwigIdType;
    newTwigId: string;
  },
  'FOCUS': {
    idToDescIdToTrue: IdToIdToTrueType;
    twigIdToTrue: IdToTrueType;
    idToHeight: IdToHeightType;
    iToTwigId: IToTwigIdType;
    detailIdToTwigId: ArrowIdToTwigIdType;
    newTwigId: string;
  },
}

const initialState: TwigState = {
  'FRAME': {
    idToDescIdToTrue: {},
    twigIdToTrue: {},
    idToHeight: {},
    iToTwigId: {},
    detailIdToTwigId: {},
    newTwigId: '',
  },
  'FOCUS': {
    idToDescIdToTrue: {},
    twigIdToTrue: {},
    idToHeight: {},
    iToTwigId: {},
    detailIdToTwigId: {},
    newTwigId: '',
  }
};

export const twigSlice = createSlice({
  name: 'twig',
  initialState,
  reducers: {
    addTwigs: (state, action: PayloadAction<{space: SpaceType, twigs: Twig[]}>) => {
      const detailIdToTwigId: ArrowIdToTwigIdType = {
        ...state[action.payload.space].detailIdToTwigId,
      };
      const iToTwigId: IToTwigIdType = {
        ...state[action.payload.space].iToTwigId,
      };
      const twigIdToTrue: IdToTrueType = {
        ...state[action.payload.space].twigIdToTrue,
      }

      action.payload.twigs.forEach(twig => {
        detailIdToTwigId[twig.detailId] = twig.id;
        iToTwigId[twig.i] = twig.id;
        twigIdToTrue[twig.id] = true;
      });

      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          detailIdToTwigId,
          iToTwigId,
          twigIdToTrue,
        }

      };
    },
    setIdToDescIdToTrue: (state, action: PayloadAction<{space: SpaceType, idToDescIdToTrue: IdToIdToTrueType}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToDescIdToTrue: action.payload.idToDescIdToTrue,
        }
      };
    },
    removeTwigs: (state, action: PayloadAction<{space: SpaceType, twigs: Twig[]}>) => {
      const detailIdToTwigId: ArrowIdToTwigIdType = {
        ...state[action.payload.space].detailIdToTwigId,
      };
      const iToTwigId: IToTwigIdType = {
        ...state[action.payload.space].iToTwigId,
      };
      const twigIdToTrue: IdToTrueType = {
        ...state[action.payload.space].twigIdToTrue,
      }
      const idToHeight: IdToHeightType = {
        ...state[action.payload.space].idToHeight,
      }
      action.payload.twigs.forEach(twig => {
        delete detailIdToTwigId[twig.detailId];
        delete iToTwigId[twig.i];
        delete twigIdToTrue[twig.id];
        delete idToHeight[twig.id];
      });
      return {
        ...state, 
        [action.payload.space]: {
          ...state[action.payload.space],
          detailIdToTwigId,
          iToTwigId,
          twigIdToTrue,
          idToHeight,
        }
      }
    },
    setTwigHeight: (state, action: PayloadAction<{space: SpaceType, twigId: string, height: number}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToHeight: {
            ...state[action.payload.space].idToHeight,
            [action.payload.twigId]: action.payload.height,
          },
        },
      };
    },
    startNewTwig: (state, action: PayloadAction<{space: SpaceType, newTwigId: string}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          newTwigId: action.payload.newTwigId,
        }
      };
    },
    finishNewTwig: (state, action: PayloadAction<{space: SpaceType}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          newTwigId: '',
        }
      };
    },
    resetTwigs: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          idToCoords: {},
          idToHeight: {},
        },
      };
    },
  },
});

export const {
  addTwigs,
  removeTwigs,
  setIdToDescIdToTrue,
  setTwigHeight,
  startNewTwig,
  finishNewTwig,
  resetTwigs,
} = twigSlice.actions;

export const selectIdToDescIdToTrue = (space: SpaceType) => (state: RootState) => state.twig[space].idToDescIdToTrue;
export const selectTwigIdToTrue = (space: SpaceType) => (state: RootState) => state.twig[space].twigIdToTrue;
export const selectNewTwigId = (space: SpaceType) => (state: RootState) => state.twig[space].newTwigId;
export const selectIdToHeight = (space: SpaceType) => (state: RootState) => state.twig[space].idToHeight;
export const selectIToTwigId = (space: SpaceType) => (state: RootState) => state.twig[space].iToTwigId;
export const selectDetailIdToTwigId = (space: SpaceType) => (state: RootState) => state.twig[space].detailIdToTwigId;

export default twigSlice.reducer