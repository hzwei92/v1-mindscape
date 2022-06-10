import { gql } from '@apollo/client';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';

export const TWIG_FIELDS = gql`
  fragment TwigFields on Twig {
    id
    userId
    abstractId
    detailId
    i
    x
    y
    z
    isPinned
    createDate
    updateDate
    deleteDate
  }
`;

export const FULL_TWIG_FIELDS = gql`
  fragment FullTwigFields on Twig {
    ...TwigFields
    user {
      id
      name
      email
      verifyEmailDate
      color
    }
    detail {
      ...FullArrowFields
    }
    parent {
      id
      detailId
    }
    children {
      id
      detailId
    }
  }
  ${TWIG_FIELDS}
  ${FULL_ARROW_FIELDS}
`;


export const TWIG_WITH_COORDS = gql`
  fragment TwigWithCoords on Twig {
    id
    x
    y
  }
`;

export const TWIG_WITH_PARENT = gql`
  fragment TwigWithParent on Twig {
    id
    parent {
      id
    }
  }
`;