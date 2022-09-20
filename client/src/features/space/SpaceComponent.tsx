import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { VIEW_RADIUS, SPACE_BAR_HEIGHT, MAX_Z_INDEX, TWIG_WIDTH, CLOSED_LINK_TWIG_DIAMETER, ROLES_MENU_WIDTH, APP_BAR_HEIGHT } from '../../constants';
import { checkPermit } from '../../utils';
import { PosType, SpaceType } from './space';
import useInitSpace from './useInitSpace';
import { Arrow } from '../arrow/arrow';
import { Role } from '../role/role';
import useMoveTwig from '../twig/useMoveTwig';
import { AppContext } from '../../App';
import { selectIdToUser } from '../user/userSlice';
import { selectIdToDescIdToTrue, selectIdToTwig } from '../twig/twigSlice';
import { IdToType } from '../../types';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectArrowById, selectIdToArrow } from '../arrow/arrowSlice';
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
import { focusAdjustIdToPosVar, focusSpaceElVar, frameAdjustIdToPosVar, frameSpaceElVar } from '../../cache';
import useTwigTree from '../twig/useTwigTree';
import { useReactiveVar } from '@apollo/client';
import useGraftTwig from '../twig/useGraftTwig';
import RolesMenu from './RolesMenu';
import useReplyTwigSub from '../twig/useReplyTwigSub';
import { selectFocusTab, selectFrameTab } from '../tab/tabSlice';
import SettingsMenu from './SettingsMenu';

export const SpaceContext = React.createContext({} as {
  abstract: Arrow | null;
  space: SpaceType;
  canView: boolean;
  canPost: boolean;
  canEdit: boolean;
  removalTwigId: string;
  setRemovalTwigId: Dispatch<SetStateAction<string>>;
});

interface SpaceComponentProps {
  space: SpaceType;
}

export default function SpaceComponent(props: SpaceComponentProps) {
  const dispatch = useAppDispatch();

  const { 
    user,
    frameWidth,
    brightColor: color,
  } = useContext(AppContext);

  const offsetLeft = props.space === SpaceType.FRAME
    ? 0
    : frameWidth;
  const offsetTop = APP_BAR_HEIGHT;

  const adjustIdToPosDetail = useReactiveVar(props.space === SpaceType.FRAME
    ? frameAdjustIdToPosVar
    : focusAdjustIdToPosVar)

  const scale = useAppSelector(selectScale(props.space));
  const scroll = useAppSelector(selectScroll(props.space));
  const cursor = useAppSelector(selectCursor(props.space));
  const drag = useAppSelector(selectDrag(props.space));
  const idToPos = useAppSelector(selectIdToPos(props.space));
  const idToHeight = useAppSelector(selectIdToHeight(props.space));

  const idToUser = useAppSelector(selectIdToUser);
  const idToTwig = useAppSelector(selectIdToTwig(props.space));
  const idToArrow = useAppSelector(selectIdToArrow);

  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(props.space));
  useTwigTree(props.space);


  const focusTab = useAppSelector(selectFocusTab);
  const frameTab = useAppSelector(selectFrameTab);

  const abstractId = props.space === SpaceType.FRAME
    ? frameTab?.arrowId
    : focusTab?.arrowId;

  const abstract = useAppSelector(state => selectArrowById(state, abstractId));

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

  const [removalTwigId, setRemovalTwigId] = useState('');

  const [touches, setTouches] = useState(null as React.TouchList | null);

  const [isScaling, setIsScaling] = useState(false);

  const [moveEvent, setMoveEvent] = useState(null as React.MouseEvent | null);

  const [showSettings, setShowSettings] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const spaceEl = useRef<HTMLElement>();

  const { moveTwig } = useMoveTwig(props.space);
  const { graftTwig } = useGraftTwig(props.space);

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
    if (Object.keys(adjustIdToPosDetail).length) {
      dispatch(mergeIdToPos({
        space: props.space,
        idToPos: adjustIdToPosDetail,
      }));
    }
  }, [adjustIdToPosDetail])

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

  const spaceContextValue = useMemo(() => {
    return {
      abstract,
      space: props.space, 
      canView,
      canPost, 
      canEdit,
      removalTwigId, 
      setRemovalTwigId,
    };
  }, [abstract, props.space, canView, canPost, canEdit, removalTwigId]);

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

      const left =  Math.round((center.x * scale1) - (event.clientX - offsetLeft));
      const top = Math.round(center.y * scale1 - (event.clientY - offsetTop));
      
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
      }
    }));

    if (!drag.twigId) return;

    if (canEdit) {
      if (drag.targetTwigId) {
        graftTwig(drag.twigId, drag.targetTwigId);
      }
      else {
        const pos = idToPos[drag.twigId]
        moveTwig(drag.twigId, pos.x, pos.y);
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
      }
    }));
  }

  const handleTargetMouseMove = (targetId: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (drag.targetTwigId !== targetId) {
      dispatch(setDrag({
        space: props.space,
        drag: {
          ...drag,
          targetTwigId: targetId,
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
        (pos.x !== 0 && pos.y !== 0)
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
      !Object.keys(idToDescIdToTrue[drag.twigId] || {}).some(descId => descId === twig.id) &&
      twig.sourceId !== drag.twigId &&
      twig.targetId !== drag.twigId &&
      twig.id !== idToTwig[drag.twigId].parent?.id
    ) {
      dropTargets.push(
        <Box 
          key={'twig-droptarget-' + twig.id} 
          onMouseMove={handleTargetMouseMove(twig.id)} 
          sx={{
            position: 'absolute',
            left: pos.x + VIEW_RADIUS,
            top: pos.y + VIEW_RADIUS,
            zIndex: MAX_Z_INDEX + twig.z,
            width: twig.isOpen
              ? TWIG_WIDTH
              : CLOSED_LINK_TWIG_DIAMETER,
            height: twig.isOpen
              ? idToHeight[twig.id]
              : CLOSED_LINK_TWIG_DIAMETER,
            backgroundColor: twig.user?.color,
            opacity: drag.targetTwigId === twig.id
              ? 0.4
              : 0,
            borderRadius: 2,
            border: `2px solid ${color}`,
          }}
        />
      );
    }

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
          <LinkTwig twigId={twig.id} />
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
          <PostTwig twigId={twig.id} />
        </Box>
      );
    }
  });

  if (Object.keys(idToPos1).length) {
    if (props.space === SpaceType.FRAME) {
      frameAdjustIdToPosVar(idToPos1);
    }
    else {
      focusAdjustIdToPosVar(idToPos1);
    }
  }

  const w = 2 * VIEW_RADIUS;
  const h = 2 * VIEW_RADIUS;
  return (
    <SpaceContext.Provider value={spaceContextValue}>
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
          width: showRoles
            ? `calc(100% - ${ROLES_MENU_WIDTH}px)`
            : '100%',
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
            { twigMarkers }
          </svg>
          { twigs }
          { dropTargets }
        </Box>
        <SpaceControls
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          showRoles={showRoles}
          setShowRoles={setShowRoles}
        />
        <SpaceNav />
        <RemoveTwigDialog />
      </Box>
      <RolesMenu
        isOpen={showRoles}
        setIsOpen={setShowRoles}
        role={role}
      />
      <SettingsMenu 
        isOpen={showSettings}
        setIsOpen={setShowSettings}
        abstract={abstract}
        role={role}
      />
    </SpaceContext.Provider>
  );
}