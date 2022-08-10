import { gql, useApolloClient, useMutation } from '@apollo/client';
import { v4 } from 'uuid';
import { useSnackbar } from 'notistack';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/useApplyRole';
import { createArrow } from '../arrow/arrow';
import { selectSessionId } from '../auth/authSlice';
import useSelectTwig from './useSelectTwig';
import useCenterTwig from './useCenterTwig';
import { useContext } from 'react';
import { createTwig, Twig } from './twig';
import { mergeTwigs, selectIdToChildIdToTrue } from './twigSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { AppContext } from '../../App';
import { SpaceContext } from '../space/SpaceComponent';
import { getEmptyDraft } from '../../utils';
import { DisplayMode } from '../../constants';
import { SpaceType } from '../space/space';
import { selectIdToPos, setSelectedTwigId } from '../space/spaceSlice';
import { mergeArrows } from '../arrow/arrowSlice';

const REPLY_TWIG = gql`
  mutation ReplyTwig(
    $sessionId: String!, 
    $parentTwigId: String!, 
    $twigId: String!, 
    $postId: String!, 
    $x: Int!, 
    $y: Int!, 
    $draft: String!
  ) {
    replyTwig(
      sessionId: $sessionId, 
      parentTwigId: $parentTwigId, 
      twigId: $twigId, 
      postId: $postId, 
      x: $x, 
      y: $y, 
      draft: $draft
    ) {
      abstract {
        id
        twigZ
        twigN
        updateDate
      }
      arrow {
        id
        outCount
      }
      twigs {
        ...FullTwigFields
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

export default function useReplyTwig() {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const { user } = useContext(AppContext);
  const { 
    space, 
    abstract, 
    canEdit
  } = useContext(SpaceContext);

  const idToPos = useAppSelector(selectIdToPos(space));

  const sessionId = useAppSelector(selectSessionId);
  const idToChildIdToTrue = useAppSelector(selectIdToChildIdToTrue(space));

  const { selectTwig } = useSelectTwig(space, canEdit);
  const { centerTwig } = useCenterTwig(space);

  const { enqueueSnackbar } = useSnackbar();
  
  const [reply] = useMutation(REPLY_TWIG, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    update: (cache, {data: {replyTwig}}) => {
      applyRole(cache, replyTwig.role);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeArrows([data.replyTwig.arrow]));
      
      dispatch(mergeTwigs({
        id: v4(),
        space,
        twigs: data.replyTwig.twigs
      }));
    }
  });

  const replyTwig = (parentTwig: Twig) => {
    if (!user) return;
    
    const dx = Math.random() - 0.5;
    const dy = Math.random() - 0.5;
    const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    const pos = idToPos[parentTwig.id];

    const postId = v4();
    const twigId = v4();
    const x = Math.round(500 * (dx / dr) + pos.x);
    const y = Math.round(500 * (dy / dr) + pos.y);

    const draft = getEmptyDraft();

    reply({
      variables: {
        sessionId,
        parentTwigId: parentTwig.id,
        twigId,
        postId,
        x,
        y,
        draft,
      },
    });

    const post = createArrow({
      id: postId,
      user,
      draft, 
      title: null, 
      url: null, 
      faviconUrl: null,
      abstract, 
      sheaf: null,
      source: null, 
      target: null,
    });

    const rank = Object.keys(idToChildIdToTrue[parentTwig.id] || {}).length + 1;

    const twig = createTwig({
      id: twigId,
      user,
      abstract, 
      detail: post, 
      parent: parentTwig, 
      x, 
      y, 
      rank, 
      color: null,
      isOpen: true, 
      windowId: null, 
      groupId: null, 
      tabId: null,
      bookmarkId: null, 
      displayMode: DisplayMode.SCATTERED,
      source: null,
      target: null,
    });

    dispatch(mergeTwigs({
      id: v4(),
      space: SpaceType.FRAME,
      twigs: [twig],
    }))

    dispatch(setSelectedTwigId({
      space,
      selectedTwigId: twig.id,
    }));

    centerTwig(twig.id, true, 0, {
      x: twig.x,
      y: twig.y
    });
  }
  return { replyTwig }
}