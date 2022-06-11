import { gql, useApolloClient, useReactiveVar } from '@apollo/client';
import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { adjustTwigVar, focusSpaceElVar, frameSpaceElVar } from '../../cache';
import { VIEW_RADIUS, SPACE_BAR_HEIGHT } from '../../constants';
import { checkPermit, getAppbarWidth, IdToTrueType } from '../../utils';
import { selectFrameWidth } from '../frame/frameSlice';
import { selectMenuMode, selectMenuWidth } from '../menu/menuSlice';
import { User } from '../user/user';
import { selectUserIdToTrue } from '../user/userSlice';
import { selectMode, selectWidth } from '../window/windowSlice';
import { SpaceType } from './space';
import { selectDrag, selectIsOpen, selectScale, selectScroll, setDrag, setScale, setScroll } from './spaceSlice';
import useInitSpace from './useInitSpace';
import { setFocusIsSynced } from '../focus/focusSlice';
import { selectIdToHeight, selectSourceIdToTargetIdToLinkIdToTrue } from '../arrow/arrowSlice';
import { ABSTRACT_ARROW_FIELDS, FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { Arrow } from '../arrow/arrow';
import { Role } from '../role/role';
import { FULL_TWIG_FIELDS, TWIG_WITH_XY, TWIG_WITH_POS } from '../twig/twigFragments';
import { IdToCoordsType, Twig } from '../twig/twig';
import TwigComponent from '../twig/TwigComponent';
import { selectDetailIdToTwigId, selectIdToDescIdToTrue, selectTwigIdToTrue } from '../twig/twigSlice';
import Sheaf from '../arrow/Sheaf';
import useMoveTwig from '../twig/useMoveTwig';
import useAdjustTwigs from '../twig/useAdjustTwigs';

interface SpaceComponentProps {
  user: User;
  space: SpaceType;
}
export default function SpaceComponent(props: SpaceComponentProps) {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const adjustTwigDetail = useReactiveVar(adjustTwigVar);

  const width = useAppSelector(selectWidth);
  const mode = useAppSelector(selectMode);

  const menuMode = useAppSelector(selectMenuMode);
  const menuWidth = useAppSelector(selectMenuWidth);
  const menuWidth1 = menuMode
    ? menuWidth
    : 0;

  const frameIsOpen = useAppSelector(selectIsOpen('FRAME'));
  const frameWidth = useAppSelector(selectFrameWidth);
  const frameWidth1 = frameIsOpen
    ? frameWidth
    : 0;
  
  const offsetLeft = props.space === 'FRAME'
    ? getAppbarWidth(width) + menuWidth1
    : getAppbarWidth(width) + menuWidth1 + frameWidth1;

  const offsetTop = SPACE_BAR_HEIGHT;

  const spaceWidth = props.space === 'FRAME'
    ? frameWidth1
    : width - offsetLeft;

  const scale = useAppSelector(selectScale(props.space));
  const scroll = useAppSelector(selectScroll(props.space));
  const drag = useAppSelector(selectDrag(props.space));

  const idToHeight = useAppSelector(selectIdToHeight(props.space));
  const twigIdToTrue = useAppSelector(selectTwigIdToTrue(props.space));
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(props.space));
  const userIdToTrue = useAppSelector(selectUserIdToTrue(props.space));
  const detailIdToTwigId = useAppSelector(selectDetailIdToTwigId(props.space));
  const sourceIdToTargetIdToLinkIdToTrue = useAppSelector(selectSourceIdToTargetIdToLinkIdToTrue(props.space));

  const abstract = client.cache.readFragment({
    id: client.cache.identify({
      id: props.space === 'FRAME'
        ? props.user.frameId
        : props.user.focusId,
      __typename: 'Arrow',
    }),
    fragment: ABSTRACT_ARROW_FIELDS,
    fragmentName: 'AbstractArrowFields',
  }) as Arrow;

  let role = null as Role | null;
  (abstract?.roles || []).some(role_i => {
    if (role_i.userId === props.user?.id && !role_i.deleteDate) {
      role = role_i;
      return true;
    }
    return false;
  });

  const canEdit = checkPermit(abstract?.canEdit, role?.type)
  const canPost = checkPermit(abstract?.canPost, role?.type)
  const canView = checkPermit(abstract?.canView, role?.type)

  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
  });

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
  const { adjustTwigs} = useAdjustTwigs(abstract)

  useEffect(() => {
    if (!spaceEl.current) return;

    if (props.space === 'FRAME') {
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
  }, [spaceEl.current]);

  useEffect(() => {
    if (!scaleEvent || !spaceEl.current) return;

    const center = {
      x: cursor.x / scale,
      y: cursor.y / scale,
    };

    const scale1 = Math.min(Math.max(.03125, scale + scaleEvent.deltaY * -0.008), 4)

    const center1 = {
      x: center.x * scale1,
      y: center.y * scale1,
    }

    setCursor(center1);

    const left = center1.x - (scaleEvent.clientX - offsetLeft);
    const top = center1.y - (scaleEvent.clientY - offsetTop);
    
    spaceEl.current.scrollTo({
      left,
      top,
    });

    dispatch(setScale({
      space: props.space,
      scale: scale1
    }));

    setScaleEvent(null);
  }, [scaleEvent, spaceEl.current]);

  useEffect(() => {
    if (!moveEvent || !spaceEl.current) return;

    const x = spaceEl.current.scrollLeft + moveEvent.clientX - offsetLeft;
    const y = spaceEl.current.scrollTop + moveEvent.clientY - offsetTop;

    const dx = x - cursor.x;
    const dy = y - cursor.y;

    if (dx !== 0 || dy !== 0){
      moveDrag(dx, dy);
    }

    setCursor({
      x,
      y,
    });

    //publishCursor(x, y); TODO

    setMoveEvent(null);
  }, [moveEvent]);

  useEffect(() => {
    if (Object.keys(adjustTwigDetail.idToCoords).length && !drag.twigId) {
      console.log('adjustment', adjustTwigDetail.idToCoords);
      adjustTwigs(adjustTwigDetail.idToCoords);
      adjustTwigVar({
        idToCoords: {},
      });
    }
  }, [adjustTwigDetail.idToCoords, drag.twigId])
  if (!abstract) return null;

  const handleWheel = (event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (!scaleEvent) {
        setScaleEvent(event);
        setIsScaling(true);
      }
    }
  };

  const moveDrag = (dx: number, dy: number, targetTwigId?: string) => {
    if (drag.isScreen) {
      if (!spaceEl.current) return;
      spaceEl.current.scrollBy(-1 * dx, -1 * dy)
      return;
    }

    if (!drag.twigId) return;

    const dx1 = dx / scale;
    const dy1 = dy / scale;

    dispatch(setDrag({
      space: props.space,
      drag: {
        ...drag,
        targetTwigId: targetTwigId || drag.targetTwigId,
        dx: drag.dx + dx1,
        dy: drag.dy + dy1,
      }
    }));

    [drag.twigId, ...Object.keys(idToDescIdToTrue[drag.twigId] || {})].forEach(twigId => {
      client.cache.modify({
        id: client.cache.identify({
          id: twigId,
          __typename: 'Twig',
        }),
        fields: {
          x: cachedVal => cachedVal + dx1,
          y: cachedVal => cachedVal + dy1,
        }
      });
    })

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
        dx: 0,
        dy: 0,
        targetTwigId: '',
      }
    }));

    if (!drag.twigId || (drag.dx === 0 && drag.dy === 0)) return;

    if (canEdit) {
      if (drag.targetTwigId) {
        //graftTwig(drag.twigId, drag.targetTwigId);
      }
      else {
        moveTwig(drag.twigId);
      }
    }
    else {
      dispatch(setFocusIsSynced(false));
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

    if (isScaling) {
      setIsScaling(false);
    }
    else if (!scaleEvent) {
      const dx = left - scroll.left;
      const dy = top - scroll.top;

      setCursor({
        x: cursor.x + dx,
        y: cursor.y + dy,
      });
    }

  }

  const handleScroll = (event: React.UIEvent) => {
    updateScroll(event.currentTarget.scrollLeft, event.currentTarget.scrollTop);
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    dispatch(setDrag({
      space: props.space,
      drag: {
        isScreen: true,
        twigId: '',
        dx: 0,
        dy: 0,
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

  const sheafs: JSX.Element[] = [];

  Object.keys(sourceIdToTargetIdToLinkIdToTrue).forEach(sourceId => {
    Object.keys(sourceIdToTargetIdToLinkIdToTrue[sourceId]).forEach(targetId => {
      const links = Object.keys(sourceIdToTargetIdToLinkIdToTrue[sourceId][targetId]).map(linkId => {
        return client.cache.readFragment({
          id: client.cache.identify({
            id: linkId,
            __typename: 'Arrow'
          }),
          fragment: FULL_ARROW_FIELDS,
          fragmentName: 'FullArrowFields',
        }) as Arrow;
      });

      sheafs.push(
        <Sheaf
          key={`sheaf-${sourceId}-${targetId}`}
          user={props.user}
          abstract={abstract}
          space={props.space}
          links={links}
          canEdit={canEdit}
        />
      )
    })
  })

  const adjusted: IdToCoordsType = {};
  const twigs: JSX.Element[] = [];
  Object.keys(twigIdToTrue).forEach(twigId => {
    const twig = client.cache.readFragment({
      id: client.cache.identify({
        id: twigId,
        __typename: 'Twig',
      }),
      fragment: FULL_TWIG_FIELDS,
      fragmentName: 'FullTwigFields'
    }) as Twig;

    if (!twig) return;

    let x: number;
    let y: number;
    if (twig.detail.sourceId !== twig.detail.targetId) {
      const sourceTwig = client.cache.readFragment({
        id: client.cache.identify({
          id: detailIdToTwigId[twig.detail.sourceId],
          __typename: 'Twig',
        }),
        fragment: TWIG_WITH_XY,
      }) as Twig;
      const targetTwig = client.cache.readFragment({
        id: client.cache.identify({
          id: detailIdToTwigId[twig.detail.targetId],
          __typename: 'Twig',
        }),
        fragment: TWIG_WITH_XY,
      }) as Twig;

      x = Math.round((sourceTwig.x + targetTwig.x) / 2);
      y = Math.round((sourceTwig.y + targetTwig.y) / 2);

      if (x !== twig.x || y !== twig.y) {
        const dx = x - twig.x;
        const dy = y - twig.y;
        [twig.id, ...Object.keys(idToDescIdToTrue[twig.id] || {})].forEach(descId => {
          const id = client.cache.identify({
            id: descId,
            __typename: 'Twig',
          });
          client.cache.modify({
            id,
            fields: {
              x: cachedVal => cachedVal + dx,
              y: cachedVal => cachedVal + dy,
            }
          });
          const desc = client.cache.readFragment({
            id,
            fragment: TWIG_WITH_XY,
          }) as Twig;
          adjusted[descId] = {
            x: desc.x,
            y: desc.y,
          };
        })
      }
    }
    else {
      x = twig.x;
      y = twig.y;
    }

    twigs.push(
      <Box key={`twig-${twigId}`} sx={{
        position: 'absolute',
        left: x + VIEW_RADIUS,
        top: y + VIEW_RADIUS,
        zIndex: twig.z,
      }}>
        <TwigComponent
          user={props.user}
          space={props.space}
          role={role}
          abstract={abstract}
          twig={twig}
          canEdit={canEdit}
          canPost={canPost}
          canView={canView}
          setTouches={setTouches}
        />
      </Box>
    )
  });

  if (Object.keys(adjusted).length) {
    adjustTwigVar({
      idToCoords: {
        ...adjustTwigDetail.idToCoords,
        ...adjusted,
      }
    })
  }

  const w = 2 * VIEW_RADIUS;
  const h = 2 * VIEW_RADIUS;
  return (
    <Box 
      ref={spaceEl}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onScroll={handleScroll}
      onWheel={handleWheel}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'relative',
        top: `${SPACE_BAR_HEIGHT}px`,
        height: `calc(100% - ${SPACE_BAR_HEIGHT}px)`,
        width: '100%',
        overflow: 'scroll',
      }}
    >
      <Box 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
              Object.keys(userIdToTrue).map(userId => {
                const user = client.cache.readFragment({
                  id: client.cache.identify({
                    id: userId,
                    __typename: 'User',
                  }),
                  fragment: gql`
                    fragment UserWithColor on User {
                      id
                      color
                    }
                  `,
                }) as User;
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
                      stroke={user.color}
                    />
                  </marker>
                )
              })
            }
          </defs>
          {
            Object.keys(twigIdToTrue).map(twigId => {
              const twig = client.cache.readFragment({
                id: client.cache.identify({
                  id: twigId,
                  __typename: 'Twig',
                }),
                fragment: TWIG_WITH_POS,
              }) as Twig;
              if (twig.deleteDate || !twig.parent || twig.detailId === abstract.id) return null;
              return (
                <line 
                  key={`twig-line-${twigId}`}
                  x1={(twig.parent?.x ?? NaN) + VIEW_RADIUS}
                  y1={(twig.parent?.y ?? NaN) + VIEW_RADIUS}
                  x2={twig.x + VIEW_RADIUS}
                  y2={twig.y + VIEW_RADIUS}
                  stroke={mode === 'dark' ? 'white' : 'black'}
                  strokeWidth={4}
                />
              )
            })
          }
          { sheafs }
        </svg>
        { twigs }
      </Box>
    </Box>
  );
}