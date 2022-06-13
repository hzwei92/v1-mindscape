import { Role } from "../role/role";
import { Sub } from "../sub/sub";
import { User } from "../user/user";
import { Vote } from "../vote/vote";

export type Arrow = {
  id: string;
  routeName: string;
  draft: string | null;
  text: string;
  title: string | null;
  url: string | null;
  color: string;

  userId: string;
  user: User;

  sourceId: string;
  source: Arrow;
  targetId: string;
  target: Arrow;

  ins: Arrow[];
  outs: Arrow[];
  inCount: number;
  outCount: number;

  abstractId: string;
  abstract: Arrow;
  twigs: Arrow[];
  twigN: number;
  twigZ: number;

  canEdit: string;
  canPost: string;
  canTalk: string;
  canHear: string;
  canView: string;

  subs: Sub[];
  roles: Role[];
  votes: Vote[];

  lng: number | null;
  lat: number | null;
  city: string | null;
  state: string | null;
  country: string | null;

  clicks: number;
  tokens: number;
  weight: number;

  isOpaque: boolean;

  activeDate: Date | null;
  saveDate: Date | null;
  commitDate: Date | null;
  removeDate: Date | null;
  createDate: Date | null;
  updateDate: Date | null;
  deleteDate: Date | null;
  __typename: string;
}

export type IdToTrueType = {
  [id: string]: true;
};

export type IdToParentIdType = {
  [id: string]: string;
};

export type IdToChildIdToTrueType = {
  [id: string]: IdToTrueType;
}
export type IdToHeightType = {
  [id: string]: number;
};

export type CreateLinkType = {
  sourceId: string;
  targetId: string;
};

export const createArrow = (
  user: User,
  id: string,
  draft: string,
  abstract: Arrow,
  source: Arrow | null,
  target: Arrow | null,
) => {
  const date = new Date();
  const arrow = {
    id,
    routeName: id,
    draft,
    text: '',
    title: null,
    url: null,
    color: user.color,

    userId: user.id,
    user,

    sourceId: source?.id || null,
    source,
    targetId: target?.id || null,
    target,

    ins: [],
    outs: [],
    inCount: 0,
    outCount: 0,

    abstractId: abstract.id,
    abstract,
    twigs: [],
    twigN: 0,
    twigZ: 0,

    canEdit: 'OTHER',
    canPost: 'OTHER',
    canTalk: 'OTHER',
    canHear: 'OTHER',
    canView: 'OTHER',

    subs: [],
    roles: [],
    votes: [],

    lng: null,
    lat: null,
    city: null,
    state: null,
    country: null,

    clicks: 1,
    tokens: 0,
    weight: 1,

    isOpaque: false,

    activeDate: date,
    saveDate: date,
    commitDate: null,
    removeDate: null,
    createDate: date,
    updateDate: date,
    deleteDate: null,
    __typename: 'Arrow'
  } as Arrow;
  return arrow
}