import { makeVar } from '@apollo/client';
import { MutableRefObject } from 'react';
import { v4 as uuid } from 'uuid';

export const sessionVar = makeVar({
  id: uuid(),
});

export const frameSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);
export const focusSpaceElVar = makeVar(null as MutableRefObject<HTMLElement | undefined> | null);
