import { Avatar, Box, IconButton, Link } from '@mui/material';
import type { User } from './user';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CirclOutlinedIcon from '@mui/icons-material/CircleOutlined'
import md5 from 'md5';
import { useContext } from 'react';
import { AppContext } from '../../App';

interface UserTagProps {
  user: User | null;
}
export default function UserTag(props: UserTagProps) {
  const { user, dimColor: color } = useContext(AppContext);
  const isFollowing = false //(props.user?.leaders || [])
    // .some(lead => !lead.deleteDate && lead.leaderId === props.user.id);


  //const { followUser } = useFollowUser();
  //const { unfollowUser } = useUnfollowUser();

  const handleUnfollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //unfollowUser(props.user.id);
  }

  const handleFollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //followUser(props.user.id);
  }

  const handleUserClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.user?.id !== user?.id) {
      /*
      dispatch(setFocusRouteName(`/u/${props.user.routeName}`))

      dispatch(setSpace('FOCUS'));

      if (width < MOBILE_WIDTH) {
        dispatch(setSurveyorMode(''));
      }
      */
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  return(
    <Box component='span' onMouseDown={handleMouseDown} sx={{
      whiteSpace: 'nowrap'
    }}>
      {
        props.user?.verifyEmailDate
          ? <Avatar
              variant='rounded'
              src={`https://www.gravatar.com/avatar/${md5(props.user.email)}?d=retro`}
              sx={{
                display: 'inline-block',
                marginBottom: '-2px',
                marginRight: '4px',
                width: 17,
                height: 17,
                border: `1px solid ${props.user.color}`
              }}
            />
          : null
      }
      <Link color={props.user?.color} onClick={handleUserClick}
        sx={{
          color: props.user?.color,
          cursor: 'pointer'
        }}
      >
        u/{props.user?.name}
      </Link>
      {
        props.user?.id === props.user?.id
          ? null
          : <Box component='span'>
              {
                isFollowing
                  ? <IconButton
                      onClick={handleUnfollowClick}
                      title={`Unfollow u/${props.user?.name}`}
                      size='small'
                      sx={{
                        marginTop: '-3px',
                        marginLeft: '2px',
                        padding: 0,
                        fontSize: 14,
                      }}
                    >
                      <CheckCircleTwoToneIcon fontSize='inherit' sx={{
                        color: props.user?.color || color,
                      }}/>
                    </IconButton>
                  : <IconButton 
                      onClick={handleFollowClick}
                      title={`Follow u/${props.user?.name}`}
                      size='small' 
                      sx={{
                        marginTop: '-1px',
                        marginLeft: '2px',
                        padding: 0,
                        fontSize: 10,
                      }}
                    >
                      <CirclOutlinedIcon fontSize='inherit' sx={{
                        color,
                      }}/>
                    </IconButton>
              }
            </Box>
      }
    </Box>
  )
}