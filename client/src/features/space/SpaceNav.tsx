import { useApolloClient, useReactiveVar } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { Box, Fab } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { useLocation, useNavigate } from 'react-router-dom';
import { SpaceType } from './space';
import { Twig } from '../twig/twig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MAX_Z_INDEX, MOBILE_WIDTH, NOT_FOUND } from '../../constants';
import useCenterTwig from '../twig/useCenterTwig';
import { selectIsOpen, selectSpace, selectTwigId, setSpace } from './spaceSlice';
import { selectWidth } from '../window/windowSlice';
import { selectMenuMode } from '../menu/menuSlice';
import { Arrow } from '../arrow/arrow';
import { User } from '../user/user';
import { selectTwigIdToTrue } from '../twig/twigSlice';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';

interface SpaceNavProps {
  user: User | null;
  space: SpaceType;
  superArrow: Arrow;
}

export default function SpaceNav(props: SpaceNavProps) {
  const client = useApolloClient();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const width = useAppSelector(selectWidth);
  const menuMode = useAppSelector(selectMenuMode);

  const space = useAppSelector(selectSpace);
  const frameIsOpen = useAppSelector(selectIsOpen('FRAME'));
  const focusIsOpen = useAppSelector(selectIsOpen('FOCUS'));

  const twigIdToTrue = useAppSelector(selectTwigIdToTrue(props.space))
  const twigId = useAppSelector(selectTwigId(props.space));

  const [twigs, setTwigs] = useState([] as Twig[]);
  const [index, setIndex] = useState(0);

  const hasEarlier = index > 0;
  const hasLater = index < twigs.length - 1;

  const { centerTwig } = useCenterTwig(props.user, props.space);

  useEffect(() => {
    const sortedTwigs = Object.keys(twigIdToTrue)
      .map(twigId => {
        return client.cache.readFragment({
          id: client.cache.identify({
            id: twigId,
            __typename: 'Twig'
          }),
          fragment: FULL_TWIG_FIELDS,
          fragmentName: 'FullTwigFields'
        }) as Twig;
      })
      .sort((a, b) => a.i < b.i ? -1 : 1);
      
    setTwigs(sortedTwigs);
  }, [twigIdToTrue]);

  useEffect(() => {
    if (!twigId) return;

    twigs.some((twig, i) => {
      if (twig.id === twigId) {
        setIndex(i);
        return true;
      }
      return false;
    });
  }, [twigId]);

  if (
    props.space === 'FOCUS' && 
    (!focusIsOpen ||
    (width < MOBILE_WIDTH && (space === 'FRAME' || menuMode)))
  ) return null;


  if (
    props.space === 'FRAME' &&
    (!frameIsOpen ||
    (width < MOBILE_WIDTH && (space === 'FOCUS' || menuMode)))
  ) return null;


  const select = (twig: Twig) => {
    const route = `/m/${props.superArrow.routeName}/${twig.i}`;
    navigate(route)
    setIndex(twig.i);
  }

  const handleNavEarliest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[0];
    select(twig);
  }

  const handleNavPrev = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[index - 1];
    select(twig);
  }

  const handleNavNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[index + 1];
    select(twig);
  }

  const handleNavLatest = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const twig = twigs[twigs.length - 1];
    select(twig);
  }

  const handleNavFocus = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const twig = twigs[index];
    const route = `/m/${props.superArrow.routeName}/${twig.i}`;
    if (route !== location.pathname) {
      navigate(route);
    }
    if (space !== props.space) {
      dispatch(setSpace(props.space));
    }
    centerTwig(twig.id, true, 0);
  }
  
  return (
    <Box sx={{
      position: 'absolute',
      marginLeft: '-140px',
      left: '50%',
      bottom: 70,
      zIndex: MAX_Z_INDEX + 100,
    }}>
    <Box sx={{
      position: 'fixed',
      whiteSpace: 'nowrap',
    }}>
      <Fab title='Earliest' size='small' disabled={!hasEarlier} onClick={handleNavEarliest}  sx={{
        margin: 1,
        color: hasEarlier ? (twigs[0]?.user?.color || 'dimgrey') : 'dimgrey',
      }}>
        <SkipPreviousIcon color='inherit' />
      </Fab>
      <Fab title='Previous' size='small' disabled={!hasEarlier} onClick={handleNavPrev} sx={{
        margin: 1,
        color: hasEarlier ? (twigs[index - 1]?.user?.color || 'dimgrey') : 'dimgrey',
      }}>
        <FastRewindIcon color='inherit' />
      </Fab>
      <Fab title='Selected' size='small' disabled={!twigId} onClick={handleNavFocus} sx={{
        margin: 1,
        color:  twigs[index]?.user?.color || 'dimgrey',
        border: space === props.space
          ? '3px solid'
          : 'none'
      }}>
        <CenterFocusStrongIcon color='inherit' />
      </Fab>
      <Fab title='Next' size='small' disabled={!hasLater} onClick={handleNavNext} sx={{
        margin: 1,
        color: hasLater ? (twigs[index + 1]?.user?.color || 'dimgrey') : 'dimgrey',
      }}>
        <FastForwardIcon color='inherit' />
      </Fab>
      <Fab title='Latest' size='small' disabled={!hasLater} onClick={handleNavLatest} sx={{
        margin: 1,
        color: hasLater ? (twigs[twigs.length - 1]?.user?.color || 'dimgrey') : 'dimgrey',
      }}>
        <SkipNextIcon color='inherit' />
      </Fab>
    </Box>
    </Box>
  );
}