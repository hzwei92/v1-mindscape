import { Box, Button, Card, Dialog, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useAppSelector } from '../../app/hooks';
import { getColor } from '../../utils';
import { selectMode } from '../window/windowSlice';
import useLogout from './useLogout';

interface LogoutProps {
  setIsLogout: Dispatch<SetStateAction<boolean>>;
}
export default function Logout(props: LogoutProps) {
  const mode = useAppSelector(selectMode);
  const color = getColor(mode);

  const { logoutUser } = useLogout();

  const handleLogoutClick = () => {
    logoutUser();
    props.setIsLogout(false);
  }

  const handleCancelClick = () => {
    handleClose();
  }
  const handleClose = () => {
    props.setIsLogout(false);
  }

  return (
    <Dialog open={true} onClose={handleClose}>
      <Card elevation={5} sx={{
        padding: 2,
        width: 350,
      }}>
        <Typography variant='overline'>
          Logout
        </Typography>
        <Box sx={{
          marginTop: 2,
          marginBottom: 3,
        }}>
          You will not be able to recover this account if you logout now
          without registering first.
        </Box>
        <Box >
          <Button variant='contained' onClick={handleLogoutClick}>
            Logout
          </Button>
          &nbsp;
          <Button onClick={handleCancelClick} sx={{
            color,
          }}>
            Cancel
          </Button>
        </Box>
      </Card>
    </Dialog>

  )
}