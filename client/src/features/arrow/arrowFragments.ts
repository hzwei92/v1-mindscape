import { gql } from '@apollo/client';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';


export const ARROW_FIELDS = gql`
  fragment ArrowFields on Arrow {
    id
    routeName
    draft
    text
    color
    userId
    inCount
    outCount
    abstractId
    sourceId
    targetId
    twigN
    twigZ
    canEdit
    canPost
    canTalk
    canHear
    canView
    lng
    lat
    city
    state
    country
    clicks
    tokens
    weight
    isOpaque
    saveDate
    commitDate
    removeDate
    createDate
    updateDate
    deleteDate
  }
`;

export const FULL_ARROW_FIELDS = gql`
  fragment FullArrowFields on Arrow {
    ...ArrowFields
    user {
      id
      name
      email
      verifyEmailDate
      color
    }
  }
  ${ARROW_FIELDS}
`;


export const ABSTRACT_ARROW_FIELDS = gql`
  fragment AbstractArrowFields on Arrow {
    ...FullArrowFields
    roles {
      ...FullRoleFields
    }
  }
  ${FULL_ARROW_FIELDS}
  ${FULL_ROLE_FIELDS}
`;
