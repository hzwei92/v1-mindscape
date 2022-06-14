import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/useApplyRole';
import { SpaceType } from '../space/space';
import { Twig } from './twig';
import { TWIG_FIELDS, TWIG_WITH_XY } from './twigFragments';
import { selectIdToDescIdToTrue } from './twigSlice';

const MOVE_TWIG = gql`
  mutation MoveTwig($sessionId: String!, $twigId: String!, $x: Int!, $y: Int!) {
    moveTwig(sessionId: $sessionId, twigId: $twigId, x: $x, y: $y) {
      twigs {
        id
        x
        y
      }
      role {
        ...RoleFields
      }
    }
  }
  ${ROLE_FIELDS}
`;

export default function useMoveTwig(space: SpaceType) {
  const client = useApolloClient();

  const sessionDetail = useReactiveVar(sessionVar);

  const { enqueueSnackbar } = useSnackbar();
  
  const [move] = useMutation(MOVE_TWIG, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    update: (cache, {data: {moveTwig}}) => {
      applyRole(cache, moveTwig.role);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const moveTwig = (twigId: string) => {
    const twig = client.cache.readFragment({
      id: client.cache.identify({
        id: twigId,
        __typename: 'Twig',
      }),
      fragment: TWIG_WITH_XY,
    }) as Twig;

    move({
      variables: {
        sessionId: sessionDetail.id,
        twigId: twig.id,
        x: Math.round(twig.x),
        y: Math.round(twig.y),
      },
    });
  }

  return { moveTwig };
}