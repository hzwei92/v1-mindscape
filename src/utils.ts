import { v4 as uuidv4 } from 'uuid';
import { RoleType } from './enums';

export const findDefaultWeight = (clicks: number, tokens: number) => {
  return clicks + 1000 * tokens;
}

export const getEmptyDraft = () => {
  return JSON.stringify({
    blocks: [
      {
        key: uuidv4(),
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      }
    ],
    entityMap: {},
  });
}

export const checkPermit = (permissionLevel: RoleType, roleType: RoleType) => {
  return permissionLevel === RoleType.ADMIN
    ? roleType === RoleType.ADMIN
    : permissionLevel === RoleType.MEMBER
      ? roleType === RoleType.ADMIN || roleType === RoleType.MEMBER
      : true;
}