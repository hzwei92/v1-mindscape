import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useContext, useState } from 'react';
import useAuth from './features/auth/useAuth';
import useAppRouter from './useAppRouter';
import { AppContext } from './App';
import Filter1 from '@mui/icons-material/Filter1';
import Filter2 from '@mui/icons-material/Filter2';
import { Icon } from '@mui/material';
import { APP_BAR_HEIGHT, MOBILE_WIDTH } from './constants';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectSelectedSpace, selectSelectedTwigId, setSelectedSpace } from './features/space/spaceSlice';
import { SpaceType } from './features/space/space';
import { selectIdToTwig } from './features/twig/twigSlice';
import useCenterTwig from './features/twig/useCenterTwig';
import { MenuMode } from './features/menu/menu';
import Brightness4 from '@mui/icons-material/Brightness4';
import { useLocation, useNavigate } from 'react-router-dom';
import useSetUserPalette from './features/user/useSetUserPalette';

const navItems = ['SEARCH', 'GRAPHS', 'CONTACTS', 'MAP', 'FEED'];
const userItems = ['Profile', 'Account', 'Dashboard', 'Logout'];

const ResponsiveAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { 
    user,
    width, 
    palette,
    brightColor: color,
    menuMode, 
    setMenuMode
  } = useContext(AppContext);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const isMobile = width < MOBILE_WIDTH;

  const selectedSpace = useAppSelector(selectSelectedSpace);
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));

  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));
  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));

  useAuth();
  useAppRouter(user);

  const { setUserPalette } = useSetUserPalette();

  const { centerTwig: frameCenterTwig } = useCenterTwig(SpaceType.FRAME);
  const { centerTwig: focusCenterTwig } = useCenterTwig(SpaceType.FOCUS);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuItemClick = (item: string) => () => {
    if (item === 'SEARCH') {
      setMenuMode(menuMode === MenuMode.SEARCH 
        ? MenuMode.NONE 
        : MenuMode.SEARCH
      );
    }
    handleCloseNavMenu();
  };

  const handlePaletteClick = () => {
    setUserPalette(palette === 'light' ? 'dark' : 'light');
  };

  const handleFrameClick = () => {
    const twig = frameIdToTwig[frameSelectedTwigId];
    if (twig && user?.frame) {
      const route = `/g/${user.frame.routeName}/${twig.i}`
      if (location.pathname !== route) {
        navigate(route);
      }
      else {
        dispatch(setSelectedSpace(SpaceType.FRAME));
      }
      frameCenterTwig(twig.id, true, 0);
    }
  }

  const handleFocusClick = () => {
    const twig = focusIdToTwig[focusSelectedTwigId];
    if (twig && user?.focus) {
      const route = `/g/${user.focus.routeName}/${twig.i}`
      if (location.pathname !== route) {
        navigate(route);
      }
      else {
        dispatch(setSelectedSpace(SpaceType.FOCUS));
      }
      focusCenterTwig(twig.id, true, 0);
    }
  }

  return (
    <Box sx={{
      backgroundColor: palette === 'dark'
        ? '#1e1e1e'
        : '#f0f0f0',
    }}>
      <AppBar position="fixed" color='inherit' enableColorOnDark>
        <Container maxWidth="xl">
          <Toolbar variant='dense' disableGutters sx={{
            height: APP_BAR_HEIGHT,
            whiteSpace: 'nowrap',
          }}>
            <Box sx={{
              marginLeft: -1.5,
              display: { xs: 'none', md: 'flex' },
            }}>
              👁‍🗨
            <Typography
              noWrap
              component="a"
              href="/"
              sx={{
                marginTop: -0.5,
                marginRight: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 'bold',
                fontSize: 24,
                fontFamily: 'Alumni Sans Pinstripe',
                color,
                textDecoration: 'none',
                verticalAlign: 'middle',
              }}
            >
              &nbsp; MINDSCAPE.PUB
            </Typography>

            </Box> 
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'flex', md: 'none' },
              marginLeft: -1.5,
            }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {navItems.map((item) => (
                  <MenuItem key={item} onClick={handleMenuItemClick(item)}>
                    <Typography textAlign="center">{item}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box sx={{
              marginTop: -0.5,
              display: { xs: 'flex', md: 'none' },
            }}>
              👁‍🗨 
            </Box>
            <Typography
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 'bold',
                fontSize: 24,
                fontFamily: 'Alumni Sans Pinstripe',
                color,
                textDecoration: 'none',
              }}
            >
              &nbsp; MINDSCAPE.PUB
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item}
                  onClick={handleMenuItemClick(item)}
                  sx={{ 
                    my: 2, 
                    color: menuMode === item
                      ? null
                      : color, 
                    display: 'block', 
                    minWidth: 0, 
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <IconButton onClick={handlePaletteClick} sx={{
                fontSize: 20,
              }}>
                <Brightness4 fontSize='inherit' />
              </IconButton>
              <IconButton sx={{
                fontSize: 20,
                border: selectedSpace === SpaceType.FRAME
                  ? '1px solid'
                  : 'none',
                color: user?.frame
                  ? user.frame.user.color
                  : color,
              }}>
                <Filter1 fontSize='inherit'/>
              </IconButton>
              <IconButton sx={{
                fontSize: 20,
                border: selectedSpace === SpaceType.FOCUS
                  ? '1px solid'
                  : 'none',
                color: user?.focus
                  ? user.focus.user.color
                  : color,
              }}>
                <Filter2 fontSize='inherit'/>
              </IconButton>
              &nbsp;&nbsp;
              <Tooltip title="Open user settings">
                <IconButton onClick={handleOpenUserMenu} sx={{
                  padding: 0,
                }}>
                  <Avatar alt={user?.name} src="/static/images/avatar/2.jpg" sx={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'primary.main',
                  }}/>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {userItems.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};
export default ResponsiveAppBar;
