
import { gql, useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { sessionVar } from '../../cache';
import { TWIG_FIELDS } from './twigFragments';
import { SpaceType } from '../space/space';
import { setSpace, setTwigId } from '../space/spaceSlice';
import { Twig } from './twig';
import useTwigTree from './useTwigTree';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { setFocusIsSynced } from '../focus/focusSlice';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { selectIdToDescIdToTrue } from './twigSlice';
import { Arrow } from '../arrow/arrow';
import { setSelectArrowId } from '../arrow/arrowSlice';

const SELECT_TWIG = gql`
  mutation Select_Twig($sessionId: String!, $twigId: String!) {
    selectTwig(sessionId: $sessionId, twigId: $twigId) {
      twigs {
        id
        z
      }
      abstract {
        id
        twigZ
        updateDate
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_ROLE_FIELDS}
`;

export default function useSelectTwig(space: SpaceType, canEdit: boolean) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);

  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(space));

  const { enqueueSnackbar } = useSnackbar();

  const [select] = useMutation(SELECT_TWIG, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const selectTwig = useCallback((abstract: Arrow, twig: Twig, shouldNav: boolean) => {
    if (canEdit) {
      select({
        variables: {
          sessionId: sessionDetail.id,
          twigId: twig.id,
        },
      });
    }
    else if (space === 'FOCUS') {
      dispatch(setFocusIsSynced(false));
    }
    else {
      throw new Error('Cannot edit frame')
    }

    dispatch(setSelectArrowId({
      space,
      arrowId: twig.detailId
    }));

    dispatch(setSpace(space));

    const idToCoords: any = {};
    Object.keys(idToDescIdToTrue[twig.id] || {})
      .map(descId => {
        return client.cache.readFragment({
          id: client.cache.identify({
            id: descId,
            __typename: 'Twig',
          }),
          fragment: gql`
            fragment TwigWithZ on Twig {
              id
              z
            }
          `
        }) as Twig;
      })
      .sort((a, b) => a.z < b.z ? -1 : 1)
      .forEach((t, i) => {
        client.cache.modify({
          id: client.cache.identify({
            id: t.id,
            __typename: 'Twig',
          }),
          fields: {
            z: () => abstract.twigZ + i,
          }
        })
      });

    client.cache.modify({
      id: client.cache.identify(twig),
      fields: {
        z: () => abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1,
      }
    });
    
    client.cache.modify({
      id: client.cache.identify(abstract),
      fields: {
        twigZ: cachedVal => cachedVal + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1,
      },
    })
    
    if (shouldNav) {
      const route =`/m/${abstract.routeName}/${twig.i}`;
      navigate(route);
    }

  }, [space, canEdit, select])

  return { selectTwig };
}