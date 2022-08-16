import React, { useContext, useEffect, useState } from 'react';
import { Box, Fab } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import { SpaceContext } from './SpaceComponent';
import { useAppSelector } from '../../app/hooks';
import { selectIdToTwig } from '../twig/twigSlice';
import useCenterTwig from '../twig/useCenterTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { Twig } from '../twig/twig';
import { MAX_Z_INDEX } from '../../constants';
import { getTwigColor } from '../../utils';
import { selectIsOpen, selectSelectedSpace, selectSelectedTwigId } from './spaceSlice';
import { selectIdToUser } from '../user/userSlice';

export default function SpaceNav() {
  const { 
    space, 
    abstract, 
    canEdit
  } = useContext(SpaceContext);

  const selectedSpace = useAppSelector(selectSelectedSpace);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));

  const isOpen = useAppSelector(selectIsOpen(space));

  const idToTwig = useAppSelector(selectIdToTwig(space));
  const idToUser = useAppSelector(selectIdToUser);

  const [twigs, setTwigs] = useState([] as Twig[]);
  const [index, setIndex] = useState(0);
  const hasEarlier = index > 0;
  const hasLater = index < twigs.length - 1;

  const { centerTwig } = useCenterTwig(space);
  const { selectTwig } = useSelectTwig(space, canEdit);

  useEffect(() => {
    const sortedTwigs = Object.keys(idToTwig).map(id => idToTwig[id])
      .filter(twig => twig && !twig.deleteDate)
      .sort((a, b) => a.i < b.i ? -1 : 1);
      
    setTwigs(sortedTwigs);
  }, [idToTwig]);

  useEffect(() => {
    if (!selectedTwigId) return;

    twigs.some((twig, i) => {
      if (twig.id === selectedTwigId) {
        setIndex(i);
        return true;
      }
      return false;
    });
  }, [selectedTwigId]);

  if (!isOpen) return null;

  const select = (twig: Twig, isInstant?: boolean) => {
    if (selectedTwigId !== twig.id) {
      selectTwig(abstract, twig);
    }
    centerTwig(twig.id, !isInstant, 0);
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
        color: hasEarlier 
          ? (idToUser[twigs[0]?.userId]?.color || 'dimgrey') 
          : 'dimgrey',
      }}>
        <SkipPreviousIcon color='inherit' />
      </Fab>
      <Fab title='Previous' size='small' disabled={!hasEarlier} onClick={handleNavPrev} sx={{
        margin: 1,
        color: hasEarlier 
          ? (idToUser[twigs[index - 1]?.userId]?.color || 'dimgrey') 
          : 'dimgrey',
      }}>
        <FastRewindIcon color='inherit' />
      </Fab>
      <Fab title='Selected' size='small' disabled={!selectedTwigId} onClick={handleNavFocus} sx={{
        margin: 1,
        color: idToUser[twigs[index]?.userId]?.color || 'dimgrey',
        border: space === selectedSpace
          ? '3px solid'
          : 'none'
      }}>
        <CenterFocusStrongIcon color='inherit' />
      </Fab>
      <Fab title='Next' size='small' disabled={!hasLater} onClick={handleNavNext} sx={{
        margin: 1,
        color: hasLater 
          ? (idToUser[twigs[index + 1]?.userId]?.color || 'dimgrey') 
          : 'dimgrey',
      }}>
        <FastForwardIcon color='inherit' />
      </Fab>
      <Fab title='Latest' size='small' disabled={!hasLater} onClick={handleNavLatest} sx={{
        margin: 1,
        color: hasLater 
          ? (idToUser[twigs[twigs.length - 1]?.userId]?.color  || 'dimgrey') 
          : 'dimgrey',
      }}>
        <SkipNextIcon color='inherit' />
      </Fab>
    </Box>
    </Box>
  );
}