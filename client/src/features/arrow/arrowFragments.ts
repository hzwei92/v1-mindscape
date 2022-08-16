import { gql } from '@apollo/client';
import { FULL_ROLE_FIELDS } from '../role/roleFragments';
import { SHEAF_FIELDS } from '../sheaf/sheafFragments';

export const ARROW_FIELDS = gql`
  fragment ArrowFields on Arrow {
    id
    routeName
    draft
    text
    title
    url
    userId
    inCount
    outCount
    abstractId
    sourceId
    targetId
    sheafId
    twigN
    twigZ
    rootTwigId
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
    sheaf {
      ...SheafFields
    }
    user {
      id
      name
      email
      verifyEmailDate
      color
    }
  }
  ${ARROW_FIELDS}
  ${SHEAF_FIELDS}
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
