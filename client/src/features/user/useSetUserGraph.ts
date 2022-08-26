import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useContext } from 'react';
import { AppContext } from '../../App';
import { useAppDispatch } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { ABSTRACT_ARROW_FIELDS } from '../arrow/arrowFragments';
import { SpaceType } from '../space/space';
import { resetTwigs } from '../twig/twigSlice';
import { mergeUsers, resetUsers } from './userSlice';

const SET_USER_FRAME_BY_ID = gql`
  mutation SetUserFrameById($sessionId: String!, $arrowId: String) {
    setUserFrameById(sessionId: $sessionId, arrowId: $arrowId) {
      id
      frameId
      frame {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

const SET_USER_FRAME_BY_ROUTE_NAME = gql`
  mutation SetUserFrameByRouteName($sessionId: String!, $arrowRouteName: String!) {
    setUserFrameByRouteName(sessionId: $sessionId, arrowRouteName: $arrowRouteName) {
      id
      frameId
      frame {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

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

export default function useSetUserGraph() {
  const { user } = useContext(AppContext);

  const sessionDetail = useReactiveVar(sessionVar);

  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();
    
  const [setFrameById] = useMutation(SET_USER_FRAME_BY_ID, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserFrameById]));
    },
  });

  const [setFrameByRouteName] = useMutation(SET_USER_FRAME_BY_ROUTE_NAME, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.setUserFrameByRouteName]));
    },
  });

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


  const setUserFrameById = (arrowId: string | null) => {
    setFrameById({
      variables: {
        sessionId: sessionDetail.id,
        arrowId,
      },
    });

    if (!arrowId) {
      const user1 = Object.assign({}, user, {
        frameId: null,
        frame: null,
      });
      dispatch(mergeUsers([user1]));
    }

    dispatch(resetTwigs(SpaceType.FOCUS));
    dispatch(resetUsers(SpaceType.FOCUS));
  };

  const setUserFrameByRouteName = (arrowRouteName: string) => {
    setFrameByRouteName({
      variables: {
        sessionId: sessionDetail.id,
        arrowRouteName,
      }
    });

    dispatch(resetTwigs(SpaceType.FOCUS));
    dispatch(resetUsers(SpaceType.FOCUS));
  }


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

  return { 
    setUserFrameById,
    setUserFrameByRouteName,
    setUserFocusById, 
    setUserFocusByRouteName,
  };
}