import { Box, Card, IconButton } from '@mui/material';
import React, { useContext, useRef } from 'react';
import type { Twig } from './twig';
import { selectChildIdToTrue, selectIdToTwig } from './twigSlice';
import RemoveIcon from '@mui/icons-material/Remove';
import useSelectTwig from './useSelectTwig';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppSelector } from '../../app/hooks';
import { DisplayMode, TWIG_WIDTH } from '../../constants';
import useOpenTwig from './useOpenTwig';
import useLinkTwigs from './useLinkTwigs';
import { getTwigColor } from '../../utils';
import ArrowComponent from '../arrow/ArrowComponent';
import PostTwig from './PostTwig';
import { selectSelectedTwigId } from '../space/spaceSlice';
import TwigControls from './TwigControls';

interface LinkTwigProps {
  twig: Twig;
}

export default function LinkTwig(props: LinkTwigProps) {
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

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = props.twig.id === selectedTwigId;
  
  const idToTwig = useAppSelector(selectIdToTwig(space));
  const childIdToTrue = useAppSelector(state => selectChildIdToTrue(state, space, props.twig.id));
  const verticalChildren: Twig[] = [];
  const horizontalChildren: Twig[] = [];

  Object.keys(childIdToTrue || {}).forEach(id => {
    const twig = idToTwig[id];

    if (twig && !twig.deleteDate) {
      if (twig.displayMode === DisplayMode.VERTICAL) {
        verticalChildren.push(twig);
      }
      else if (twig.displayMode === DisplayMode.HORIZONTAL) {
        horizontalChildren.push(twig);
      }
    }
  });

  const twigEl = useRef<HTMLDivElement | undefined>();

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
          ? `5px solid ${getTwigColor(props.twig.color) || props.twig.user?.color}`
          : `1px solid ${getTwigColor(props.twig.color) || props.twig.user?.color}`,
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
      <Box ref={twigEl} sx={{
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
                ? `10px solid ${getTwigColor(props.twig.color) || props.twig.user?.color}`
                : `1px solid ${getTwigColor(props.twig.color) || props.twig.user?.color}`,
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
          {
            verticalChildren
              .sort((a, b) => a.rank < b.rank ? -1 : 1)
              .map(twig => {
                return (
                  <Box key={`twig-${twig.id}`} sx={{
                    marginTop: 3,
                    marginLeft: 5,
                  }}>
                    <PostTwig twig={twig} />
                  </Box>
                )
              })
          }
        </Box>
        {
          horizontalChildren
            .sort((a, b) => a.rank < b.rank ? -1 : 1)
            .map(twig => {
              return (
                <Box key={`twig-${twig.id}`} sx={{
                  marginTop: 5,
                  marginLeft: 3,
                }}>
                  <PostTwig twig={twig} />
                </Box>
              )
            })
        }
      </Box>
    </Box>
  );
}