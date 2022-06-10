import { useApolloClient, useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks';
import { selectIsOpen, setIsOpen, setSpace } from './features/space/spaceSlice';
import { v4 as uuidv4 } from 'uuid';
import { Role } from './features/role/role';
import { User } from './features/user/user';
import useSetUserFocus from './features/user/useSetUserFocus';
import { setFrameWidth } from './features/frame/frameSlice';
import { selectMenuMode, selectMenuWidth } from './features/menu/menuSlice';
import { selectWidth } from './features/window/windowSlice';
import { checkPermit, getAppbarWidth } from './utils';
import { selectSelectArrowId, setSelectArrowId } from './features/arrow/arrowSlice';
import useCenterTwig from './features/twig/useCenterTwig';
import useSelectTwig from './features/twig/useSelectTwig';
import { selectDetailIdToTwigId, selectIToTwigId, selectNewTwigId, selectTwigIdToTrue } from './features/twig/twigSlice';
import { TWIG_FIELDS } from './features/twig/twigFragments';
import { Twig } from './features/twig/twig';

export default function useAppRouter(user: User | null) {
  const location = useLocation();
  const navigate = useNavigate();
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const width = useAppSelector(selectWidth);

  const menuMode = useAppSelector(selectMenuMode);
  const menuWidth = useAppSelector(selectMenuWidth);
  const menuWidth1 = menuMode
    ? menuWidth
    : 0;

  const frameIsOpen = useAppSelector(selectIsOpen('FRAME'));

  const frameArrowId = useAppSelector(selectSelectArrowId('FRAME'));
  const frameDetailIdToTwigId = useAppSelector(selectDetailIdToTwigId('FRAME'));
  const frameTwigId = frameDetailIdToTwigId[frameArrowId];

  const frameTwigIdToTrue = useAppSelector(selectTwigIdToTrue('FRAME'));
  const frameIToTwigId = useAppSelector(selectIToTwigId('FRAME'));
  const frameNewTwigId = useAppSelector(selectNewTwigId('FRAME'));

  const focusIsOpen = useAppSelector(selectIsOpen('FOCUS'));

  const focusArrowId = useAppSelector(selectSelectArrowId('FOCUS'));
  const focusDetailIdToTwigId = useAppSelector(selectDetailIdToTwigId('FOCUS'));
  const focusTwigId = focusDetailIdToTwigId[focusArrowId];

  const focusTwigIdToTrue = useAppSelector(selectTwigIdToTrue('FOCUS'));
  const focusIToTwigId = useAppSelector(selectIToTwigId('FOCUS'));

  let focusRole = null as Role | null;
  (user?.roles || []).filter(role_i => !role_i.deleteDate).some(role => {
    if (role.arrowId === user?.focusId) {
      focusRole = role;
      return true;
    }
    return false;
  });

  const canEdit = checkPermit(user?.focus?.canEdit || 'OTHER', focusRole?.type);

  const { centerTwig: frameCenterTwig } = useCenterTwig(user, 'FRAME');
  const { centerTwig: focusCenterTwig } = useCenterTwig(user, 'FOCUS');
  const { selectTwig: frameSelectTwig } = useSelectTwig('FRAME', true);
  const { selectTwig: focusSelectTwig } = useSelectTwig('FOCUS', canEdit);

  const { setUserFocusByRouteName } = useSetUserFocus(user);

  useEffect(() => {
    if (!user?.frame) return;
    if (!Object.keys(frameTwigIdToTrue || {}).length) return;

    const path = location.pathname.split('/');
    console.log(path);
    if (path.length < 3) {
      console.log('no path')
      navigate(`/m/${user.frame.routeName}/0`, {
        replace: true,
      })
      dispatch(setIsOpen({
        space: 'FOCUS', 
        isOpen:false
      }));
      dispatch(setSpace('FRAME'));
    }
    else if (path[2].toLowerCase() === user.frame.routeName) {
      console.log('frame routing');

      dispatch(setSpace('FRAME'));

      document.title = `Mindscape | ${user.frame.text.split('\n')[0]}`;

      const frameTwig = client.cache.readFragment({
        id: client.cache.identify({
          id: frameTwigId,
          __typename: 'Twig',
        }),
        fragment: TWIG_FIELDS,
      }) as Twig;

      if (path[3] !== (frameTwig?.i ?? -1).toString()) {
        const twigId = frameIToTwigId[path[3] || (frameTwig.i ?? -1)];

        const twig = client.cache.readFragment({
          id: client.cache.identify({
            id: twigId,
            __typename: 'Twig',
          }),
          fragment: TWIG_FIELDS,
        }) as Twig;
  
        if (twig?.id && !twig?.deleteDate) {
          if (twigId === frameNewTwigId) {
            console.log('frame, index select new')
            dispatch(setSelectArrowId({
              space: 'FRAME',
              arrowId: twig.detailId,
            }));
            frameCenterTwig(twigId, true, 0);
          }
          else {
            console.log('frame, index select');
            frameSelectTwig(user.frame, twig, true);
            frameCenterTwig(twigId, true, 0);
          }
        }
        else {
          console.log('frame, index invalid');
          dispatch(setSelectArrowId({
            space: 'FRAME',
            arrowId: user.frame.id,
          }));
          navigate(`/m/${user.frame.routeName}/0`, {
            replace: true,
          })
        }
      }
    }
    else {
      console.log('focus routing')

      dispatch(setSpace('FOCUS'));

      if (!focusIsOpen) {
        if (frameIsOpen) {
          dispatch(setFrameWidth((width - getAppbarWidth(width) - menuWidth1) / 2))
        }
      }

      if (!frameTwigId) {
        dispatch(setSelectArrowId({
          space: 'FRAME',
          arrowId: user.frame.id
        }));
        frameCenterTwig(frameDetailIdToTwigId[user.frame.id], true, 0);
      }

      if (path[2] !== user.focus?.routeName) {
        console.log('refocus')
        setUserFocusByRouteName(path[2]);
      }
      else {
        if (!Object.keys(focusTwigIdToTrue || {}).length) return;

        document.title = `Mindscape | ${user.focus.text.split('\n')[0]}`

        const focusTwig = client.cache.readFragment({
          id: client.cache.identify({
            id: focusTwigId,
            __typename: 'Twig',
          }),
          fragment: TWIG_FIELDS,
        }) as Twig;

        if (path[3] !== (focusTwig?.i ?? -1).toString()) {
          const twigId = focusIToTwigId[path[3] || (focusTwig.i ?? -1)];

          const twig = client.cache.readFragment({
            id: client.cache.identify({
              id: twigId,
              __typename: 'Twig',
            }),
            fragment: TWIG_FIELDS,
          }) as Twig;

          if (twig?.id && !twig?.deleteDate) {
            console.log('index select');
            focusSelectTwig(user.focus, twig, true);
            focusCenterTwig(twigId, true, 0);
          }
          else {
            console.log('index invalid');
            dispatch(setSelectArrowId({
              space: 'FOCUS',
              arrowId: user.focus.id,
            }));
            navigate(`/m/${path[2]}/0`, {
              replace: true,
            });
          }
        }
      }
    }
  }, [location.pathname, Object.keys(frameTwigIdToTrue || {}).length, Object.keys(focusTwigIdToTrue || {}).length])

}