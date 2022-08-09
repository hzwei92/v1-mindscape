import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAppDispatch } from '../../app/hooks';
import { sessionVar } from '../../cache';

const SAVE_ARROW = gql`
  mutation SaveArrow($sessionId: String!, $arrowId: String!, $draft: String!) {
    saveArrow(sessionId: $sessionId, arrowId: $arrowId, draft: $draft) {
      id
      draft
      text
      saveDate
    }
  }
`;

export default function useSaveArrow(arrowId: string, instanceId: string) {
  const sessionDetail = useReactiveVar(sessionVar);
  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();
  
  const [save] = useMutation(SAVE_ARROW, {
    onError: error => {
      console.error(error);
      
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const saveArrow = (draft: string) => {
    save({
      variables: {
        sessionId: sessionDetail.id,
        arrowId,
        draft,
      }
    });
  }

  return { saveArrow }
}