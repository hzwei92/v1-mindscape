import { gql, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSessionId } from '../auth/authSlice';
import { SpaceType } from '../space/space';
import type { Twig } from './twig';
import { mergeTwigs } from './twigSlice';

const OPEN_TWIG = gql`
  mutation OpenTwig($sessionId: String!, $twigId: String!, $shouldOpen: Boolean!) {
    openTwig(sessionId: $sessionId, twigId: $twigId, shouldOpen: $shouldOpen) {
      twig {
        id
        isOpen
      }
    }
  }
`;

const useOpenTwig = () => {
  const dispatch = useAppDispatch();

  const sessionId = useAppSelector(selectSessionId);

  const [open] = useMutation(OPEN_TWIG, {
    onError: error => {
      console.error(error);
    },
    update: (cache, {data: {openTwig}}) => {
      //applyRole(cache, openTwig.role);
    },
    onCompleted: data => {
      console.log(data);
    }
  });

  const openTwig = (twig: Twig, shouldOpen: boolean) => {
    open({
      variables: {
        sessionId,
        twigId: twig.id,
        shouldOpen,
      }
    });

    const twig1 = Object.assign({}, twig, {
      isOpen: shouldOpen,
    });

    dispatch(mergeTwigs({
      id: v4(),
      space: SpaceType.FRAME,
      twigs: [twig1],
    }));
  }
  return { openTwig }
}

export default useOpenTwig