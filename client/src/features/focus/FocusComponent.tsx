import { Box, createTheme, ThemeProvider } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX } from '../../constants';
import SpaceComponent from '../space/SpaceComponent';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';
import { selectSelectedTwigId } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import useCenterTwig from '../twig/useCenterTwig';
import { selectFocusTab } from '../tab/tabSlice';
import { selectArrowById } from '../arrow/arrowSlice';

export default function FocusComponent() {
  const { 
    user,
    width,
    palette,
    frameWidth,
  } = useContext(AppContext);

  const focusWidth = width - frameWidth;

  const focusTab = useAppSelector(selectFocusTab);
  const focusArrow = useAppSelector(state => selectArrowById(state, focusTab?.arrowId));

  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));

  const [theme, setTheme] = useState(createTheme({
    palette: {
      primary: {
        main: palette === 'dark'
          ? '#000000'
          : '#ffffff',
      },
      mode: palette,
    },
    zIndex: {
      modal: MAX_Z_INDEX + 1000,
      snackbar: MAX_Z_INDEX + 10000
    },
  }));

  const { centerTwig } = useCenterTwig(SpaceType.FOCUS);

  useEffect(() => {
    if (focusTab) {
      centerTwig(focusSelectedTwigId || focusTab.arrow.rootTwigId || '', true, 0);
    }
  }, [focusTab]);

  useEffect(() => {
    if (!focusArrow) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: focusArrow.color || '#ffffff',
        },
        mode: palette,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [focusArrow?.color, palette]);

  
  if (!user) return null;

  const handleClick = () => {
    console.log('focus');
  }

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: focusTab
          ? focusWidth
          : 0,
        height: '100%',
        // transition: menuIsResizing || frameIsResizing
        //   ? 'none'
        //   : 'width 0.5s',
        display: focusTab && !focusTab.deleteDate
          ? 'flex'
          : 'none',
        flexDirection: 'row',
      }}>
        <SpaceComponent space={SpaceType.FOCUS}/>
      </Box>
    </ThemeProvider>
  );
}