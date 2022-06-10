import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToIdToTrueType } from '../../utils';
import { SpaceType } from '../space/space';
import { Arrow, CreateLinkType, IdToChildIdToTrueType, IdToHeightType, IdToParentIdType, IdToTrueType } from './arrow';

export interface ArrowState {
  createLink: CreateLinkType;
  commitArrowId: string;
  removeArrowId: string;
  'FRAME': {
    idToLinkIdToTrue: IdToIdToTrueType;
    idToHeight: IdToHeightType;
  },
  'FOCUS': {
    idToLinkIdToTrue: IdToIdToTrueType;
    idToHeight: IdToHeightType;
  },
}

const initialState: ArrowState = {
  createLink: {
    sourceId: '',
    targetId: '',
  },
  commitArrowId: '',
  removeArrowId: '',
  'FRAME': {
    idToLinkIdToTrue: {},
    idToHeight: {},
  },
  'FOCUS': {
    idToLinkIdToTrue: {},
    idToHeight: {},
  }
};

export const arrowSlice = createSlice({
  name: 'arrow',
  initialState,
  reducers: {
    setCreateLink: (state, action: PayloadAction<CreateLinkType>) => {
      return {
        ...state,
        createLink: action.payload,
      };
    },
    setCommitArrowId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        commitArrowId: '',
      }
    },
    setRemoveArrowId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        removeArrowId: '',
      }
    },
    addArrows: (state, action: PayloadAction<{space: SpaceType, arrows: Arrow[]}>) => {
      const idToLinkIdToTrue: IdToIdToTrueType = {
        ...state[action.payload.space].idToLinkIdToTrue,
      };

      action.payload.arrows.forEach(arrow => {
        idToLinkIdToTrue[arrow.targetId] = {
          ...idToLinkIdToTrue[arrow.targetId],
          [arrow.id]: true,
        };
        idToLinkIdToTrue[arrow.sourceId] = {
          ...idToLinkIdToTrue[arrow.sourceId],
          [arrow.id]: true,
        }
      });

      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          idToLinkIdToTrue,
        }
      }
    },
    resetArrows: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: initialState[action.payload],
      };
    },
  },
});

export const {
  setCreateLink,
  setCommitArrowId,
  setRemoveArrowId,
  addArrows,
  resetArrows,
} = arrowSlice.actions;

export const selectCreateLink = (state: RootState) => state.arrow.createLink;
export const selectCommitArrowId = (state: RootState) => state.arrow.commitArrowId;
export const selectRemoveArrowId = (state: RootState) => state.arrow.removeArrowId;
export const selectIdToHeight = (space: SpaceType) => (state: RootState) => state.arrow[space].idToHeight;
export const selectIdToLinkIdToTrue = (space: SpaceType) => (state: RootState) => state.arrow[space].idToLinkIdToTrue;
export default arrowSlice.reducer