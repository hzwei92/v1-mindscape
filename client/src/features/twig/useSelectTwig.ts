
import { gql, useMutation } from '@apollo/client';
import { Dispatch, useCallback, useContext } from 'react';
import { useSnackbar } from 'notistack';
import { mergeTwigs, selectIdToDescIdToTrue, selectIdToTwig } from './twigSlice';
import type { Arrow } from '../arrow/arrow';
import { v4 } from 'uuid';
import type { Twig } from './twig';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSessionId } from '../auth/authSlice';
import { mergeArrows } from '../arrow/arrowSlice';
import { SpaceType } from '../space/space';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { setSelectedSpace, setSelectedTwigId } from '../space/spaceSlice';

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
    }
  }
`;

export default function useSelectTwig(space: SpaceType, canEdit: boolean) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const sessionId = useAppSelector(selectSessionId);

  const idToTwig = useAppSelector(selectIdToTwig(space));
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

  const selectTwig = (abstract: Arrow, twig: Twig, dontNav?: boolean) => {
    if (!twig) return;
    
    if (canEdit) {
      select({
        variables: {
          sessionId,
          twigId: twig.id,
        },
      });
    }
    else if (space === 'FOCUS') {
      //dispatch(setFocusIsSynced(false));
    }
    else {
      throw new Error('Unable to edit frame')
    }

    dispatch(setSelectedSpace(space));
    
    dispatch(setSelectedTwigId({
      space,
      selectedTwigId: twig.id,
    }));

    const twigs = [];
    Object.keys(idToDescIdToTrue[twig.id] || {})
      .map(descId => idToTwig[descId])
      .sort((a, b) => a.z < b.z ? -1 : 1)
      .forEach((t, i) => {
        const t1 = Object.assign({}, t, {
          z: abstract.twigZ + i
        });
        twigs.push(t1);
      });

    const twig1 = Object.assign({}, twig, {
      z: abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1,
    });

    twigs.push(twig1);

    dispatch(mergeTwigs({
      space,
      twigs,
    }));
    
    const abstract1 = Object.assign({}, abstract, {
      twigZ: abstract.twigZ + Object.keys(idToDescIdToTrue[twig.id] || {}).length + 1
    });

    dispatch(mergeArrows([abstract1]));

    if (!dontNav) {
      const route = `/m/${abstract.routeName}/${twig.i}`;
      navigate(route);
    }
  };

  return { selectTwig };
}