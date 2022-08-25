import { Box, Paper } from '@mui/material';
import { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { APP_BAR_HEIGHT } from '../../constants';
import AccountComponent from '../account/AccountComponent';
import SearchComponent from '../search/SearchComponent';

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
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      marginTop: `${APP_BAR_HEIGHT}px`,
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
        <SearchComponent />
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