import { gql, useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { Arrow } from '../arrow/arrow';
import { IdToCoordsType, IdWithCoordsType } from './twig';

const ADJUST_TWIG = gql`
  mutation AdjustTwigs($abstractId: String!, $twigIds: [String!]!, $xs: [Int!]!, $ys: [Int!]!) {
    adjustTwigs(abstractId: $abstractId, twigIds: $twigIds, xs: $xs, ys: $ys) {
      id
    }
  }
`;

export default function useAdjustTwigs(abstract: Arrow) {
  const { enqueueSnackbar } = useSnackbar();

  const [adjust] = useMutation(ADJUST_TWIG, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const adjustTwigs = (idToCoords: IdToCoordsType) => {
    if (Object.keys(idToCoords).length) {
      const xs: number[] = [];
      const ys: number[] = [];
      Object.keys(idToCoords).forEach(id => {
        xs.push(idToCoords[id].x);
        ys.push(idToCoords[id].y);
      });
      adjust({
        variables: {
          abstractId: abstract.id,
          twigIds: Object.keys(idToCoords),
          xs,
          ys,
        }
      });
    }
  };

  return { adjustTwigs }
}