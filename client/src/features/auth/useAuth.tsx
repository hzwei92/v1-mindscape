import { useContext, useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setCurrentUser } from '../user/userSlice';
import { AppContext } from '../../App';
import { selectAuthIsValid, selectAuthIsInit } from './authSlice';

const INIT_USER = gql`
  mutation InitUser($palette: String!) {
    initUser(palette: $palette) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

const GET_CURRENT_USER = gql`
  mutation GetCurrentUser {
    getCurrentUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useAuth() {
  const dispatch = useAppDispatch();

  const {
    palette,
    brightColor: color
  } = useContext(AppContext);

  const isInit = useAppSelector(selectAuthIsInit);
  const isValid = useAppSelector(selectAuthIsValid);

  const [isLoading, setIsLoading] = useState(false);

  const { refreshToken, refreshTokenInterval } = useToken();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [getUser] = useMutation(GET_CURRENT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      if (!isLoading) return;
      setIsLoading(false);

      console.log(data);
      if (!data.getCurrentUser.id) return;

      refreshTokenInterval();

      dispatch(setCurrentUser(data.getCurrentUser));
      
      const handleDismissClick = (event: React.MouseEvent) => {
        closeSnackbar(data.getCurrentUser.id);
      }
      enqueueSnackbar(`Welcome back, ${data.getCurrentUser.name}`, {
        key: data.getCurrentUser.id,
        preventDuplicate: true,
        action: () => {
          return (
            <Box>
              <IconButton onClick={handleDismissClick} sx={{
                color,
              }}>
                <CloseIcon sx={{
                  fontSize: 14,
                }}/>
              </IconButton>
            </Box>
          );
        }
      });
    }
  });

  const [initUser] = useMutation(INIT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      
      setIsLoading(false);

      refreshTokenInterval();

      dispatch(setCurrentUser(data.initUser));

      const handleDismissClick = (event: React.MouseEvent) => {
        closeSnackbar(data.initUser.id);
      }
      enqueueSnackbar(`Welcome! We dub thee u/${data.initUser.name}`, {
        key: data.initUser.id,
        preventDuplicate: true,
        action: () => {
          return (
            <Box>
              <IconButton onClick={handleDismissClick} sx={{
                color,
              }}>
                <CloseIcon sx={{
                  fontSize: 14,
                }}/>
              </IconButton>
            </Box>
          );
        }
      });
    }
  });

  useEffect(() => {
    refreshToken();
  }, [])

  useEffect(() => {
    if (!isInit) return;
    if (isValid) {
      setIsLoading(true);
      getUser();
    }
    else {
      setIsLoading(true)
      initUser({
        variables: {
          palette,
        }
      });
    }
  }, [isInit, isValid]);
}