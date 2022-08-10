import { Box, Card } from '@mui/material';
import React, { useContext, useEffect, useRef } from 'react';
import type { Twig } from './twig';
import { selectChildIdToTrue, selectIdToTwig } from './twigSlice';
import TwigBar from './TwigBar';
import TwigControls from './TwigControls';
import useSelectTwig from './useSelectTwig';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { DisplayMode, TWIG_WIDTH } from '../../constants';
import useLinkTwigs from './useLinkTwigs';
import { getTwigColor } from '../../utils';
import ArrowComponent from '../arrow/ArrowComponent';
import { selectIdToPos, selectIdToHeight, selectSelectedTwigId } from '../space/spaceSlice';

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

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));
  const idToPos = useAppSelector(selectIdToPos(space));
  const idToHeight = useAppSelector(selectIdToHeight(space));

  const isSelected = props.twig.id === selectedTwigId;

  const idToTwig = useAppSelector(selectIdToTwig(space));
  const childIdToTrue = useAppSelector(state => selectChildIdToTrue(state, space, props.twig.id));
  const verticalChildren: Twig[] = [];
  const horizontalChildren: Twig[] = [];

  Object.keys(childIdToTrue || {}).forEach(id => {
    const twig =  idToTwig[id];

    if (twig && !twig.deleteDate) {
      if (twig.displayMode === DisplayMode.VERTICAL) {
        verticalChildren.push(twig);
      }
      else if (twig.displayMode === DisplayMode.HORIZONTAL) {
        horizontalChildren.push(twig);
      }
    }
  });

  const twigEl = useRef<HTMLElement>();
  const cardEl = useRef<HTMLElement>();

  const pos = idToPos[props.twig.id];
  const parentPos = idToPos[props.twig.parent?.id];

  useEffect(() => {
    if (!twigEl.current) return;
    if (!parentPos) return;
    if (!pos) return;
    if (props.twig.displayMode === DisplayMode.SCATTERED) return;
    const { offsetLeft, offsetTop } = twigEl.current;

    const x = Math.round(parentPos.x + offsetLeft);
    const y = Math.round(parentPos.y + offsetTop);

    if (x !== pos.x || y !== pos.y) {
      dispatch({
        type: 'mergeIdToPos',
        idToPos: {
          [props.twig.id]: {
            x,
            y,
          }
        },
      });
    }
  }, [parentPos, pos, props.twig.displayMode, twigEl.current?.offsetLeft, twigEl.current?.offsetTop]);

  if (cardEl.current?.clientHeight && cardEl.current.clientHeight !== idToHeight[props.twig.id]) {
    dispatch({
      type: 'mergeIdToHeight',
      idToHeight: {
        [props.twig.id]:  cardEl.current.clientHeight,
      }
    });
  }
  
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
                ? `10px solid ${props.twig.bookmarkId
                  ? palette === 'dark'
                    ? 'white'
                    : 'black'
                  : getTwigColor(props.twig.color) || props.twig.user?.color}`
                : `1px solid ${props.twig.bookmarkId
                  ? palette === 'dark'
                    ? 'white'
                    : 'black'
                  : getTwigColor(props.twig.color) || props.twig.user?.color}`,
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
        {
          verticalChildren
            .sort((a, b) => a.rank < b.rank ? -1 : 1)
            .map(twig => {
              return (
                <Box key={`twig-${twig.id}`} sx={{
                  marginTop: 2,
                  marginLeft: 2,
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
                marginTop: 2,
                marginLeft: 2,
              }}>
                <PostTwig twig={twig} />
              </Box>
            )
          })
      }
    </Box>
  );
}