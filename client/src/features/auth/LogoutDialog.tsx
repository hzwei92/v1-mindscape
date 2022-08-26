import { Box, Button, Card, Dialog, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useContext } from 'react';
import { AppContext } from '../../App';
import useLogout from './useLogout';

interface LogoutProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  closeMenu: () => void;
}
export default function LogoutDialog(props: LogoutProps) {
  const { brightColor } = useContext(AppContext);

  const { logoutUser } = useLogout();

  const handleLogoutClick = () => {
    logoutUser();
    handleClose();
    props.closeMenu();
  }

  const handleCancelClick = () => {
    handleClose();
  }
  const handleClose = () => {
    props.setIsOpen(false);
  }

  return (
    <Dialog open={props.isOpen} onClose={handleClose}>
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
            color: brightColor,
          }}>
            Cancel
          </Button>
        </Box>
      </Card>
    </Dialog>

  )
}