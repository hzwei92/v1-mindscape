import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { sessionVar } from '../../cache';
import { useSnackbar } from 'notistack';
import { Box, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { FULL_TWIG_FIELDS } from './twigFragments';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SpaceContext } from '../space/SpaceComponent';
import { mergeTwigs } from './twigSlice';
import { mergeArrows } from '../arrow/arrowSlice';

const REPLY_TWIG = gql`
  subscription ReplyTwig($sessionId: String!, $abstractId: String!) {
    replyTwig(sessionId: $sessionId, abstractId: $abstractId) {
      abstract {
        id
        twigZ
        twigN
        updateDate
      }
      source {
        id
        outCount
      }
      link {
        ...FullTwigFields
      }
      target {
        ...FullTwigFields
      }
      role {
        ...FullRoleFields
      }
    }
  }
  ${FULL_TWIG_FIELDS}
  ${FULL_ROLE_FIELDS}
`;

export default function useReplyTwigSub() {
  //console.log('sub'); // TODO prevent re-rendering
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    user,
    palette,
  } = useContext(AppContext);

  const {
    space,
    abstract,
  } = useContext(SpaceContext);

  const sessionDetail = useReactiveVar(sessionVar);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useSubscription(REPLY_TWIG, {
    variables: {
      sessionId: sessionDetail.id,
      abstractId: abstract?.id,
    },
    onSubscriptionData: ({subscriptionData: {data: {replyTwig}}}) => {
      console.log(replyTwig);

      const {
        abstract, 
        source,
        link,
        target,
        role,
      } = replyTwig;

      dispatch(mergeTwigs({
        space,
        twigs: [link, target]
      }));

      dispatch(mergeArrows([abstract, source]));

      const handleClick = (event: React.MouseEvent) => {
        if (!user) return;
      }

      const handleDismissClick = (event: React.MouseEvent) => {
        closeSnackbar(target.id);
      }
      enqueueSnackbar(`${target.i}. u/${target.user.name}`, {
        key: target.id,
        action: () => {
          return (
            <Box>
              <Button onClick={handleClick} sx={{
                color: target.user.color,
              }}>
                View
              </Button>
              <IconButton onClick={handleDismissClick} sx={{
                color: palette === 'dark'
                  ? '#000000'
                  : '#ffffff',
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
}