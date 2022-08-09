import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks';
import { Role } from './features/role/role';
import { User } from './features/user/user';
import useSetUserFocus from './features/user/useSetUserFocus';
import { checkPermit } from './utils';
import useCenterTwig from './features/twig/useCenterTwig';
import useSelectTwig from './features/twig/useSelectTwig';
import { SpaceType } from './features/space/space';
import { selectIdToTwig, selectIToTwigId } from './features/twig/twigSlice';
import { selectIdToPos, selectIsOpen, selectSelectedTwigId, setIsOpen, setSelectedSpace } from './features/space/spaceSlice';

export default function useAppRouter(user: User | null) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  let focusRole = null as Role | null;
  (user?.roles || []).filter(role_i => !role_i.deleteDate).some(role => {
    if (role.arrowId === user?.focusId) {
      focusRole = role;
      return true;
    }
    return false;
  });

  const canEditFocus = checkPermit(user?.focus?.canEdit, focusRole?.type);

  const frameIsOpen = useAppSelector(selectIsOpen(SpaceType.FRAME));
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));
  const frameIToTwigId = useAppSelector(selectIToTwigId(SpaceType.FRAME));
  const frameIdToPos = useAppSelector(selectIdToPos(SpaceType.FRAME));

  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));
  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));
  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));
  const focusIToTwigId = useAppSelector(selectIToTwigId(SpaceType.FOCUS));
  const focusIdToPos = useAppSelector(selectIdToPos(SpaceType.FOCUS));

  const { centerTwig: frameCenterTwig } = useCenterTwig(SpaceType.FRAME);
  const { centerTwig: focusCenterTwig } = useCenterTwig(SpaceType.FOCUS);
  const { selectTwig: frameSelectTwig } = useSelectTwig(SpaceType.FRAME, true);
  const { selectTwig: focusSelectTwig } = useSelectTwig(SpaceType.FOCUS, canEditFocus);

  const { setUserFocusByRouteName } = useSetUserFocus(user);

  useEffect(() => {
    if (!user?.frame) return;
    if (!Object.keys(frameIdToPos || {}).length) return;

    const path = location.pathname.split('/');
    console.log(path);
    if (path.length < 3) {
      console.log('no path')
      navigate(`/m/${user.frame.routeName}/0`, {
        replace: true,
      })
      dispatch(setIsOpen({
        space: SpaceType.FRAME,
        isOpen: false,
      }));
      dispatch(setSelectedSpace(SpaceType.FRAME));
    }
    else if (path[2].toLowerCase() === user.frame.routeName) {
      console.log('frame routing');

      setSelectedSpace(SpaceType.FRAME);

      document.title = `Mindscape | ${user.frame.text.split('\n')[0]}`;

      const frameTwig = frameIdToTwig[frameSelectedTwigId];

      console.log(frameTwig);
      if (path[3] !== (frameTwig?.i ?? -1).toString()) {
        console.log('hello')
        const twigId = frameIToTwigId[path[3] || (frameTwig.i ?? -1)];
        const twig = frameIdToTwig[twigId];
  
        if (twig?.id && !twig?.deleteDate) {
          console.log('frame, index select');
          frameSelectTwig(user.frame, twig);
          frameCenterTwig(twigId, true, 0);
        }
        else {
          console.log('frame, index invalid');
          const twig = user?.frame?.rootTwigId
            ? frameIdToTwig[user?.frame?.rootTwigId]
            : null;
          if (twig?.id && !twig?.deleteDate) {
            navigate(`/m/${user.frame.routeName}/0`, {
              replace: true,
            })
          }
          else {
            console.error('frame, index invalid; no root twig');
          }
        }
      }
    }
    else {
      console.log('focus routing')

      setSelectedSpace(SpaceType.FOCUS);

      if (!focusIsOpen) {
        if (frameIsOpen) {
          dispatch(setIsOpen({
            space: SpaceType.FOCUS,
            isOpen: true,
          }));
          // setFocusWdith ?? TODO
        }
      }

      if (!frameSelectedTwigId && user?.frame?.rootTwigId) {
        const twig = frameIdToTwig[user?.frame?.rootTwigId];
        frameSelectTwig(user.frame, twig);
        frameCenterTwig(twig.id, true, 0);
      }

      if (path[2] !== user.focus?.routeName) {
        console.log('refocus')
        setUserFocusByRouteName(path[2]);
      }
      else {
        if (!Object.keys(focusIdToPos || {}).length) return;

        document.title = `Mindscape | ${user.focus.text.split('\n')[0]}`

        const focusTwig = focusIdToTwig[focusSelectedTwigId]

        if (path[3] !== (focusTwig?.i ?? -1).toString()) {
          const twigId = focusIToTwigId[path[3] || (focusTwig.i ?? -1)];
          const twig = focusIdToTwig[twigId];

          if (twig?.id && !twig?.deleteDate) {
            console.log('index select');
            focusSelectTwig(user.focus, twig);
            focusCenterTwig(twigId, true, 0);
          }
          else {
            console.log('index invalid');
            navigate(`/m/${path[2]}/0`, {
              replace: true,
            });
          }
        }
      }
    }
  }, [location.pathname, Object.keys(frameIdToPos || {}).length, Object.keys(focusIdToPos || {}).length])
}