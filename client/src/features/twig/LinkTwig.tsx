import { Box, Card, IconButton } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import type { Twig } from './twig';
import RemoveIcon from '@mui/icons-material/Remove';
import useSelectTwig from './useSelectTwig';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TWIG_WIDTH } from '../../constants';
import useOpenTwig from './useOpenTwig';
import useLinkTwigs from './useLinkTwigs';
import ArrowComponent from '../arrow/ArrowComponent';
import { mergeIdToHeight, selectIdToHeight, selectSelectedTwigId } from '../space/spaceSlice';
import TwigControls from './TwigControls';
import { selectUserById } from '../user/userSlice';

interface LinkTwigProps {
  twig: Twig;
}

export default function LinkTwig(props: LinkTwigProps) {
  const dispatch = useAppDispatch();
  const { 
    palette,
    pendingLink, 
    setPendingLink,
  } = useContext(AppContext);
  
  const { 
    abstract,
    space, 
    canEdit,
  } = useContext(SpaceContext);

  const twigUser = useAppSelector(state => selectUserById(state, props.twig.userId));

  const idToHeight = useAppSelector(selectIdToHeight(space));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = props.twig.id === selectedTwigId;

  const cardEl = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== idToHeight[props.twig.id]) {
      dispatch(mergeIdToHeight({
        space,
        idToHeight: {
          [props.twig.id]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { openTwig } = useOpenTwig();
  const { selectTwig } = useSelectTwig(space, canEdit);
  const { linkTwigs } = useLinkTwigs();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (pendingLink.sourceId === props.twig.detailId) {
      setPendingLink({
        sourceId: '',
        targetId: '',
      });
    }
    if (pendingLink.sourceId && pendingLink.targetId === props.twig.detailId) {
      linkTwigs();
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {

  }
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectTwig(abstract, props.twig);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== props.twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: props.twig.detailId,
      })
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== props.twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: '',
      });
    }
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectTwig(abstract, props.twig);
    }
    openTwig(props.twig, !props.twig.isOpen);
  }

  const isLinking = (
    pendingLink.sourceId === props.twig.detailId || 
    pendingLink.targetId === props.twig.detailId
  );

  return (
    <Box>
      <Card elevation={5} onClick={handleOpenClick} sx={{
        width: 30,
        height: 30,
        outline: isSelected
          ? `5px solid ${twigUser?.color}`
          : `1px solid ${twigUser?.color}`,
        borderRadius: 2,
        borderTopLeftRadius: 0,
        display: props.twig.isOpen
          ? 'none'
          : 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
        opacity: .9,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
            {props.twig.detail.weight}
        </Box>
      </Card>
      <Box ref={cardEl} sx={{
        display: props.twig.isOpen
          ? 'flex'
          : 'none',
        flexDirection: 'row',
        position: 'relative',
        pointerEvents: 'none',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          pointerEvents: 'none',
        }}>
          <Card 
            elevation={isSelected? 15 : 5}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: TWIG_WIDTH,
              opacity: .8,
              outline: isSelected
                ? `10px solid ${twigUser?.color}`
                : `1px solid ${twigUser?.color}`,
              borderRadius: 3,
              borderTopLeftRadius: 0,
              backgroundColor: isLinking
                ? palette === 'dark'
                  ? 'dimgrey'
                  : 'darkgrey'
                : null,
              cursor: pendingLink.sourceId
                ? 'crosshair'
                : 'default', 
              pointerEvents: 'auto',
            }}
          >
            <Box sx={{
              display: 'flex',
            }}>
              <Box sx={{
                padding: 0.5,
                paddingLeft: 0,
              }}>
                <Box sx={{
                  marginRight: 0.5,
                  paddingLeft: 4,
                  position: 'relative',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    left: TWIG_WIDTH - 35,
                    top: -6,
                    zIndex: 1,
                  }}>
                    <IconButton onClick={handleOpenClick} sx={{
                      color: palette === 'dark'
                        ? 'white'
                        : 'black'
                    }}>
                      <RemoveIcon color='inherit' sx={{
                        fontSize: 12,
                      }}/>
                    </IconButton>
                  </Box>
                  <ArrowComponent
                    arrowId={props.twig.detailId}
                    instanceId={props.twig.id}
                    showLinkLeftIcon={false}
                    showLinkRightIcon={false}
                    showPostIcon={false}
                    isTab={!!props.twig.tabId}
                    isGroup={!props.twig.tabId && !!props.twig.groupId}
                    isWindow={!props.twig.tabId && !props.twig.groupId && !!props.twig.windowId}
                  />
                  <TwigControls 
                    twig={props.twig}
                    isPost={false}
                  />
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}