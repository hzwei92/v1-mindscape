import { Box, Card, createTheme, IconButton, Link, Theme, ThemeProvider } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { MAX_Z_INDEX, SPACE_BAR_HEIGHT } from '../../constants';
import { useNavigate } from 'react-router-dom';
import SpaceComponent from '../space/SpaceComponent';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../App';
import { SpaceType } from '../space/space';

export default function FocusComponent() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { 
    user,
    width,
    height,
    palette,
    dimColor: color,
    menuIsResizing,
    focusWidth,
  } = useContext(AppContext);

  const spaceIsResizing = false;

  const [theme, setTheme] = useState(null as Theme | null);

  useEffect(() => {
    if (!user?.focusId) return;
    setTheme(createTheme({
      palette: {
        primary: {
          main: user.focus?.color || '',
        },
        mode: palette,
      },
      zIndex: {
        modal: MAX_Z_INDEX + 1000,
        snackbar: MAX_Z_INDEX + 10000
      },
    }));
  }, [user?.focus?.color, palette]);

  if (!theme || !user) return null;

  const handleClick = () => {
    console.log('focus');
  }

  const handleCloseClick = (event: React.MouseEvent) => {
    
  };

  return (
    <ThemeProvider theme={theme}>
      <Box onClick={handleClick} sx={{
        position: 'relative',
        width: focusWidth,
        height: '100%',
        transition: menuIsResizing || spaceIsResizing
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
            transition: menuIsResizing || spaceIsResizing
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
              display: false
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