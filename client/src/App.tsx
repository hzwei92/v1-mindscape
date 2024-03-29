import { createTheme, PaletteMode, Paper, ThemeProvider } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from './app/hooks';
import { FRAME_MIN_WIDTH, MAX_Z_INDEX, MENU_MIN_WIDTH, MENU_WIDTH } from './constants';
import { selectCurrentUser, selectIdToUser } from './features/user/userSlice';
import { SnackbarProvider } from 'notistack';
import AppBar from './AppBar';
import { getColor } from './utils';
import FrameComponent from './features/frame/FrameComponent';
import FocusComponent from './features/focus/FocusComponent';
import { User } from './features/user/user';
import { MenuMode } from './features/menu/menu';
import { PendingLinkType, SpaceType } from './features/space/space';
import CreateGraphDialog from './features/arrow/CreateGraphDialog';
import AboutComponent from './features/about/AboutComponent';
import GraphsComponent from './features/graphs/GraphsComponent';
import SearchComponent from './features/search/SearchComponent';
import { selectFocusTab, selectFrameTab } from './features/tab/tabSlice';

export const AppContext = React.createContext({} as {
  user: User | null;

  width: number;
  height: number;

  palette: PaletteMode;
  setPalette: Dispatch<SetStateAction<PaletteMode>>;
  dimColor: string;
  brightColor: string;

  menuMode: MenuMode;
  setMenuMode: Dispatch<SetStateAction<MenuMode>>;

  searchMenuIsResizing: boolean;
  setSearchMenuIsResizing: Dispatch<SetStateAction<boolean>>;
  searchMenuWidth: number;

  graphsMenuIsResizing: boolean;
  setGraphsMenuIsResizing: Dispatch<SetStateAction<boolean>>;
  graphsMenuWidth: number;

  frameIsResizing: boolean;
  setFrameIsResizing: Dispatch<SetStateAction<boolean>>;
  frameWidth: number;

  pendingLink: PendingLinkType;
  setPendingLink: Dispatch<SetStateAction<PendingLinkType>>;

  isCreatingGraph: boolean;
  setIsCreatingGraph: Dispatch<SetStateAction<boolean>>;
  setCreateGraphSpace: Dispatch<SetStateAction<SpaceType | null>>;
  setCreateGraphArrowId: Dispatch<SetStateAction<string | null>>;

});

function App() {
  const user = useAppSelector(selectCurrentUser);
  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  const idToUser = useAppSelector(selectIdToUser);

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const [palette, setPalette] = useState('dark' as PaletteMode);
  const [dimColor, setDimColor] = useState(getColor(palette, true));
  const [brightColor, setBrightColor] = useState(getColor(palette, false));

  const [menuMode, setMenuMode] = useState(MenuMode.NONE);

  const [graphsMenuWidth, setGraphsMenuWidth] = useState(MENU_WIDTH);
  const [graphsMenuIsResizing, setGraphsMenuIsResizing] = useState(false);

  const [searchMenuWidth, setSearchMenuWidth] = useState(MENU_WIDTH);
  const [searchMenuIsResizing, setSearchMenuIsResizing] = useState(false);

  const [latentMenuWidth, setLatentMenuWidth] = useState(MENU_WIDTH);
  const [menuWidth, setMenuWidth] = useState(0); 
  const [menuIsResizing, setMenuIsResizing] = useState(false);
  
  const [latentFrameWidth, setLatentFrameWidth] = useState((width - menuWidth) / 2);
  const [frameWidth, setFrameWidth] = useState(width - menuWidth);
  const [frameIsResizing, setFrameIsResizing] = useState(false);

  const [pendingLink, setPendingLink] = useState({
    sourceId: '',
    targetId: '',
  });

  const [isCreatingGraph, setIsCreatingGraph] = useState(false);
  const [createGraphSpace, setCreateGraphSpace] = useState(null as SpaceType | null);
  const [createGraphArrowId, setCreateGraphArrowId] = useState(null as string | null);

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
      console.log('resize');
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
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
    if (user?.palette && user?.palette !== palette) {
      setPalette(user?.palette === 'light'
        ? 'light'
        : 'dark'
      );
    }
  }, [user?.palette])
  
  useEffect(() => {
    setDimColor(getColor(palette, true));
    setBrightColor(getColor(palette, false));
  }, [palette]);

  useEffect(() => {
    const menuWidth1 = menuMode === MenuMode.NONE
      ? 0
      : latentMenuWidth;
    setMenuWidth(menuWidth1);

  }, [menuMode]);
  
  useEffect(() => {
    if (frameTab) {
      if (focusTab) {
        setFrameWidth(latentFrameWidth);
      }
      else {
        setFrameWidth(width);
      }
    }
    else {
      setFrameWidth(0);
    }
  }, [frameTab, focusTab]);

  const appContextValue = useMemo(() => {
    return {
      user,

      width,
      height,

      palette,
      setPalette,
      dimColor,
      brightColor,

      menuMode,
      setMenuMode,

      searchMenuIsResizing,
      setSearchMenuIsResizing,
      searchMenuWidth,

      graphsMenuIsResizing,
      setGraphsMenuIsResizing,
      graphsMenuWidth,

      frameIsResizing,
      setFrameIsResizing,
      frameWidth,

      pendingLink,
      setPendingLink,

      isCreatingGraph,
      setIsCreatingGraph,
      setCreateGraphSpace,
      setCreateGraphArrowId,
    };
  }, [
    user, 
    width, height, 
    palette, dimColor, brightColor, 
    menuMode, 
    graphsMenuIsResizing, graphsMenuWidth,
    searchMenuIsResizing, searchMenuWidth,
    menuIsResizing, menuWidth, 
    frameIsResizing, frameWidth, 
    pendingLink,
    isCreatingGraph,
  ]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (searchMenuIsResizing) {
      event.preventDefault();
      setSearchMenuWidth(Math.max(event.clientX, MENU_MIN_WIDTH));
    }
    else if (graphsMenuIsResizing) {
      event.preventDefault();
      setGraphsMenuWidth(Math.max(event.clientX, MENU_MIN_WIDTH));
    }
    else if (frameIsResizing) {
      event.preventDefault();
      setFrameWidth(Math.max(event.clientX, FRAME_MIN_WIDTH));
    }
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (searchMenuIsResizing) {
      event.preventDefault();
      setSearchMenuIsResizing(false);
    }
    else if (graphsMenuIsResizing) {
      event.preventDefault();
      setGraphsMenuIsResizing(false);
    }
    else if (frameIsResizing) {
      event.preventDefault();
      setFrameIsResizing(false);
    }
  }

  return (
    <AppContext.Provider value={appContextValue}>
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
          <AppBar />
          <Paper onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} sx={{
            height: '100%',
            width: '100%',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'row',
          }}>
            <svg width={0} height={0}>
              <defs>
                {
                  Object.keys(idToUser).map(userId => {
                    const user = idToUser[userId];
                    return (
                      <marker 
                        key={`marker-${userId}`}
                        id={`marker-${userId}`} 
                        markerWidth='6'
                        markerHeight='10'
                        refX='7'
                        refY='5'
                        orient='auto'
                      >
                        <polyline 
                          points='0,0 5,5 0,10'
                          fill='none'
                          stroke={user?.color}
                        />
                      </marker>
                    )
                  })
                }
              </defs>
            </svg>
            <SearchComponent />
            <GraphsComponent />
            <FrameComponent />
            <FocusComponent />
            <AboutComponent />
          </Paper>
          <CreateGraphDialog 
            isOpen={isCreatingGraph} 
            setIsOpen={setIsCreatingGraph}
            space={createGraphSpace}
            arrowId={createGraphArrowId}
          />
        </SnackbarProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
}

export default App;
