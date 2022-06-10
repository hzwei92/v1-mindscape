import { Avatar, Box, IconButton, Link } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { User } from './user';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CirclOutlinedIcon from '@mui/icons-material/CircleOutlined'
import md5 from 'md5';
import { setSpace } from '../space/spaceSlice';
import { useNavigate } from 'react-router-dom';
import { getColor } from '../../utils';
import { MOBILE_WIDTH } from '../../constants';
import { selectMode, selectWidth } from '../window/windowSlice';

interface UserTagProps {
  user: User | null;
  tagUser: User;
}
export default function UserTag(props: UserTagProps) {
  const navigate = useNavigate();

  const width = useAppSelector(selectWidth);
  const mode = useAppSelector(selectMode);
  const color = getColor(mode);

  const isFollowing = (props.user?.leaders || [])
    .some(lead => !lead.deleteDate && lead.leaderId === props.tagUser.id);

  const dispatch = useAppDispatch();

  //const { followUser } = useFollowUser();
  //const { unfollowUser } = useUnfollowUser();

  const handleUnfollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //unfollowUser(props.tagUser.id);
  }

  const handleFollowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    //followUser(props.tagUser.id);
  }

  const handleUserClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (props.tagUser.id !== props.user?.id) {
      /*
      dispatch(setFocusRouteName(`/u/${props.tagUser.routeName}`))

      dispatch(setSpace('FOCUS'));

      if (width < MOBILE_WIDTH) {
        dispatch(setSurveyorMode(''));
      }

      navigate(`/u/${props.tagUser.routeName}`)*/
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
        props.tagUser.verifyEmailDate
          ? <Avatar
              variant='rounded'
              src={`https://www.gravatar.com/avatar/${md5(props.tagUser.email)}?d=retro`}
              sx={{
                display: 'inline-block',
                marginBottom: '-2px',
                marginRight: '4px',
                width: 17,
                height: 17,
                border: `1px solid ${props.tagUser.color}`
              }}
            />
          : null
      }
      <Link color={props.tagUser.color} onClick={handleUserClick}
        sx={{
          color: props.tagUser.color,
          cursor: 'pointer'
        }}
      >
        u/{props.tagUser.name}
      </Link>
      {
        props.tagUser.id === props.user?.id
          ? null
          : <Box component='span'>
              {
                isFollowing
                  ? <IconButton
                      onClick={handleUnfollowClick}
                      title={`Unfollow u/${props.tagUser.name}`}
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
                      title={`Follow u/${props.tagUser.name}`}
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