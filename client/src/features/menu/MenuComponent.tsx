import { Box, Paper } from '@mui/material';
import { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { APP_BAR_HEIGHT, MAX_Z_INDEX } from '../../constants';
import SearchComponent from '../search/SearchComponent';
import GraphsComponent from '../graphs/GraphsComponent';

export default function MenuComponent() {
  const {
    dimColor: color, 
    menuWidth,
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
      position: 'fixed',
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      marginTop: `${APP_BAR_HEIGHT}px`,
      display: 'flex',
      flexDirection: 'row',
      zIndex: MAX_Z_INDEX + 1000,
      width: menuWidth,
      // transition: menuIsResizing
      //   ? 'none'
      //   : 'width .5s'
    }}>
      <Paper sx={{
        height: '100%',
        width: 'calc(100% - 4px)',
        color,
      }}>
        <SearchComponent />
        <GraphsComponent />
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