import { gql, useApolloClient, useReactiveVar } from '@apollo/client';
import { Box, Button, Card, IconButton, Link, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { getColor, getTimeString } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import { MOBILE_WIDTH } from '../../constants';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';
import { selectIdToArrow } from '../arrow/arrowSlice';


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

  const handleJoinClick = (jamId: string) => (event: React.MouseEvent) => {
    //requestRole(jamId);
  }
  const handleLeaveClick = (roleId: string) => (event: React.MouseEvent) => {
    //removeRole(roleId)
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
      <Box sx={{
        height: '100%',
        width: '100%',
        overflowY: 'scroll',
      }}>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Button onClick={handleStartClick} sx={{
            whiteSpace: 'nowrap',
          }}>
            Create a graph
          </Button>
        </Card>
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
              </Card>
            )
          })
        }
      </Box>
    </Box>
  );

}