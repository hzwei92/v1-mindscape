import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Dispatch, SetStateAction, useContext, useState } from 'react';
import { Entry } from './entry';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateEntry } from './entrySlice';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsTwoToneIcon from '@mui/icons-material/NotificationsTwoTone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EditIcon from '@mui/icons-material/Edit';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import CropDinIcon from '@mui/icons-material/CropDin';
import CropFreeIcon from '@mui/icons-material/CropFree';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { Twig } from '../twig/twig';
import useCenterTwig from '../twig/useCenterTwig';
import { useNavigate } from 'react-router-dom';
import { Arrow } from '../arrow/arrow';
import { AppContext } from '../../App';

interface EntryControlsProps {
  entry: Entry;
  arrow: Arrow;
  depth: number;
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function EntryControls(props: EntryControlsProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    user,
    menuMode,
    brightColor: color,
    pendingLink,
  } = useContext(AppContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null as Element | null);

  const [isEditingRoute, setIsEditingRoute] = useState(false);

  // const { replyEntry } = useReplyEntry(props.entry.id, props.entry.postId);
  // const { promoteEntry } = usePromoteEntry();
  // const { subPost } = useSubPost(props.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { unsubPost } = useUnsubPost(props.post, () => {
  //   props.setIsLoading(false);
  // });
  // const { addTwig: addFrameTwig } = useAddTwig('FRAME');
  // const { addTwig: addFocusTwig } = useAddTwig('FOCUS');

  // const { centerTwig: centerFrameTwig } = useCenterTwig('FRAME');
  // const { centerTwig: centerFocusTwig } = useCenterTwig('FOCUS');

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleReplyClick = (event: React.MouseEvent) => {
    // event.stopPropagation();
    // replyEntry();
  }

  const handleLinkClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (pendingLink.sourceId === props.entry.arrowId) {
  //     dispatch(setNewLink({
  //       sourcePostId: '',
  //       targetPostId: '',
  //     }));
  //   }
  //   else {
  //     dispatch(setNewLink({
  //       sourcePostId: props.entry.postId,
  //       targetPostId: '', 
  //     }));
  //   }
  }

  // const handleMenuOpenClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   setMenuAnchorEl(event.currentTarget);
  // }
  // const handleMenuClose = () => {
  //   setIsEditingRoute(false);
  //   setMenuAnchorEl(null)
  // }

  // const handleRouteClick = (event: React.MouseEvent) => {
  //   setIsEditingRoute(!isEditingRoute);
  // }

  // const handleCopyClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   navigator.clipboard.writeText(`https://granum.io/p/${props.post.routeName || props.post.id}`);
  //   enqueueSnackbar('URL copied');
  //   const handleDismissClick = (event: React.MouseEvent) => {
  //     closeSnackbar(props.entry.id);
  //   }
  //   enqueueSnackbar('URL copied', {
  //     key: props.entry.id,
  //     action: () => {
  //       return (
  //         <Box>
  //           <IconButton onClick={handleDismissClick} sx={{
  //             color: getColor(paletteMode, true)
  //           }}>
  //             <CloseIcon sx={{
  //               fontSize: 14,
  //             }}/>
  //           </IconButton>
  //         </Box>
  //       );
  //     }
  //   })
  //   handleMenuClose();
  // }

  // const handleSubClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   subPost();
  //   props.setIsLoading(true);
  //   handleMenuClose();
  // }
  
  // const handleUnsubClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   unsubPost();
  //   props.setIsLoading(true);
  //   handleMenuClose();
  // }


  // const handlePromoteClick = (event: React.MouseEvent) => { 
  //   event.stopPropagation();
  //   promoteEntry(props.entry);
  // }

  // const handleFrameClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (props.frameTwig) {
  //     if (props.frameTwig.postId === framePostId) {
  //       centerFrameTwig(props.frameTwig, true, 0);
  //     }
  //     else {
  //       navigate(`/u/${user?.frame?.routeName}/${props.frameTwig.jamI}`);
  //     }
  //   }
  //   else {
  //     addFrameTwig(props.post.id)
  //   }
  // }

  // const handleFocusClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (props.focusTwig) {
  //     if (props.focusTwig.postId === focusPostId) {
  //       centerFocusTwig(props.focusTwig, true, 0);
  //     }
  //     else {
  //       navigate(`/${user?.focus?.userId ? 'u' : 'j'}/${user?.focus?.routeName}/${props.focusTwig.jamI}`);
  //     }
  //   }
  //   else {
  //     addFocusTwig(props.post.id);
  //   }
  // }

  // const handleCommitClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   commitVar({
  //     postId: props.post.id
  //   });
  //   handleMenuClose();
  // }
  // const handleRemoveClick =  (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   removeVar({
  //     postId: props.post.id
  //   });
  //   handleMenuClose();
  // }

  const handlePrevClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.entry.showIns) {
      dispatch(updateEntry({
        ...props.entry,
        showIns: false,
      }));
    }
    else {
      dispatch(updateEntry({
        ...props.entry,
        showIns: true,
        showOuts: false,
        shouldGetLinks: true,
      }));
    }
  }

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.entry.showOuts) {
      dispatch(updateEntry({
        ...props.entry,
        showOuts: false,
      }));
    }
    else {
      dispatch(updateEntry({
        ...props.entry,
        showIns: false,
        showOuts: true,
        shouldGetLinks: true,
      }));
    }
  }

  return (
    <Box sx={{
      margin: 1,
      marginTop: 0,
      marginLeft: 0,
      fontSize: 12,
    }}>
        <Button onClick={handleReplyClick} sx={{
          color,
          fontSize: 12,
        }}>
          Reply
        </Button>
        <Button onClick={handleLinkClick} sx={{
          color,
          fontSize: 12,
        }}>
          Link
        </Button>
        <IconButton>
          <MoreVertIcon  sx={{
            color,
            fontSize: 12,
          }}/>
        </IconButton>
        {/* <Menu
          open={!!menuAnchorEl}
          onClose={handleMenuClose}
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{
            fontSize: 12,
            padding: 1,
            color: props.arrow.user.color,
          }}>
            {
              isEditingRoute
                ? <PostRouteNameEditor
                    postId={props.post.id}
                    routeName={props.post.routeName}
                    color={props.post.user.color}
                    setIsEditingRoute={setIsEditingRoute}
                    setIsLoading={props.setIsLoading}
                  />
                : `p/${props.post.routeName || props.post.id}`
            }
          </Box>
          {
            props.post.userId === user?.id
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
          {
            surveyorMode === 'SEARCH' && props.depth !== 0
              ? <MenuItem onClick={handlePromoteClick} sx={{
                  fontSize: 14,
                }}>
                  <Box sx={{
                    marginLeft: '-5px',
                    marginBottom: '-5px',
                    fontSize: 14,
                  }}>
                    <NorthWestIcon fontSize='inherit'/>
                  </Box>
                  &nbsp; Set as root
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
          {
            props.post.userId === user?.id && !props.post.commitDate && !props.post.removeDate
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
            props.post.userId === user?.id && !props.post.removeDate
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
            props.post.sub?.id && !props.post.sub.deleteDate
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
                  &nbsp; Subscribe
                </MenuItem>
          }
          <MenuItem onClick={handleFrameClick} sx={{
            fontSize: 14,
          }}>
            <Box sx={{
              marginLeft: '-5px',
              marginBottom: '-5px',
              fontSize: 14,
              color: props.frameTwig ? user?.frame?.color : null
            }}>
              <CropDinIcon fontSize='inherit'/>
            </Box>
            &nbsp; { props.frameTwig ? 'View in frame' : 'Add to frame' }
          </MenuItem>
          {
            user?.focusId
              ? <MenuItem onClick={handleFocusClick} sx={{
                  fontSize: 14,
                }}>
                  <Box sx={{
                    marginLeft: '-5px',
                    marginBottom: '-5px',
                    fontSize: 14,
                    color: props.focusTwig ? user?.focus?.color : null
                  }}>
                    <CropFreeIcon fontSize='inherit'/>
                  </Box>
                  &nbsp; { props.focusTwig ? 'View in focus' : 'Add to focus' }
                </MenuItem>
              : null
          }
        </Menu> */}
        &nbsp;&nbsp;
        <Box component='span' sx={{
          whiteSpace: 'nowrap',
        }}>
          <Button variant={props.entry.showIns ? 'outlined' : 'text'} onClick={handlePrevClick} sx={{
            color,
            fontSize: 12,
          }}>
            {props.arrow.inCount} In
          </Button>
          &nbsp;
          <Button variant={props.entry.showOuts ? 'outlined' : 'text'} onClick={handleNextClick} sx={{
            color,
            fontSize: 12, 
          }}>
            {props.arrow.outCount} Out
          </Button>
        </Box>
    </Box>
  )
}