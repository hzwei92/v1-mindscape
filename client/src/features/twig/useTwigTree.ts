import { gql, useApolloClient } from '@apollo/client';
import { FULL_TWIG_FIELDS, TWIG_FIELDS, TWIG_WITH_PARENT } from './twigFragments';
import { Twig } from './twig';
import { IdToIdToTrueType, IdToTrueType } from '../../utils';
import { useAppDispatch } from '../../app/hooks';
import { setIdToDescIdToTrue } from './twigSlice';
import { SpaceType } from '../space/space';

export default function useTwigTree(space: SpaceType) {
  const dispatch = useAppDispatch();
  const client = useApolloClient();

  const setTwigTree = (twigs: Twig[]) => {
    const idToDescIdToTrue: IdToIdToTrueType = {};

    twigs.forEach(twig => {
      let twig1 = twig;
      while (twig1.parent) {
        idToDescIdToTrue[twig1.parent.id] = {
          ...(idToDescIdToTrue[twig1.parent.id]),
          [twig1.id]: true,
        }
        twig1 = client.cache.readFragment({
          id: client.cache.identify(twig1.parent),
          fragment: TWIG_WITH_PARENT,
        }) as Twig;
      }
    });

    dispatch(setIdToDescIdToTrue({
      space,
      idToDescIdToTrue,
    }))
  }

  return { 
    setTwigTree,
  };
}