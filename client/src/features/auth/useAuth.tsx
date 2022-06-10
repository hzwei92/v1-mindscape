import { useEffect, useState } from 'react';
import useToken from './useToken';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getColor } from '../../utils';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectMode } from '../window/windowSlice';
import { selectAuthState } from './authSlice';
import { setUserId } from '../user/userSlice';
import { useNavigate } from 'react-router-dom';

const INIT_USER = gql`
  mutation InitUser {
    initUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

export default function useAuth() {
  const auth = useAppSelector(selectAuthState);
  const mode = useAppSelector(selectMode);
  const color = getColor(mode, true);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { refreshToken, refreshTokenInterval } = useToken();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [getUser] = useLazyQuery(GET_CURRENT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      if (!isLoading) return;
      setIsLoading(false);

      console.log(data);
      if (!data.getCurrentUser.id) return;

      refreshTokenInterval();

      dispatch(setUserId(data.getCurrentUser.id));
      
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

      dispatch(setUserId(data.initUser.id));

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
    if (!auth.isInit) return;
    if (auth.isValid) {
      setIsLoading(true);
      getUser();
    }
    else {
      setIsLoading(true)
      initUser();
    }
  }, [auth.isInit, auth.isValid]);
}