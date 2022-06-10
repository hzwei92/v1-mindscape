import { gql } from '@apollo/client';

export const VOTE_FIELDS = gql`
  fragment VoteFields on Vote {
    id
    userId
    edgeId
    clicks
    tokens
    weight
    createDate
    deleteDate
  }
`;