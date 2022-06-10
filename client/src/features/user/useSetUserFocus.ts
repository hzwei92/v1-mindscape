import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { ABSTRACT_ARROW_FIELDS } from '../arrow/arrowFragments';
import { resetArrows } from '../arrow/arrowSlice';
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
  mutation RefocusUserByRouteName($sessionId: String!, $postRouteName: String!) {
    setUserFocusByRouteName(sessionId: $sessionId, postRouteName: $postRouteName) {
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

    dispatch(resetArrows('FOCUS'));
    dispatch(resetUsers('FOCUS'));
  };

  const setUserFocusByRouteName = (postRouteName: string) => {
    setFocusByRouteName({
      variables: {
        sessionId: sessionDetail.id,
        postRouteName,
      }
    });

    dispatch(resetArrows('FOCUS'));
    dispatch(resetUsers('FOCUS'));
  }

  return { setUserFocusById, setUserFocusByRouteName };
}