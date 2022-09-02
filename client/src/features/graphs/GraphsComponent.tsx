import { gql, useApolloClient, useReactiveVar } from '@apollo/client';
import { Box, Button, Card, IconButton, Link, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { getTimeString } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';
import { selectIdToArrow } from '../arrow/arrowSlice';
import LooksOne from '@mui/icons-material/LooksOne';
import LooksTwo from '@mui/icons-material/LooksTwo';
import useSetUserGraph from '../user/useSetUserGraph';


interface GraphsComponentProps {
}

export default function GraphsComponent(props: GraphsComponentProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { 
    user, 
    menuMode,
    setMenuMode,
    dimColor: color,
    setIsCreatingGraph,
    setCreateGraphArrowId,
  } = useContext(AppContext);
  
  const roles = [...(user?.roles || [])]
    .filter(role =>!role.deleteDate);

  const idToArrow = useAppSelector(selectIdToArrow);

  // const { requestRole } = useRequestRole();
  // const { removeRole } = useRemoveRole();

  const { setUserFrameById, setUserFocusById } = useSetUserGraph();

  const handleJoinClick = (jamId: string) => (event: React.MouseEvent) => {
    //requestRole(jamId);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    //removeRole(roleId)
  }

  const handleFrameClick = (abstractId: string) => (event: React.MouseEvent) => {
    if (abstractId !== user?.frameId) {
      setUserFrameById(abstractId);
    }
  }

  const handleFocusClick = (abstractId: string) => (event: React.MouseEvent) => {
    if (abstractId !== user?.focusId) {
      setUserFocusById(abstractId);
    }
  }

  // const handleJamClick = (jamUserId: string | null, jamRouteName: string) => (event: React.MouseEvent) => {
  //   if (!(jamUserId && jamRouteName === user?.routeName)) {
  //     const route = `${jamUserId ? 'u' : 'j'}/${jamRouteName}/0`
  //     dispatch(setFocusRouteName(route))

  //     dispatch(setSpace('FOCUS'));

  //     if (width < MOBILE_WIDTH) {
  //       dispatch(setSurveyorMode(''));
  //     }

  //     navigate(route);
  //   }
  // }

  const handleStartClick = () => {
    setCreateGraphArrowId(null);
    setIsCreatingGraph(true);
  }

  const handleClose = () => {
    setMenuMode(MenuMode.NONE);
  };

  if (menuMode !== MenuMode.GRAPHS) return null;

  return (
    <Box sx={{
      height: '100%',
    }}>
      <Card elevation={5} sx={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 1,
      }}>
        <Button onClick={handleStartClick} variant='contained' sx={{
          whiteSpace: 'nowrap',
        }}>
          Create a graph
        </Button>
        <Box>
          <IconButton onClick={handleClose} sx={{
            fontSize: 16,
          }}>
            <CloseIcon fontSize='inherit' />
          </IconButton>
        </Box>
      </Card>
      <Box sx={{
        height: '100%',
        width: '100%',
        overflowY: 'scroll',
      }}>

      {
          roles.map(role => {
            const { arrow } = role;
            const time = new Date(arrow?.updateDate || Date.now()).getTime();
            const timeString = getTimeString(time);
            return (
              <Card key={`role-${role.id}`} elevation={5} sx={{
                margin: 1,
                padding: 1,
                fontSize: 16,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Box>
                    <Link color={arrow.user?.color} sx={{
                      color: arrow.user?.color,
                      cursor: arrow.userId === user?.id
                        ? 'default'
                        : 'pointer',
                    }}>
                      {arrow.title}
                    </Link>
                    &nbsp;
                    <Box component='span' sx={{
                      fontSize: 14,
                      color,
                    }}>
                      {
                        timeString
                      }
                    </Box>
                  </Box>
                  <Box sx={{
                    marginTop:1,
                    fontSize: 12,
                  }}>
                    { role.type }
                    { role.isInvited 
                        ? ' - INVITED'
                        : role.isRequested
                          ? ' - REQUESTED'
                          : null
                    }
                  </Box>
                </Box>
                <Box sx={{
                  display: role.userId === user?.id && role.type !== 'ADMIN'
                    ? 'block'
                    : 'none'
                }}>
                  {
                    role.isRequested
                      ? role.isInvited
                        ? <Button onClick={handleLeaveClick(role.id)}>
                            Leave
                          </Button>
                        : <Button onClick={handleLeaveClick(role.id)}>
                            Cancel
                          </Button>
                      : role.isInvited
                        ? <Box>
                          <Button onClick={handleJoinClick(role.arrowId)}>
                            Accept
                          </Button>
                          <Button onClick={handleLeaveClick(role.id)}>
                            Decline
                          </Button>
                          </Box>
                        : null
                  }
                </Box>
                <Box>
                  <IconButton onClick={handleFrameClick(role.arrowId)} sx={{
                    color: role.arrowId === user?.frameId
                      ? role.arrow.user.color
                      : null,
                    outline: role.arrowId === user?.frameId
                      ? `1px solid ${role.arrow.user.color}`
                      : null,
                  }}>
                    <LooksOne />
                  </IconButton>
                  &nbsp;
                  <IconButton onClick={handleFocusClick(role.arrowId)}  sx={{
                    color: role.arrowId === user?.focusId
                      ? role.arrow.user.color
                      : null,
                    outline: role.arrowId === user?.focusId
                      ? `1px solid ${role.arrow.user.color}`
                      : null,
                  }}>
                    <LooksTwo />
                  </IconButton>
                </Box>
              </Card>
            )
          })
        }
      </Box>
    </Box>
  );

}