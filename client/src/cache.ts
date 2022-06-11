import { makeVar } from '@apollo/client';
import { MutableRefObject } from 'react';
import { v4 as uuid } from 'uuid';
import { CoordsType, IdToCoordsType } from './features/twig/twig';
import { IdToTrueType } from './utils';

export const sessionVar = makeVar({
  id: uuid(),
});

export const frameSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);
export const focusSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);

export const adjustTwigVar = makeVar({
  idToCoords: {} as IdToCoordsType,
});