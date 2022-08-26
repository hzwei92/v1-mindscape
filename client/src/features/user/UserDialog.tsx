

import { gql, useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Card, Dialog, FormControl, FormHelperText, IconButton, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { sessionVar } from '../../cache';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../app/hooks';
import { mergeUsers } from './userSlice';
import { ChromePicker } from 'react-color';
import useSetUserColor from './useSetUserColor';
import Verify from '../auth/Verify';
import Register from '../auth/Register';
import { AppContext } from '../../App';

const SET_USER_NAME = gql`
  mutation SetUserName($sessionId: String!, $name: String!) {
    setUserName(sessionId: $sessionId, name: $name) {
      id
      name
      lowercaseName
      routeName
    }
  }
`;

const GET_USER_BY_NAME = gql`
  query GetUserByName($name: String!) {
    getUserByName(name: $name) {
      id
      name
    }
  }
`;

interface UserDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}


export default function UserDialog(props: UserDialogProps) {
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);

  const sessionDetail = useReactiveVar(sessionVar);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name);
  const [nameError, setNameError] = useState('');
  const [nameTimeout, setNameTimeout] = useState(null as ReturnType<typeof setTimeout> | null);


  const [color, setColor] = useState(null as string | null);
  const [colorTimeout, setColorTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const { setUserColor } = useSetUserColor();

  const { enqueueSnackbar } = useSnackbar();
   
  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getUserByName?.id && data.getUserByName.id !== user?.id) {
        setNameError('This name is already in use');
      }
    }
  });

  const [setUserName] = useMutation(SET_USER_NAME, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserName]));
    }
  })

  useEffect(() => {
    if (user?.color) {
      setColor(user.color);
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.color && !color) {
      setColor(user.color);
    }
  }, [user?.color, color])

  const handleClose = () => {
    props.setIsOpen(false);
  }
  
  const handleNameEditClick = (event: React.MouseEvent) => {
    setIsEditingName(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError('');
    if (nameTimeout) {
      clearTimeout(nameTimeout);
    }
    const timeout = setTimeout(() => {
      getUserByName({
        variables: {
          name: event.target.value,
        },
      });
    }, 300);
    setNameTimeout(timeout);
  };

  const handleNameSubmitClick = () => {
    setUserName({
      variables: {
        name,
        sessionId: sessionDetail.id,
      }
    })
    setIsEditingName(false);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleNameSubmitClick();
    }
  }

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
       setUserColor(color.hex);

      setColorTimeout(null);
    }, 500);

    setColorTimeout(timeout);
  };

  return (
    <Dialog open={props.isOpen} onClose={handleClose}>
      <Card elevation={5} sx={{
        padding: 1,
        margin: 1,
      }}>
        <Typography variant='overline'>
          Name
        </Typography>
        <Box sx={{
          marginTop: '5px',
        }}>
          <Box sx={{
            display: isEditingName ? 'none' : 'block',
            paddingLeft: 1,
            paddingBottom: 1,
          }}>
            { user?.name }&nbsp;
            <Box sx={{position: 'relative', display:'inline-block'}}>
              <Box sx={{position: 'absolute', left: 0, top: -20}}>
              <IconButton title='Edit username' onClick={handleNameEditClick} size='small' sx={{
                fontSize: 16,
              }}>
                <EditIcon fontSize='inherit' />
              </IconButton>
              </Box>
            </Box>
          </Box>
          <Box sx={{
            display: isEditingName ? 'block' : 'none',
            width: '100%',
            marginTop: '5px',
          }}>
            <FormControl sx={{
              width: '100%', 
            }}>
              <OutlinedInput
                id='user-name'
                type='text'
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                error={!!nameError}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      title='Submit'
                      disabled={!name?.length || !!nameError}
                      edge='end'
                      onClick={handleNameSubmitClick}
                      onMouseDown={handleMouseDown}
                      sx={{
                        fontSize: 16,
                      }}
                    >
                      <SendIcon fontSize='inherit'/>
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  marginLeft: 1,
                  marginRight: 1,
                }}
              />
              <FormHelperText error={true}>{nameError}</FormHelperText>
            </FormControl>
          </Box>
        </Box>
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
                  { user?.email }
                </Box>
              </Card>
            : <Verify />
          : <Register />
      }
      <Card elevation={5} sx={{
        margin: 1,
        padding:1,
      }}>
        <Typography variant='overline'>
          Color
        </Typography>
        <Box sx={{
          margin: 1,
        }}>
          <ChromePicker 
            color={color || '#ffffff'}
            disableAlpha={true}
            onChange={handleColorChange}
            onChangeComplete={handleColorChangeComplete}
          />
        </Box>
      </Card>
    </Dialog>
  )
}