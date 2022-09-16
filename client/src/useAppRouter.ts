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
import { selectIdToPos, selectSelectedTwigId, setSelectedSpace, setSelectedTwigId } from './features/space/spaceSlice';
import { selectFocusTab, selectFrameTab, selectIdToTab } from './features/tab/tabSlice';
import useCreateTab from './features/tab/useCreateTab';
import { Tab } from './features/tab/tab';

export default function useAppRouter(user: User | null) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const focusTab = useAppSelector(selectFocusTab);
  const frameTab = useAppSelector(selectFrameTab);

  let focusRole = null as Role | null;
  (user?.roles || []).filter(role_i => !role_i.deleteDate).some(role => {
    if (role.arrowId === frameTab?.arrowId) {
      focusRole = role;
      return true;
    }
    return false;
  });

  const canEditFocus = checkPermit(focusTab?.arrow.canEdit, focusRole?.type);

  const idToTab = useAppSelector(selectIdToTab);
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

  const { createTabByRoutename } = useCreateTab();


  useEffect(() => {
    const path = location.pathname.split('/');
    console.log(path);
    if (!Object.keys(idToTab).length) return;

    if (path.length < 3) {
      console.log('no path')
      if (focusTab) {
        console.log('hello')
        navigate(`/g/${focusTab.arrow.routeName}/0`);
        if (frameTab) {
          dispatch(setSelectedTwigId({
            space: SpaceType.FRAME,
            selectedTwigId: frameTab.arrow.rootTwigId || '',
          }));
        }
      }
      else if (frameTab) {
        navigate(`/g/${frameTab.arrow.routeName}/0`);
      }
    }
    else {
      let tab = null as Tab | null;
      Object.values(idToTab).some(tab_i => {
        if (tab_i.arrow.routeName === path[2].toLowerCase()) {
          tab = tab_i;
        }
        return !!tab;
      });
      console.log('matching tab', tab);
      if (tab) {
        document.title = `Mindscape | ${tab.arrow.title}`
        if (tab.isFrame && Object.keys(frameIdToPos).length) {
          console.log('tab is frameTab')
          if (focusTab && !focusSelectedTwigId) {
            dispatch(setSelectedTwigId({
              space: SpaceType.FRAME,
              selectedTwigId: focusTab.arrow.rootTwigId || '',
            }));
          }

          dispatch(setSelectedSpace(SpaceType.FRAME));

          const frameTwig = frameIdToTwig[frameSelectedTwigId];

          if (path[3] !== (frameTwig?.i ?? -1).toString()) {
            const twigId = frameIToTwigId[path[3] || (frameTwig?.i ?? -1)];
            const twig = frameIdToTwig[twigId];
      
            if (twig?.id && !twig?.deleteDate) {
              if (twig.id === newTwigId) {
                console.log('frame, index select newly created twig');
                dispatch(setSelectedTwigId({
                  space: SpaceType.FRAME,
                  selectedTwigId: twig.id,
                }));
                frameCenterTwig(twig.id, true, 0);
              }
              else {
                console.log('frame, index select');
                frameSelectTwig(tab.arrow, twig);
                frameCenterTwig(twigId, true, 0);
              }
            }
            else {
              console.log('frame, index invalid');
              const twig = tab.arrow.rootTwigId
                ? frameIdToTwig[tab.arrow.rootTwigId]
                : null;
              if (twig?.id && !twig?.deleteDate) {
                navigate(`/g/${tab.arrow.routeName}/0`, {
                  replace: true,
                })
              }
              else {
                console.error('frame, index invalid; no root twig');
              }
            }
          }
        }
        else if (tab.isFocus && Object.keys(focusIdToPos).length) {
          console.log('tab is focusTab', frameTab, frameSelectedTwigId, focusTab)
          if (frameTab && !frameSelectedTwigId) {
            dispatch(setSelectedTwigId({
              space: SpaceType.FRAME,
              selectedTwigId: frameTab.arrow.rootTwigId || '',
            }));
          }

          dispatch(setSelectedSpace(SpaceType.FOCUS));

          const focusTwig = focusIdToTwig[focusSelectedTwigId]
  
          if (path[3] !== (focusTwig?.i ?? -1).toString()) {
            const twigId = focusIToTwigId[path[3] || (focusTwig?.i ?? -1)];
            const twig = focusIdToTwig[twigId];
  
            if (twig?.id && !twig?.deleteDate) {
              console.log('focus, index select');
              focusSelectTwig(tab.arrow, twig);
              focusCenterTwig(twigId, true, 0);
            }
            else {
              console.log('focus, index invalid');
              navigate(`/g/${path[2]}/0`, {
                replace: true,
              });
            }
          }
        }
        else {
          console.log('tab is neither frame nor focus');
          dispatch(setSelectedSpace(SpaceType.FOCUS));
          // if (!tab.isFocus) {
          //   updateTab(tab, false, true);
          // }
        }
      }
      else {
        createTabByRoutename(path[2], null, false, true);
      }
    }
  }, [location.pathname, Object.keys(frameIdToPos || {}).length, Object.keys(focusIdToPos || {}).length, Object.keys(idToTab).length])
}