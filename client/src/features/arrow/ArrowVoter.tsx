import { Box, Button, IconButton } from '@mui/material';
import { useContext, useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import type { Arrow } from './arrow';
import { Vote } from '../vote/vote';
import { AppContext } from '../../App';
import { useAppSelector } from '../../app/hooks';
import { selectVotesByArrowId } from '../vote/voteSlice';
import useVoteArrow from '../vote/useVoteArrow';

interface ArrowVoterProps {
  arrow: Arrow;
}
export default function ArrowVoter(props: ArrowVoterProps) {
  const { 
    user, 
    dimColor: color,
  } = useContext(AppContext);

  const [isVoting, setIsVoting] = useState(false);

  const votes = useAppSelector(state => selectVotesByArrowId(state, props.arrow.id));

  let userVote = null as Vote | null;
  votes.some(vote => {
    if (vote && !vote.deleteDate && vote.userId === user?.id) {
      userVote = vote;
    }
    return !!userVote;
  });

  const { voteArrow } = useVoteArrow(() => {
    setIsVoting(false);
  });


  const handleVoteClick = (clicks: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsVoting(true);
    voteArrow(props.arrow.id, clicks);
  }

  const handleButtonMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '10px',
      marginLeft: '-4px',
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <IconButton
          disabled={isVoting || userVote?.weight === 10}
          size='small' 
          onMouseDown={handleButtonMouseDown}
          onClick={handleVoteClick(
            userVote
              ? userVote?.weight + 1
              : 1
          )}
          sx={{
            color: (userVote?.weight || 0) > 0
              ? user?.color
              : color,
          }}
        >
          { 
            (userVote?.weight || 0) > 0
              ? <KeyboardDoubleArrowUpIcon fontSize='inherit' />
              : <KeyboardArrowUpIcon fontSize='inherit' />
          }
        </IconButton>
      </Box>

      <Button
        disabled={isVoting}
        onMouseDown={handleButtonMouseDown}
        color='inherit'
        size='small'
        title={`${(userVote?.weight || 0) > 0 ? '+' : ''}${userVote?.weight || 0}`}
        sx={{
          minWidth: '40px',
          color,
          fontSize: 14,
        }}
      >
        { props.arrow.weight }
      </Button>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <IconButton
          onMouseDown={handleButtonMouseDown}
          disabled={isVoting || userVote?.weight === -10}
          size='small' 
          onClick={handleVoteClick(
            userVote
              ? userVote?.weight - 1
              : -1
          )}
          sx={{
            color: (userVote?.weight || 0) < 0
              ? user?.color
              : color,
          }}
        >
          {
            (userVote?.weight || 0) < 0
              ? <KeyboardDoubleArrowDownIcon fontSize='inherit' />
              : <KeyboardArrowDownIcon fontSize='inherit' />
          }
        </IconButton>
      </Box>

    </Box>
  )
}