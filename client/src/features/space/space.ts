import { IdToTrueType } from '../../utils';

export type SpaceType = 'FRAME' | 'FOCUS';

export type ScrollState = {
  left: number;
  top: number;
};

export type DragState = {
  isScreen: boolean;
  twigId: string;
  dx: number;
  dy: number;
  targetTwigId: string;
};
