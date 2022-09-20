import { gql, useMutation } from '@apollo/client';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { mergeTwigs, resetTwigs } from '../twig/twigSlice';
import { useContext, useEffect } from 'react';
import { SpaceContext } from './SpaceComponent';
import useCenterTwig from '../twig/useCenterTwig';
import { SpaceType } from './space';
import { selectSelectedTwigId } from './spaceSlice';

const GET_DETAILS = gql`
  mutation GetTwigs($abstractId: String!) {
    getTwigs(abstractId: $abstractId) {
      ...FullTwigFields
    }
  }
  ${FULL_TWIG_FIELDS}
`;

export default function useInitSpace() {
  const dispatch = useAppDispatch();

  const {
    space, 
    abstract,
    canView,
  } = useContext(SpaceContext);

  const selectedTwigId = useAppSelector(selectSelectedTwigId(space));

  const { centerTwig } = useCenterTwig(space);

  const [getTwigs] = useMutation(GET_DETAILS, {
    onError: error => {
      console.error(error);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeTwigs({
        space,
        twigs: data.getTwigs,
      }));

      centerTwig(selectedTwigId || '', true, 0);
    },
  });

  useEffect(() => {
    if (!abstract?.id) return;
    console.log('init Space', space, abstract.id, abstract)
    dispatch(resetTwigs(space));

    getTwigs({
      variables: {
        abstractId: abstract.id
      }
    });
  }, [abstract?.id])

}