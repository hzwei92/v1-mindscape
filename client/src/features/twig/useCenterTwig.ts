import { useApolloClient, useReactiveVar } from '@apollo/client';
import { useAppSelector } from '../../app/hooks';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';
import { VIEW_RADIUS } from '../../constants';
import { SpaceType } from '../space/space';
import { selectScale } from '../space/spaceSlice';
import { User } from '../user/user';
import { Twig } from './twig';
import { TWIG_WITH_XY } from './twigFragments';

export default function useCenterTwig(user: User | null, space: SpaceType) {
  const client = useApolloClient();

  const spaceEl = useReactiveVar(space === 'FRAME'
    ? frameSpaceElVar
    : focusSpaceElVar
  );

  const scale = useAppSelector(selectScale(space));

  const centerTwig = (twigId: string, isSmooth: boolean, delay: number, coords?: any) => {
    setTimeout(() => {
      if (!spaceEl?.current) return;
      if (!user) return;
      
      const twig = client.cache.readFragment({
        id: client.cache.identify({
          id: twigId,
          __typename: 'Twig',
        }),
        fragment: TWIG_WITH_XY,
      }) as Twig;

      const x1 = (twig.x + VIEW_RADIUS) * scale;
      const y1 = (twig.y + VIEW_RADIUS) * scale;

      spaceEl.current.scrollTo({
        left: (x1 - spaceEl.current.clientWidth / 2),
        top: (y1 - spaceEl.current.clientHeight / 2),
        behavior: isSmooth 
          ? 'smooth'
          : 'auto',
      })
    }, delay);
  }

  return { centerTwig };
} 