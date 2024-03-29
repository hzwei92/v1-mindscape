import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { mergeArrows } from '../arrow/arrowSlice';
import { selectIdToEntry } from '../entry/entrySlice';
import { VOTE_FIELDS } from './voteFragments';
import { mergeVotes } from './voteSlice';

const VOTE_POSTS = gql`
  mutation VoteArrow($sessionId: String!, $arrowId: String!, $clicks: Int!) {
    voteArrow(sessionId: $sessionId, arrowId: $arrowId, clicks: $clicks) {
      arrow {
        id
        clicks
        tokens
        weight
      }
      votes {
        ...VoteFields
      }
    }
  }
  ${VOTE_FIELDS}
`;

export default function useVoteArrow(onCompleted: any) {
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);

  const { enqueueSnackbar } = useSnackbar();

  const [vote] = useMutation(VOTE_POSTS, {
    onError: error => {
      console.error(error);
      
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
      const {
        arrow,
        votes,
      } = data.voteArrow;

      dispatch(mergeArrows([arrow]));

      dispatch(mergeVotes(votes));

      onCompleted();
    }
  });

  const voteArrow = (arrowId: string, clicks: number) => {
    vote({
      variables: {
        sessionId: sessionDetail.id,
        arrowId,
        clicks,
      },
    });
  };

  return { voteArrow };
}