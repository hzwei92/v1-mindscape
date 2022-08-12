import { makeVar } from '@apollo/client';
import { MutableRefObject } from 'react';
import { v4 as uuid } from 'uuid';
import { PosType } from './features/space/space';
import { IdToType } from './types';

export const sessionVar = makeVar({
  id: uuid(),
});

export const frameSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);
export const focusSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);

export const frameAdjustIdToPosVar = makeVar({} as IdToType<PosType>);
export const focusAdjustIdToPosVar = makeVar({} as IdToType<PosType>);