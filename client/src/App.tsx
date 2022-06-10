import { createTheme, Paper, Theme, ThemeProvider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { FRAME_MIN_WIDTH, MAX_Z_INDEX, MENU_MIN_WIDTH } from './constants';
import { selectUserId } from './features/user/userSlice';
import { selectMode, selectWidth, setMode, setSize } from './features/window/windowSlice';
import { useApolloClient } from '@apollo/client';
import { User } from './features/user/user';
import { SnackbarProvider } from 'notistack';
import AppBar from './AppBar';
import MenuComponent from './features/menu/MenuComponent';
import { selectMenuIsResizing, selectMenuMode, selectMenuWidth, setMenuIsResizing, setMenuWidth } from './features/menu/menuSlice';
import { getAppbarWidth } from './utils';
import FrameComponent from './features/frame/FrameComponent';
import { selectFrameIsResizing, setFrameIsResizing, setFrameWidth } from './features/frame/frameSlice';
import FocusComponent from './features/focus/FocusComponent';
import { FULL_USER_FIELDS } from './features/user/userFragments';

function App() {
  const client = useApolloClient();

  const mode = useAppSelector(selectMode);
  const width = useAppSelector(selectWidth);

  const userId = useAppSelector(selectUserId);
  const user = client.cache.readFragment({
    id: client.cache.identify({
      id: userId,
      __typename: 'User',
    }),
    fragment: FULL_USER_FIELDS,
    fragmentName: 'FullUserFields',
  }) as User;
  
  const menuIsResizing = useAppSelector(selectMenuIsResizing);
  const menuMode = useAppSelector(selectMenuMode);
  const menuWidth = useAppSelector(selectMenuWidth);
  const menuWidth1 = menuMode
    ? menuWidth
    : 0;
  const frameIsResizing = useAppSelector(selectFrameIsResizing);

  const [theme, setTheme] = useState(null as Theme | null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      dispatch(setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    };

    window.addEventListener('resize', handleResize);

    const handlePaletteModeChange =  (event: any) => {
      dispatch(setMode(event.matches 
        ? 'dark' 
        : 'light'
      ));
    }

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', handlePaletteModeChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', handlePaletteModeChange)
    }
  }, []);

  useEffect(() => {
    setTheme(createTheme({
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
      palette: {
        primary: {
          main: user?.color || (mode === 'dark' ? '#ffffff' : '#000000'),
        },
        mode,
      },
    }));
  }, [user?.color, mode]);

  if (!theme) return null;

  const handleMouseMove = (event: React.MouseEvent) => {
    if (menuIsResizing) {
      event.preventDefault();
      dispatch(setMenuWidth(
        Math.max(event.clientX - getAppbarWidth(width), MENU_MIN_WIDTH)
      ));
    }
    else if (frameIsResizing) {
      event.preventDefault();
      dispatch(setFrameWidth(
        Math.max(event.clientX - getAppbarWidth(width) - menuWidth1, FRAME_MIN_WIDTH)
      ));
    }
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (menuIsResizing) {
      event.preventDefault();
      dispatch(setMenuIsResizing(false));
    }
    else if (frameIsResizing) {
      event.preventDefault();
      dispatch(setFrameIsResizing(false));
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        preventDuplicate={true}
        dense={true}
        autoHideDuration={10000}
      >
        <Paper onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} sx={{
          height: '100%',
          width: '100%',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'row',
        }}>
          <AppBar user={user} />
          <MenuComponent user={user} />
          <FrameComponent user={user} />
          <FocusComponent user={user} />
        </Paper>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App;
