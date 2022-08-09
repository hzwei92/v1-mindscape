import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import type { IdToType } from '../../types';
import { setInit, setLogin, setLogout } from '../auth/authSlice';
import { SpaceType } from '../space/space';
import { mergeTwigs } from '../twig/twigSlice';
import type { User } from './user';

export interface UserState {
  currentUser: User | null;
  [SpaceType.FRAME]: {
    idToUser: IdToType<User>;
  };
  [SpaceType.FOCUS]: {
    idToUser: IdToType<User>;
  };
}

const initialState: UserState = {
  currentUser: null,
  [SpaceType.FRAME]: {
    idToUser: {},
  },
  [SpaceType.FOCUS]: {
    idToUser: {},
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      return {
        ...state,
        currentUser: action.payload,
      }
    },
    resetUsers: (state, action: PayloadAction<SpaceType>) => {
      return {
        ...state,
        [action.payload]: {
          idToUser: {},
        }
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setInit, (state, action) => {
        if (!action.payload) {
          return initialState;
        }
      })
      .addCase(setLogin, (state, action) => {
        return {
          ...initialState,
          currentUser: action.payload,
        };
      })
      .addCase(setLogout, () => {
        return initialState;
      })
      .addCase(mergeTwigs, (state, action) => {
        const idToUser = action.payload.twigs.reduce((acc, twig) => {
          if (!twig.deleteDate) {
            acc[twig.userId] = Object.assign({}, 
              acc[twig.userId], 
              twig.user
            );
            if (twig.detail) {
              acc[twig.detail.userId] = Object.assign({}, 
                acc[twig.detail.userId], 
                twig.detail.user
              );
            }
          }
          return acc;
        }, { 
          ...state[action.payload.space].idToUser
        });

        return {
          ...state,
          [action.payload.space]: {
            idToUser,
          }
        };
      });
  },
});

export const {
  setCurrentUser,
  resetUsers,
} = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectIdToUser = (space: SpaceType) => (state: RootState) => state.user[space].idToUser;

export default userSlice.reducer