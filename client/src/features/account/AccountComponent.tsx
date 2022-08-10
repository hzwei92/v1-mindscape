import { Box, Button, Card, IconButton, Typography, } from '@mui/material';
import React, { useContext, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getColor } from '../../utils';
import AccountSettings from './AccountSettings';
import { User } from '../user/user';
import useLogout from '../auth/useLogout';
import Verify from '../auth/Verify';
import Register from '../auth/Register';
import Logout from '../auth/Logout';
import Login from '../auth/Login';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';

export default function AccountComponent() {
  const {
    user,
    brightColor: color,
    menuMode,
    setMenuMode,
  } = useContext(AppContext);

  const [isLogin, setIsLogin] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  const { logoutUser } = useLogout();

  if (!user || menuMode !== MenuMode.ACCOUNT) return null;

  const handleClose = () => {
    setIsLogin(false);
    setIsLogout(false);
    setMenuMode(MenuMode.NONE);
  };

  const handleLogoutClick = (event: React.MouseEvent) => {
    if (user?.email) {
      logoutUser();
      handleClose();
    }
    else {
      setIsLogout(true)
    }
  }

  const handleLoginClick = (event: React.MouseEvent) => {
    setIsLogin(true);
  }

  return (
    <Box sx={{
      height: 'calc(100% - 20px)',
      width: '100%',
    }}>
      <Card elevation={5} sx={{
        padding: 1,
        display: 'flex',
        justifyContent: 'right',
      }}>
        <IconButton onClick={handleClose} sx={{
          fontSize: 16,
        }}>
          <CloseIcon fontSize='inherit' />
        </IconButton>
      </Card>
      <Box sx={{
        height: 'calc(100% - 30px)',
        width: '100%',
        overflowY: 'scroll',
      }}>
      <Box>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Button onClick={handleLogoutClick} sx={{
            color,
          }}>
            Logout
          </Button>
          &nbsp;
          <Button onClick={handleLoginClick} sx={{
            color,
          }}>
            Login
          </Button>
        </Card>
        {
          user?.email
            ? user?.verifyEmailDate
              ? <Card elevation={5} sx={{
                  padding: 1,
                  margin: 1,
                }}>
                  <Typography variant='overline'>
                    Email
                  </Typography>
                  <Box sx={{
                    marginLeft: 1,
                  }}>
                    { user.email }
                  </Box>
                </Card>
              : <Verify />
            : <Register />
        }
        <AccountSettings user={user} />
        {
          isLogout
            ? <Logout setIsLogout={setIsLogout}/>
            : null
        }
        {
          isLogin
            ? <Login setIsLogin={setIsLogin}/>
            : null
        }
      </Box>
      </Box>
    </Box>
  )
}