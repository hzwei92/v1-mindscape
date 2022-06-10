import { gql, useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SpaceType } from './space';
import { selectFocusShouldSync, setFocusShouldSync } from '../focus/focusSlice';
import { addTwigUsers, resetUsers } from '../user/userSlice';
import { addArrows, resetArrows } from '../arrow/arrowSlice';
import { Arrow } from '../arrow/arrow';
import { addTwigs } from '../twig/twigSlice';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import useTwigTree from '../twig/useTwigTree';
import { Twig } from '../twig/twig';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace(space: SpaceType, abstract: Arrow | null, canView: boolean) {
  const shouldSync = useAppSelector(selectFocusShouldSync)
  const dispatch = useAppDispatch();

  const { setTwigTree } = useTwigTree(space);

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addTwigs({
        space,
        twigs: data.getTwigs,
      }));

      setTwigTree(data.getTwigs);

      dispatch(addArrows({
        space,
        arrows: data.getTwigs.map((twig: Twig) => twig.detail)
      }))

      dispatch(addTwigUsers({
        space,
        twigs: data.getTwigs,
      }))
    },
  });

  useEffect(() => {
    console.log(abstract?.id);
    if (!abstract?.id) return;
    // TODO fire only once
    dispatch(resetArrows(space));
    dispatch(resetUsers(space));

    getTwigs({
      variables: {
        abstractId: abstract.id
      }
    });
    console.log('leggo')

    if (shouldSync) {
      dispatch(setFocusShouldSync(false));
    }
  }, [abstract?.id, (shouldSync && space === 'FOCUS'), canView])

}