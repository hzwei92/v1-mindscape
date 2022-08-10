import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch';
import { useContext, useEffect, useRef, useState } from 'react';
import { Box, Card, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import CustomSearchBox from './SearchBox';
import CustomHits from './Hits';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchGoBack, searchGoForward, searchRefresh, selectSearchIndex, selectSearchShouldRefresh, selectSearchSlice, selectSearchStack } from './searchSlice';
import EntryTree from '../entry/EntryTree';
import { AppContext } from '../../App';
import { MenuMode } from '../menu/menu';

export default function SearchComponent() {
  const {
    menuIsResizing,
    menuMode,
    setMenuMode,
    brightColor: color,
  } = useContext(AppContext);

  const stack = useAppSelector(selectSearchStack);
  const index = useAppSelector(selectSearchIndex);
  const slice = useAppSelector(selectSearchSlice);

  console.log('slice', slice)

  const shouldRefreshDraft = useAppSelector(selectSearchShouldRefresh);
  const dispatch = useAppDispatch();
  const [searchClient, setSearchClient] = useState(null as SearchClient | null);

  const containerEl = useRef<HTMLElement>();
 
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

  if (!searchClient) return null;

  return (
    <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
      <Card elevation={5} sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 1,
        marginBottom: 0,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        color,
        transition: menuIsResizing
          ? 'none'
          : 'width 0.5s',
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
  )
}