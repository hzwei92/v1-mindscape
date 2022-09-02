import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks';
import { Role } from './features/role/role';
import { User } from './features/user/user';
import { checkPermit } from './utils';
import useCenterTwig from './features/twig/useCenterTwig';
import useSelectTwig from './features/twig/useSelectTwig';
import { SpaceType } from './features/space/space';
import { selectIdToTwig, selectIToTwigId, selectNewTwigId } from './features/twig/twigSlice';
import { selectIdToPos, selectSelectedTwigId, setIsOpen, setSelectedSpace, setSelectedTwigId } from './features/space/spaceSlice';
import useSetUserGraph from './features/user/useSetUserGraph';

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

  const newTwigId = useAppSelector(selectNewTwigId);
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));
  const frameIToTwigId = useAppSelector(selectIToTwigId(SpaceType.FRAME));
  const frameIdToPos = useAppSelector(selectIdToPos(SpaceType.FRAME));

  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));
  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));
  const focusIToTwigId = useAppSelector(selectIToTwigId(SpaceType.FOCUS));
  const focusIdToPos = useAppSelector(selectIdToPos(SpaceType.FOCUS));

  const { centerTwig: frameCenterTwig } = useCenterTwig(SpaceType.FRAME);
  const { centerTwig: focusCenterTwig } = useCenterTwig(SpaceType.FOCUS);
  const { selectTwig: frameSelectTwig } = useSelectTwig(SpaceType.FRAME, true);
  const { selectTwig: focusSelectTwig } = useSelectTwig(SpaceType.FOCUS, canEditFocus);

  const { setUserFocusByRouteName } = useSetUserGraph();

  useEffect(() => {
    const path = location.pathname.split('/');
    console.log(path);
    
    if (path.length < 3) {
      console.log('no path')
    }
    else if (path[2].toLowerCase() === user?.frame?.routeName) {
      console.log('frame routing');

      dispatch(setIsOpen({
        space: SpaceType.FRAME,
        isOpen: true,
      }));
      dispatch(setSelectedSpace(SpaceType.FRAME));

      if (user.focus && !focusSelectedTwigId && user.focus.rootTwigId) {
        const twig = focusIdToTwig[user.focus.rootTwigId];
        if (twig) {
          focusSelectTwig(user.focus, twig);
          focusCenterTwig(user.focus.rootTwigId, true, 0);
        }
      }

      document.title = `Mindscape | ${user.frame.title}`;

      const frameTwig = frameIdToTwig[frameSelectedTwigId];

      if (path[3] !== (frameTwig?.i ?? -1).toString()) {
        console.log('hello')
        const twigId = frameIToTwigId[path[3] || (frameTwig.i ?? -1)];
        const twig = frameIdToTwig[twigId];
  
        if (twig?.id && !twig?.deleteDate) {
          if (twig.id === newTwigId) {
            console.log('frame, index select new twig');
            dispatch(setSelectedTwigId({
              space: SpaceType.FRAME,
              selectedTwigId: twig.id,
            }));
            frameCenterTwig(twig.id, true, 0);
          }
          else {
            console.log('frame, index select');
            frameSelectTwig(user.frame, twig);
            frameCenterTwig(twigId, true, 0);
          }
        }
        else {
          console.log('frame, index invalid');
          const twig = user?.frame?.rootTwigId
            ? frameIdToTwig[user?.frame?.rootTwigId]
            : null;
          if (twig?.id && !twig?.deleteDate) {
            navigate(`/g/${user.frame.routeName}/0`, {
              replace: true,
            })
          }
          else {
            console.error('frame, index invalid; no root twig');
          }
        }
      }
    }
    else if (user) {
      console.log('focus routing')

      dispatch(setIsOpen({
        space: SpaceType.FOCUS,
        isOpen: true,
      }));
      dispatch(setSelectedSpace(SpaceType.FOCUS));

      if (user.frame && !frameSelectedTwigId && user.frame.rootTwigId) {
        const twig = frameIdToTwig[user.frame.rootTwigId];
        if (twig) {
          frameSelectTwig(user.frame, twig);
          frameCenterTwig(twig.id, true, 0);
        }
      }

      if (path[2] !== user.focus?.routeName) {
        console.log('refocus')
        setUserFocusByRouteName(path[2]);
      }
      else {
        if (!Object.keys(focusIdToPos || {}).length) return;

        document.title = `Mindscape | ${user.focus.title}`

        const focusTwig = focusIdToTwig[focusSelectedTwigId]

        if (path[3] !== (focusTwig?.i ?? -1).toString()) {
          const twigId = focusIToTwigId[path[3] || (focusTwig?.i ?? -1)];
          const twig = focusIdToTwig[twigId];

          if (twig?.id && !twig?.deleteDate) {
            console.log('index select');
            focusSelectTwig(user.focus, twig);
            focusCenterTwig(twigId, true, 0);
          }
          else {
            console.log('index invalid');
            navigate(`/g/${path[2]}/0`, {
              replace: true,
            });
          }
        }
      }
    }
  }, [location.pathname, Object.keys(frameIdToPos || {}).length, Object.keys(focusIdToPos || {}).length])
}