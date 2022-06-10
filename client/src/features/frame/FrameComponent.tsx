import { Box, Card, createTheme, IconButton, Link, Theme, ThemeProvider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX, MOBILE_WIDTH, SPACE_BAR_HEIGHT } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { selectMode, selectWidth } from '../window/windowSlice';
import { selectFrameIsResizing, selectFrameWidth, setFrameIsResizing, setFrameWidth } from './frameSlice';
import { User } from '../user/user';
import { selectIsOpen, selectSpace } from '../space/spaceSlice';
import { selectMenuIsResizing, selectMenuMode, selectMenuWidth } from '../menu/menuSlice';
import SpaceComponent from '../space/SpaceComponent';
import CloseIcon from '@mui/icons-material/Close';
import { getAppbarWidth } from '../../utils';

interface FrameComponentProps {
  user: User;
}

export default function FrameComponent(props: FrameComponentProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectMode);
  const width = useAppSelector(selectWidth);

  const menuMode = useAppSelector(selectMenuMode);
  const menuIsResizing = useAppSelector(selectMenuIsResizing);
  const menuWidth = useAppSelector(selectMenuWidth);
  const menuWidth1 = menuMode 
    ? menuWidth
    : 0;

  const frameIsResizing = useAppSelector(selectFrameIsResizing);
  const frameWidth = useAppSelector(selectFrameWidth);
  const space = useAppSelector(selectSpace);

  const focusIsOpen = useAppSelector(selectIsOpen('FOCUS'));

  const [theme, setTheme] = useState(null as Theme | null);
  const [showResizer, setShowResizer] = useState(false);

  useEffect(() => {
    if (!props.user?.frameId) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: props.user.frame?.color || '',
        },
        mode,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [props.user?.frame?.color, mode]);

  useEffect(() => {
    if (focusIsOpen) return;
    dispatch(setFrameWidth(width - getAppbarWidth(width) - menuWidth1));
  }, [focusIsOpen, width, menuWidth1])

  if (!theme || !props.user) return null;

  const handleClick = () => {
    console.log('frame');
  }

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    dispatch(setFrameIsResizing(true));
  };

  const handleCloseClick = (event: React.MouseEvent) => {
    
  };

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: width < MOBILE_WIDTH && (space === 'FOCUS' || menuMode)
          ? 0
          : frameWidth - 1,
        height: '100%',
        transition: menuIsResizing || frameIsResizing
          ? 'none'
          : 'width 0.5s',
        display: 'flex',
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
            width: frameWidth,
            height: `${SPACE_BAR_HEIGHT - 2}px`,
            transition: menuIsResizing || frameIsResizing
              ? 'none'
              : 'width 0.5s',
          }}>
            <Box sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 2,
              fontSize: 14,
            }}>
              <Box>
                Logged in as&nbsp;
                <Link
                  component='span'
                  sx={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  u/{props.user?.name}
                </Link>
              </Box>
            </Box>
            <Box sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 1,
              display: focusIsOpen
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
        <SpaceComponent user={props.user} space={'FRAME'}/>
        <Box 
          onMouseDown={handleResizeMouseDown}
          onMouseEnter={handleResizeMouseEnter}
          onMouseLeave={handleResizeMouseLeave} 
          sx={{
            height: '100%',
            width: 4,
            backgroundColor: showResizer
              ? 'primary.main'
              : mode === 'dark'
                ? 'dimgrey'
                : 'lavender',
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