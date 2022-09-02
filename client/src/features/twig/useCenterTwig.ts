import { useReactiveVar } from '@apollo/client';
import { useContext } from 'react';
import { AppContext } from '../../App';
import { useAppSelector } from '../../app/hooks';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';
import { VIEW_RADIUS } from '../../constants';
import { SpaceType } from '../space/space';
import { selectIdToPos, selectScale } from '../space/spaceSlice';

export default function useCenterTwig(space: SpaceType) {
  const { 
    user,
    width,
    menuWidth,
    frameWidth,
  } = useContext(AppContext);

  const focusWidth = width - frameWidth;

  const spaceWidth = space === SpaceType.FRAME 
    ? frameWidth 
    : focusWidth;

  const spaceEl = useReactiveVar(space === SpaceType.FRAME
    ? frameSpaceElVar
    : focusSpaceElVar);

  const idToPos = useAppSelector(selectIdToPos(space));
  const scale = useAppSelector(selectScale(space));

  const centerTwig = (twigId: string, isSmooth: boolean, delay: number, coords?: any) => {
    setTimeout(() => {
      if (!spaceEl?.current) return;
      if (!user) return;
      
      const pos = idToPos[twigId];

      console.log(pos, space, twigId, idToPos);

      const x1 = ((coords?.x ?? pos?.x) + VIEW_RADIUS) * scale;
      const y1 = ((coords?.y ?? pos?.y) + VIEW_RADIUS) * scale;

      console.log('centerTwig', scale);

      spaceEl.current.scrollTo({
        left: (x1 - (spaceEl.current.clientWidth / 2)),
        top: (y1 - spaceEl.current.clientHeight / 2),
        behavior: isSmooth 
          ? 'smooth'
          : 'auto',
      })
    }, delay);
  }

  return { centerTwig };
} 