import { Box, Card, createTheme, IconButton, Link, Theme, ThemeProvider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX, MOBILE_WIDTH, SPACE_BAR_HEIGHT } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { selectMode, selectWidth } from '../window/windowSlice';
import { User } from '../user/user';
import { selectIsOpen, selectSpace } from '../space/spaceSlice';
import { selectMenuIsResizing, selectMenuMode, selectMenuWidth } from '../menu/menuSlice';
import { selectFrameIsResizing, selectFrameWidth } from '../frame/frameSlice';
import SpaceComponent from '../space/SpaceComponent';
import CloseIcon from '@mui/icons-material/Close';
import { getAppbarWidth } from '../../utils';

interface FocusComponentProps {
  user: User;
}

export default function FocusComponent(props: FocusComponentProps) {
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

  const frameIsOpen = useAppSelector(selectIsOpen('FRAME'));
  const frameIsResizing = useAppSelector(selectFrameIsResizing);
  const frameWidth = useAppSelector(selectFrameWidth);
  const frameWidth1 = frameIsOpen
    ? frameWidth
    : 0;

  const focusIsOpen = useAppSelector(selectIsOpen('FOCUS'));
  const focusWidth = width - getAppbarWidth(width) - menuWidth1 - frameWidth1;
  const focusWidth1 = focusIsOpen
    ? focusWidth
    : 0;

  const space = useAppSelector(selectSpace);

  const [theme, setTheme] = useState(null as Theme | null);

  useEffect(() => {
    if (!props.user?.focusId) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: props.user.focus?.color || '',
        },
        mode,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [props.user?.focus?.color, mode]);

  if (!theme || !props.user) return null;

  const handleClick = () => {
    console.log('focus');
  }

  const handleCloseClick = (event: React.MouseEvent) => {
    
  };

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: width < MOBILE_WIDTH && (space === 'FRAME' || menuMode)
          ? 0
          : focusWidth1,
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
            width: focusWidth,
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
                Viewing&nbsp;
                <Link
                  component='span'
                  sx={{
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  m/{props.user.focus?.routeName}
                </Link>
              </Box>
            </Box>
            <Box sx={{
              whiteSpace: 'nowrap',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: 1,
              display: frameIsOpen
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
        <SpaceComponent user={props.user} space={'FOCUS'}/>
      </Box>
    </ThemeProvider>
  );
}