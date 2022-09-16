import { Box, createTheme, ThemeProvider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { MAX_Z_INDEX } from '../../constants';
import SpaceComponent from '../space/SpaceComponent';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';
import { selectSelectedTwigId } from '../space/spaceSlice';
import { useAppSelector } from '../../app/hooks';
import { selectUserById } from '../user/userSlice';
import useCenterTwig from '../twig/useCenterTwig';
import { selectFocusTab, selectFrameTab } from '../tab/tabSlice';
import { selectArrowById } from '../arrow/arrowSlice';

export default function FrameComponent() {
  const { 
    user,
    palette,
    dimColor: color,
    frameWidth,
    setFrameIsResizing,
  } = useContext(AppContext);

  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));

  const focusTab = useAppSelector(selectFocusTab);

  const frameTab = useAppSelector(selectFrameTab);
  const frameArrow = useAppSelector(state => selectArrowById(state, frameTab?.arrowId));

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

  const [showResizer, setShowResizer] = useState(false);

  useEffect(() => {
    if (!frameArrow) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: frameArrow?.color || (palette === 'dark' ? '#ffffff' : '#000000'),
        },
        mode: palette,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [frameArrow?.color, palette]);

  const { centerTwig } = useCenterTwig(SpaceType.FRAME);

  useEffect(() => {
    if (frameTab) {
      centerTwig(frameSelectedTwigId || frameTab.arrow.rootTwigId || '', true, 0);
    }
  }, [frameTab?.id]);

  if (!theme || !user) return null;

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    setFrameIsResizing(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className='frame' sx={{
        position: 'relative',
        width: frameWidth - 1,
        height: '100%',
        display: frameTab
          ? 'flex'
          : 'none',
        flexDirection: 'row',
      }}>
        <SpaceComponent space={SpaceType.FRAME}/>
        <Box 
          onMouseDown={handleResizeMouseDown}
          onMouseEnter={handleResizeMouseEnter}
          onMouseLeave={handleResizeMouseLeave} 
          sx={{
            height: '100%',
            width: 4,
            backgroundColor: showResizer
              ? 'primary.main'
              : color,
            cursor: 'col-resize',
            display: frameTab && focusTab
              ? 'block'
              : 'none'
          }}
        />
      </Box>
    </ThemeProvider>
  );
}