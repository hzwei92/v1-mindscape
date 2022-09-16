import { Box, Button, Card, IconButton, Link, Paper,  } from '@mui/material';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import CloseIcon from '@mui/icons-material/Close';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';
import { selectIdToArrow } from '../arrow/arrowSlice';
import { APP_BAR_HEIGHT, MAX_Z_INDEX } from '../../constants';
import useCreateTab from '../tab/useCreateTab';
import { selectFocusTab, selectFrameTab } from '../tab/tabSlice';


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
    setGraphsMenuIsResizing,
    graphsMenuWidth,
    setIsCreatingGraph,
    setCreateGraphArrowId,
  } = useContext(AppContext);
  
  const focusTab = useAppSelector(selectFocusTab);
  const frameTab = useAppSelector(selectFrameTab);

  const roles = [...(user?.roles || [])]
    .filter(role =>!role.deleteDate);

  const tabs = [...(user?.tabs || [])]
    .filter(tab =>!tab.deleteDate)
    .sort((a, b) => a.i - b.i);

  const idToArrow = useAppSelector(selectIdToArrow);

  const [showResizer, setShowResizer] = useState(false);

  // const { requestRole } = useRequestRole();
  // const { removeRole } = useRemoveRole();

  const { createTab } = useCreateTab();


  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    setGraphsMenuIsResizing(true);
  };

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

  const handleArrowClick = (arrowId: string) => () => {
    const hasTab = (user?.tabs || []).some(tab => tab.arrowId === arrowId);
    if (!hasTab) {
      createTab(arrowId, null, false, true);
    }
  }

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
      position: 'fixed',
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      marginTop: `${APP_BAR_HEIGHT}px`,
      display: 'flex',
      flexDirection: 'row',
      zIndex: MAX_Z_INDEX + 1000,
      width: graphsMenuWidth,
      // transition: menuIsResizing
      //   ? 'none'
      //   : 'width .5s'
    }}>
      <Paper sx={{
        height: '100%',
        width: 'calc(100% - 4px)',
        color,
      }}>
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
              tabs.map(tab => {
                const { arrow } = tab;
                return (
                  <Card key={`tab-${tab.id}`} elevation={5} sx={{
                    margin: 1,
                    padding: 1,
                    fontSize: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Box>
                        {tab.i + 1}
                      </Box>
                      <Box>
                        <Link color={arrow.color} onClick={handleArrowClick(arrow.id)} sx={{
                          color: arrow.color,
                          cursor: arrow.userId === user?.id
                            ? 'default'
                            : 'pointer',
                        }}>
                          {arrow.title}
                        </Link>
                        &nbsp;
                      </Box>
                    </Box>
                  </Card>
                )
              })
            }
            {
              roles.filter(role => !tabs.some(tab => tab.arrowId === role.arrowId)).map(role => {
                const { arrow } = role;
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
                        <Link color={arrow.color} onClick={handleArrowClick(arrow.id)} sx={{
                          color: arrow.color,
                          cursor: arrow.userId === user?.id
                            ? 'default'
                            : 'pointer',
                        }}>
                          {arrow.title}
                        </Link>
                      </Box>
                    </Box>
                  </Card>
                );
              })
            }
          </Box>
        </Box>
      </Paper>
      <Box 
        onMouseDown={handleResizeMouseDown}
        onMouseEnter={handleResizeMouseEnter}
        onMouseLeave={handleResizeMouseLeave} 
          sx={{
          width: 4,
          backgroundColor: showResizer
            ? 'primary.main'
            : color,
          cursor: 'col-resize'
        }}
      />
    </Box>
  );

}