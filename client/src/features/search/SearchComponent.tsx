import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch';
import { useContext, useEffect, useRef, useState } from 'react';
import { Box, Card, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CustomSearchBox from './SearchBox';
import CustomHits from './Hits';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME, APP_BAR_HEIGHT, MAX_Z_INDEX } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchGoBack, searchGoForward, searchRefresh, selectSearchIndex, selectSearchShouldRefresh, selectSearchSlice, selectSearchStack } from './searchSlice';
import EntryTree from '../entry/EntryTree';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';

export default function SearchComponent() {
  const dispatch = useAppDispatch();
  
  const {
    setSearchMenuIsResizing,
    searchMenuWidth,
    menuMode,
    setMenuMode,

    brightColor: color,
  } = useContext(AppContext);

  const stack = useAppSelector(selectSearchStack);
  const index = useAppSelector(selectSearchIndex);
  const slice = useAppSelector(selectSearchSlice);

  const shouldRefreshDraft = useAppSelector(selectSearchShouldRefresh);
  const [searchClient, setSearchClient] = useState(null as SearchClient | null);

  const containerEl = useRef<HTMLElement>();
 
  const [showResizer, setShowResizer] = useState(false);

  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY))
  }, []);

  useEffect(() => {
    if (shouldRefreshDraft) {
      dispatch(searchRefresh(false));
    }
  }, [shouldRefreshDraft])

  const handleBackClick = (event: React.MouseEvent) => {
    dispatch(searchGoBack());
  };

  const handleForwardClick = (event: React.MouseEvent) => {
    dispatch(searchGoForward());
  };

  const handleClose = () => {
    setMenuMode(MenuMode.NONE);
  };

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    setSearchMenuIsResizing(true);
  };

  if (!searchClient || menuMode !== MenuMode.SEARCH) return null;

  return (
    <Box sx={{
      position: 'fixed',
      height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
      marginTop: `${APP_BAR_HEIGHT}px`,
      display: 'flex',
      flexDirection: 'row',
      zIndex: MAX_Z_INDEX + 1000,
      width: searchMenuWidth,
      // transition: menuIsResizing
      //   ? 'none'
      //   : 'width .5s'
    }}>
      <Paper sx={{
        height: '100%',
        width: 'calc(100% - 4px)',
        color,
      }}>
        <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
          <Card elevation={5} sx={{
            display: menuMode === MenuMode.SEARCH
              ? 'flex'
              : 'none',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: searchMenuWidth ? 1 : 0,
            marginBottom: 0,
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            color,
          }}>
            <Box sx={{ whiteSpace: 'nowrap', paddingRight: 1,}}>
              <IconButton
                title='Go back'
                disabled={index <= 0} 
                size='small'
                color='inherit'
                onClick={handleBackClick}
              >
                <ArrowBackIcon fontSize='inherit' />
              </IconButton>
              <IconButton
                title='Go forward'
                disabled={index >= stack.length - 1} 
                size='small'
                color='inherit'
                onClick={handleForwardClick}
              >
                <ArrowForwardIcon fontSize='inherit' />
              </IconButton> 
            </Box>
            <Box> 
              <CustomSearchBox defaultRefinement='5fda8f9c-42a0-4b42-bad0-ef30b0af14b0'/>
              <CustomHits />
            </Box>
            <Box>
              <IconButton onClick={handleClose} sx={{
                fontSize: 16,
              }}>
                <CloseIcon fontSize='inherit' />
              </IconButton>
            </Box>
          </Card>
          <Box ref={containerEl} sx={{
            display: menuMode === MenuMode.SEARCH
              ? 'block'
              : 'none',
            height: 'calc(100% - 50px)',
            width: '100%',
            overflowY: 'scroll',
          }}>
            { 
              slice.entryIds.map((entryId) => {
                return (
                  <EntryTree
                    key={`surveyor-search-tree-${entryId}`}
                    entryId={entryId}
                    depth={0}
                  />
                );
              })
            }
            <Box sx={{height: '10px'}}/>
          </Box>
        </InstantSearch>
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