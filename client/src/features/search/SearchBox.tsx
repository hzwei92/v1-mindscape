import {
  Box,
  FormControl,
  OutlinedInput,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useContext } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { searchPushSlice, searchSpliceSlice, selectSearchSlice } from './searchSlice';
import { AppContext } from '../../App';

interface SearchBoxProps {
  currentRefinement: string;
  isSearchStalled: boolean;
  refine: any;
}

function SearchBox(props: SearchBoxProps) {
  const {
    menuIsResizing,
    menuWidth,
    brightColor: color,
  } = useContext(AppContext);

  const slice = useAppSelector(selectSearchSlice);
  const dispatch = useAppDispatch();


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(searchSpliceSlice({
      ...slice,
      query: event.target.value,
    }));
  }

  const refineQuery = () => {
    const query = slice.query;
    dispatch(searchPushSlice({
      originalQuery: query, 
      query, 
      entryIds: [],
      userIds: [],
    }));
    props.refine(slice.query);
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      refineQuery();
    }
  }

  if (!slice) return null;
  return (
    <FormControl variant={'outlined'}>
      <OutlinedInput
        sx={{
          height: 30, 
          width: menuWidth - 90,
          fontSize: 14,
          transition: menuIsResizing
            ? 'none'
            : 'width 0.5s',
        }}
        id='query'
        type={'text'}
        value={slice.query}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        endAdornment={
          <InputAdornment position='end' sx={{
            marginRight: -1,
            color,
          }}> 
            <IconButton color='inherit' size='small' title='Search' onClick={refineQuery}>
              <SearchIcon fontSize='inherit'/>
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  )
}

const CustomSearchBox = connectSearchBox(SearchBox)

export default CustomSearchBox