import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IdToType } from "../../types";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeTwigs } from "../twig/twigSlice";
import { setCurrentUser } from "../user/userSlice";
import type { Arrow } from "./arrow";

export interface ArrowState {
  idToArrow: IdToType<Arrow>;
  urlToArrowId: IdToType<string>;
};

const initialState: ArrowState = {
  idToArrow: {},
  urlToArrowId: {},
};

const arrowSlice = createSlice({
  name: 'arrow',
  initialState,
  reducers: {
    mergeArrows: (state, action: PayloadAction<Arrow[]>) => {
      return action.payload.reduce((acc, arrow) => {
        if (arrow?.id) {
          acc.idToArrow[arrow.id] = arrow;

          if (arrow.url) {
            acc.urlToArrowId[arrow.url] = arrow.id
          }
        } 
        return acc;
      }, {
        idToArrow: { ...state.idToArrow },
        urlToArrowId: { ...state.urlToArrowId },
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setInit, (state, action) => {
        if (!action.payload) {
          return initialState;
        }
      })
      .addCase(setLogin, (state, action) => {
        return [action.payload.frame, action.payload.focus].reduce((acc, arrow) => {
          if (arrow?.id) {
            acc.idToArrow[arrow.id] = arrow;

            if (arrow.url) {
              acc.urlToArrowId[arrow.url] = arrow.id
            }
          } 
          return acc;
        }, {
          idToArrow: {} as IdToType<Arrow>,
          urlToArrowId: {} as IdToType<string>,
        });
      })
      .addCase(setLogout, () => {
        return initialState;
      })
      .addCase(setCurrentUser, (state, action) => {
        return [action.payload?.frame, action.payload?.focus].reduce((acc, arrow) => {
          if (arrow?.id) {
            acc.idToArrow[arrow.id] = arrow;
            
            if (arrow.url) {
              acc.urlToArrowId[arrow.url] = arrow.id
            }
          } 
          return acc;
        }, {
          idToArrow: { ...state.idToArrow },
          urlToArrowId: { ...state.urlToArrowId },
        });
      })
      .addCase(mergeTwigs, (state, action) => {
        return action.payload.twigs.reduce((acc, twig) => {
          if (twig.detail) {
            if (twig.detail.deleteDate) {
              delete acc.idToArrow[twig.detail.id];
              if (twig.detail.url) {
                delete acc.urlToArrowId[twig.detail.url];
              }
            }
            else {
              acc.idToArrow[twig.detail.id] = Object.assign({}, 
                acc.idToArrow[twig.detail.id], 
                twig.detail
              );
              if (twig.detail.url) {
                acc.urlToArrowId[twig.detail.url] = twig.detail.id;
              }
            }
          }
          return acc;
        }, {
          idToArrow: { ...state.idToArrow },
          urlToArrowId: { ...state.urlToArrowId },
        });
      })
  }
});

export const { mergeArrows } = arrowSlice.actions;
export const selectIdToArrow = (state: RootState) => state.arrow.idToArrow;
export const selectUrlToArrowId = (state: RootState) => state.arrow.urlToArrowId;

export const selectArrow = createSelector(
  [
    selectIdToArrow,
    (state, id: string | null | undefined) => id,
  ],
  (idToArrow, id): Arrow | null => {
    if (id) {
      return idToArrow[id];
    }
    return null;
  }
);

export default arrowSlice.reducer;