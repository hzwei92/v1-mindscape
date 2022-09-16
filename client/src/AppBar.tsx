import MUIAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import React, { useContext, useState } from 'react';
import useAuth from './features/auth/useAuth';
import useAppRouter from './useAppRouter';
import { AppContext } from './App';
import { APP_BAR_HEIGHT, MOBILE_WIDTH } from './constants';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { SpaceType } from './features/space/space';
import { MenuMode } from './features/menu/menu';
import Brightness4 from '@mui/icons-material/Brightness4';
import { useLocation, useNavigate } from 'react-router-dom';
import useSetUserPalette from './features/user/useSetUserPalette';
import UserDialog from './features/user/UserDialog';
import { Link } from '@mui/material';
import LoginDialog from './features/auth/LoginDialog';
import LogoutDialog from './features/auth/LogoutDialog';
import useSaveArrowSub from './features/arrow/useSaveArrowSub';
import { Tab } from './features/tab/tab';
import { selectFocusTab, selectFrameTab, selectIdToTab } from './features/tab/tabSlice';
import useUpdateTab from './features/tab/useUpdateTab';

const navItems = ['SEARCH', 'GRAPHS', 'CONTACTS', 'MAP', 'FEED'];
const userItems = ['SETTINGS', 'LOGIN', 'LOGOUT'];

function AppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { 
    user,
    width, 
    palette,
    brightColor: color,
    menuMode, 
    setMenuMode,
    setIsCreatingGraph,
    setCreateGraphSpace,
    setCreateGraphArrowId,
  } = useContext(AppContext);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [clickTimeout, setClickTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isMobile = width < MOBILE_WIDTH;

  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  const idToTab = useAppSelector(selectIdToTab);

  useAuth();
  useAppRouter(user);

  const { setUserPalette } = useSetUserPalette();

  const { updateTab } = useUpdateTab();

  useSaveArrowSub();

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

  const handleTabClick = (tab: Tab) => () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      navigate(`/g/${tab.arrow.routeName}`);
      updateTab(tab, true, false);
      console.log('double click');
    }
    else {
      const t = setTimeout(() => {
        setClickTimeout(null);
        if (focusTab?.id === tab.id) {
          updateTab(tab, false, false)
        }
        else if (frameTab?.id === tab.id) {
          updateTab(tab, false, false)
        }
        else {
          navigate(`/g/${tab.arrow.routeName}`);
          updateTab(tab, false, true)
        }
        console.log('single click');
      }, 200);

      setClickTimeout(t);
    }
  }

  const handleMenuItemClick = (item: string) => () => {
    if (item === 'SEARCH') {
      setMenuMode(menuMode === MenuMode.SEARCH 
        ? MenuMode.NONE 
        : MenuMode.SEARCH
      );
    }
    else if (item === 'GRAPHS') {
      setMenuMode(menuMode === MenuMode.GRAPHS
        ? MenuMode.NONE
        : MenuMode.GRAPHS
      );
    }
    handleCloseNavMenu();
  };

  const handleUserItemClick = (item: string) => () => {
    if (item === 'SETTINGS') {
      setShowUserDialog(true);
    }
    else if (item === 'LOGIN') {
      setShowLoginDialog(true);
    }
    else if (item === 'LOGOUT') {
      setShowLogoutDialog(true);
    }
  }

  const handlePaletteClick = () => {
    setUserPalette(palette === 'light' ? 'dark' : 'light');
  };

  const handleCreateGraphClick = () => {
    setCreateGraphArrowId(null);
    setCreateGraphSpace(SpaceType.FOCUS);
    setIsCreatingGraph(true);
  };

  return (
    <Box sx={{
      backgroundColor: palette === 'dark'
        ? '#1e1e1e'
        : '#f0f0f0',
    }}>
      <MUIAppBar position="fixed" color='inherit' enableColorOnDark>
        <Toolbar variant='dense' sx={{
          height: APP_BAR_HEIGHT,
          whiteSpace: 'nowrap',
          fontSize: 20,
        }}>
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            marginTop: 0.5,
          }}>
            👁‍🗨
          <Typography
            noWrap
            component="a"
            href="/"
            sx={{
              marginTop: -0.6,
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
                  <Typography textAlign="center" sx={{
                    color: item === menuMode
                      ? user?.color
                      : color,
                  }}>{item}</Typography>
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
              marginRight: 1,
              marginTop: -0.4,
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
                  outline: item === menuMode
                    ? '1px solid'
                    : 'none',
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
            &nbsp;
            {
              Object.values(idToTab)
                .filter(tab => !tab.deleteDate)
                .sort((a, b) => a.i - b.i)
                .map((tab) => {
                  if (!tab || !tab.arrow) return null;

                  return (
                    <Button key={tab.id} variant={
                      tab.id === frameTab?.id 
                        ? 'contained'
                        : tab.id === focusTab?.id 
                          ? 'outlined'
                          : 'text'
                      }
                      onClick={handleTabClick(tab)} 
                      sx={{
                        margin: 1,
                        height: 30,
                        width: 30,
                        minWidth: 30,
                        color: tab.id === frameTab?.id
                          ? palette === 'dark'
                            ? '#000000'
                            : '#ffffff'
                          : tab.arrow.color,
                        borderColor: tab.arrow.color,
                        backgroundColor: tab.id === frameTab?.id
                          ? tab.arrow.color
                          : null,
                      }}
                    >
                      { tab.i + 1 }
                    </Button>
                  );
                })
            }
            <Button onClick={handleCreateGraphClick} sx={{
              height: 30,
              width: 30,
              minWidth: 30,
            }}>
              +
            </Button>
            &nbsp;&nbsp;
            <IconButton onClick={handleOpenUserMenu} sx={{
              padding: 0,
            }}>
              <Avatar alt={user?.name} src="/static/images/avatar/2.jpg" sx={{
                width: '32px',
                height: '32px',
                backgroundColor: 'primary.main',
              }}/>
            </IconButton>
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
              <Box sx={{
                padding: 2,
              }}>
                <Link sx={{
                  cursor: 'pointer',
                }}>
                  {user?.name}
                </Link>
              </Box>
              {userItems.map((item) => (
                <MenuItem key={item} onClick={handleUserItemClick(item)}>
                  <Typography textAlign="center" sx={{
                    color,
                  }}>{item}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </MUIAppBar>
      <UserDialog isOpen={showUserDialog} setIsOpen={setShowUserDialog} />
      <LoginDialog 
        isOpen={showLoginDialog} 
        setIsOpen={setShowLoginDialog} 
        closeMenu={() => setAnchorElUser(null)}
      />
      <LogoutDialog 
        isOpen={showLogoutDialog} 
        setIsOpen={setShowLogoutDialog}  
        closeMenu={() => setAnchorElUser(null)}
      />
    </Box>
  );
};
export default React.memo(AppBar);
