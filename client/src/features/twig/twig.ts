import { DisplayMode } from "../../constants";
import { Arrow } from "../arrow/arrow";
import { SpaceType } from "../space/space";
import { User } from "../user/user";

export type Twig = {
  id: string;
  sourceId: string | null;
  source: Twig | null;
  targetId: string | null;
  target: Twig | null;
  userId: string;
  user: User
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
  isRoot: boolean;
  degree: number;
  rank: number;
  color: string | null;
  displayMode: string;
  bookmarkId: string | null,
  windowId: number | null;
  groupId: number | null;
  tabId: number | null;
  isOpen: boolean;
  createDate: string | null;
  updateDate: string | null;
  deleteDate: string | null;
  __typename: string;
}


export const createTwig = (p: {
  id: string,
  source: Twig | null,
  target: Twig | null,
  user: User, 
  abstract: Arrow, 
  detail: Arrow, 
  parent: Twig, 
  x: number,
  y: number,
  rank: number,
  color: string | null,
  isOpen: boolean,
  bookmarkId: string | null,
  windowId: number | null,
  groupId: number | null,
  tabId: number | null,
  displayMode: DisplayMode,
}) => {
  const twig: Twig = {
    id: p.id,
    sourceId: p.source?.id || null,
    source: p.source,
    targetId: p.target?.id || null,
    target: p.target,
    userId: p.user.id,
    user: p.user,
    abstractId: p.abstract.id,
    abstract: p.abstract,
    detailId: p.detail.id,
    detail: p.detail,
    parent: p.parent,
    children: [],
    isRoot: false,
    i: p.abstract.twigN + 1,
    x: p.x,
    y: p.y,
    z: p.abstract.twigZ + 1,
    color: p.color,
    degree: p.parent.degree + 1,
    rank: p.rank,
    tabId: p.tabId,
    groupId: p.groupId,
    windowId: p.windowId,
    bookmarkId: p.bookmarkId,
    isOpen: p.isOpen,
    displayMode: p.displayMode,
    createDate: null,
    updateDate: null,
    deleteDate: null,
    __typename: 'Twig'
  };
  return twig;
}


export type CopyingTwigType = {
  space: SpaceType;
  twigId: string;
  parentTwigId: string;
  rank: number;
  displayMode: DisplayMode;
}