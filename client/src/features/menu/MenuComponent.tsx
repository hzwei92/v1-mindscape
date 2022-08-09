import { Box, Paper } from '@mui/material';
import { useContext, useState } from 'react';
import { AppContext } from '../../App';
import AccountComponent from '../account/AccountComponent';

export default function MenuComponent() {
  const {
    dimColor: color, 
    menuWidth, 
    menuIsResizing, 
    setMenuIsResizing,
  } = useContext(AppContext);

  const [showResizer, setShowResizer] = useState(false);

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    setMenuIsResizing(true);
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'stretch',
      width: menuWidth,
      transition: menuIsResizing
        ? 'none'
        : 'width 0.5s'
    }}>
      <Paper sx={{
        height: '100%',
        width: 'calc(100% - 4px)',
        color,
      }}>
        <AccountComponent />
      </Paper>
      <Box 
        onMouseDown={handleResizeMouseDown}
        onMouseEnter={handleResizeMouseEnter}
        onMouseLeave={handleResizeMouseLeave} 
          sx={{
          width: 4,
          backgroundColor: showResizer
            ? 'primary.main'
            : color,
          cursor: 'col-resize'
        }}
      />
    </Box>
  )
}