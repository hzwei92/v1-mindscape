import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Arrow } from '../arrow/arrow';
import { SpaceType } from '../space/space';
import { Twig } from '../twig/twig';
import { IdToTrueType } from './user';


export interface UserState {
  userId: string;
  FRAME: {
    userIdToTrue: IdToTrueType;
  };
  FOCUS: {
    userIdToTrue: IdToTrueType;
  };
}

const initialState: UserState = {
  userId: '',
  FRAME: {
    userIdToTrue: {},
  },
  FOCUS: {
    userIdToTrue: {},
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        userId: action.payload,
      };
    },
    addTwigUsers: (state, action: PayloadAction<{space: SpaceType, twigs: Twig[]}>) => {
      return {
        ...state,
        [action.payload.space]: {
          userIdToTrue: action.payload.twigs.reduce((acc, twig) => {
            acc[twig.userId] = true;
            acc[twig.detail.userId] = true;
            return acc;
          }, { ...state[action.payload.space].userIdToTrue })
        }
      }
    },
    resetUsers: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: initialState[action.payload]
      };
    },
  },
});

export const { setUserId, addTwigUsers, resetUsers } = userSlice.actions;

export const selectUserId = (state: RootState) => state.user.userId;
export const selectUserIdToTrue = (space: SpaceType) => (state: RootState) => state.user[space].userIdToTrue;

export default userSlice.reducer