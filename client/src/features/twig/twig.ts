import { Arrow } from '../arrow/arrow';
import { User } from '../user/user';

export type Twig = {
  id: string;
  userId: string;
  user: User;
  abstractId: string;
  abstract: Arrow;
  detailId: string;
  detail: Arrow;
  parent: Twig;
  children: Twig[];
  i: number;
  x: number;
  y: number;
  z: number;
  isPinned: boolean;
  createDate: Date | null;
  updateDate: Date | null;
  deleteDate: Date | null;
  __typename: string;
};

export type IdToCoordsType = {
  [id: string]: {
    x: number;
    y: number;
    z: number;
  };
};

export type IdToTwigType = {
  [id: string]: Twig;
};

export type ArrowIdToTwigIdType = {
  [arrowId: string]: string;
};

export type IToTwigIdType = {
  [i: string]: string;
};

export type IdToHeightType = {
  [id: string]: number;
};

export const createTwig = (
  user: User, 
  id: string,
  abstract: Arrow, 
  detail: Arrow, 
  parent: Twig, 
  x: number,
  y: number,
  isPinned: boolean,
) => {
  const date = new Date();
  const twig = {
    id,
    userId: user.id,
    user,
    abstractId: abstract.id,
    abstract,
    detailId: detail.id,
    detail,
    parent,
    children: [],
    i: abstract.twigN + 1,
    x,
    y,
    z: abstract.twigZ + 1,
    isPinned,
    createDate: date,
    updateDate: date,
    deleteDate: null,
    __typename: 'Twig'
  } as Twig;
  return twig;
}