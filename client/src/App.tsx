import { createTheme, PaletteMode, Paper, ThemeProvider } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useReducer, useState } from 'react';
import { useAppSelector } from './app/hooks';
import { FOCUS_WIDTH, MAX_Z_INDEX, MENU_WIDTH } from './constants';
import { selectCurrentUser } from './features/user/userSlice';
import { SnackbarProvider } from 'notistack';
import AppBar from './AppBar';
import MenuComponent from './features/menu/MenuComponent';
import { getAppbarWidth, getColor } from './utils';
import FrameComponent from './features/frame/FrameComponent';
import FocusComponent from './features/focus/FocusComponent';
import { User } from './features/user/user';
import { MenuMode } from './features/menu/menu';
import { DirectionType, PosType, SpaceState, SpaceType } from './features/space/space';
import { IdToType } from './types';
import { selectIsOpen } from './features/space/spaceSlice';

export const AppContext = React.createContext({} as {
  user: User | null;

  width: number;
  height: number;

  palette: PaletteMode;
  setPalette: Dispatch<SetStateAction<PaletteMode>>;
  dimColor: string;
  brightColor: string;
  
  appBarWidth: number;

  menuMode: MenuMode;
  setMenuMode: Dispatch<SetStateAction<MenuMode>>;
  menuIsResizing: boolean;
  setMenuIsResizing: Dispatch<SetStateAction<boolean>>;
  menuWidth: number;

  focusWidth: number;
});

function App() {
  //console.log('app');
  const user = useAppSelector(selectCurrentUser);
  
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const [appBarWidth, setAppBarWidth] = useState(getAppbarWidth(width));

  const [palette, setPalette] = useState('dark' as PaletteMode);
  const [dimColor, setDimColor] = useState(getColor(palette, true));
  const [brightColor, setBrightColor] = useState(getColor(palette, false));

  const [menuMode, setMenuMode] = useState(MenuMode.NONE);
  const [latentMenuWidth, setLatentMenuWidth] = useState(MENU_WIDTH);
  const [menuWidth, setMenuWidth] = useState(0); 
  const [menuIsResizing, setMenuIsResizing] = useState(false);
  
  const [latentFocusWidth, setLatentFocusWidth] = useState(FOCUS_WIDTH);
  const [focusWidth, setFocusWidth] = useState(0);

  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));

  const frameIsOpen = useAppSelector(selectIsOpen(SpaceType.FRAME));

  const [theme, setTheme] = useState(createTheme({
    zIndex: {
      modal: MAX_Z_INDEX + 1000,
      snackbar: MAX_Z_INDEX + 10000
    },
    palette: {
      primary: {
        main: user?.color || (palette === 'dark' ? '#ffffff' : '#000000'),
      },
      mode: palette,
    },
  }));

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      setAppBarWidth(getAppbarWidth(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);

    const handlePaletteModeChange = (event: any) => {
      setPalette(event.matches ? 'dark' : 'light');
      setDimColor(getColor(palette, true));
      setBrightColor(getColor(palette, false));
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
          main: user?.color || (palette === 'dark' ? '#ffffff' : '#000000'),
        },
        mode: palette,
      },
    }));
  }, [user?.color, palette]);

  useEffect(() => {
    setMenuWidth(menuMode === MenuMode.NONE
      ? 0
      : latentMenuWidth
    )
  }, [menuMode]);
  
  useEffect(() => {
    setDimColor(getColor(palette, true));
    setBrightColor(getColor(palette, false));
  }, [palette]);

  useEffect(() => {
    if (focusIsOpen) {
      if (frameIsOpen) {
        setFocusWidth(latentFocusWidth);
      }
      else {
        setFocusWidth(width - appBarWidth - menuWidth);
      }
    }
    else {
      setFocusWidth(0);
    }
  }, [focusIsOpen, frameIsOpen]);

  const handleMouseMove = (event: React.MouseEvent) => {
    // if (menuIsResizing) {
    //   event.preventDefault();
    //   dispatch(setMenuWidth(
    //     Math.max(event.clientX - getAppbarWidth(width), MENU_MIN_WIDTH)
    //   ));
    // }
    // else if (frameIsResizing) {
    //   event.preventDefault();
    //   dispatch(setFocusWidth(
    //     Math.max(event.clientX - getAppbarWidth(width) - menuWidth1, FRAME_MIN_WIDTH)
    //   ));
    // }
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    // if (menuIsResizing) {
    //   event.preventDefault();
    //   dispatch(setMenuIsResizing(false));
    // }
    // else if (frameIsResizing) {
    //   event.preventDefault();
    //   dispatch(setFrameIsResizing(false));
    // }
  }

  return (
    <AppContext.Provider value={{
      user,

      width,
      height,

      palette,
      setPalette,
      dimColor,
      brightColor,

      appBarWidth,

      menuMode,
      setMenuMode,
      menuIsResizing,
      setMenuIsResizing,
      menuWidth,

      focusWidth,
    }}>
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
            <AppBar />
            <MenuComponent />
            <FocusComponent />
            <FrameComponent />
          </Paper>
        </SnackbarProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
}

export default App;
