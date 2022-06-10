import { Box, Button, Card, IconButton, Typography, } from '@mui/material';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getColor } from '../../utils';
import AccountSettings from './AccountSettings';
import { selectMode } from '../window/windowSlice';
import { User } from '../user/user';
import { selectMenuMode, setMenuMode } from '../menu/menuSlice';
import useLogout from '../auth/useLogout';
import Verify from '../auth/Verify';
import Register from '../auth/Register';
import Logout from '../auth/Logout';
import Login from '../auth/Login';

interface AccountComponentProps {
  user: User | null;
}

export default function AccountComponent(props: AccountComponentProps) {
  const mode = useAppSelector(selectMode);
  const color = getColor(mode);
  const menuMode = useAppSelector(selectMenuMode);

  const [isLogin, setIsLogin] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  const dispatch = useAppDispatch();

  const { logoutUser } = useLogout();

  if (!props.user || !menuMode) return null;

  const handleClose = () => {
    setIsLogin(false);
    setIsLogout(false);
    dispatch(setMenuMode({
      mode: '',
      toggle: false
    }));
  };

  const handleLogoutClick = (event: React.MouseEvent) => {
    if (props.user?.email) {
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
          props.user?.email
            ? props.user?.verifyEmailDate
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
                    { props.user.email }
                  </Box>
                </Card>
              : <Verify />
            : <Register />
        }
        <AccountSettings user={props.user} />
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