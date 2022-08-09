import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { VIEW_RADIUS, SPACE_BAR_HEIGHT, DisplayMode, MAX_Z_INDEX, TWIG_WIDTH } from '../../constants';
import { checkPermit, getTwigColor } from '../../utils';
import { DirectionType, PendingLinkType, PosType, ScrollState, SpaceType } from './space';
import useInitSpace from './useInitSpace';
import { Arrow } from '../arrow/arrow';
import { Role } from '../role/role';
import useMoveTwig from '../twig/useMoveTwig';
import { AppContext } from '../../App';
import { selectIdToUser } from '../user/userSlice';
import { selectIdToDescIdToTrue, selectIdToTwig } from '../twig/twigSlice';
import { IdToType } from '../../types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectArrow, selectIdToArrow } from '../arrow/arrowSlice';
import PostTwigMarker from '../twig/PostTwigMarker';
import LinkTwigMarker from '../twig/LinkTwigMarker';
import LinkTwig from '../twig/LinkTwig';
import PostTwig from '../twig/PostTwig';
import SpaceControls from './SpaceControls';
import SpaceNav from './SpaceNav';
import RemoveTwigDialog from './RemoveTwigDialog';
import { 
  moveTwigs, 
  resetSpace, 
  selectCursor, 
  selectIdToPos, 
  selectDrag, 
  selectIdToHeight, 
  selectScale, 
  selectScroll, 
  setCursor, 
  setDrag,
  mergeIdToPos, 
  setScale, 
  setScroll,
} from './spaceSlice';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';

export const SpaceContext = React.createContext({} as {
  abstract: Arrow;
  space: SpaceType;
  canView: boolean;
  canPost: boolean;
  canEdit: boolean;
  pendingLink: PendingLinkType;
  setPendingLink: Dispatch<SetStateAction<PendingLinkType>>;
  removalTwigId: string;
  setRemovalTwigId: Dispatch<SetStateAction<string>>;
});

interface SpaceComponentProps {
  space: SpaceType;
}

export default function SpaceComponent(props: SpaceComponentProps) {
  //console.log('space');
  const dispatch = useAppDispatch();

  const { 
    user,
    appBarWidth,
    menuWidth,
    focusWidth,
    brightColor: color,
  } = useContext(AppContext);

  const offsetLeft = appBarWidth + menuWidth;
  const offsetTop = SPACE_BAR_HEIGHT;

  const scale = useAppSelector(selectScale(props.space));
  const scroll = useAppSelector(selectScroll(props.space));
  const cursor = useAppSelector(selectCursor(props.space));
  const drag = useAppSelector(selectDrag(props.space));
  const idToPos = useAppSelector(selectIdToPos(props.space));
  const idToHeight = useAppSelector(selectIdToHeight(props.space));

  const idToUser = useAppSelector(selectIdToUser(props.space));
  const idToTwig = useAppSelector(selectIdToTwig(props.space));
  const idToArrow = useAppSelector(selectIdToArrow);

  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(props.space));

  const abstractId = props.space === SpaceType.FRAME
    ? user?.frameId
    : user?.focusId;

  const abstract = useAppSelector(state => selectArrow(state, abstractId));

  let role = null as Role | null;
  (abstract?.roles || []).some(role_i => {
    if (role_i.userId === user?.id && !role_i.deleteDate) {
      role = role_i;
      return true;
    }
    return false;
  });

  const canEdit = checkPermit(abstract?.canEdit, role?.type)
  const canPost = checkPermit(abstract?.canPost, role?.type)
  const canView = checkPermit(abstract?.canView, role?.type)

  const [pendingLink, setPendingLink] = useState({
    sourceId: '',
    targetId: '',
  });

  const [removalTwigId, setRemovalTwigId] = useState('');

  const [touches, setTouches] = useState(null as React.TouchList | null);

  const [scaleEvent, setScaleEvent] = useState(null as React.WheelEvent | null);
  const [isScaling, setIsScaling] = useState(false);

  const [moveEvent, setMoveEvent] = useState(null as React.MouseEvent | null);

  const [showSettings, setShowSettings] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const spaceEl = useRef<HTMLElement>();

  useInitSpace(props.space, abstract, canView);
  //useAddTwigSub(props.user, props.space, abstract);

  const { moveTwig } = useMoveTwig(props.space);
  useEffect(() => {
    if (Object.keys(idToTwig).length === 0) {
      dispatch(resetSpace(props.space));
      return;
    }
    const idToPos1 = Object.keys(idToTwig).reduce((acc: IdToType<PosType>, twigId) => {
      const pos = idToPos[twigId];
      if (!pos) {
        const twig = idToTwig[twigId];
        acc[twigId] = {
          x: twig.x,
          y: twig.y,
        };
      }
      return acc;
    }, {});

    if (Object.keys(idToPos1).length) {
      dispatch(mergeIdToPos({
        space: props.space,
        idToPos: idToPos1,
      }));
    }
  }, [idToTwig]);
  
  useEffect(() => {
    if (!spaceEl?.current) return;


    if (props.space === SpaceType.FRAME) {
      frameSpaceElVar(spaceEl);
    }
    else {
      focusSpaceElVar(spaceEl);
    }

    const preventWheelDefault = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    }

    spaceEl.current.addEventListener('wheel', preventWheelDefault);

    return () => {
      spaceEl.current?.removeEventListener('wheel', preventWheelDefault);
    }
  }, [spaceEl?.current]);

  useEffect(() => {
    if (!spaceEl?.current) return;
    const { scrollLeft, scrollTop } = spaceEl.current;
    if (scroll.left !== scrollLeft || scroll.top !== scrollTop) {
      spaceEl.current.scrollTo(scroll.left, scroll.top);
    }
  }, [scroll, spaceEl.current])


  useEffect(() => {
    if (!moveEvent || !spaceEl?.current) return;

    const x = spaceEl.current.scrollLeft + moveEvent.clientX - offsetLeft;
    const y = spaceEl.current.scrollTop + moveEvent.clientY - offsetTop;

    const dx = x - cursor.x;
    const dy = y - cursor.y;

    if (dx !== 0 || dy !== 0){
      moveDrag(dx, dy);
    }

    dispatch(setCursor({
      space: props.space,
      cursor: {
        x,
        y,
      },
    }));

    //publishCursor(x, y); TODO

    setMoveEvent(null);
  }, [moveEvent]);

  if (!abstract) return null;

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (!spaceEl.current) return;

      const { scrollLeft, scrollTop } = spaceEl.current;

      if (scroll.left !== scrollLeft || scroll.top !== scrollTop) {
        spaceEl.current.scrollTo({
          left: scroll.left,
          top: scroll.top,
        });
      }

      const center = {
        x: cursor.x / scale,
        y: cursor.y / scale,
      };

      const scale1 = Math.min(Math.max(.03125, scale + event.deltaY * -0.004), 4)

      const left = props.space === 'FRAME'
        ? Math.round((center.x * scale1) - (event.clientX - appBarWidth - menuWidth - focusWidth))
        : Math.round((center.x * scale1) - (event.clientX - appBarWidth - menuWidth));
      const top = Math.round(center.y * scale1 - (event.clientY - SPACE_BAR_HEIGHT));
      
      spaceEl.current.scrollTo({
        left,
        top,
      });

      setIsScaling(true);
      updateScroll(left, top)
      dispatch(setScale({
        space: props.space,
        scale: scale1
      }));
    }
  };

  const moveDrag = (dx: number, dy: number, targetTwigId?: string) => {
    if (drag.isScreen) {
      if (!spaceEl?.current) return;
      spaceEl.current.scrollBy(-1 * dx, -1 * dy)
      return;
    }

    if (!drag.twigId) return;

    const dx1 = dx / scale;
    const dy1 = dy / scale;

    dispatch(moveTwigs({
      space: props.space,
      twigIds: [
        drag.twigId,
        ...Object.keys(idToDescIdToTrue[drag.twigId] || {}),
      ],
      dx: dx1,
      dy: dy1,
    }));

    if (canEdit) {
      //dragTwig(drag.twigId, dx1, dy1);
    }
  };

  const endDrag = () => {
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: false,
        twigId: '',
        targetTwigId: '',
        targetDirection: DirectionType.NONE,
      }
    }));

    if (!drag.twigId) return;

    if (canEdit) {
      if (drag.targetTwigId) {
        // const dragTwig = idToTwig[drag.twigId];
        // const target = idToTwig[drag.targetTwigId];

        // let parentTwigId;
        // let rank;
        // let displayMode;

        // if (drag.targetDirection === DirectionType.NONE) {
        //   parentTwigId = target.id;
        //   rank = 1;
        //   displayMode = target.displayMode;
        // }
        // else if (drag.targetDirection === DirectionType.DOWN) {
        //   console.log('down');
        //   if (target.displayMode === DisplayMode.VERTICAL) {
        //     console.log('vertical');
        //     parentTwigId = target.parent.id;
        //     if (dragTwig.parent.id === parentTwigId && dragTwig.rank < target.rank) {
        //       console.log('rank', target)
        //       rank = target.rank;
        //     }
        //     else {
        //       console.log('rank + 1')
        //       rank = target.rank + 1;
        //     }
        //   }
        //   else {
        //     parentTwigId = target.id;
        //     rank = 1;
        //   }
        //   displayMode = DisplayMode.VERTICAL;
        // }
        // else if (drag.targetDirection === DirectionType.RIGHT) {
        //   if (target.displayMode === DisplayMode.HORIZONTAL) {
        //     parentTwigId = target.parent.id;
        //     if (dragTwig.parent.id === parentTwigId && dragTwig.rank < target.rank) {
        //       rank = target.rank;
        //     }
        //     else {
        //       rank = target.rank + 1;
        //     }
        //   }
        //   else {
        //     parentTwigId = target.id;
        //     rank = 1;
        //   }
        //   displayMode = DisplayMode.HORIZONTAL;
        // }
        // else if (drag.targetDirection === DirectionType.UP) { 
        //   parentTwigId = target.parent.id;
        //   if (dragTwig.parent.id === parentTwigId && dragTwig.rank < target.rank) {
        //     rank = target.rank - 1;
        //   }
        //   else {
        //     rank = target.rank;
        //   }
        //   displayMode = DisplayMode.VERTICAL;
        // }
        // else { // drag.targetDirection === DirectionType.LEFT
        //   parentTwigId = target.parent.id;
        //   if (dragTwig.parent.id === parentTwigId && dragTwig.rank < target.rank) {
        //     rank = target.rank - 1;
        //   }
        //   else {
        //     rank = target.rank;
        //   }
        //   displayMode = DisplayMode.HORIZONTAL;
        // }
    
        // const parentTwig = idToTwig[parentTwigId];
        // if (dragTwig.tabId) {
        //   if (parentTwig.windowId) {
        //     graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        //   else {
        //     copyTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        // }
        // else if (dragTwig.groupId) {
        //   if (parentTwig.windowId && !parentTwig.groupId) {
        //     graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        //   else {
        //     copyTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        // }
        // else if (dragTwig.windowId) {
        //   if (parentTwig.id === dragTwig.parent.id) {
        //     graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        //   else {
        //     copyTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        // }
        // else if (dragTwig.bookmarkId) {
        //   if (parentTwig.bookmarkId) {
        //     graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        //   else {
        //     copyTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        // }
        // else if (dragTwig.detail.url) {
        //   if (parentTwig.windowId || parentTwig.bookmarkId) {
        //     copyTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        //   else {
        //     graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        //   }
        // }
        // else {
        //   graftTwig(drag.twigId, parentTwigId, rank, displayMode);
        // }
      }
      else {
        const pos = idToPos[drag.twigId]
        moveTwig(drag.twigId, pos.x, pos.y, DisplayMode.SCATTERED);
      }
    }
    else {
      // dispatch(setFocusIsSynced(false));
    }
  };

  const handleMouseMove = (event: React.MouseEvent, targetId?: string) => {
    if (drag.isScreen || drag.twigId) {
      event.preventDefault();
    }
    if (!targetId && drag.targetTwigId && !drag.isScreen) {
      dispatch(setDrag({
        space: props.space,
        drag: {
          ...drag,
          targetTwigId: '',
          targetDirection: DirectionType.NONE,
        },
      }));
    }

    if (!moveEvent) {
      setMoveEvent(event);
    }
    // if (!spaceEl.current) return; 
    // const x = props.space === 'FRAME'
    //   ? spaceEl.current.scrollLeft + event.clientX - appBarWidth - menuWidth - focusWidth
    //   : spaceEl.current.scrollLeft + event.clientX - appBarWidth - menuWidth;
    // const y = spaceEl.current.scrollTop + event.clientY - SPACE_BAR_HEIGHT + 1;

    // const dx = x - cursor.x;
    // const dy = y - cursor.y;

    // if (dx !== 0 || dy !== 0){
    //   moveDrag(dx, dy);
    // }

    // spaceDispatch({
    //   type: 'setCursor',
    //   cursor: {
    //     x,
    //     y,
    //   },
    // });
    
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    endDrag()
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    endDrag();
  }

  const updateScroll = (left: number, top: number) => {
    dispatch(setScroll({
      space: props.space,
      scroll: {
        left,
        top,
      },
    }));

    const dx = left - scroll.left;
    const dy = top - scroll.top;

    dispatch(setCursor({
      space: props.space,
      cursor: {
        x: cursor.x + dx,
        y: cursor.y + dy,
      },
    }));
  }

  const handleScroll = (event: React.UIEvent) => {
    if (isScaling) {
      setIsScaling(false);
    }
    else {
      updateScroll(event.currentTarget.scrollLeft, event.currentTarget.scrollTop);
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: true,
        twigId: '',
        targetTwigId: '',
        targetDirection: DirectionType.NONE,
      }
    }));
  }

  const handleTargetMouseMove = (targetId: string, direction: DirectionType) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (drag.targetTwigId !== targetId || drag.targetDirection !== direction) {
      dispatch(setDrag({
        space: props.space,
        drag: {
          ...drag,
          targetTwigId: targetId,
          targetDirection: direction,
        },
      }));
    }
    handleMouseMove(event, targetId);
  }
 
  // const adjusted: IdToCoordsType = {};
  const twigMarkers: JSX.Element[] = [];
  const twigs: JSX.Element[] = [];

  const dropTargets: JSX.Element[] = [];

  const idToPos1: IdToType<PosType> = {};
  Object.keys(idToPos).forEach(twigId => {
    const twig = idToTwig[twigId];
    const pos = idToPos[twigId];

    if (!twig || twig.deleteDate || !pos) return;

    const parentTwig = idToTwig[twig.parent?.id];

    if (parentTwig && !parentTwig.deleteDate) {
      const parentPos = idToPos[twig.parent.id];

      if (
        parentPos &&
        (twig.displayMode === DisplayMode.SCATTERED || (pos.x !== 0 && pos.y !== 0))
      ) {
        twigMarkers.push(
          <PostTwigMarker
            key={`post-twig-marker-${twigId}`}
            twig={twig}
            pos={pos}
            parentPos={parentPos}
          />
        );
      }
    }


    if (
      drag.twigId &&
      twig.id !== drag.twigId && 
      !Object.keys(idToDescIdToTrue[drag.twigId] || {}).some(descId => descId === twig.id)
    ) {
      const dragTwig = idToTwig[drag.twigId];

      if (
        (!dragTwig.windowId && !dragTwig.bookmarkId) ||
        (dragTwig.tabId && (!twig.bookmarkId || !idToArrow[twig.detailId].url)) ||
        (dragTwig.groupId && !twig.groupId && (!twig.bookmarkId || !idToArrow[twig.detailId].url)) ||
        (dragTwig.windowId && !twig.windowId && (!twig.bookmarkId || !idToArrow[twig.detailId].url)) ||
        (dragTwig.bookmarkId && (!twig.bookmarkId || !idToArrow[twig.detailId].url))
      ) {
        dropTargets.push(
          <Box 
            key={'twig-main-droptarget-' + twig.id} 
            onMouseMove={handleTargetMouseMove(twig.id, DirectionType.NONE)} 
            sx={{
              position: 'absolute',
              left: pos.x + VIEW_RADIUS,
              top: pos.y + VIEW_RADIUS,
              zIndex: MAX_Z_INDEX + twig.z,
              width: TWIG_WIDTH,
              height: idToHeight[twig.id],
              backgroundColor: getTwigColor(twig.color || twig.user?.color),
              opacity: drag.targetTwigId === twig.id && drag.targetDirection === DirectionType.NONE
                ? 0.4
                : 0,
              borderRadius: 2,
              border: `2px solid ${color}`,
            }}
          />
        )  
      }

      if (twig.displayMode === DisplayMode.HORIZONTAL) {
        if (
          (!dragTwig.windowId && !dragTwig.bookmarkId) ||
          dragTwig.tabId ||
          (dragTwig.groupId && !parentTwig.groupId) ||
          (dragTwig.windowId && !parentTwig.windowId) ||
          (dragTwig.bookmarkId && (!parentTwig.bookmarkId || !idToArrow[parentTwig.detailId].url))
        ) {
          dropTargets.push(
            <Box 
              key={'twig-left-droptarget-' + twig.id} 
              onMouseMove={handleTargetMouseMove(twig.id, DirectionType.LEFT)} 
              sx={{
                position: 'absolute',
                left: pos.x + VIEW_RADIUS - 50,
                top: pos.y + VIEW_RADIUS,
                zIndex: MAX_Z_INDEX + twig.z ,
                width: 100,
                height: idToHeight[twig.id],
                backgroundColor: getTwigColor(twig.color || twig.user?.color),
                opacity: drag.targetTwigId === twig.id && drag.targetDirection === DirectionType.LEFT
                  ? 0.4
                  : 0,
                borderRadius: 2,
                border: `2px solid ${color}`,
              }}
            />
          );
        }
      }
      if (twig.displayMode === DisplayMode.VERTICAL) {
        if (
          (!dragTwig.windowId && !dragTwig.bookmarkId) ||
          (dragTwig.tabId && (!parentTwig.bookmarkId || !idToArrow[parentTwig.detailId].url)) ||
          (dragTwig.groupId && !parentTwig.groupId && (!parentTwig.bookmarkId || !idToArrow[parentTwig.detailId].url)) ||
          (dragTwig.windowId && !parentTwig.windowId && (!parentTwig.bookmarkId || !idToArrow[parentTwig.detailId].url)) ||
          (dragTwig.bookmarkId && (!parentTwig.bookmarkId || !idToArrow[parentTwig.detailId].url))
        ) {
          dropTargets.push(
            <Box 
              key={'twig-up-droptarget-' + twig.id} 
              onMouseMove={handleTargetMouseMove(twig.id, DirectionType.UP)} 
              sx={{
                position: 'absolute',
                left: pos.x + VIEW_RADIUS,
                top: pos.y + VIEW_RADIUS - 50,
                zIndex:MAX_Z_INDEX + twig.z,
                width: TWIG_WIDTH,
                height: 100,
                backgroundColor: getTwigColor(twig.color || twig.user?.color),
                opacity: drag.targetTwigId === twig.id && drag.targetDirection === DirectionType.UP
                ? 0.4
                : 0,
                borderRadius: 2,
                border: `2px solid ${color}`,
              }}
            />
          );
        }
      }
      let rightParent = twig.displayMode === DisplayMode.HORIZONTAL 
        ? parentTwig 
        : twig;
      if (
        (!dragTwig.windowId && !dragTwig.bookmarkId) ||
        (dragTwig.tabId && (!rightParent.bookmarkId || !idToArrow[rightParent.detailId].url)) ||
        (dragTwig.groupId && !rightParent.groupId && (!rightParent.bookmarkId || !idToArrow[rightParent.detailId].url)) ||
        (dragTwig.windowId && !rightParent.windowId && (!rightParent.bookmarkId || !idToArrow[rightParent.detailId].url)) ||
        (dragTwig.bookmarkId && (!rightParent.bookmarkId || !idToArrow[rightParent.detailId].url))
      ) {
        dropTargets.push(
          <Box 
            key={'twig-right-droptarget-' + twig.id} 
            onMouseMove={handleTargetMouseMove(twig.id, DirectionType.RIGHT)} 
            sx={{
              position: 'absolute',
              left: pos.x + VIEW_RADIUS + TWIG_WIDTH - 50,
              top: pos.y + VIEW_RADIUS,
              zIndex: MAX_Z_INDEX + twig.z,
              width: 100,
              height: idToHeight[twig.id],
              backgroundColor: getTwigColor(twig.color || twig.user?.color),
              opacity: drag.targetTwigId === twig.id && drag.targetDirection === DirectionType.RIGHT
                ? 0.4
                : 0,
              borderRadius: 2,
              border: `2px solid ${color}`,
            }}
          />
        );
      }
      let downParent = twig.displayMode === DisplayMode.VERTICAL
        ? parentTwig
        : twig;
      if (
        (!dragTwig.windowId && !dragTwig.bookmarkId) ||
        (dragTwig.tabId && (!downParent.bookmarkId || !idToArrow[downParent.detailId].url)) ||
        (dragTwig.groupId && !downParent.groupId && (!downParent.bookmarkId || !idToArrow[downParent.detailId].url)) ||
        (dragTwig.windowId && !downParent.windowId && (!downParent.bookmarkId || !idToArrow[downParent.detailId].url)) ||
        (dragTwig.bookmarkId && (!downParent.bookmarkId || !idToArrow[downParent.detailId].url))
      ) {
        dropTargets.push(
          <Box 
            key={'twig-down-droptarget-' + twig.id} 
            onMouseMove={handleTargetMouseMove(twig.id, DirectionType.DOWN)} 
            sx={{
              position: 'absolute',
              left: pos.x + VIEW_RADIUS,
              top: pos.y + VIEW_RADIUS + idToHeight[twig.id] - 50,
              zIndex: MAX_Z_INDEX + twig.z,
              width: TWIG_WIDTH,
              height: 100,
              backgroundColor: getTwigColor(twig.color || twig.user?.color),
              opacity: drag.targetTwigId === twig.id && drag.targetDirection === DirectionType.DOWN
                ? 0.4
                : 0,
              borderRadius: 2,
              border: `2px solid ${color}`,
            }}
          />
        )
      }
    }

    if (twig.displayMode !== DisplayMode.SCATTERED) return;

    if (twig.sourceId !== twig.targetId) {
      const sourceTwig = twig.sourceId
        ? idToTwig[twig.sourceId]
        : null;
      const targetTwig = twig.targetId
        ? idToTwig[twig.targetId]
        : null;

      if (
        !sourceTwig || 
        sourceTwig.deleteDate || 
        !targetTwig || 
        targetTwig.deleteDate
      ) return;

      const sourcePos = twig.sourceId
        ? idToPos[twig.sourceId]
        : null;
      const targetPos = twig.targetId
        ? idToPos[twig.targetId]
        : null;

      const x = Math.round(((sourcePos?.x ?? 0) + (targetPos?.x ?? 0)) / 2);
      const y = Math.round(((sourcePos?.y ?? 0) + (targetPos?.y ?? 0)) / 2);

      if (x !== pos.x || y !== pos.y) {
        const dx = x - pos.x;
        const dy = y - pos.y;
        [
          twigId, 
          ...Object.keys(idToDescIdToTrue[twigId] || {})
        ].forEach(descId => {
          const descPos = idToPos[descId];

          idToPos1[descId] = {
            x: descPos.x + dx,
            y: descPos.y + dy,
          }
        })
      }
      twigs.push(
        <Box key={`twig-${twigId}`} sx={{
          position: 'absolute',
          left: x + VIEW_RADIUS,
          top: y + VIEW_RADIUS,
          zIndex: twig.z,
          pointerEvents: 'none',
        }}>
          <LinkTwig twig={twig} />
        </Box>
      );

      twigMarkers.push(
        <LinkTwigMarker
          key={`link-twig-marker-${twigId}`}
          twig={twig}
          sourcePos={sourcePos}
          targetPos={targetPos}
        />
      );
    }
    else {
      twigs.push(
        <Box key={`twig-${twigId}`} sx={{
          position: 'absolute',
          left: pos.x + VIEW_RADIUS,
          top: pos.y + VIEW_RADIUS,
          zIndex: twig.z,
          pointerEvents: 'none',
        }}>
          <PostTwig twig={twig} />
        </Box>
      );
    }
  });

  if (Object.keys(idToPos1).length) {
    dispatch(mergeIdToPos({
      space: props.space,
      idToPos: idToPos1,
    }));
  }

  const w = 2 * VIEW_RADIUS;
  const h = 2 * VIEW_RADIUS;
  return (
    <SpaceContext.Provider value={{
      abstract,
      space: props.space,
      canEdit,
      canPost,
      canView,
      pendingLink,
      setPendingLink,
      removalTwigId,
      setRemovalTwigId,
    }}>
      <Box
        ref={spaceEl}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onScroll={handleScroll}
        sx={{
          position: 'relative',
          top: `${SPACE_BAR_HEIGHT}px`,
          height: `calc(100% - ${SPACE_BAR_HEIGHT}px)`,
          width: '100%',
          overflow: 'scroll',
        }}
      >
        <Box
          sx={{
            width: w * (scale < 1 ? scale : 1),
            height: h * (scale < 1 ? scale : 1),
            position: 'relative',
            cursor: drag.isScreen || drag.twigId
              ? 'grabbing'
              : 'grab',
            transform: `scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          <svg viewBox={`0 0 ${w} ${h}`} style={{
            width: w,
            height: h,
          }}>
            <defs>
              {
                Object.keys(idToUser).map(userId => {
                  const user = idToUser[userId];
                  return (
                    <marker 
                      key={`marker-${userId}`}
                      id={`marker-${userId}`} 
                      markerWidth='6'
                      markerHeight='10'
                      refX='7'
                      refY='5'
                      orient='auto'
                    >
                      <polyline 
                        points='0,0 5,5 0,10'
                        fill='none'
                        stroke={user?.color}
                      />
                    </marker>
                  )
                })
              }
            </defs>
            { twigMarkers }
          </svg>
          { twigs }
          { dropTargets }
        </Box>
        <SpaceControls
          setShowSettings={setShowSettings}
          setShowRoles={setShowRoles}
        />
        <SpaceNav />
        <RemoveTwigDialog />
      </Box>
    </SpaceContext.Provider>
  );
}