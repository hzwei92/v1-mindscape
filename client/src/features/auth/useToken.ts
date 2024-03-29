import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { REFRESH_ACCESS_TOKEN_TIME } from '../../constants';
import { selectCurrentUser } from '../user/userSlice';
import { setAuthIsInit, setAuthIsValid, setTokenInterval } from './authSlice';

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      id
    }
  }
`;

export default function useToken() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectCurrentUser);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        if (user?.id) {
          //logoutUser(); TODO
        }

        dispatch(setAuthIsInit(true));
        dispatch(setAuthIsValid(false));
        dispatch(setTokenInterval(null));
      }
    },
    onCompleted: data => {
      console.log(data);
      dispatch(setAuthIsInit(true));

      if (data.refreshToken.id) {
        dispatch(setAuthIsValid(true));
      }
      else {
        dispatch(setAuthIsValid(false));
        dispatch(setTokenInterval(null));
      }
    },
  });

  const refreshToken = () => {
    refresh();
  }

  const refreshTokenInterval = () => {
    const interval = setInterval(() => {
      refresh();
    }, REFRESH_ACCESS_TOKEN_TIME);

    dispatch(setAuthIsInit(true));
    dispatch(setAuthIsValid(true));
    dispatch(setTokenInterval(interval));
  }
  
  return { refreshToken, refreshTokenInterval };
}