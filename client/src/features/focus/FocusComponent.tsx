import { Box, createTheme, ThemeProvider } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX } from '../../constants';
import SpaceComponent from '../space/SpaceComponent';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';
import { selectIsOpen } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';

export default function FocusComponent() {
  const { 
    user,
    width,
    palette,
    frameWidth,
  } = useContext(AppContext);

  const focusWidth = width - frameWidth;

  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));
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
    if (!focusUser) return;
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

  if (!user) return null;

  const handleClick = () => {
    console.log('focus');
  }

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: focusIsOpen
          ? focusWidth
          : 0,
        height: '100%',
        // transition: menuIsResizing || frameIsResizing
        //   ? 'none'
        //   : 'width 0.5s',
        display: focusIsOpen
          ? 'flex'
          : 'none',
        flexDirection: 'row',
      }}>
        <SpaceComponent space={SpaceType.FOCUS}/>
      </Box>
    </ThemeProvider>
  );
}