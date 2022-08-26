import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import React, { useContext } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { sessionVar } from '../../cache';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import useCenterTwig from '../twig/useCenterTwig';
import { AppContext } from '../../App';
import { mergeArrows, selectArrowIdToInstanceIds, selectIdToArrow, selectIdToInstance, updateInstance } from './arrowSlice';
import { SpaceType } from '../space/space';
import { ContentState, convertFromRaw } from 'draft-js';

const SAVE_ARROW = gql`
  subscription SaveArrow($sessionId: String!, $userId: String!, $arrowIds: [String!]!) {
    saveArrow(sessionId: $sessionId, userId: $userId, arrowIds: $arrowIds) {
      id
      draft
      saveDate
    }
  }
`
export default function useSaveArrowSub() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    user,
    palette,
  } = useContext(AppContext);

  const sessionDetail = useReactiveVar(sessionVar);

  const idToArrow = useAppSelector(selectIdToArrow);

  const arrowIdToInstanceIds = useAppSelector(selectArrowIdToInstanceIds);
  const idToInstance = useAppSelector(selectIdToInstance);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { centerTwig: centerFrameTwig } = useCenterTwig(SpaceType.FRAME);
  const { centerTwig: centerFocusTwig } = useCenterTwig(SpaceType.FOCUS);

  useSubscription(SAVE_ARROW, {
    shouldResubscribe: true,
    variables: {
      sessionId: sessionDetail.id,
      userId: user?.id,
      arrowIds: Object.keys(arrowIdToInstanceIds),
    },
    onSubscriptionData: ({subscriptionData: {data: {saveArrow}}}) => {
      console.log(saveArrow);

      dispatch(mergeArrows([saveArrow]));

      const arrow = idToArrow[saveArrow.id];

      const instanceIds = arrowIdToInstanceIds[saveArrow.id];

      instanceIds.forEach(id => {
        dispatch(updateInstance({
          ...idToInstance[id],
          shouldRefreshDraft: true,
        }))
      });

      const handleClick = (event: React.MouseEvent) => {
        closeSnackbar(arrow.id);
      }

      const handleDismissClick = (event: React.MouseEvent) => {
        closeSnackbar(arrow.id);
      }
      
      const contentState = convertFromRaw(JSON.parse(saveArrow.draft)) as ContentState;
      let text = contentState.getPlainText('\n')
      const index = Math.min(20, text.indexOf('\n'));
      text = text.slice(0, index);
      if (text.length > index) {
        text += '...'
      }
      enqueueSnackbar(` u/${arrow.user.name}: ${text}`, {
        key: arrow.id,
        action: key => {
          return (
            <Box>
              <Button onClick={handleClick} sx={{
                color: arrow.user.color,
              }}>
                View
              </Button>
              <IconButton onClick={handleDismissClick} sx={{
                color: palette === 'dark'
                  ? '#ffffff'
                  : '#000000',
              }}>
                <CloseIcon sx={{
                  fontSize: 14,
                }}/>
              </IconButton>
            </Box>
          );
        }
      });
    },
  });
}