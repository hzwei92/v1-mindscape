import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useContext } from 'react';
import type { Twig } from './twig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { selectDrag, setDrag } from '../space/spaceSlice';
import { User } from '../user/user';

interface TwigBarProps {
  twig: Twig;
  twigUser: User | null;
  isSelected: boolean;
}

function TwigBar(props: TwigBarProps) {
  const dispatch = useAppDispatch();

  const { 
    palette,
    pendingLink,
  } = useContext(AppContext);

  const {
    space, 
    abstract, 
    canEdit,
    setRemovalTwigId,
  } = useContext(SpaceContext);
  
  const drag = useAppSelector(selectDrag(space));

  const color = palette === 'dark'
    ? 'black'
    : 'white';

  const beginDrag = () => {
    if (!props.twig.parent) return;
    dispatch(setDrag({
      space,
      drag: {
        ...drag,
        isScreen: false,
        twigId: props.twig.id,
        targetTwigId: '',
      }
    }));
  }

  const dontDrag = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setRemovalTwigId(props.twig.id);
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    beginDrag();
  }

  return (
    <Box
      title={props.twig.id}
      onMouseDown={handleMouseDown}
      sx={{
        backgroundColor: props.twigUser?.color,
        textAlign: 'left',
        cursor: abstract.id === props.twig.detailId
          ? pendingLink.sourceId
            ? 'crosshair'
            : 'default'
          : pendingLink.sourceId
            ? 'crosshair'
            : drag.twigId
              ? 'grabbing'
              : 'grab',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: '3px',
        paddingRight: '5px',
        width: '100%',
      }}>
        <Box sx={{
          display: 'flex',
        }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: 14,
        }}>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography component='span' sx={{
            marginLeft: '3px',
            fontSize: 12,
            color,
          }}>
            {props.twig.i}
          </Typography>
        </Box>
        </Box>
        <Box>
          <IconButton
            disabled={
              abstract.id === props.twig.detailId || 
              !canEdit || 
              !!pendingLink.sourceId ||
              props.twig.bookmarkId === "1" ||
              props.twig.bookmarkId === "2"
            } 
            size='small'
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleRemoveClick}
            sx={{
              fontSize: 12,
              color,
            }}
          >
            <CloseIcon fontSize='inherit'/>
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default React.memo(TwigBar)