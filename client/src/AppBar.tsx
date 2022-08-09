import { Box, Card, IconButton, Icon, Divider } from '@mui/material';
import { MAX_Z_INDEX, MOBILE_WIDTH } from './constants';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import HubIcon from '@mui/icons-material/Hub';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import CropDinIcon from '@mui/icons-material/CropDin';
import CropFreeIcon from '@mui/icons-material/CropFree';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { getAppbarWidth, getColor } from './utils';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { User } from './features/user/user';
import useAuth from './features/auth/useAuth';
import useAppRouter from './useAppRouter';
import { useContext } from 'react';
import { AppContext } from './App';
import { MenuMode } from './features/menu/menu';
//import useSavePostSub from './features/post/useSavePostSub';

export default function AppBar() {
  const dispatch = useAppDispatch();

  const { 
    user,
    width, 
    palette,
    brightColor: color,
    setPalette,
    menuMode, 
    setMenuMode
  } = useContext(AppContext);

  useAuth();
  useAppRouter(user);

  const handleAboutClick = () => {

  };

  const handleAccountClick = () => {
    setMenuMode(menuMode === MenuMode.ACCOUNT 
      ? MenuMode.NONE 
      : MenuMode.ACCOUNT
    );
  };

  const handleSignalClick = () => {

  };

  const handleGraphClick = () => {

  };

  const handleMapClick = () => {

  };

  const handleSearchClick = () => {

  };

  const handleFeedClick = () => {

  };
  const handleFrameClick = () => {

  }
  const handleFocusClick = () => {

  }
  const handlePaletteClick = () => {
    setPalette(palette === 'dark'
      ? 'light'
      : 'dark'
    )
  }
  return (
    <Box>
      <Card elevation={5} sx={{
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'center',
        minHeight: '100%',
        width: getAppbarWidth(width),
        marginRight: '1px',
        zIndex: MAX_Z_INDEX + 100,
      }}>
        <Box>
          <Box sx={{
            padding: '5px',
            paddingTop: 1,
          }}>
            <IconButton title='About' size='small' onClick={handleAboutClick} sx={{
              border: menuMode === 'ABOUT'
                ? `1px solid ${user?.color}`
                : 'none',
              fontSize: width < MOBILE_WIDTH
                ? 16
                : 28,
            }}>
              <Icon fontSize='inherit'>
                👁‍🗨
              </Icon>
            </IconButton>
          </Box>
          <Box title='Account' sx={{paddingTop: 1}}>
            <IconButton onClick={handleAccountClick} sx={{
              border: menuMode === 'ACCOUNT'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'ACCOUNT'
                ? 'primary.main'
                : color,
            }}>
              <AccountCircle/>
            </IconButton>
          </Box>
          <Box title='Signal' sx={{paddingTop: 1}}>
            <IconButton onClick={handleSignalClick} sx={{
              border: menuMode === 'SIGNAL'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'SIGNAL'
                ? 'primary.main'
                : color,
            }}>
              <PodcastsIcon/>
            </IconButton>
          </Box>
          <Box title='Graphs' sx={{paddingTop: 1}}>
            <IconButton onClick={handleGraphClick} sx={{
              border: menuMode === 'GRAPH'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'GRAPH'
                ? 'primary.main'
                : color,
            }}>
              <HubIcon/>
            </IconButton>
          </Box>
          <Box title='Search' sx={{paddingTop: 1}}>
            <IconButton onClick={handleSearchClick} sx={{
              border: menuMode === 'SEARCH'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'SEARCH'
                ? 'primary.main'
                : color,
            }}>
              <SearchIcon/>
            </IconButton>
          </Box>
          <Box title='Map' sx={{paddingTop: 1}}>
            <IconButton onClick={handleMapClick} sx={{
              border: menuMode === 'MAP'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'MAP'
                ? 'primary.main'
                : color,
            }}>
              <MapIcon/>
            </IconButton>
          </Box>
          <Box title='Feed' sx={{paddingTop: 1}}>
            <IconButton onClick={handleFeedClick} sx={{
              border: menuMode === 'FEED'
                ? `1px solid ${user?.color}`
                : 'none',
              color: menuMode === 'FEED'
                ? 'primary.main'
                : color,
            }}>
              <DynamicFeedIcon/>
            </IconButton>
          </Box>
        </Box>
        <Box sx={{
          marginBottom: '5px',
          padding: '5px',
        }}>
          <IconButton 
            size='small' 
            onClick={handlePaletteClick}
            title='Toggle light/dark menuMode' 
            sx={{
              color,
            }}
          >
            <Brightness4Icon/>
          </IconButton>
        </Box>
      </Card>
      <Box sx={{
        width: getAppbarWidth(width) + 1,
      }}/>
    </Box>
  )
}