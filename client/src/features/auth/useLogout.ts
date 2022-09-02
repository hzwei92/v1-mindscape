import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setLogout } from './authSlice';

const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      id
    }
  }
`;

export default function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [logout] = useMutation(LOGOUT_USER, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const logoutUser = async () => {
    logout();
    dispatch(setLogout());
    navigate('/');
  }

  return { logoutUser };
}