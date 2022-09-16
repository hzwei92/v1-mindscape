import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import arrowReducer from '../features/arrow/arrowSlice';
import searchReducer from '../features/search/searchSlice';
import twigReducer from '../features/twig/twigSlice';
import userReducer from '../features/user/userSlice';
import sheafReducer from '../features/sheaf/sheafSlice';
import spaceReducer from '../features/space/spaceSlice';
import entryReducer from '../features/entry/entrySlice';
import voteReducer from '../features/vote/voteSlice';
import tabReducer from '../features/tab/tabSlice';

export const store = configureStore({
  reducer: {
    arrow: arrowReducer,
    auth: authReducer,
    entry: entryReducer,
    search: searchReducer,
    sheaf: sheafReducer,
    space: spaceReducer,
    tab: tabReducer,
    twig: twigReducer,
    user: userReducer,
    vote: voteReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
