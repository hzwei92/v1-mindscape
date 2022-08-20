import { Box, Card } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import type { Twig } from './twig';
import TwigBar from './TwigBar';
import TwigControls from './TwigControls';
import useSelectTwig from './useSelectTwig';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TWIG_WIDTH } from '../../constants';
import useLinkTwigs from './useLinkTwigs';
import ArrowComponent from '../arrow/ArrowComponent';
import { selectIdToPos, selectIdToHeight, selectSelectedTwigId, setSelectedSpace, mergeIdToPos, mergeIdToHeight } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';

interface PostTwigProps {
  twig: Twig;
}
export default function PostTwig(props: PostTwigProps) {
  const dispatch = useAppDispatch();

  const {
    dimColor,
    palette,
    pendingLink,
    setPendingLink,
  } = useContext(AppContext);

  const {
    space,
    abstract,
    canEdit,
  } = useContext(SpaceContext);

  const twigUser = useAppSelector(state => selectUserById(state, props.twig.userId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const idToPos = useAppSelector(selectIdToPos(space));
  const idToHeight = useAppSelector(selectIdToHeight(space));

  const isSelected = props.twig.id === selectedTwigId;

  const twigEl = useRef<HTMLElement>();
  const cardEl = useRef<HTMLElement>();

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
    dispatch(setSelectedSpace(space));
    if (!isSelected) {
      selectTwig(abstract, props.twig);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== props.twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: props.twig.detailId,
      });
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

  const isLinking = (
    pendingLink.sourceId === props.twig.detailId || 
    pendingLink.targetId === props.twig.detailId
  );

  return (
    <Box ref={twigEl} sx={{
      display: 'flex',
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
        <Box ref={cardEl}>
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
              opacity: .9,
              outline: isSelected
                ? `10px solid ${twigUser?.color}`
                : `1px solid ${twigUser?.color}`,
              borderRadius: 2,
              borderTopLeftRadius: 0,
              backgroundColor: isLinking
                ? dimColor
                : null,
              cursor: pendingLink.sourceId
                ? 'crosshair'
                : 'default', 
              pointerEvents: 'auto',
            }}
          >
            <TwigBar
              twig={props.twig}
              twigUser={twigUser}
              isSelected={isSelected}
            />
            <Box sx={{
              padding: 0.5,
              paddingLeft: 4,
            }}>
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
                isPost={true}
              />
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}