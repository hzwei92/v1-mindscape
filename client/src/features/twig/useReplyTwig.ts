import { gql, Reference, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { sessionVar } from '../../cache';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { SpaceType } from '../space/space';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createTwig, Twig } from './twig';
import { setSpace, setTwigId } from '../space/spaceSlice';
import { User } from '../user/user';
import { useSnackbar } from 'notistack';
import { addTwigs, finishNewTwig, startNewTwig } from './twigSlice';
import { getEmptyDraft } from '../../utils';
import { FULL_TWIG_FIELDS, TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS, ROLE_FIELDS } from '../role/roleFragments';
import { applyRole } from '../role/useApplyRole';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { Arrow, createArrow } from '../arrow/arrow';

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
      twigs {
        ...FullTwigFields
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${FULL_ARROW_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

export default function useReplyTwig(user: User | null, space: SpaceType, abstract: Arrow) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);

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

      dispatch(finishNewTwig({
        space,
      }));
      dispatch(addTwigs({
        space,
        twigs: data.replyTwig.twigs
      }));
    }
  });

  const replyTwig = (parentTwig: Twig) => {
    if (!user) return;
    
    const dx = parentTwig.x || 1;
    const dy = parentTwig.y || 1;
    const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    const postId = uuidv4();
    const twigId = uuidv4();
    const x = Math.round((420 + 100 * Math.random()) * (dx / dr) + parentTwig.x);
    const y = Math.round((420 + 100 * Math.random()) * (dy / dr) + parentTwig.y);

    const draft = getEmptyDraft();

    reply({
      variables: {
        sessionId: sessionDetail.id,
        parentTwigId: parentTwig.id,
        twigId,
        postId,
        x,
        y,
        draft,
      },
    });

    const post = createArrow(user, postId, draft, abstract, null, null);
    const twig = createTwig(user, twigId, abstract, post, parentTwig, x, y, false);
    
    client.cache.writeQuery({
      query: gql`
        query WriteReplyTwig {
          twig {
            ...FullTwigFields
          }
        }
        ${FULL_TWIG_FIELDS}
      `,
      data: {
        twig,
      },
    });

    twig.createDate = null;
    twig.updateDate = null;
    post.activeDate = null;
    post.saveDate = null;
    post.createDate = null;
    post.updateDate = null;
    
    const newRef = client.cache.writeFragment({
      id: client.cache.identify(twig),
      fragment: TWIG_FIELDS,
      data: twig,
    });

    client.cache.modify({
      id: client.cache.identify(parentTwig),
      fields: {
        children: (cachedRefs = []) => {
          return [...(cachedRefs || []), newRef];
        }
      }
    });

    dispatch(startNewTwig({
      space,
      newTwigId: twigId,
    }));

    dispatch(addTwigs({
      space,
      twigs: [twig],
    }));


    dispatch(setTwigId({
      space,
      twigId
    }));

    dispatch(setSpace(space));

    navigate(`/m/${abstract.routeName}/${twig.i}`);
    //centerTwig(twigId, true, 100, coords);
  }

  return { replyTwig }
}