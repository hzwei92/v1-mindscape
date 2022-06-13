import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { Dispatch, SetStateAction } from 'react';
import useTwigTree from './useTwigTree';
import { Twig } from './twig';
import { SpaceType } from '../space/space';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Arrow } from '../arrow/arrow';
import { selectMode } from '../window/windowSlice';
import { selectDrag, setDrag } from '../space/spaceSlice';
//import useSelectTwig from './useSelectTwig';
import { selectCreateLink } from '../arrow/arrowSlice';
import AdjustIcon from '@mui/icons-material/Adjust';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import useSelectTwig from './useSelectTwig';

interface TwigBarProps {
  space: SpaceType;
  abstract: Arrow;
  twig: Twig;
  canEdit: boolean;
  isSelected: boolean;
  isPost: boolean;
  setTouches: Dispatch<SetStateAction<React.TouchList | null>>;
}

function TwigBar(props: TwigBarProps) {
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectMode);
  const color = mode === 'dark'
    ? 'black'
    : 'white';
  const createLink = useAppSelector(selectCreateLink);
  const drag = useAppSelector(selectDrag(props.space));

  const { selectTwig } = useSelectTwig(props.space, props.canEdit);

  const beginDrag = () => {
    if (!props.twig.parent) return;
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: false,
        twigId: props.twig.id,
        dx: 0,
        dy: 0,
        targetTwigId: '',
      }
    }));
  }

  const dontDrag = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    /*
    dispatch(setRemove({
      twig: props.twig,
      showDialog: true,
    }));*/
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!props.isSelected) {
      selectTwig(props.abstract, props.twig, true);
    }
    beginDrag();
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    event.stopPropagation();
    props.setTouches(event.touches);
    beginDrag();
  }

  return (
    <Box
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      sx={{
        backgroundColor: props.twig.color || props.twig.user.color,
        textAlign: 'left',
        cursor: props.abstract.id === props.twig.detailId
          ? createLink.sourceId
            ? 'crosshair'
            : 'default'
          : createLink.sourceId
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
            disabled={props.abstract.id === props.twig.detailId || !props.canEdit || !!createLink.sourceId} 
            size='small'
            color='inherit'
            onMouseDown={dontDrag}
            onClick={handleRemoveClick}
            sx={{
              fontSize: 10,
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