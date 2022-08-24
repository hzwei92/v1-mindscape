import { Box, Card, createTheme, Icon, IconButton, Link, ThemeProvider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { MAX_Z_INDEX, SPACE_BAR_HEIGHT } from '../../constants';
import SpaceComponent from '../space/SpaceComponent';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';
import { selectIsOpen } from '../space/spaceSlice';
import { useAppSelector } from '../../app/hooks';
import { selectUserById } from '../user/userSlice';
import Filter1Icon from '@mui/icons-material/Filter1';

export default function FrameComponent() {
  const { 
    user,
    palette,
    dimColor: color,
    menuIsResizing,
    frameWidth,
    frameIsResizing,
    setFrameIsResizing,
  } = useContext(AppContext);

  const frameIsOpen = useAppSelector(selectIsOpen(SpaceType.FRAME));
  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));

  const frameUser = useAppSelector(state => selectUserById(state, user?.frame?.userId));

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
    if (!user?.frameId) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: frameUser?.color || '#ffffff',
        },
        mode: palette,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [frameUser?.color, palette]);

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

  const handleCloseClick = (event: React.MouseEvent) => {
    
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        position: 'relative',
        width: frameWidth - 1,
        height: '100%',
        transition: menuIsResizing || frameIsResizing
          ? 'none'
          : 'width 0.5s',
        display: frameIsOpen
          ? 'flex'
          : 'none',
        flexDirection: 'row',
      }}>
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 0,
        }}>
          <Card elevation={5} sx={{
            position: 'fixed',
            zIndex: MAX_Z_INDEX,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            width: frameWidth - (focusIsOpen ? 5 : 0),
            height: `${SPACE_BAR_HEIGHT - 2}px`,
            transition: menuIsResizing || frameIsResizing
              ? 'none'
              : 'width 0.5s',
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
            }}>
              <Box sx={{
                whiteSpace: 'nowrap',
                padding: 2,
                paddingTop: 1.8,
                paddingRight: 1.5,
              }}>
                <Icon sx={{
                  color: frameUser?.color,
                  fontSize: 20,
                }}>
                  <Filter1Icon fontSize='inherit'/>
                </Icon>
              </Box>
              <Box sx={{
                whiteSpace: 'nowrap',
                paddingTop: 2,
                fontSize: 16,
                color: frameUser?.color,
              }}>
                  {user.frame?.title}
              </Box>
            </Box>
            <Box sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 1,
              display: frameIsOpen && false
                ? 'flex'
                : 'none',
            }}>
              <IconButton onClick={handleCloseClick} sx={{
                fontSize: 16,
              }}> 
                <CloseIcon fontSize='inherit'/>
              </IconButton>
            </Box>
          </Card>
        </Box>
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
            display: focusIsOpen
              ? 'block'
              : 'none'
          }}
        />
      </Box>
    </ThemeProvider>
  );
}