import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/hooks';
import { SpaceType } from './space';
import { Arrow } from '../arrow/arrow';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import useTwigTree from '../twig/useTwigTree';
import { mergeTwigs, resetTwigs } from '../twig/twigSlice';
import { v4 } from 'uuid';
import { resetUsers } from '../user/userSlice';
import { useEffect } from 'react';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(space: SpaceType, abstract: Arrow | null, canView: boolean) {
  const dispatch = useAppDispatch();

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeTwigs({
        id: v4(),
        space,
        twigs: data.getTwigs,
      }));
    },
  });

  useEffect(() => {
    console.log(abstract?.id);
    if (!abstract?.id) return;
    // TODO fire only once
    dispatch(resetTwigs(space));
    dispatch(resetUsers(space));

    getTwigs({
      variables: {
        abstractId: abstract.id
      }
    });
  }, [abstract?.id])

}