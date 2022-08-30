import { Box, Card, IconButton } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import useSelectTwig from './useSelectTwig';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLOSED_LINK_TWIG_DIAMETER, TWIG_WIDTH } from '../../constants';
import useOpenTwig from './useOpenTwig';
import useLinkTwigs from './useLinkTwigs';
import ArrowComponent from '../arrow/ArrowComponent';
import { mergeIdToHeight, selectHeightByTwigId, selectSelectedTwigId } from '../space/spaceSlice';
import TwigControls from './TwigControls';
import { selectUserById } from '../user/userSlice';
import { selectTwigById } from './twigSlice';
import CloseIcon from '@mui/icons-material/Close';

interface LinkTwigProps {
  twigId: string;
}
 
function LinkTwig(props: LinkTwigProps) {
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
    setRemovalTwigId,
  } = useContext(SpaceContext);
  
  const twig = useAppSelector(state => selectTwigById(state, space, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const isLinking = (
    pendingLink.sourceId === twig.detailId || 
    pendingLink.targetId === twig.detailId
  );

  const height = useAppSelector(state => selectHeightByTwigId(state, space, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        space,
        idToHeight: {
          [twig.id]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

  const { openTwig } = useOpenTwig();
  const { selectTwig } = useSelectTwig(space, canEdit);
  const { linkTwigs } = useLinkTwigs();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (pendingLink.sourceId === twig.detailId) {
      setPendingLink({
        sourceId: '',
        targetId: '',
      });
    }
    if (pendingLink.sourceId && pendingLink.targetId === twig.detailId) {
      linkTwigs(pendingLink);
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {

  }
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectTwig(abstract, twig);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: twig.detailId,
      })
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: '',
      });
    }
  }

  const handleOpenClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectTwig(abstract, twig);
    }
    openTwig(twig, !twig.isOpen);
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovalTwigId(twig.id);
  }

  return (
    <Box>
      <Card elevation={5} onClick={handleOpenClick} sx={{
        width: CLOSED_LINK_TWIG_DIAMETER,
        height: CLOSED_LINK_TWIG_DIAMETER,
        outline: isSelected
          ? `5px solid ${twigUser?.color}`
          : `1px solid ${twigUser?.color}`,
        borderRadius: 2,
        borderTopLeftRadius: 0,
        display: twig.isOpen
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
            {twig.detail.weight}
        </Box>
      </Card>
      <Box ref={cardEl} sx={{
        display: twig.isOpen
          ? 'flex'
          : 'none',
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
                  left: TWIG_WIDTH - 65,
                  top: -6,
                  zIndex: 1,
                  display: 'flex',
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
                  <IconButton onClick={handleRemoveClick} sx={{
                    color: palette === 'dark'
                      ? 'white'
                      : 'black'
                  }}>
                    <CloseIcon color='inherit' sx={{
                      fontSize: 12,
                    }}/>
                  </IconButton>
                </Box>
                <ArrowComponent
                  arrowId={twig.detailId}
                  instanceId={twig.id}
                  showLinkLeftIcon={false}
                  showLinkRightIcon={false}
                  showPostIcon={false}
                  isTab={!!twig.tabId}
                  isGroup={!twig.tabId && !!twig.groupId}
                  isWindow={!twig.tabId && !twig.groupId && !!twig.windowId}
                />
                <TwigControls 
                  twig={twig}
                  isPost={false}
                />
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default React.memo(LinkTwig)