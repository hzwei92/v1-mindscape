import { useApolloClient } from '@apollo/client';
import { Box, Link } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpaceType } from '../space/space';
import { Arrow } from './arrow';
import { getColor, getTimeString } from '../../utils';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSpace } from '../space/spaceSlice';
import UserTag from '../user/UserTag';
import { MOBILE_WIDTH } from '../../constants';
import { selectMode, selectWidth } from '../window/windowSlice';
import { setMenuMode } from '../menu/menuSlice';
import { User } from '../user/user';
import ArrowEditor from './ArrowEditor';

interface ArrowProps {
  user: User | null;
  space: SpaceType | null;
  abstract: Arrow;
  arrow: Arrow;
  instanceId: string;
}

export default function ArrowComponent(props: ArrowProps) {
  const navigate = useNavigate();
  const client = useApolloClient();

  const width = useAppSelector(selectWidth);
  const mode = useAppSelector(selectMode);
  const color = getColor(mode, true);
  const space = useAppSelector(selectSpace);
  
  //useAppSelector(state => selectInstanceById(state, props.instanceId)); // rerender on instance change
  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   dispatch(addInstance({
  //     id: props.instanceId,
  //     arrowId: arrow.id,
  //     isNewlySaved: false,
  //     shouldRefreshDraft: false,
  //   }));
  //   return () => {
  //     dispatch(removeInstance(props.instanceId));
  //   };
  // }, []);

  const handleJamClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    /*
    if (arrow.jamId === user?.frameId && space !== 'FRAME') {
      const route = `/u/${user.frame?.routeName}`;
      navigate(route);
    }
    else if (arrow.jamId !== user?.focusId || space !== 'FOCUS') {
      const route = `/${arrow.jam.userId ? 'u' : 'j'}/${arrow.jam.routeName}`;
      dispatch(setFocusRouteName(route))
      navigate(route);
    }
    */
    if (width < MOBILE_WIDTH) {
      dispatch(setMenuMode({
        mode: '',
        toggle: false
      }));
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const time = new Date(props.arrow.removeDate || props.arrow.commitDate || props.arrow.saveDate || Date.now()).getTime();
  const timeString = getTimeString(time);

  return (
    <Box sx={{
      margin:1,
    }}>
      <Box sx={{
        fontSize: 14,
        color,
        paddingBottom: '4px',
      }}>
        <UserTag user={props.user} tagUser={props.arrow.user} />
        { ' ' }
        { timeString }
        {
          props.arrow.removeDate
            ? ' (deleted)'
            : props.arrow.commitDate 
              ? ' (committed)'
              : null
        }
        {
          // props.arrow.ownerArrow.id === props.abstract?.id
          //   ? null
          //   : <Box sx={{
          //       marginTop: 1,
          //     }}>
          //       &nbsp;&nbsp;
          //       <Link color={arrow.ownerArrow.color} onMouseDown={handleMouseDown} onClick={handleJamClick}
          //         sx={{
          //           color: arrow.ownerArrow.color,
          //           cursor: 'pointer'
          //         }}
          //       >
          //         {`m/${arrow.ownerArrow.routeName}`}
          //       </Link>
          //     </Box>
        }
      </Box>
      <Box>
        <ArrowEditor
          user={props.user}
          space={props.space}
          arrow={props.arrow}
          isReadonly={false}
          instanceId={props.instanceId}
        />
      </Box>
    </Box>
  )

}