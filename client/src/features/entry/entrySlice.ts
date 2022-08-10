import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { IdToType } from '../../types';
import { Entry } from './entry';

export interface EntryState {
  idToEntry: IdToType<Entry>;
  newEntryId: string;
};

const initialState: EntryState = {
  idToEntry: {},
  newEntryId: '',
};

export const entrySlice = createSlice({
  name: 'entry',
  initialState,
  reducers: {
    mergeIdToEntry: (state, action: PayloadAction<IdToType<Entry>>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          ...action.payload,
        },
      }
    },
    addEntry: (state, action: PayloadAction<Entry>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          [action.payload.id]: action.payload,
        },
      };
    },
    updateEntry: (state, action: PayloadAction<Entry>) => {
      return {
        ...state,
        idToEntry: {
          ...state.idToEntry,
          [action.payload.id]: action.payload,
        },
      };
    },
    removeEntries: (state, action: PayloadAction<string[]>) => {
      const idToEntry = {
        ...state.idToEntry,
      };
      action.payload.forEach(entryId => {
        delete idToEntry[entryId];
      });
      return {
        ...state,
        idToEntry,
      };
    },
    entryStartNew: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        newEntryId: action.payload,
      }
    },
    entryFinishNew: (state, action: PayloadAction<string>) => {
      return {
        idToEntry: {
          ...state.idToEntry,
          [state.newEntryId]: {
            ...state.idToEntry[state.newEntryId],
            linkId: action.payload,
          },
        },
        newEntryId: '',
      }
    },
  },
});

export const {
  mergeIdToEntry,
  addEntry,
  updateEntry,
  removeEntries,
  entryStartNew,
  entryFinishNew,
} = entrySlice.actions;

export const selectIdToEntry = (state: RootState) => state.entry.idToEntry;
export const selectNewEntryId = (state: RootState) => state.entry.newEntryId;

export default entrySlice.reducer