import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useContext } from 'react';
import { AppContext } from '../../App';
import { useAppDispatch } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { ABSTRACT_ARROW_FIELDS } from '../arrow/arrowFragments';
import { SpaceType } from '../space/space';
import { resetTwigs } from '../twig/twigSlice';
import { User } from './user';
import { mergeUsers, resetUsers, setCurrentUser } from './userSlice';

const SET_USER_FOCUS_BY_ID = gql`
  mutation SetUserFocusById($sessionId: String!, $arrowId: String) {
    setUserFocusById(sessionId: $sessionId, arrowId: $arrowId) {
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
  mutation SetUserFocusByRouteName($sessionId: String!, $arrowRouteName: String!) {
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

export default function useSetUserFocus() {
  const { user } = useContext(AppContext);

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
      dispatch(mergeUsers([data.setUserFocusById]));
    },
  });

  const [setFocusByRouteName] = useMutation(SET_USER_FOCUS_BY_ROUTE_NAME, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserFocusByRouteName]));
    },
  });


  const setUserFocusById = (arrowId: string | null) => {
    setFocusById({
      variables: {
        sessionId: sessionDetail.id,
        arrowId,
      },
    });

    if (!arrowId) {
      const user1 = Object.assign({}, user, {
        focusId: null,
        focus: null,
      });
      dispatch(mergeUsers([user1]));
    }

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