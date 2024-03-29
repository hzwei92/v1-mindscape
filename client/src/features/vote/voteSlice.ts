import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IdToType } from "../../types";
import { setInit, setLogin, setLogout } from "../auth/authSlice";
import { mergeTwigs } from "../twig/twigSlice";
import { setCurrentUser } from "../user/userSlice";
import { mergeArrows } from "../arrow/arrowSlice";
import { Vote } from "./vote";

export interface VoteState {
  idToVote: IdToType<Vote>;
  arrowIdToVoteIds: IdToType<string[]>;
};

const initialState: VoteState = {
  idToVote: {},
  arrowIdToVoteIds: {},
};

const arrowSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    mergeVotes: (state, action: PayloadAction<Vote[]>) => {
      const {
        idToVote,
        arrowIdToVoteIds,
      } = action.payload.reduce((acc, vote) => {
        if (vote.deleteDate) {
          if (vote.id) {
            delete acc.idToVote[vote.id];
            if (vote.arrowId) {
              acc.arrowIdToVoteIds[vote.arrowId] = acc.arrowIdToVoteIds[vote.arrowId]
                .filter(voteId => voteId !== vote.id);
            }
          }
        }
        else {
          if (vote.id) {
            acc.idToVote[vote.id] = {
              ...acc.idToVote[vote.id], 
              ...vote,
            };
            if (vote.arrowId) {
              acc.arrowIdToVoteIds[vote.arrowId] = [
                ...(acc.arrowIdToVoteIds[vote.arrowId] || []), 
                vote.id
              ];
            }
          }
        }
        return acc;
      } , {
        idToVote: { ...state.idToVote },
        arrowIdToVoteIds: { ...state.arrowIdToVoteIds },
      });

      return {
        ...state,
        idToVote,
        arrowIdToVoteIds,
      };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(setInit, (state, action) => {
        if (!action.payload) {
          return initialState;
        }
      })
      // .addCase(setLogin, (state, action) => {
      //   const {
      //     idToVote,
      //     arrowIdToVoteIds,
      //   } = [action.payload.frame, action.payload.focus].reduce((acc, arrow) => {
      //     if (arrow?.votes) {
      //       acc.arrowIdToVoteIds[arrow.id] = [];

      //       arrow.votes.forEach(vote => {
      //         acc.arrowIdToVoteIds[arrow.id].push(vote.id);
      //         acc.idToVote[vote.id] = vote;
      //       });
      //     } 
      //     return acc;
      //   }, {
      //     idToVote: {} as IdToType<Vote>,
      //     arrowIdToVoteIds: {} as IdToType<string[]>,
      //   });

      //   return {
      //     ...state,
      //     idToVote,
      //     arrowIdToVoteIds,
      //   };
      // })
      .addCase(setLogout, () => {
        return initialState;
      })
      // .addCase(setCurrentUser, (state, action) => {
      //   const {
      //     idToVote,
      //     arrowIdToVoteIds,
      //   } = [action.payload?.frame, action.payload?.focus].reduce((acc, arrow) => {
      //     if (arrow?.votes?.length) {
      //       acc.arrowIdToVoteIds[arrow.id] = [];

      //       arrow.votes.forEach(vote => {
      //         acc.arrowIdToVoteIds[arrow.id].push(vote.id);
      //         acc.idToVote[vote.id] = vote;
      //       });
      //     } 
      //     return acc;
      //   }, {
      //     idToVote: {} as IdToType<Vote>,
      //     arrowIdToVoteIds: {} as IdToType<string[]>,
      //   });

      //   return {
      //     ...state,
      //     idToVote,
      //     arrowIdToVoteIds,
      //   };
      // })
      .addCase(mergeTwigs, (state, action) => {
        const {
          idToVote,
          arrowIdToVoteIds,
        } = action.payload.twigs.reduce((acc, twig) => {
          if (twig.detail?.votes?.length) {
            acc.arrowIdToVoteIds[twig.detail.id] = [...(acc.arrowIdToVoteIds[twig.detail.id] || [])];
            
            twig.detail.votes.forEach(vote => {
              acc.arrowIdToVoteIds[twig.detail.id].push(vote.id);

              acc.idToVote[vote.id] = {
                ...acc.idToVote[vote.id], 
                ...vote,
              };
            });
          }
          return acc;
        }, {
          idToVote: { ...state.idToVote },
          arrowIdToVoteIds: { ...state.arrowIdToVoteIds },
        });

        return {
          ...state,
          idToVote,
          arrowIdToVoteIds,
        }
      })
      .addCase(mergeArrows, (state, action) => {
        const {
          idToVote,
          arrowIdToVoteIds,
        } = action.payload.reduce((acc, arrow) => {
          if (arrow.votes?.length) {
            acc.arrowIdToVoteIds[arrow.id] = [...(acc.arrowIdToVoteIds[arrow.id] || [])];
            arrow.votes.forEach(vote => {
              acc.arrowIdToVoteIds[arrow.id].push(vote.id);

              acc.idToVote[vote.id] = {
                ...acc.idToVote[vote.id], 
                ...vote,
              };
            });
          }
          return acc;
        }, {
          idToVote: { ...state.idToVote },
          arrowIdToVoteIds: { ...state.arrowIdToVoteIds },
        });

        return {
          ...state,
          idToVote,
          arrowIdToVoteIds,
        }
      })
  }
});

export const {
  mergeVotes,
} = arrowSlice.actions;

export const selectIdToVote = (state: RootState) => state.vote.idToVote;
export const selectArrowIdToVoteIds = (state: RootState) => state.vote.arrowIdToVoteIds;

export const selectVoteById = createSelector(
  [
    selectIdToVote,
    (state, id: string | null | undefined) => id,
  ],
  (idToVote, id): Vote | null => {
    if (id) {
      return idToVote[id] || null;
    }
    return null;
  }
);

export const selectVoteIdsByArrowId = createSelector(
  [
    selectArrowIdToVoteIds,
    (state, arrowId: string | null | undefined) => arrowId,
  ],
  (arrowIdToVoteIds, arrowId): string[] => {
    if (arrowId) {
      return arrowIdToVoteIds[arrowId] || [];
    }
    return [];
  }
);

export const selectVotesByArrowId = createSelector(
  [
    (state, arrowId) => selectVoteIdsByArrowId(state, arrowId),
    selectIdToVote,
  ],
  (voteIds, idToVote): Vote[] => {
    return voteIds.map(id => idToVote[id]);
  }
);

export default arrowSlice.reducer;