import { Box, Paper } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getColor } from '../../utils';
import AccountComponent from '../account/AccountComponent';
import { User } from '../user/user';
import { selectMode } from '../window/windowSlice';
import { selectMenuIsResizing, selectMenuMode, selectMenuWidth, setMenuIsResizing } from './menuSlice';

interface MenuComponentProps {
  user: User | null;
}
export default function MenuComponent(props: MenuComponentProps) {
  const menuMode = useAppSelector(selectMenuMode);
  const width = useAppSelector(selectMenuWidth);
  const isResizing = useAppSelector(selectMenuIsResizing);
  const mode = useAppSelector(selectMode);

  const color = getColor(mode);

  const [showResizer, setShowResizer] = useState(false);

  const dispatch = useAppDispatch();

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    dispatch(setMenuIsResizing(true));
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'stretch',
      width: menuMode 
        ? width
        : 0,
      transition: isResizing
        ? 'none'
        : 'width 0.5s'
    }}>
      <Paper sx={{
        height: '100%',
        width: 'calc(100% - 4px)',
        color,
      }}>
        <AccountComponent user={props.user} />
      </Paper>
      <Box 
        onMouseDown={handleResizeMouseDown}
        onMouseEnter={handleResizeMouseEnter}
        onMouseLeave={handleResizeMouseLeave} 
          sx={{
          width: 4,
          backgroundColor: showResizer
            ? 'primary.main'
            : mode === 'dark'
              ? 'dimgrey'
              : 'lavender',
          cursor: 'col-resize'
        }}
      />
    </Box>
  )
}