import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { ABSTRACT_ARROW_FIELDS } from '../arrow/arrowFragments';
import { SpaceType } from '../space/space';
import { resetTwigs } from '../twig/twigSlice';
import { User } from './user';
import { resetUsers } from './userSlice';

const SET_USER_FOCUS_BY_ID = gql`
  mutation RefocusUserById($sessionId: String!, $postId: String) {
    setUserFocusById(sessionId: $sessionId, postId: $postId) {
      id
      focusId
      focus {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

const SET_USER_FOCUS_BY_ROUTE_NAME = gql`
  mutation RefocusUserByRouteName($sessionId: String!, $arrowRouteName: String!) {
    setUserFocusByRouteName(sessionId: $sessionId, arrowRouteName: $arrowRouteName) {
      id
      focusId
      focus {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

export default function useSetUserFocus(user: User | null) {
  const client = useApolloClient();
  const sessionDetail = useReactiveVar(sessionVar);

  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();
  
  const [setFocusById] = useMutation(SET_USER_FOCUS_BY_ID, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const [setFocusByRouteName] = useMutation(SET_USER_FOCUS_BY_ROUTE_NAME, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
    },
  });


  const setUserFocusById = (postId: string | null) => {
    setFocusById({
      variables: {
        sessionId: sessionDetail.id,
        postId,
      },
    });

    dispatch(resetTwigs(SpaceType.FOCUS));
    dispatch(resetUsers(SpaceType.FOCUS));
  };

  const setUserFocusByRouteName = (arrowRouteName: string) => {
    setFocusByRouteName({
      variables: {
        sessionId: sessionDetail.id,
        arrowRouteName,
      }
    });

    dispatch(resetTwigs(SpaceType.FOCUS));
    dispatch(resetUsers(SpaceType.FOCUS));
  }

  return { setUserFocusById, setUserFocusByRouteName };
}