import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToIdToIdToTrueType, IdToIdToTrueType } from '../../utils';
import { SpaceType } from '../space/space';
import { Arrow, CreateLinkType, IdToChildIdToTrueType, IdToHeightType, IdToParentIdType, IdToTrueType } from './arrow';

export interface ArrowState {
  createLink: CreateLinkType;
  commitArrowId: string;
  removeArrowId: string;
  'FRAME': {
    selectArrowId: string,
    sourceIdToTargetIdToLinkIdToTrue: IdToIdToIdToTrueType;
    linkIdToTrue: IdToTrueType;
    idToLinkIdToTrue: IdToIdToTrueType;
    idToHeight: IdToHeightType;
  },
  'FOCUS': {
    selectArrowId: '',
    sourceIdToTargetIdToLinkIdToTrue: IdToIdToIdToTrueType;
    linkIdToTrue: IdToTrueType;
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
    selectArrowId: '',
    sourceIdToTargetIdToLinkIdToTrue: {},
    linkIdToTrue: {},
    idToLinkIdToTrue: {},
    idToHeight: {},
  },
  'FOCUS': {
    selectArrowId: '',
    sourceIdToTargetIdToLinkIdToTrue: {},
    linkIdToTrue: {},
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
    setSelectArrowId: (state, action: PayloadAction<{space: SpaceType, arrowId: string}>) => {
      return {
        ...state,
        [action.payload.space]: {
          ...state[action.payload.space],
          selectArrowId: action.payload.arrowId
        }
      }
    },
    addArrows: (state, action: PayloadAction<{space: SpaceType, arrows: Arrow[]}>) => {
      const idToLinkIdToTrue: IdToIdToTrueType = {
        ...state[action.payload.space].idToLinkIdToTrue,
      };
      const linkIdToTrue: IdToTrueType = {
        ...state[action.payload.space].linkIdToTrue,
      };
      const sourceIdToTargetIdToLinkIdToTrue: IdToIdToIdToTrueType = {
        ...state[action.payload.space].sourceIdToTargetIdToLinkIdToTrue,
      };

      action.payload.arrows.forEach(arrow => {
        if (arrow.sourceId === arrow.targetId) return;

        sourceIdToTargetIdToLinkIdToTrue[arrow.sourceId] = {
          ...(sourceIdToTargetIdToLinkIdToTrue[arrow.sourceId] || {}),
          [arrow.targetId]: {
            ...((sourceIdToTargetIdToLinkIdToTrue[arrow.sourceId] || {})[arrow.targetId] || {}),
            [arrow.id]: true,
          },
        };
        linkIdToTrue[arrow.id] = true;
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
          sourceIdToTargetIdToLinkIdToTrue,
          linkIdToTrue,
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
  setSelectArrowId,
  addArrows,
  resetArrows,
} = arrowSlice.actions;

export const selectCreateLink = (state: RootState) => state.arrow.createLink;
export const selectCommitArrowId = (state: RootState) => state.arrow.commitArrowId;
export const selectRemoveArrowId = (state: RootState) => state.arrow.removeArrowId;
export const selectSelectArrowId = (space: SpaceType) => (state: RootState) => state.arrow[space].selectArrowId;
export const selectIdToHeight = (space: SpaceType) => (state: RootState) => state.arrow[space].idToHeight;
export const selectLinkIdToTrue = (space: SpaceType) => (state: RootState) => state.arrow[space].linkIdToTrue;
export const selectIdToLinkIdToTrue = (space: SpaceType) => (state: RootState) => state.arrow[space].idToLinkIdToTrue;
export const selectSourceIdToTargetIdToLinkIdToTrue = (space: SpaceType) => (state: RootState) => state.arrow[space].sourceIdToTargetIdToLinkIdToTrue;
export default arrowSlice.reducer