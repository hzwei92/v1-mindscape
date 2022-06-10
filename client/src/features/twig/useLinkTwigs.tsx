import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useCallback } from 'react';
import { sessionVar } from '../../cache';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SpaceType } from '../space/space';
import { useSnackbar } from 'notistack';
import { Box, IconButton } from '@mui/material';
import { getColor } from '../../utils';
import CloseIcon from '@mui/icons-material/Close';
import { selectMode } from '../window/windowSlice';
import { addArrows, selectCreateLink, setCreateLink } from '../arrow/arrowSlice';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { addTwigs } from './twigSlice';
import { Arrow } from '../arrow/arrow';
import { ROLE_FIELDS } from '../role/roleFragments';

const LINK_TWIGS = gql`
  mutation LinkTwigs($sessionId: String!, $abstractId: String!, $sourceId: String!, $targetId: String!) {
    linkTwigs(sessionId: $sessionId, abstractId: $abstractId, sourceId: $sourceId, targetId: $targetId) {
      abstract {
        id
        twigN
        twigZ
      }
      twig {
        ...FullTwigFields
      }
      source {
        id
        outCount
      }
      target {
        id
        inCount
      }
      role {
        ...RoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${ROLE_FIELDS}
`
export default function useLinkTwigs(space: SpaceType, abstract: Arrow) {
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);

  const mode = useAppSelector(selectMode);
  const color = getColor(mode, true);

  const createLink = useAppSelector(selectCreateLink);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [link] = useMutation(LINK_TWIGS, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(setCreateLink({
        sourceId: '',
        targetId: '',
      }));

      dispatch(addTwigs({
        space,
        twigs: [data.linkTwigs.twig]
      }));

      dispatch(addArrows({
        space,
        arrows: [data.linkTwigs.twig.detail]
      }))

      const handleDismissClick = (event: React.MouseEvent) => {
        closeSnackbar(data.linkTwigs.twig.id);
      }
      enqueueSnackbar('Link created', {
        key: data.linkTwigs.twig.id,
        action: () => {
          return (
            <Box>
              <IconButton onClick={handleDismissClick} sx={{
                color,
              }}>
                <CloseIcon sx={{
                  fontSize: 14,
                }}/>
              </IconButton>
            </Box>
          );
        }
      });
    }
  });

  const linkTwigs = useCallback((detail?: any) => {
    link({
      variables: {
        sessionId: sessionDetail.id,
        abstractId: abstract.id,
        sourceId: detail?.sourceId || createLink.sourceId,
        targetId: detail?.targetId || createLink.targetId,
      },
    });
  }, [link, abstract.id, createLink.sourceId, createLink.targetId]);

  return { linkTwigs }
}