import { gql, useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/useApplyRole';
import { selectSessionId } from '../auth/authSlice';
import { mergeTwigs } from './twigSlice';
import { SpaceType } from '../space/space';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const MOVE_TWIG = gql`
  mutation MoveTwig($sessionId: String!, $twigId: String!, $x: Int!, $y: Int!) {
    moveTwig(sessionId: $sessionId, twigId: $twigId, x: $x, y: $y) {
      twigs {
        id
        x
        y
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useMoveTwig(space: SpaceType) {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

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
      dispatch(mergeTwigs({
        space,
        twigs: data.moveTwig.twigs,
      }))
    },
  });

  const moveTwig = (twigId: string, x: number, y: number) => {
    move({
      variables: {
        sessionId: sessionId,
        twigId,
        x,
        y,
      },
    });
  }

  return { moveTwig };
}