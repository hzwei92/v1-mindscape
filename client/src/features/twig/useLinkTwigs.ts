import { gql, useMutation } from '@apollo/client';
import { useCallback, useContext } from 'react';
import { useSnackbar } from 'notistack';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { ROLE_FIELDS } from '../role/roleFragments';
import { mergeTwigs } from './twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSessionId } from '../auth/authSlice';
import { SpaceContext } from '../space/SpaceComponent';
import { AppContext } from '../../App';
import { PendingLinkType } from '../space/space';

const LINK_TWIGS = gql`
  mutation LinkTwigs($sessionId: String!, $abstractId: String!, $sourceId: String!, $targetId: String!) {
    linkTwigs(sessionId: $sessionId, abstractId: $abstractId, sourceId: $sourceId, targetId: $targetId) {
      abstract {
        id
        twigN
        twigZ
      }
      twigs {
        ...FullTwigFields
      }
      source {
        id
        outCount
        sheaf {
          id
          outCount
        }
      }
      target {
        id
        inCount
        sheaf {
          id
          inCount
        }
      }
      role {
        ...RoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${ROLE_FIELDS}
`
export default function useLinkTwigs() {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector(selectSessionId);

  const {
    setPendingLink,
  } = useContext(AppContext);

  const { 
    space, 
    abstract,
  } = useContext(SpaceContext);

  const { enqueueSnackbar } = useSnackbar();

  const [link] = useMutation(LINK_TWIGS, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);

      setPendingLink({
        sourceId: '',
        targetId: '',
      });

      dispatch(mergeTwigs({
        space,
        twigs: data.linkTwigs.twigs
      }));
    }
  });

  const linkTwigs = (pendingLink: PendingLinkType) => {
    if (!abstract) return;

    link({
      variables: {
        sessionId,
        abstractId: abstract.id,
        sourceId: pendingLink.sourceId,
        targetId: pendingLink.targetId,
      },
    });
  }

  return { linkTwigs }
}