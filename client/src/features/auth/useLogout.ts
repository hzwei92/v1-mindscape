import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setUserId } from '../user/userSlice';
import { selectAuthState, setAuthState } from './authSlice';

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      id
    }
  }
`;

export default function useLogout() {
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuthState);
  const dispatch = useAppDispatch();

  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const logoutUser = () => {
    logout();
    dispatch(setUserId(''));
    if (auth.interval) {
      clearInterval(auth.interval);
    }
    dispatch(setAuthState({
      isInit: true,
      isValid: false,
      interval: null,
    }));
    navigate('/');
  }

  return { logoutUser };
}