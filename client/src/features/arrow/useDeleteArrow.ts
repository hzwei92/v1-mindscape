import { gql, useMutation, useReactiveVar } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { sessionVar } from "../../cache";
import { mergeArrows, selectIdToArrow } from "./arrowSlice";


const DELETE_ARROW = gql`
  mutation DeleteArrow($sessionId: String!, $arrowId: String!) {
    deleteArrow(sessionId: $sessionId, arrowId: $arrowId) {
      id
      removeDate
    }
  }
`;

export default function useDeleteArrow() {
  const dispatch = useAppDispatch();
  const sessionDetail = useReactiveVar(sessionVar);

  const idToArrow = useAppSelector(selectIdToArrow);

  const [del] = useMutation(DELETE_ARROW, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const deleteArrow = (arrowId: string) => {
    del({
      variables: {
        sessionId: sessionDetail.id,
        arrowId,
      },
    });

    const arrow = idToArrow[arrowId];

    if (arrow) {
      const arrow1 = {
        ...arrow,
        removeDate: new Date().toISOString(),
      };
      dispatch(mergeArrows([arrow1]));
    }
  }

  return { deleteArrow };
}