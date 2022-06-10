import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import focusReducer from '../features/focus/focusSlice';
import frameReducer from '../features/frame/frameSlice';
import menuReducer from '../features/menu/menuSlice';
import arrowReducer from '../features/arrow/arrowSlice';
import searchReducer from '../features/search/searchSlice';
import spaceReducer  from '../features/space/spaceSlice';
import twigReducer from '../features/twig/twigSlice';
import userReducer from '../features/user/userSlice';
import windowReducer from '../features/window/windowSlice';

export const store = configureStore({
  reducer: {
    arrow: arrowReducer,
    auth: authReducer,
    focus: focusReducer,
    frame: frameReducer,
    menu: menuReducer,
    search: searchReducer,
    space: spaceReducer,
    twig: twigReducer,
    user: userReducer,
    window: windowReducer,
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
