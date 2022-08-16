import { Box, Card, createTheme, IconButton, Link, Theme, ThemeProvider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX, SPACE_BAR_HEIGHT } from '../../constants';
import SpaceComponent from '../space/SpaceComponent';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';
import { selectIsOpen, selectSelectedTwigId, setIsOpen } from '../space/spaceSlice';
import { Navigate, useNavigate } from 'react-router-dom';
import { selectIdToTwig } from '../twig/twigSlice';
import useSetUserFocus from '../user/useSetUserFocus';
import { selectUserById } from '../user/userSlice';

export default function FocusComponent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { 
    user,
    width,
    palette,
    dimColor: color,
    appBarWidth,
    menuIsResizing,
    menuWidth,
    frameIsResizing,
    frameWidth,
  } = useContext(AppContext);

  const focusWidth = width - appBarWidth - menuWidth - frameWidth;

  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));

  const focusUser = useAppSelector(state => selectUserById(state, user?.focus?.userId));

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

  useEffect(() => {
    if (!user?.frameId) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: focusUser?.color || '#ffffff',
        },
        mode: palette,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [focusUser?.color, palette]);

  const { setUserFocusById } = useSetUserFocus();

  if (!user) return null;

  const handleClick = () => {
    console.log('focus');
  }

  const handleCloseClick = (event: React.MouseEvent) => {
    const frameTwig = frameIdToTwig[frameSelectedTwigId];
    const route = `/g/${user.frameId}/${frameTwig.i}`;
    navigate(route);
    dispatch(setIsOpen({
      space: SpaceType.FOCUS,
      isOpen: false,
    }));
    setUserFocusById(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: focusWidth,
        height: '100%',
        transition: menuIsResizing || frameIsResizing
          ? 'none'
          : 'width 0.5s',
        display: focusIsOpen 
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
                  m/{user.focus?.routeName}
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
        <SpaceComponent space={SpaceType.FOCUS}/>
      </Box>
    </ThemeProvider>
  );
}