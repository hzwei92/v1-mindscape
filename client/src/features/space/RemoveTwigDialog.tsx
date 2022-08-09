import { Box, Button, Card, Dialog, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { useAppSelector } from '../../app/hooks';
import { selectIdToDescIdToTrue, selectIdToTwig } from '../twig/twigSlice';
import useRemoveTwig from '../twig/useRemoveTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { SpaceContext } from './SpaceComponent';

export default function RemoveTwigDialog() {
  const { 
    brightColor: color,
  } = useContext(AppContext);

  const { 
    space,
    abstract,
    removalTwigId, 
    setRemovalTwigId,
    canEdit,
  } = useContext(SpaceContext);

  const idToTwig = useAppSelector(selectIdToTwig(space));
  const idToDescIdToTrue = useAppSelector(selectIdToDescIdToTrue(space));

  const { removeTwig } = useRemoveTwig();
  const { selectTwig } = useSelectTwig(space, canEdit);

  const handleClose = () => {
    setRemovalTwigId('');
  };

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!removalTwigId) return;
    const removalTwig = idToTwig[removalTwigId]

    selectTwig(abstract, idToTwig[removalTwig.parent.id]);

    removeTwig(removalTwig, false);

    handleClose();
  }

  const handleRemoveSubtreeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!removalTwigId) return;
    const removalTwig = idToTwig[removalTwigId]

    selectTwig(abstract, idToTwig[removalTwig.parent.id]);

    removeTwig(removalTwig, true);

    handleClose();
  }

  const descIds = Object.keys(idToDescIdToTrue[removalTwigId] || {});

  return (
    <Dialog open={!!removalTwigId} onClose={handleClose}>
      <Card elevation={5} sx={{
        padding: 2,
      }}>
        <Typography variant='overline'>
          Remove
          {
            descIds.length
              ? ' subtree'
              : ' post'
          }
        </Typography>
        <Box sx={{
          marginTop: 2,
          marginBottom: 3,
        }}>
          Remove this post.
          {
            descIds.length
              ? ' Or, remove it along with its ' + descIds.length + ' descendant' + (descIds.length === 1 ? '.' : 's.')
              : ''
          }
          <br/><br/>
          This does not delete the post, it merely removes it from this view.
          <br/><br/>
          To delete a post open the More Options menu on the post.
        </Box>
        <Box>
          <Button variant='contained' onClick={handleRemoveClick}>
            Remove post
          </Button>
          {
            descIds.length 
              ? <Button variant='contained' onClick={handleRemoveSubtreeClick} sx={{
                  marginLeft: 1.5,
                }}>
                  Remove subtree
                </Button>
              : null
          }
          &nbsp;
          &nbsp;
          <Button onClick={handleClose} sx={{
            color,
          }}>
            Cancel
          </Button>
        </Box>
      </Card>
    </Dialog>
  )
}