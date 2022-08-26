import { 
  Box, 
  Button,
  Card,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import GoogleButton from './GoogleButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { FULL_USER_FIELDS } from '../user/userFragments';
import { gql, useApolloClient, useMutation } from '@apollo/client';
import { setLogin } from './authSlice';
import { useAppDispatch } from '../../app/hooks';

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $pass: String!) {
    loginUser(email: $email, pass: $pass) {
      ...FullUserFields
    }
  }
  ${FULL_USER_FIELDS}
`;

interface LoginProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  closeMenu: () => void;
}
export default function LoginDialog(props: LoginProps) {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState('');

  const [loginUser] = useMutation(LOGIN_USER, {
    onError: error => {
      console.error(error);
      setMessage(error.message);
    },
    onCompleted: data => {
      console.log(data);

      client.clearStore();
      client.writeQuery({
        query: gql`
          query LoginQuery {
            ...FullUserFields
          }
          ${FULL_USER_FIELDS}
        `,
        data: data.loginUser,
      });

      dispatch(setLogin(data.loginUser));

      props.setIsOpen(false);
      props.closeMenu()
    }
  });

  const [email, setEmail] = useState('');

  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePassChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPass(event.target.value);
  };
  const handleClickShowPass = () => {
    setShowPass(!showPass);
  };
  const handleMouseDownPass = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = (event: React.MouseEvent) => {
    loginUser({
      variables: {
        email,
        pass,
      }
    })
  };

  const handleClose = (event: React.MouseEvent) => {
    props.setIsOpen(false);
  }

  const isFormValid = email.length && pass.length;

  return (
    <Dialog open={props.isOpen} onClose={handleClose}>
    <Card elevation={5} sx={{
      padding:2,
      width: '350px'
    }}>
      <Typography variant='overline'>
        Login
      </Typography>
      <FormControl margin='dense' sx={{width: '100%'}}>
        <TextField
          label='Email'
          type='text'
          value={email}
          onChange={handleEmailChange}
          variant={'outlined'}
        />
      </FormControl>
      <FormControl margin='dense' variant='outlined' sx={{width: '100%'}}>
        <InputLabel htmlFor='pass'>Password</InputLabel>
        <OutlinedInput
          id='pass'
          type={showPass ? 'text' : 'password'}
          value={pass}
          onChange={handlePassChange}
          label='Password'
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                edge='end'
                tabIndex={-1}
                onClick={handleClickShowPass}
                onMouseDown={handleMouseDownPass}
                sx={{
                  fontSize: 16,
                }}
              >
                {showPass 
                  ? <VisibilityIcon fontSize='inherit'/> 
                  : <VisibilityOffIcon fontSize='inherit'/>
                }
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <Box sx={{margin: 1}}>
      { message }
      </Box>
      <Button
        disabled={!isFormValid}
        variant='contained' 
        onClick={handleSubmit} 
        sx={{width: '100%', marginTop:1}
      }>
        login with email
      </Button>
      <Box sx={{
        marginTop: 1,
        paddingTop: 1,
        borderTop: '1px solid dimgrey',
      }}>
        <GoogleButton isRegistration={false} onCompleted={() => props.setIsOpen(false)}/>
      </Box>
    </Card>
    </Dialog>
  );
}