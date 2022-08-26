import { Box, Button, Card, Link, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Role, RoleType } from '../role/role';
import { AppContext } from '../../App';
import { SpaceContext } from './SpaceComponent';
import { ROLES_MENU_WIDTH, SPACE_BAR_HEIGHT } from '../../constants';

interface RolesMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  role: Role | null;
}
export default function RolesMenu(props: RolesMenuProps) {
  const navigate = useNavigate();

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

  const [isInviting, setIsInviting] = useState(false);
  const canInvite = props.role && (props.role.type === 'ADMIN' || props.role.type === 'MEMBER')

  // const { requestRole } = useRequestRole();
  // const { inviteRole } = useInviteRole(props.jam.id, () => {});
  // const { removeRole } = useRemoveRole();

  const handleInviteClick = (event: React.MouseEvent) => {
    setIsInviting(true);
  }
  const handleJoinClick = (event: React.MouseEvent) => {
    //requestRole(props.jam.id);
  }
  const handleApproveClick = (userName: string) => (event: React.MouseEvent) => {
    //inviteRole(userName);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    //removeRole(roleId)
  }

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
          {
            canInvite
              ? <Box>
                  {
                    isInviting 
                      ? <Box>
                        </Box>
                      : <Button variant='contained' onClick={handleInviteClick}>
                          Invite
                        </Button>
                  }
                </Box>
              : props.role && props.role.isRequested
                ? null
                : <Box>
                    {
                      props.role && props.role.isInvited
                        ? <Button disabled={!user} variant='contained' onClick={handleJoinClick}>
                            Join
                          </Button>
                        : <Button disabled={!user} onClick={handleJoinClick}>
                            Request membership
                          </Button>
                    }
                  </Box>
          }
        </Card>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Typography variant='overline'>
            Owner
          </Typography>
          <Card variant='outlined' sx={{
            padding: 1,
          }}>
            <Link onClick={handleUserClick(abstract.userId)} sx={{
              cursor: 'pointer',
            }}>
              {abstract.user.name || '...'}
            </Link>
          </Card>
        </Card>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Typography variant='overline'>
            Members
          </Typography>
          {
            members.map(role_i => {
              return (
                <Card variant='outlined' key={`role-${role_i.id}`} sx={{
                  padding: 1,
                }}>
                  <Link color={role_i.user.color} onClick={handleUserClick(role_i.userId)} sx={{
                    color: role_i.user.color,
                    cursor: 'pointer',
                  }}>
                    {role_i.user.name || '...'}
                  </Link>
                </Card>
              )
            })
          }
        </Card>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Typography variant='overline'>
            Other
          </Typography>
          {
            others.map(role_i => {
              return (
                <Card variant='outlined' key={`role-${role_i.id}`} sx={{
                  padding: 1,
                }}>
                  <Link  color={role_i.user.color} onClick={handleUserClick(role_i.userId)} sx={{
                    color: role_i.user.color,
                    cursor: 'pointer',
                  }}>
                    {role_i.user.name || '...'}
                  </Link>
                </Card>
              )
            })
          }
        </Card>
      </Paper>
    </Box>
  )
}