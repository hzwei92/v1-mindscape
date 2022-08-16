import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import React, { useContext, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EditIcon from '@mui/icons-material/Edit';
import CropDinIcon from '@mui/icons-material/CropDin';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Twig } from './twig';
import { useSnackbar } from 'notistack';
import UserTag from '../user/UserTag';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectArrowById } from '../arrow/arrowSlice';
import { selectSheafById } from '../sheaf/sheafSlice';
import useReplyTwig from './useReplyTwig';
import { v4 } from 'uuid';
import { addEntry } from '../entry/entrySlice';
import { searchPushSlice } from '../search/searchSlice';
import { MenuMode } from '../menu/menu';
import { Arrow } from '../arrow/arrow';
import useSetUserFocus from '../user/useSetUserFocus';
import { setIsOpen } from '../space/spaceSlice';
import { SpaceType } from '../space/space';
import { useNavigate } from 'react-router-dom';
//import useCenterTwig from './useCenterTwig';

interface TwigControlsProps {
  twig: Twig;
  isPost: boolean;
}
function TwigControls(props: TwigControlsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    user,
    brightColor: color,
    pendingLink,
    setPendingLink,
    setMenuMode,
  } = useContext(AppContext);
  
  const {
    space,
    abstract,
    canPost,
    canView
  } = useContext(SpaceContext)

  const arrow = useAppSelector(state => selectArrowById(state, props.twig.detailId));
  const sheaf = useAppSelector(state => selectSheafById(state, arrow?.sheafId));

  const frameTwig = null;
  const focusTwig = null;

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);
  const [isEditingRoute, setIsEditingRoute] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { setUserFocusById } = useSetUserFocus();
  const { replyTwig } = useReplyTwig();
  
  // const { sub } = useSubArrow(props.twig.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { unsub } = useUnsub(props.twig.post, () => {
  //   props.setIsLoading(false);
  // });

  // const { addTwig: addFrameTwig } = useAddTwig('FRAME');
  // const { addTwig: addFocusTwig } = useAddTwig('FOCUS');

  //const { centerTwig: centerFrameTwig } = useCenterTwig(user, 'FRAME');
  //const { centerTwig: centerFocusTwig } = useCenterTwig(user, 'FOCUS');


  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!arrow) return;
    navigate(`/g/${arrow.routeName}/0`);
  }

  const handleReplyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!arrow) return;
    replyTwig(props.twig, arrow);
  }

  const handleLinkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (pendingLink.sourceId === props.twig.detailId) {
      setPendingLink({
        sourceId: '',
        targetId: '',
      });
    }
    else {
      setPendingLink({
        sourceId: props.twig.detailId,
        targetId: '',
      });
    }
  }

  const handleMenuOpenClick = (event: React.MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setIsEditingRoute(false);
  }

  const handleRouteClick = (event: React.MouseEvent) => {
    setIsEditingRoute(!isEditingRoute);
  }

  const handleCopyClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://mindscape.pub/g/${arrow?.routeName}`);
    const handleDismissClick = (event: React.MouseEvent) => {
      closeSnackbar(props.twig.id);
    }
    enqueueSnackbar('URL copied', {
      key: props.twig.id,
      action: () => {
        return (
          <Box>
            <IconButton onClick={handleDismissClick} sx={{
              color,
            }}>
              <CloseIcon sx={{
                fontSize: 14,
              }}/>
            </IconButton>
          </Box>
        );
      }
    })
    handleMenuClose();
  }

  const handleCopyRelativeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://mindscape.pub/g/${abstract.routeName}/${props.twig.i}`);
    const handleDismissClick = (event: React.MouseEvent) => {
      closeSnackbar(props.twig.id + 'context');
    }
    enqueueSnackbar('URL (with context) copied ', {
      key: props.twig.id + 'context',
      action: () => {
        return (
          <Box>
            <IconButton onClick={handleDismissClick} sx={{
              color,
            }}>
              <CloseIcon sx={{
                fontSize: 14,
              }}/>
            </IconButton>
          </Box>
        );
      }
    })
    handleMenuClose();
  }

  const handleSubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //sub();
    handleMenuClose();
  }
  
  const handleUnsubClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //unsub();
    handleMenuClose();
  }

  const handleFrameClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    /*
    if (frameTwig) {
      if (frameTwig.postId === frameArrowId) {
        centerFrameTwig(frameTwig, true, 0);
      }
      else {
      }
    }
    else {
      addFrameTwig(props.twig.post.id)
    }*/
  }

  const handleFocusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    /*
    if (focusTwig) {
      if (focusTwig.postId === focusArrowId) {
        centerFocusTwig(focusTwig, true, 0);
      }
      else {
      }
    }
    else {
      addFocusTwig(props.twig.post.id);
    }*/
  }

  const handleCommitClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setCommitArrowId(props.twig.detailId))
    handleMenuClose();
  }

  const handleRemoveClick =  (event: React.MouseEvent) => {
    event.stopPropagation();
    //dispatch(setRemoveArrowId(props.twig.detailId));
    handleMenuClose();
  }

  const handlePrevClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!arrow) return;

    const id = v4();
    
    dispatch(addEntry({
      id,
      userId: arrow.userId,
      parentId: '',
      arrowId: arrow.id,
      showIns: true,
      showOuts: false,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: true,
    }));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds: [id],
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH);
  }

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!arrow) return;

    const id = v4();

    let sourceId = null;
    let targetId = null;
    if (arrow.sourceId !== arrow.targetId) {
      if (arrow.source) {
        sourceId = v4();

        dispatch(addEntry({
          id: sourceId,
          userId: arrow.source.userId,
          parentId: id,
          arrowId: arrow.source.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
        }));
      }

      if (arrow.target) {
        targetId = v4();
        dispatch(addEntry({
          id: targetId,
          userId: arrow.target.userId,
          parentId: id,
          arrowId: arrow.target.id,
          showIns: false,
          showOuts: false,
          inIds: [],
          outIds: [],
          sourceId: null,
          targetId: null,
          shouldGetLinks: false,
        }));
      }
    }

    dispatch(addEntry({
      id,
      userId: arrow.userId,
      parentId: '',
      arrowId: arrow.id,
      showIns: false,
      showOuts: true,
      inIds: [],
      outIds: [],
      sourceId,
      targetId,
      shouldGetLinks: true,
    }));

    dispatch(searchPushSlice({
      originalQuery: '',
      query: '',
      entryIds: [id],
      userIds: [],
    }));

    setMenuMode(MenuMode.SEARCH);
  }

  return (
    <Box sx={{
      margin: 1,
      marginTop: 0,
      marginLeft: 0,
    }}>
      <Button
        variant={abstract.id === arrow?.id ? 'outlined' : 'text'}
        onMouseDown={handleMouseDown}
        onClick={handleOpenClick}
        sx={{
          color,
          fontSize: 12,
        }}
      >
        Open {arrow?.twigN ? `(${arrow.twigN})` : ''}
      </Button>
      <Button
        disabled={!canPost}
        onMouseDown={handleMouseDown} 
        onClick={handleReplyClick}
        sx={{
          color,
          fontSize: 12,
        }}
      >
        Reply
      </Button>

      <Button disabled={!canView} onMouseDown={handleMouseDown} onClick={handleLinkClick} sx={{
        color,
        fontSize: 12,
      }}>
        Link
      </Button>
      <IconButton onMouseDown={handleMouseDown} onClick={handleMenuOpenClick}>
        <MoreVertIcon sx={{
          color,
          fontSize: 12,
        }}/>
      </IconButton>
      <Menu
        open={!!menuAnchorEl}
        onClose={handleMenuClose}
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {
          props.twig.user.id !== arrow?.user.id
            ? <Box sx={{
                fontSize: 12,
                padding: 1,
              }}>
                reposted by&nbsp;
                <UserTag user={props.twig.user} />
              </Box>
            : null
        }
        {
          arrow?.userId === user?.id
            ? <MenuItem onClick={handleRouteClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <EditIcon fontSize='inherit'/>
                </Box>
                &nbsp; Edit hyperlink
              </MenuItem>
            : null
        }
        <MenuItem onClick={handleCopyClick} sx={{
          fontSize: 14,
        }}>
          <Box sx={{
            marginLeft: '-5px',
            marginBottom: '-5px',
            fontSize: 14,
          }}>
            <LinkIcon fontSize='inherit'/>
          </Box>
          &nbsp; Copy hyperlink
        </MenuItem>
        <MenuItem onClick={handleCopyRelativeClick} sx={{
          fontSize: 14,
        }}>
          <Box sx={{
            marginLeft: '-5px',
            marginBottom: '-5px',
            fontSize: 14,
          }}>
            <LinkIcon fontSize='inherit'/>
          </Box>
          &nbsp; Copy hyperlink (with context)
        </MenuItem>
        {
          arrow?.userId === user?.id && !arrow?.commitDate && !arrow?.removeDate
            ? <MenuItem onClick={handleCommitClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <CheckIcon fontSize='inherit'/>
                </Box>
                &nbsp; Commit post
              </MenuItem>
            : null
        }
        {
          arrow?.userId === user?.id && !arrow?.removeDate
            ? <MenuItem onClick={handleRemoveClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <CloseIcon fontSize='inherit'/>
                </Box>
                &nbsp; Delete post
              </MenuItem>
            : null
        }
        {
          false
            ? <MenuItem onClick={handleUnsubClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                  color: user?.color, 
                }}>
                  <NotificationsTwoToneIcon fontSize='inherit'/>
                </Box>
                &nbsp; Unsubscribe from post
              </MenuItem>
            : <MenuItem onClick={handleSubClick} sx={{
                fontSize: 14,
              }}>
                <Box sx={{
                  marginLeft: '-5px',
                  marginBottom: '-5px',
                  fontSize: 14,
                }}>
                  <NotificationsNoneIcon fontSize='inherit'/>
                </Box>
                &nbsp; Subscribe to post
              </MenuItem>
          }
          {
            space === 'FOCUS'
              ? <MenuItem onClick={handleFrameClick} sx={{
                  fontSize: 14,
                }}>
                  <Box sx={{
                    marginLeft: '-5px',
                    marginBottom: '-5px',
                    fontSize: 14,
                    color: frameTwig ? user?.frame?.user.color : null
                  }}>
                    <CropDinIcon fontSize='inherit'/>
                  </Box>
                  &nbsp; { frameTwig ? 'View in frame' : 'Add to frame' }
                </MenuItem>
              : user?.focusId
                ? <MenuItem onClick={handleFocusClick} sx={{
                    fontSize: 14,
                  }}>
                    <Box sx={{
                      marginLeft: '-5px',
                      marginBottom: '-5px',
                      fontSize: 14,
                      color: focusTwig ? user?.focus?.user.color : null
                    }}>
                      <CropFreeIcon fontSize='inherit'/>
                    </Box>
                    &nbsp; { focusTwig ? 'View in focus' : 'Add to focus' }
                  </MenuItem>
                : null
          }
      </Menu>
      <Button onMouseDown={handleMouseDown} onClick={handlePrevClick} sx={{
        color,
        fontSize: 12,
      }}>
        {arrow?.inCount} IN
      </Button>
      <Button onMouseDown={handleMouseDown} onClick={handleNextClick} sx={{
        color,
        fontSize: 12,
      }}>
        {arrow?.outCount} OUT
      </Button>
    </Box>
  )
}

export default React.memo(TwigControls)