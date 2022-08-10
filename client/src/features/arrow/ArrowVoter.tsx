import { Box, Button, IconButton } from '@mui/material';
import { useContext, useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import type { Arrow } from './arrow';
import { Vote } from '../vote/vote';
import { AppContext } from '../../App';

interface ArrowVoterProps {
  arrow: Arrow;
}
export default function ArrowVoter(props: ArrowVoterProps) {
  const { 
    user, 
    dimColor: color,
  } = useContext(AppContext);

  const [isVoting, setIsVoting] = useState(false);

  let userVote = null as Vote | null;
  // (props.arrow.votes || []).some(vote => {
  //   if (vote.userId === props.user?.id) {
  //     userVote = vote;
  //     return true;
  //   }
  //   return false;
  // });


  const handleVoteClick = (clicks: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsVoting(true);
  }
  const handleButtonMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '10px',
      marginLeft: '2px',
      marginRight: '-5px',
    }}>
      <IconButton
        disabled={isVoting}
        size='small' 
        onMouseDown={handleButtonMouseDown}
        onClick={handleVoteClick(
          userVote && userVote.weight === 1 
            ? 0
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
      <Button
        disabled={isVoting}
        onMouseDown={handleButtonMouseDown}
        color='inherit'
        size='small'
        sx={{
          minWidth: 0,
          color,
          fontSize: 14,
        }}
      >
        &nbsp;{ props.arrow?.weight || 0 }&nbsp;
      </Button>
      <IconButton
        onMouseDown={handleButtonMouseDown}
        disabled={isVoting}
        size='small' 
        onClick={handleVoteClick(
          userVote && userVote.weight === -1
            ? 0
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
  )
}