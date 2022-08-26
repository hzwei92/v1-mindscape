import { gql, useMutation } from '@apollo/client';
import { useAppDispatch } from '../../app/hooks';
import { SpaceType } from './space';
import { Arrow } from '../arrow/arrow';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { mergeTwigs, resetTwigs } from '../twig/twigSlice';
import { v4 } from 'uuid';
import { resetUsers } from '../user/userSlice';
import { useContext, useEffect, useState } from 'react';
import { SpaceContext } from './SpaceComponent';

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
    },
  });

  useEffect(() => {
    if (!abstract?.id) return;
    // dispatch(resetTwigs(space));
    // dispatch(resetUsers(space));

    getTwigs({
      variables: {
        abstractId: abstract.id
      }
    });
  }, [abstract?.id])

}