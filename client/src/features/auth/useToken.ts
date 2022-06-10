import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { REFRESH_ACCESS_TOKEN_TIME } from '../../constants';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { User } from '../user/user';
import { selectUserId } from '../user/userSlice';
import { selectAuthState, setAuthState } from './authSlice';

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      id
    }
  }
`;

export default function useToken() {
  const client = useApolloClient();
  const auth = useAppSelector(selectAuthState);
  const userId = useAppSelector(selectUserId);
  const user = client.cache.readFragment({
    id: client.cache.identify({
      id: userId,
      __typename: 'User',
    }),
    fragment: FULL_USER_FIELDS,
    fragmentName: 'FullUserFields',
  }) as User;
  const dispatch = useAppDispatch();

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: error => {
      console.error(error);
      if (error.message === 'Unauthorized') {
        if (user?.id) {
          //logoutUser(); TODO
        }
        dispatch(setAuthState({
          isInit: true,
          isValid: false,
          interval: null,
        }));
      }
    },
    onCompleted: data => {
      console.log(data);
      if (data.refreshToken.id) {
        dispatch(setAuthState({
          isInit: true,
          isValid: true,
          interval: auth.interval,
        }));
      }
      else {
        dispatch(setAuthState({
          isInit: true,
          isValid: false,
          interval: null,
        }));
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

    dispatch(setAuthState({
      isInit: true,
      isValid: true,
      interval,
    }));
  }
  
  return { refreshToken, refreshTokenInterval };
}