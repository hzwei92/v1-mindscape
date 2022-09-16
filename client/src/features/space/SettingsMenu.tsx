import { Box, Button, Card, Link, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { AppContext } from '../../App';
import { SpaceContext } from './SpaceComponent';
import { ROLES_MENU_WIDTH, SPACE_BAR_HEIGHT } from '../../constants';
import { ChromePicker } from 'react-color';
import { Arrow } from '../arrow/arrow';
import useSetArrowColor from '../arrow/useSetArrowColor';

interface SettingsMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  role: Role | null;
  abstract: Arrow | null;
}
export default function SettingsMenu(props: SettingsMenuProps) {
  const navigate = useNavigate();

  const { setArrowColor } = useSetArrowColor();

  const { 
    user,
  } = useContext(AppContext);

  const {
    abstract,
  } = useContext(SpaceContext);

  const admins: Role[] = [];
  const members: Role[] = [];
  const others: Role[] = [];
  (abstract?.roles || [])
    .filter(role_i => !role_i.deleteDate)
    .sort((a, b) => a.updateDate < b.updateDate ? -1 : 1)
    .forEach(role_i => {
      if (role_i.type === RoleType.ADMIN) {
        if (role_i.userId !== user?.id) {
          admins.push(role_i);
        }
      }
      else if (role_i.type === RoleType.MEMBER) {
        members.push(role_i);
      }
      else {
        others.push(role_i);
      }
    });

  const [color, setColor] = useState(props.abstract?.color);
  const [colorTimeout, setColorTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = props.abstract?.userId === user?.id || props.role?.type === 'ADMIN';


  const handleColorChange = (color: any) => {
    if (!isAdmin) return; 
    setColor(color.hex);
  };

  const handleColorChangeComplete = (color: any) => {
    if (!isAdmin) return;
    if (colorTimeout) {
      clearTimeout(colorTimeout);
    }
    const timeout = setTimeout(() => {
      setColorTimeout(null);
      if (!props.abstract) return;
      setArrowColor(props.abstract.id, color.hex);
    }, 500);
    setColorTimeout(timeout);
  };

  const handleUserClick = (userId: string) => (event: React.MouseEvent) => {

  }

  const handleClose = () => {
    props.setIsOpen(false);
  }

  if (!abstract) return null;

  return (
    <Box sx={{
      display: props.isOpen
        ? 'block'
        : 'none',
    }}>
      <Paper sx={{
        overflowY: 'scroll',
        marginTop: `${SPACE_BAR_HEIGHT}px`,
        height: `calc(100% - ${SPACE_BAR_HEIGHT}px - 20px)`,
        width: ROLES_MENU_WIDTH,
      }}>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Typography variant='overline'>
            Color
          </Typography>
          <Box sx={{
            margin: 1,
          }}>
            <ChromePicker 
              color={color}
              disableAlpha={true}
              onChange={handleColorChange}
              onChangeComplete={handleColorChangeComplete}
            />
          </Box>
        </Card>
      </Paper>
    </Box>
  )
}