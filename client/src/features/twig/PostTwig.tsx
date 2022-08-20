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
import { selectSelectedTwigId, setSelectedSpace, mergeIdToHeight, selectHeightByTwigId } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import { SpaceType } from '../space/space';
import { selectTwigById } from './twigSlice';

interface PostTwigProps {
  twigId: string;
}
function PostTwig(props: PostTwigProps) {
  const dispatch = useAppDispatch();

  const {
    dimColor,
    pendingLink,
    setPendingLink,
  } = useContext(AppContext);

  const {
    space,
    abstract,
    canEdit,
  } = useContext(SpaceContext);

  const twig = useAppSelector(state => selectTwigById(state, space, props.twigId));
  const twigUser = useAppSelector(state => selectUserById(state, twig.userId));

  const height = useAppSelector(state => selectHeightByTwigId(state, space, props.twigId));

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const isSelected = twig.id === selectedTwigId;

  const cardEl = useRef<HTMLElement>();

  useEffect(() => {
    if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== height) {
      dispatch(mergeIdToHeight({
        space,
        idToHeight: {
          [props.twigId]:  cardEl.current.clientHeight,
        }
      }));
    }
  }, [cardEl.current?.clientHeight])

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
    dispatch(setSelectedSpace(space));
    if (!isSelected) {
      selectTwig(abstract, twig);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (pendingLink.sourceId && pendingLink.sourceId !== twig.detailId) {
      setPendingLink({
        sourceId: pendingLink.sourceId,
        targetId: twig.detailId,
      });
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

  const isLinking = (
    pendingLink.sourceId === twig.detailId || 
    pendingLink.targetId === twig.detailId
  );

  return (
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
          twig={twig}
          twigUser={twigUser}
          isSelected={isSelected}
        />
        <Box sx={{
          padding: 0.5,
          paddingLeft: 4,
        }}>
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
            isPost={true}
          />
        </Box>
      </Card>
    </Box>
  );
}

export default React.memo(PostTwig);